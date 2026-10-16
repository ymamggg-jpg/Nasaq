"use strict";

// Shared by every page: language (English default, Arabic), theme, and the strings in the header and footer.
// A page script calls Nasaq.init(pageStrings, onLangChange) once it has loaded.
(function () {
  const d = document.documentElement;
  const SHARED = {
    en: {
      brand: "Nasaq", skip: "Skip to content", navConsole: "Console", navAbout: "How it works", navTeam: "About us",
      themeDark: "Dark mode", themeLight: "Light mode",
      footNote: "A prototype for the Expo 2030 Riyadh challenge at Tuwaiq Academy (track 3, challenge 3.1). Not an official Expo tool.",
      credit: "Simulation: JuPedSim 1.4.2 (Forschungszentrum Jülich). Forecast: scikit-learn.",
    },
    ar: {
      brand: "نسق", skip: "انتقل إلى المحتوى", navConsole: "لوحة المراقبة", navAbout: "كيف يعمل", navTeam: "من نحن",
      themeDark: "الوضع الداكن", themeLight: "الوضع الفاتح",
      footNote: "نموذج أولي لتحدي إكسبو 2030 الرياض في أكاديمية طويق (المسار 3، التحدي 3.1). ليس أداة رسمية لإكسبو.",
      credit: "المحاكاة: JuPedSim 1.4.2 (Forschungszentrum Jülich). التوقّع: scikit-learn.",
    },
  };

  const N = (window.Nasaq = {
    lang: d.lang === "ar" ? "ar" : "en",
    T: { en: { ...SHARED.en }, ar: { ...SHARED.ar } },
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)"),
    subs: [],
  });
  const $ = (s) => document.querySelector(s);

  N.store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } };
  N.load = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  N.t = () => N.T[N.lang];

  N.init = (pageT, onChange) => {
    for (const l of ["en", "ar"]) Object.assign(N.T[l], pageT[l]);
    if (onChange) N.subs.push(onChange);
    apply();
  };

  function apply() {
    const L = N.t();
    d.lang = N.lang;
    d.dir = N.lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = L[el.dataset.i18n];
      if (typeof v === "string") el.textContent = v;
    });
    const other = N.lang === "ar" ? "en" : "ar";
    $("#lang-txt").textContent = other === "ar" ? "عربي" : "English";
    $("#lang").setAttribute("lang", other);
    setTheme();
    N.subs.forEach((f) => f(N.lang));
  }

  /* theme: no saved choice = follow the system */
  N.isDark = () => {
    const th = d.dataset.theme;
    return th ? th === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  function setTheme() {
    const dark = N.isDark(), label = dark ? N.t().themeLight : N.t().themeDark;
    $("#theme use").setAttribute("href", dark ? "#i-sun" : "#i-moon");
    $("#theme").setAttribute("aria-label", label);
    $("#theme").title = label;
  }

  $("#lang").addEventListener("click", () => {
    N.lang = N.lang === "ar" ? "en" : "ar";
    N.store("nasaq-lang", N.lang);
    // drop ?lang= from the address so a reload keeps the language just chosen
    const u = new URL(location.href);
    if (u.searchParams.has("lang")) { u.searchParams.delete("lang"); history.replaceState(null, "", u); }
    apply();
  });

  // the new theme spreads out from the button (View Transitions); instant where unsupported
  $("#theme").addEventListener("click", (ev) => {
    const next = N.isDark() ? "light" : "dark";
    const go = () => { d.dataset.theme = next; N.store("nasaq-theme", next); setTheme(); };
    if (!document.startViewTransition || N.reduced.matches) return go();
    const b = ev.currentTarget.getBoundingClientRect();
    d.style.setProperty("--vx", b.left + b.width / 2 + "px");
    d.style.setProperty("--vy", b.top + b.height / 2 + "px");
    document.startViewTransition(go);
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", setTheme);
})();
