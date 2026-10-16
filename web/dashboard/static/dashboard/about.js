"use strict";

const T = {
  en: {
    heroH: "Rehearse the crowd before the gates open.",
    heroP: "Nasaq forecasts the crowd at each gate 10 seconds ahead, raises an alert, and shows the operations team solutions that were already tested in a crowd simulator, before and after.",
    ctaConsole: "Open the console", ctaResults: "See what we found",
    heroNote: "The gate warning is built and tested inside a simulator; the simulator itself is checked against a real lab experiment. Not connected to live Expo data.",
    probH: "The problem",
    probQuote: "“The site operations team struggles to detect congestion early enough to act, when thousands of visitors move between gates, sites, transport points and public spaces at the same time.”",
    probCite: "Challenge 3.1, Operations, Safety and Security track",
    probP: "A count of who is at a door right now arrives too late: by the time a door looks full, the queue behind it is already forming. Nasaq looks ahead instead, and gives the team a safe place to try a decision first.",
    findH: "What we found",
    findSub: "Every number below is read from our result files. Each is a mean over several runs; where a result failed, we say so.",
    F: {
      warn: (g) => ["The warning halves the error", `Forecasting the crowd at each gate 10 seconds ahead, the model was off by ${g.mae_model} people on average, against ${g.mae_same} when assuming the count stays the same (${g.test_runs} simulated runs it never trained on).`],
      gate: (b, a, lv) => ["An extra gate empties the queue", `At the ${lv} visitor level, opening an extra gate 60 s after the alert cut the people still inside at the end from ${b} to ${a} (mean of 8 runs, same arrivals before and after).`],
      fire: (p) => ["Rerouting at a closure spread the load", `When an area behind the main gate closed during an evacuation and people were rerouted, the last person got out ${Math.abs(p.mean)}% sooner, against our expectation: they were pushed to the side gate that was almost empty. The closure does not help; spreading the load does.`],
      door: (p) => ["Closing one door slows the whole exit", `With one of two doors unavailable, the last person got out ${p.mean}% later (${p.min}% to ${p.max}% over 10 runs).`],
      calib: (lo, hi) => ["Real data: the simulator is too slow", `In a real lab bottleneck 1.90–2.19 people per second passed a 1 m gap; the simulator passed about half (${lo}–${hi}% less). Our absolute numbers are not real-world numbers.`],
    },
    realH: "Which data is real?",
    realSub: "Simulated and real data are kept apart, and every result says which one it uses.",
    realCol: ["Part", "Data", "Real?"],
    realRows: [
      ["Gate warning (10 s ahead)", "40 runs of our crowd simulator", "No: simulation"],
      ["Solutions (extra gate, stewards, batches)", "Our simulator, same seeds before and after", "No: simulation"],
      ["Fire and closed door", "Our simulator", "No: simulation"],
      ["Simulator check", "Jülich bottleneck experiment (Seyfried et al. 2007)", "Yes, for comparison only"],
    ],
    yes: "Yes", no: "No",
    unitS: "s",
    pipeH: "How the system works",
    pipeSub: "Six stages, from a layout to a decision. Select a stage to see what it does and which stages it feeds.",
    stageOf: (i, n) => `Stage ${i} of ${n}`, linked: "Connected stages",
    st_verified: "Tested in the simulator", st_synthetic: "Synthetic", st_assumption: "Our assumption",
    s_layout: "Layout", s_layout_d: "A test layout with two rooms, two doors and one exit stands in for one gate zone. It is synthetic: no operational Expo map is public.",
    s_sim: "Simulate", s_sim_d: "JuPedSim moves every visitor step by step with the Collision-Free Speed Model, at three visitor levels, during an evacuation, or with a closed route.",
    s_record: "Record", s_record_d: "Each run records, over time, how many people stand in front of each door. These recorded runs are the training data for the forecast.",
    s_forecast: "Forecast", s_forecast_d: "A gradient-boosting model predicts the crowd at each door 10 seconds ahead, with about half the error of assuming no change.",
    s_warn: "Warn", s_warn_d: "When the forecast reaches 2 persons/m² in front of a gate, the console raises an alert. This limit is our assumption, not a standard.",
    s_decide: "Decide", s_decide_d: "After the alert the team compares solutions (extra gate, stewards, batched entry) that were tested in the simulator on the same arrivals, before and after.",
    scH: "Three situations to rehearse", scSub: "Each one opens in the console with its recorded run.",
    sc1h: "Crowd at the gate", sc1: "Visitors keep arriving at a low, medium or peak level. The model raises an alert, and you compare the tested solutions before and after.",
    sc2h: "Fire and evacuation", sc2: "During an evacuation an area behind the main gate becomes unavailable at 30 seconds, and people are sent to the side gate.",
    sc3h: "Closed door", sc3: "40 people leave while one of the two doors is unavailable, for example a blocked route.",
    openConsole: "Open in console",
    techH: "What it is built with",
    tech1: "Open pedestrian simulator from Forschungszentrum Jülich. Moves every visitor with the Collision-Free Speed Model.",
    tech2: "Gradient-boosting model that forecasts the crowd at each door 10 seconds ahead.",
    tech3: "Turns recorded runs into training data and results tables.",
    tech4: "This site. Every run is precomputed, so the console needs no live simulation.",
    tech6: "A real bottleneck experiment from Jülich, used to check the simulator.",
    limH: "Honest limits",
    lim1: "The layout is a test layout (two rooms, two gates, one exit), not the Expo site.",
    lim2: "The gate warning is trained on our own simulations, so it shows the method works inside the simulator, not on real crowds.",
    lim3: "The simulator passes about half the flow measured in a real lab bottleneck, so absolute times and peaks do not carry over to reality.",
    lim4: "We only simulate that an area becomes unavailable; we do not simulate fire or smoke spread, and this is not an evacuation safety certificate.",
    lim5: "Response time, steward compliance, density limits and visitor levels are our assumptions.",
    nextH: "What comes next",
    next1: "Feed the forecast with real gate counters and sensors.",
    next2: "Model the real site layout once an operational map is available.",
    next3: "Train the gate warning on recorded crowd data, not only on simulations.",
    next4: "Calibrate the simulator to the measured real flow, then repeat the tests.",
    ctaH: "See it run.",
  },
  ar: {
    heroH: "تمرّن على الحشد قبل أن تُفتح البوابات.",
    heroP: "نسق يتوقّع الحشد عند كل بوابة قبل 10 ثوانٍ، وينبّه، ويعرض لفريق العمليات حلولًا جُرّبت مسبقًا في محاكي الحشود، قبل وبعد.",
    ctaConsole: "افتح لوحة المراقبة", ctaResults: "شاهد ما وجدناه",
    heroNote: "إنذار البوابة بُني واختُبر داخل محاكي، والمحاكي نفسه قارنّاه بتجربة مختبر حقيقية. غير متصل ببيانات إكسبو الحية.",
    probH: "المشكلة",
    probQuote: "«فريق عمليات الموقع يجد صعوبة في اكتشاف الازدحام مبكرًا بما يكفي للتصرّف، عندما يتنقّل آلاف الزوار بين البوابات والمواقع ونقاط النقل والأماكن العامة في الوقت نفسه.»",
    probCite: "التحدي 3.1، مسار العمليات والسلامة والأمن",
    probP: "عدّ الموجودين عند الباب الآن يأتي متأخرًا: حين يبدو الباب ممتلئًا يكون الطابور خلفه قد بدأ. نسق ينظر إلى الأمام بدلًا من ذلك، ويعطي الفريق مكانًا آمنًا لتجربة القرار أولًا.",
    findH: "ماذا وجدنا",
    findSub: "كل رقم هنا مقروء من ملفات نتائجنا، وهو متوسط عدة تشغيلات. وحيث فشلت نتيجة نقول ذلك.",
    F: {
      warn: (g) => ["الإنذار يخفض الخطأ للنصف", `عند توقّع الحشد عند كل بوابة قبل 10 ثوانٍ، أخطأ النموذج بـ${g.mae_model} شخص في المتوسط، مقابل ${g.mae_same} لو افترضنا أن العدد لن يتغير (${g.test_runs} تشغيلات محاكاة لم يتدرب عليها).`],
      gate: (b, a, lv) => ["بوابة إضافية تفرّغ الطابور", `عند مستوى الزوار ${lv}، فتح بوابة إضافية بعد 60 ث من الإنذار خفّض من بقي في الداخل في النهاية من ${b} إلى ${a} (متوسط 8 تشغيلات، بنفس الوصول قبل وبعد).`],
      fire: (p) => ["إعادة التوجيه وقت الإغلاق وزّعت الحمل", `عندما أُغلقت منطقة خلف البوابة الرئيسية أثناء الإخلاء ووُجّه الناس، خرج آخر شخص أسرع بـ${Math.abs(p.mean)}%، عكس توقعنا: دُفعوا إلى البوابة الجانبية الفارغة تقريبًا. الإغلاق نفسه لا يفيد؛ الذي يفيد هو توزيع الحمل.`],
      door: (p) => ["إغلاق باب واحد يبطئ الخروج كله", `مع تعطّل أحد البابين، خرج آخر شخص متأخرًا بنسبة ${p.mean}% (من ${p.min}% إلى ${p.max}% على 10 تشغيلات).`],
      calib: (lo, hi) => ["بيانات حقيقية: المحاكي أبطأ من الواقع", `في تجربة مختبر حقيقية عبر 1.90–2.19 شخص في الثانية من فتحة عرضها 1 م؛ المحاكي مرّر نحو النصف (أقل بـ${lo}–${hi}%). أرقامنا المطلقة ليست أرقام الواقع.`],
    },
    realH: "أي البيانات حقيقية؟",
    realSub: "نفصل بين بيانات المحاكاة والبيانات الحقيقية، وكل نتيجة تذكر مصدرها.",
    realCol: ["الجزء", "البيانات", "حقيقية؟"],
    realRows: [
      ["إنذار البوابة (قبل 10 ث)", "40 تشغيلة من محاكي الحشود الخاص بنا", "لا: محاكاة"],
      ["الحلول (بوابة إضافية، منظمون، دفعات)", "محاكينا، بنفس الـseeds قبل وبعد", "لا: محاكاة"],
      ["الحريق والباب المغلق", "محاكينا", "لا: محاكاة"],
      ["التحقق من المحاكي", "تجربة يوليش للممرات الضيقة (Seyfried وآخرون 2007)", "نعم، للمقارنة فقط"],
    ],
    yes: "نعم", no: "لا",
    unitS: "ث",
    pipeH: "كيف يعمل النظام",
    pipeSub: "ست مراحل، من التصميم إلى القرار. اختر مرحلة لترى ماذا تفعل وما المراحل المرتبطة بها.",
    stageOf: (i, n) => `المرحلة ${i} من ${n}`, linked: "مراحل مرتبطة",
    st_verified: "مُختبر في المحاكي", st_synthetic: "تجريبي", st_assumption: "افتراض منّا",
    s_layout: "التصميم", s_layout_d: "تصميم تجريبي من غرفتين وبابين ومخرج واحد يمثّل منطقة بوابة واحدة. هو تصميم مصطنع: لا توجد خريطة تشغيلية منشورة لإكسبو.",
    s_sim: "المحاكاة", s_sim_d: "JuPedSim يحرّك كل زائر خطوة بخطوة بنموذج Collision-Free Speed، بثلاثة مستويات للزوار، وأثناء الإخلاء، ومع مسار مغلق.",
    s_record: "التسجيل", s_record_d: "كل تشغيلة تسجّل عبر الزمن عدد الأشخاص أمام كل باب. هذه التشغيلات المسجّلة هي بيانات تدريب التوقّع.",
    s_forecast: "التوقّع", s_forecast_d: "نموذج Gradient Boosting يتوقّع الحشد عند كل باب قبل 10 ثوانٍ، بنحو نصف خطأ افتراض عدم التغيّر.",
    s_warn: "الإنذار", s_warn_d: "عندما يصل التوقّع إلى 2 شخص/م² أمام بوابة، تُظهر اللوحة إنذارًا. هذا الحد افتراض منّا وليس معيارًا.",
    s_decide: "القرار", s_decide_d: "بعد الإنذار يقارن الفريق حلولًا (بوابة إضافية، منظمون، دخول على دفعات) جُرّبت في المحاكي على نفس الوصول، قبل وبعد.",
    scH: "ثلاثة مواقف للتمرين", scSub: "كل موقف يُفتح في لوحة المراقبة مع تشغيلته المسجّلة.",
    sc1h: "زحام عند البوابة", sc1: "الزوار يصلون تباعًا بمستوى منخفض أو متوسط أو ذروة. النموذج ينبّه، وتقارن الحلول المُختبرة قبل وبعد.",
    sc2h: "حريق وإخلاء", sc2: "أثناء الإخلاء تصبح منطقة خلف البوابة الرئيسية غير متاحة عند الثانية 30، ويُوجَّه الناس إلى البوابة الجانبية.",
    sc3h: "باب مغلق", sc3: "40 شخصًا يخرجون وأحد البابين غير متاح، مثل مسار مقطوع.",
    openConsole: "افتح في لوحة المراقبة",
    techH: "التقنيات المستخدمة",
    tech1: "محاكي مشاة مفتوح من مركز يوليش للأبحاث. يحرّك كل زائر بنموذج Collision-Free Speed.",
    tech2: "نموذج Gradient Boosting يتوقّع الحشد عند كل باب قبل 10 ثوانٍ.",
    tech3: "يحوّل التشغيلات المسجّلة إلى بيانات تدريب وجداول نتائج.",
    tech4: "هذا الموقع. كل تشغيلة محسوبة مسبقًا، فلا تحتاج اللوحة إلى محاكاة حية.",
    tech6: "تجربة حقيقية للممرات الضيقة من يوليش، للتحقق من المحاكي.",
    limH: "حدود صادقة",
    lim1: "التصميم تجريبي (غرفتان وبوابتان ومخرج)، وليس موقع إكسبو.",
    lim2: "إنذار البوابة مدرّب على محاكاتنا، فهو يُثبت أن الطريقة تعمل داخل المحاكي، لا على حشود حقيقية.",
    lim3: "المحاكي يمرّر نحو نصف التدفق المقاس في تجربة مختبر حقيقية، فالأزمنة والذروة المطلقة لا تُنقل للواقع كما هي.",
    lim4: "نحاكي أن المنطقة صارت غير متاحة فقط؛ لا نحاكي انتشار النار أو الدخان، وهذه ليست شهادة سلامة إخلاء.",
    lim5: "زمن الاستجابة، ونسبة الالتزام بالمنظمين، وحدود الكثافة، ومستويات الزوار افتراضات منّا.",
    nextH: "الخطوات القادمة",
    next1: "تغذية التوقّع بعدّادات وحسّاسات حقيقية عند البوابات.",
    next2: "نمذجة تصميم الموقع الحقيقي عندما تتوفّر خريطة تشغيلية.",
    next3: "تدريب إنذار البوابة على بيانات حشود مسجّلة، لا على المحاكاة فقط.",
    next4: "معايرة المحاكي ليطابق التدفق الحقيقي المقاس، ثم إعادة الاختبارات.",
    ctaH: "شاهده يعمل.",
  },
};

const $ = (s) => document.querySelector(s);
const tr = () => Nasaq.t();
const reduced = Nasaq.reduced;

/* run a draw loop only while the element is on screen (and never under reduced motion) */
function loopWhileVisible(el, frame) {
  let on = false, raf = 0;
  const step = (now) => { frame(now); if (on && !reduced.matches) raf = requestAnimationFrame(step); };
  new IntersectionObserver(([e]) => {
    on = e.isIntersecting; cancelAnimationFrame(raf);
    if (on) raf = requestAnimationFrame(step);
  }).observe(el);
  frame(performance.now());
}

/* ---------- dithered globe, Riyadh marked ---------- */
(function globe() {
  const c = $("#globe"); if (!c) return;
  const g = c.getContext("2d");
  const B = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map((v) => (v + 0.5) / 64);
  const L = (() => { const v = [-0.55, -0.55, 0.63], n = Math.hypot(...v); return v.map((x) => x / n); })();
  const LAT = 24.7 * Math.PI / 180, LON = 46.7 * Math.PI / 180;   // Riyadh
  let size = 0, d = 1;
  const PX = 3;
  function resize() {
    d = Math.min(window.devicePixelRatio || 1, 2);
    size = c.clientWidth;
    c.width = c.height = size * d;
    g.setTransform(d, 0, 0, d, 0, 0);
  }
  function frame(now) {
    const rot = reduced.matches ? -0.6 : -0.6 + now / 9000;
    const N = Math.floor(size / PX), R = N / 2;
    g.clearRect(0, 0, size, size);
    const front = "#4D9BEA", hi = "#BFE6F5";
    for (let j = 0; j < N; j++) {
      const ny = (j + 0.5 - R) / R;
      for (let i = 0; i < N; i++) {
        const nx = (i + 0.5 - R) / R, r2 = nx * nx + ny * ny;
        if (r2 > 1) continue;
        const nz = Math.sqrt(1 - r2);
        const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
        const lon = Math.atan2(nx, nz) + rot, lat = Math.asin(-ny);
        const grid = Math.abs(Math.sin(lon * 6)) < 0.035 || Math.abs(Math.sin(lat * 6)) < 0.03;
        let v = 0.06 + 0.9 * lam;
        if (grid) v *= 0.5;
        if (v > B[(j & 7) * 8 + (i & 7)]) {
          g.fillStyle = v > 0.9 ? hi : front;
          g.fillRect(i * PX, j * PX, PX - 0.6, PX - 0.6);
        }
      }
    }
    // Riyadh: a sand marker on the turning globe, drawn only on the visible side
    const a = LON - rot, cl = Math.cos(LAT);
    const mx = cl * Math.sin(a), my = -Math.sin(LAT), mz = cl * Math.cos(a);
    if (mz > 0.05) {
      const x = (mx * R + R) * PX, y = (my * R + R) * PX, pulse = reduced.matches ? 0 : (now / 1400) % 1;
      g.strokeStyle = `rgba(224,192,141,${1 - pulse})`; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x, y, 6 + pulse * 16, 0, 6.283); g.stroke();
      g.fillStyle = "#E0C08D"; g.beginPath(); g.arc(x, y, 5, 0, 6.283); g.fill();
    }
  }
  resize();
  new ResizeObserver(() => { resize(); frame(performance.now()); }).observe(c);
  loopWhileVisible(c, frame);
})();

/* ---------- how it works: six stages orbiting the mark ---------- */
const STAGES = [
  { id: "layout", icon: "i-grid", st: "synthetic", rel: ["sim"] },
  { id: "sim", icon: "i-cpu", st: "verified", rel: ["layout", "record", "decide"] },
  { id: "record", icon: "i-db", st: "verified", rel: ["sim", "forecast"] },
  { id: "forecast", icon: "i-sparkles", st: "verified", rel: ["record", "warn"] },
  { id: "warn", icon: "i-bell", st: "assumption", rel: ["forecast", "decide"] },
  { id: "decide", icon: "i-scale", st: "verified", rel: ["warn", "sim"] },
];
let active = 0, userPicked = false, rot = 0, target = null;

function buildOrbit() {
  const box = $("#orbit-nodes"); if (!box) return;
  box.innerHTML = "";
  STAGES.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "node"; b.dataset.i = i;
    b.innerHTML = `<span class="node-dot"><svg class="ico" aria-hidden="true"><use href="#${s.icon}"/></svg></span><span class="node-label"><small>${i + 1}</small><span data-k="${s.id}"></span></span>`;
    b.addEventListener("click", () => pick(i, true));
    box.appendChild(b);
  });
  // text is filled in by renderOrbitText once Nasaq.init has merged this page's strings
}

function renderOrbitText() {
  const L = tr();
  document.querySelectorAll(".node").forEach((b) => {
    const s = STAGES[b.dataset.i];
    b.querySelector("[data-k]").textContent = L["s_" + s.id];
    b.setAttribute("aria-pressed", String(+b.dataset.i === active));
  });
  const s = STAGES[active];
  $("#stage-card").innerHTML = `
    <p class="stage-of">${L.stageOf(active + 1, STAGES.length)}</p>
    <h3><svg class="ico" aria-hidden="true"><use href="#${s.icon}"/></svg>${L["s_" + s.id]}</h3>
    <span class="tag-pill ${s.st}">${L["st_" + s.st]}</span>
    <p>${L["s_" + s.id + "_d"]}</p>
    <p class="stage-of">${L.linked}</p>
    <div class="chips">${s.rel.map((r) => {
      const k = STAGES.findIndex((x) => x.id === r);
      return `<button type="button" class="chip-btn" data-go="${k}">${k + 1}. ${L["s_" + r]}</button>`;
    }).join("")}</div>`;
  $("#stage-card").querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => pick(+b.dataset.go, true)));
  document.querySelectorAll(".node").forEach((b) => {
    const i = +b.dataset.i;
    b.classList.toggle("is-active", i === active);
    b.classList.toggle("is-related", s.rel.includes(STAGES[i].id));
  });
  const card = $("#stage-card");
  card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
}

function pick(i, byUser) {
  active = i;
  if (byUser) { userPicked = true; target = -i * 60; }   // bring the chosen stage to the top
  renderOrbitText();
}

function placeNodes() {
  const n = STAGES.length;
  document.querySelectorAll(".node").forEach((b) => {
    const i = +b.dataset.i;
    const a = ((i / n) * 360 + rot - 90) * Math.PI / 180;
    b.style.left = 50 + 41 * Math.cos(a) + "%";
    b.style.top = 50 + 41 * Math.sin(a) + "%";
    b.style.setProperty("--depth", (0.62 + 0.38 * (1 - Math.sin(a)) / 2).toFixed(2));
  });
}

(function orbit() {
  const el = $("#orbit"); if (!el) return;
  buildOrbit();
  loopWhileVisible(el, () => {
    if (target !== null) {
      let diff = ((target - rot) % 360 + 540) % 360 - 180;   // shortest way round
      rot += diff * 0.08;
      if (Math.abs(diff) < 0.05) { rot = target; target = null; }
    } else if (!userPicked) {
      rot += 0.06;
    }
    placeNodes();
  });
})();

/* ---------- findings and "which data is real", read from the same files the console uses ---------- */
const D = {};
async function load(name) {
  try { const r = await fetch(window.DATA_URL + name + ".json"); if (r.ok) D[name] = await r.json(); } catch (e) { /* that finding is skipped */ }
}

function renderFindings() {
  const box = $("#findings-list"); if (!box) return;
  const L = tr(), F = L.F, items = [];
  // [figure, unit, [title, text], honest?]
  if (D.ai_card) { const g = D.ai_card.gate; items.push([(g.mae_same / g.mae_model).toFixed(1), "×", F.warn(g)]); }
  if (D.solutions) {
    const v = D.solutions.levels.medium.variants;
    items.push([v.before.metrics.not_out.mean.toFixed(0), "→" + v.extra_gate.metrics.not_out.mean.toFixed(0),
      F.gate(v.before.metrics.not_out.mean.toFixed(1), v.extra_gate.metrics.not_out.mean.toFixed(1), Nasaq.lang === "ar" ? "المتوسط" : "medium")]);
  }
  if (D.fire) items.push([String(D.fire.last_out_pct.mean), "%", F.fire(D.fire.last_out_pct)]);
  if (D.summary) items.push(["+" + D.summary.evac.last_out_pct.mean, "%", F.door(D.summary.evac.last_out_pct)]);
  if (D.calibration) {
    const d = D.calibration.rows.map((r) => Math.abs(r.diff_pct));
    items.push(["½", "", F.calib(Math.round(Math.min(...d)), Math.round(Math.max(...d))), true]);
  }
  box.innerHTML = items.map(([fig, unit, [h, p], honest]) => `
    <li class="${honest ? "honest" : ""}">
      <p class="fig"><span dir="ltr">${fig}</span><small dir="ltr">${unit}</small></p>
      <div><h3>${h}</h3><p>${p}</p></div>
    </li>`).join("");
}

function renderReal() {
  const t = $("#real-table"); if (!t) return;
  const L = tr();
  t.innerHTML = `<thead><tr>${L.realCol.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>` +
    L.realRows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td></tr>`).join("") + "</tbody>";
}

(async function init() {
  Nasaq.init(T, () => { renderOrbitText(); renderFindings(); renderReal(); });
  await Promise.all(["ai_card", "solutions", "fire", "summary", "calibration"].map(load));
  renderFindings();
})();
