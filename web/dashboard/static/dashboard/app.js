"use strict";

// Every number on this page comes from data/web/*.json (made by sim/solutions.py and sim/export_web.py).
const T = {
  ar: {
    brand: "نسق",
    tagline: "تجربة الحشود عند البوابات قبل أن تحدث",
    introH: "جديد هنا؟ اقرأ اللوحة في ثلاث خطوات",
    intro1h: "اختر موقفًا", intro1: "من اللوحة الجانبية: زحام عند البوابة بالمستوى الذي تختاره، أو حريق وإخلاء، أو باب مغلق.",
    intro2h: "شاهد الإعادة والإنذار", intro2: "كل نقطة زائر، ولونها يبيّن ازدحام الناس حوله. النموذج ينبّه قبل الزحام بعشر ثوانٍ.",
    intro3h: "قارن الحلول", intro3: "بعد الإنذار جرّبنا كل حل بالمحاكاة. اضغط \"جرّب الحل\" لترى قبل وبعد.",
    introMore: "كيف يعمل النظام", introClose: "فهمت",
    simTag: "إعادة تشغيل محاكاة، وليست بثًا مباشرًا",
    siteH: "أين تقع هذه المنطقة", keyFlow: "تدفق الزوار نحو البوابة الغربية", keyGate: "البوابة المُحاكاة", keyOther: "بوابات أخرى (غير مُحاكاة)",
    loadErr: (n) => `تعذّر تحميل ${n}.json. شغّل sim/solutions.py و sim/export_web.py ثم أعد تحميل الصفحة.`,
    h1: "أين ستزدحم البوابة بعد 10 ثوانٍ، وما الحل؟",
    lede: "اختر مستوى الزوار، وشاهد الحشد يتحرك، واقرأ الإنذار، ثم قارن الحلول قبل وبعد.",
    plaza: "الساحة المركزية", pavilions: "أجنحة", metro: "مترو", bus: "حافلات", parking: "مواقف",
    gateN: "بوابة شمالية", gateE: "بوابة شرقية", gateS: "بوابة جنوبية",
    gateW: "البوابة الغربية", gateWnote: "المنطقة المُحاكاة",
    mapNote: "رسم توضيحي مبسّط، وليس خريطة إكسبو 2030 الرسمية. المحاكاة تمثّل منطقة بوابة واحدة فقط (البوابة الغربية) بتصميم تجريبي من غرفتين وبوابتين.",
    scenario: "السيناريو",
    sc_normal: "زحام عند البوابة", sc_normal_d: "الزوار يصلون تباعًا بالمستوى الذي تختاره، والجميع يتبع اللوحات إلى البوابة الرئيسية.",
    sc_closed: "باب مغلق", sc_closed_d: "40 شخصًا يخرجون وأحد البابين غير متاح (مسار مقطوع).",
    sc_fire: "حريق وإخلاء", sc_fire_d: "إخلاء غرفة الدخول، وعند الثانية 30 تُغلق منطقة خلف البوابة الرئيسية.",
    fireCase: "الحالة", f_closure: "مع إغلاق المنطقة", f_noclosure: "دون إغلاق (للمقارنة)",
    fireNote: "نحاكي أن المنطقة صارت غير متاحة فقط؛ لا نحاكي انتشار النار أو الدخان، وهذه ليست شهادة سلامة إخلاء.",
    fireZone: "منطقة مغلقة",
    fireMsg: (ft, tc) => `عند الثانية ${ft} أُغلقت المنطقة الحمراء، ووُجّه من في غرفة الدخول إلى البوابة الجانبية. أُزيلت المنطقة من الخريطة عند ${tc} ث، أول لحظة خلت فيها من الناس.`,
    fireRes: (n, p) => `إخلاء ${p} شخصًا، ${n} تشغيلات بنفس أماكن البداية في الحالتين. المتوسط وتحته أقل وأعلى قيمة؛ الفرق محسوب لكل تشغيلة.`,
    fireCol: { m: "المقياس", no: "دون إغلاق", yes: "مع إغلاق", diff: "الفرق" },
    fireM: { last_out_s: "زمن خروج آخر شخص (ث)", avg_time_s: "متوسط زمن الخروج (ث)", peak_near_gates: "ذروة الناس قرب البوابات (3 م)", peak_density: "أعلى كثافة (شخص/م²)", not_out: "لم يخرجوا" },
    fireFind: (p, tc) => `النتيجة عكس المتوقع: مع الإغلاق خرج آخر شخص أسرع بـ ${Math.abs(p.mean)}% في المتوسط (من ${Math.abs(p.max)}% إلى ${Math.abs(p.min)}%). السبب: دون إغلاق يذهب أغلب الناس للبوابة الرئيسية (الطريق الأقصر) وتبقى الجانبية شبه فارغة؛ إعادة التوجيه دفعتهم إليها فتوزّع الحمل؛ الإغلاق نفسه لا يفيد. الذروة لم تتغير لأنها تحدث قبل الثانية 30. المنطقة لم تُزل فعليًا إلا عند ${tc} ث في المتوسط، لأن من عبروا البوابة كانوا ما زالوا يمرّون بها.`,
    fireFindPlain: (p) => `الإغلاق غيّر زمن خروج آخر شخص بنسبة ${p.mean}% في المتوسط (من ${p.min}% إلى ${p.max}%).`,
    level: "عدد الزوار", lv_low: "منخفض", lv_medium: "متوسط", lv_peak: "ذروة",
    lvRate: (r, s) => `${r} شخص/ث لمدة ${s} ث`,
    lvNote: "منطقة تجريبية صغيرة؛ هذه ليست أرقام زوار إكسبو.",
    densKey: (y, r) => [`أقل من ${y} شخص/م²`, `من ${y} إلى ${r} شخص/م²`, `أكثر من ${r} شخص/م²`],
    densNote: (r) => `لون النقطة = عدد الناس داخل دائرة نصف قطرها ${r} م حول الزائر، مقسومًا على مساحتها.`,
    asmH: "افتراضات",
    asmSub: "قيم لم نقِسها؛ اخترناها نحن أو هي قيم المحاكي الافتراضية.",
    asm: (a, s) => [
      `حدود ألوان الكثافة: أخضر أقل من ${a.dens_yellow}، أصفر من ${a.dens_yellow} إلى ${a.dens_red}، أحمر أكثر من ${a.dens_red} شخص/م² (دائرة نصف قطرها ${a.dens_r} م).`,
      `مستويات الزوار: ${s.levels.low} و${s.levels.medium} و${s.levels.peak} شخص/ث لمدة ${s.arrive_s} ث؛ يتوقف التشغيل عند ${s.cap_s} ث، ومن بقي يُحسب "لم يخرج".`,
      `حدود الإنذار: مراقبة من ${a.warn_watch} شخص/م²، وإنذار من ${s.warn_alert} شخص/م² متوقّعة في منطقة البوابة بعد 10 ث.`,
      `زمن الاستجابة: الحل يبدأ بعد ${s.response_delay} ث من الإنذار.`,
      `البوابة الإضافية بعرض 1 م، ومن يراها يتجه لأقرب بوابة مفتوحة.`,
      `نسبة من يتبع المنظمين: ${s.compliance.map((c) => Math.round(c * 100) + "%").join(" و")}.`,
      `الدخول على دفعات: ${Math.round(s.batch_factor * 100)}% من معدل الوصول لمدة ${s.batch_s} ث.`,
      `سرعة المشي ${a.speed} م/ث (القيمة الافتراضية في JuPedSim)، ونصف قطر الشخص ${a.radius} م.`,
    ],
    doors: "الأبواب", d_one: "باب واحد مغلق", d_two: "البابان مفتوحان (للمقارنة)",
    zoneH: "منطقة البوابة الغربية",
    pause: "إيقاف", play: "تشغيل",
    warnH: "إنذار مبكر",
    warnSub: "عدد الأشخاص أمام كل بوابة، الآن وبعد 10 ثوانٍ.",
    warnNone: "لا يوجد توقّع لهذا السيناريو: النموذج مدرّب على تصميم الوصول التدريجي فقط.",
    resH: "النتائج على عدة تشغيلات",
    limH: "حدود صادقة",
    lim1: "التصميم تجريبي (غرفتان وبوابتان ومخرج)، وليس موقع إكسبو.",
    lim2: "النموذج مدرّب على محاكاتنا، فالنتائج تُثبت أن الطريقة تعمل داخل المحاكي، لا على حشود حقيقية.",
    lim3: "الحلول مُختبرة في هذا التصميم فقط، وزمن الاستجابة ونسبة الالتزام افتراضات.",
    lim4: "لا نمثّل الحريق أو الدخان، ولا نقدّم إخلاءً معتمدًا.",
    now: "الآن", in10: "بعد 10 ث (توقّع)", was: "توقّعنا قبل 10 ث",
    ok: "طبيعي", watch: "مراقبة", alert: "ازدحام متوقع",
    actualKey: "الفعلي", fcKey: "التوقّع (مرسوم عند وقته)",
    hover: (t, a, f) => `عند ${t} ث: الفعلي ${a}، التوقّع ${f}`,
    doorA: "البوابة الرئيسية", doorB: "البوابة الجانبية", gateShort: { A: "الرئيسية", B: "الجانبية", C: "الإضافية" },
    exit: "مخرج", entry: "من المترو", closedDoor: "مغلقة", zoneNote: "المستطيل المتقطع = منطقة العدّ أمام كل بوابة.",
    acc: (m, s, n) => `في هذه التشغيلة: خطأ التوقّع ${m} شخص لكل بوابة، مقابل ${s} لو افترضنا أن العدد لن يتغير (${n} قراءة).`,
    k_people: "زوار في هذه التشغيلة", k_total: "متوسط الزمن الكلي", k_dens: "أعلى كثافة", k_notout: "لم يخرجوا",
    k_avg: "متوسط الزمن", k_last: "آخر خروج", k_left: "بقوا في الداخل",
    alertMsg: (t, d) => `إنذار عند الثانية ${t}: النموذج يتوقّع ${d} شخص/م² أو أكثر عند البوابة خلال 10 ث.`,
    respMsg: (t, d) => `الحل يبدأ عند الثانية ${t} (بعد ${d} ث من الإنذار).`,
    noAlert: "لم يصدر إنذار في تشغيلة العرض بهذا المستوى.",
    solH: "الحلول بعد الإنذار",
    solNote: "الإنذار من نموذج التوقع؛ الحلول مُختبرة بالمحاكاة.",
    solSub: (n, a) => `متوسط ${n} تشغيلات، كل حل بنفس الـ seed ونفس سلسلة الوصول التي في "قبل". صدر الإنذار في ${a} من ${n}. الأرقام الصغيرة = أقل وأعلى قيمة. مرتبة من الأفضل للأسوأ: أولًا حسب عدد من لم يخرج، ثم متوسط الزمن الكلي. متوسط الزمن يُحسب لمن خرج فقط، لذلك لا يكفي وحده (غيّرنا الترتيب إلى هذا بعد رؤية النتائج).`,
    solNone: (n) => `لم يصدر إنذار في أي من التشغيلات الـ ${n} بهذا المستوى، فلم يبدأ أي حل والنتائج مطابقة لـ "قبل".`,
    v_extra_gate: "فتح بوابة إضافية", v_extra_gate_d: (s) => `فتحة جديدة في الجدار تُفتح بعد ${s.response_delay} ث من الإنذار.`,
    v_stewards: (c) => `نشر منظمين (يلتزم ${c}%)`, v_stewards_d: (c, s) => `بعد ${s.response_delay} ث، ${c}% من الواصلين ومن في غرفة الدخول يُوجَّهون للبوابة الأقل زحامًا.`,
    v_batch: "الدخول على دفعات", v_batch_d: (s) => `الدخول ينخفض إلى ${Math.round(s.batch_factor * 100)}% لمدة ${s.batch_s} ث؛ الانتظار خارج المنطقة محسوب في الزمن الكلي.`,
    m: { avg_total_s: "متوسط الزمن الكلي (ث)", avg_wait_outside_s: "الانتظار خارج المنطقة (ث)", peak_density: "أعلى كثافة (شخص/م²)", danger_s: "مدة وجود نقاط حمراء (ث)", not_out: "لم يخرجوا" },
    before: "قبل (بدون حل)", after: "بعد",
    tryBtn: "جرّب الحل", cmpH: (n) => `قبل وبعد: ${n}`, cmpClose: "إغلاق المقارنة",
    cmpSub: (n) => `الإعادتان من تشغيلة العرض (seed ${n})؛ الجدول متوسط كل التشغيلات.`,
    col: { metric: "المقياس", before: "قبل", after: "بعد", diff: "الفرق", case: "الحالة", avg: "متوسط الزمن (ث)", last: "آخر خروج (ث)", peak: "ذروة الزحمة" },
    resSubEvac: (n) => `${n} تشغيلات، أماكن البداية تختلف في كل تشغيلة. المتوسط وتحته أقل وأعلى قيمة.`,
    two: "البابان مفتوحان", one: "باب واحد مغلق",
    f_closed: (p) => `إغلاق باب واحد رفع زمن خروج آخر شخص ${p.mean}% في المتوسط (من ${p.min}% إلى ${p.max}%).`,
    s: "ث",
    aiH: "على أي أساس يتوقع الذكاء الاصطناعي؟",
    aiRows: ["المدخلات", "المخرج", "نوع النموذج", "بيانات التدريب", "الدقة على بيانات لم يرها"],
    aiGate: (g) => ({
      h: "الإنذار اللحظي عند البوابة",
      v: [
        "عدد الناس أمام البوابة الآن وقبل 5 و10 ثوانٍ، وعدد المتجهين إليها، ومن وصلوا في آخر 5 ثوانٍ، وأي بوابة.",
        "عدد الناس أمام كل بوابة بعد 10 ثوانٍ.",
        "Gradient Boosting (أشجار قرار متتالية، scikit-learn).",
        `محاكاة فقط: ${g.runs} تشغيلة من محاكينا (${g.rows} قراءة). لا بيانات حشود حقيقية.`,
        `على ${g.test_runs} تشغيلات لم يتدرب عليها: خطأ ${g.mae_model} شخص في المتوسط، مقابل ${g.mae_same} لو افترضنا أن العدد لن يتغير (متوسط العدد ${g.mean_target}).`,
      ],
    }),
    calH: "التحقق من المحاكي ببيانات حقيقية",
    calSrc: "المصدر: Seyfried وآخرون 2007، تجربة Jülich، arXiv:physics/0702004، جدول 2.",
    calLede: (c) => `أعدنا تجربة حقيقية داخل المحاكي: ممر عرضه ${c.width} م وطوله ${c.length} م، والناس يبدؤون بكثافة ${c.rho} شخص/م² أمامه، ونقيس عدد من يعبر في الثانية. شغّلنا كل حالة ${c.seeds} مرات.`,
    calCol: { n: "عدد الأشخاص", real: "الحقيقي (شخص/ث)", sim: "المحاكي (شخص/ث)", diff: "الفرق" },
    calFind: (lo, hi) => `المحاكي بإعداداته الافتراضية يمرّر نحو نصف التدفق الحقيقي (أقل بنسبة ${lo}% إلى ${hi}%). معنى ذلك أن الزحام في محاكاتنا غالبًا أكبر من الواقع، وأن الأرقام المطلقة (الأزمنة والذروة) لا تُنقل للواقع كما هي. المقارنات بين الحلول تبقى على نفس المحاكي. معايرة المحاكي ليطابق هذه القيم عمل مستقبلي.`,
    calLim: [
      "طلاب وموظفون في مختبر يمشون بهدوء، وليسوا زوار معرض بأعمار وأحمال مختلفة.",
      "عرض منطقة الانتظار (4 م) افتراض منّا؛ الورقة تذكر الكثافة والمسافة فقط.",
      "قيمة FLOW = 1.3 في قاعدة التوجيه بقيت افتراضًا ولم نغيّرها.",
    ],
  },
  en: {
    brand: "Nasaq",
    tagline: "Rehearse gate crowds before they happen",
    introH: "New here? Read the console in three steps",
    intro1h: "Choose a situation", intro1: "Use the side panel: a crowd at the gate at the level you pick, a fire and evacuation, or a closed door.",
    intro2h: "Watch the replay and the warning", intro2: "Each dot is one visitor; its colour shows how crowded it is around them. The model warns 10 seconds ahead.",
    intro3h: "Compare the solutions", intro3: "After the alert we tested each solution by simulation. Press \"Try it\" to see before and after.",
    introMore: "How the system works", introClose: "Got it",
    simTag: "Simulation replay, not a live feed",
    siteH: "Where this zone sits", keyFlow: "Visitor flow towards the west gate", keyGate: "Simulated gate", keyOther: "Other gates (not simulated)",
    loadErr: (n) => `Could not load ${n}.json. Run sim/solutions.py and sim/export_web.py, then reload the page.`,
    h1: "Which gate will be crowded 10 seconds from now, and what helps?",
    lede: "Pick a visitor level, watch the crowd move, read the warning, then compare the solutions before and after.",
    plaza: "Central plaza", pavilions: "Pavilions", metro: "Metro", bus: "Buses", parking: "Parking",
    gateN: "North gate", gateE: "East gate", gateS: "South gate",
    gateW: "West gate", gateWnote: "Simulated zone",
    mapNote: "A simple illustrative sketch, not the official Expo 2030 map. The simulation covers one gate zone only (the west gate), using a test layout with two rooms and two gates.",
    scenario: "Scenario",
    sc_normal: "Crowd at the gate", sc_normal_d: "Visitors keep arriving at the level you pick, and everyone follows the signs to the main gate.",
    sc_closed: "Closed door", sc_closed_d: "40 people leave and one of the two doors is unavailable (a blocked route).",
    sc_fire: "Fire and evacuation", sc_fire_d: "The entry room is evacuated; at 30 s an area behind the main gate closes.",
    fireCase: "Case", f_closure: "With the area closed", f_noclosure: "Without closure (to compare)",
    fireNote: "We only simulate that the area becomes unavailable; we do not simulate fire or smoke spread, and this is not an evacuation safety certificate.",
    fireZone: "Closed area",
    fireMsg: (ft, tc) => `At ${ft} s the red area closed and people in the entry room were sent to the side gate. The area was removed from the map at ${tc} s, the first moment nobody stood in it.`,
    fireRes: (n, p) => `Evacuating ${p} people, ${n} runs with the same start positions in both cases. Mean, with lowest and highest value below; the change is computed per run.`,
    fireCol: { m: "Measure", no: "Without closure", yes: "With closure", diff: "Change" },
    fireM: { last_out_s: "Last person out (s)", avg_time_s: "Mean exit time (s)", peak_near_gates: "Peak people near the gates (3 m)", peak_density: "Highest density (persons/m²)", not_out: "Not out" },
    fireFind: (p, tc) => `The result is the opposite of what we expected: with the closure the last person got out ${Math.abs(p.mean)}% sooner on average (${Math.abs(p.max)}% to ${Math.abs(p.min)}%). Reason: without closure most people take the main gate (the shorter path) and the side gate stays almost empty; rerouting pushed them there and spread the load; the closure itself does not help. The peak did not change because it happens before 30 s. The area was only removed at ${tc} s on average, because people who had passed the gate were still walking through it.`,
    fireFindPlain: (p) => `The closure changed the time for the last person to get out by ${p.mean}% on average (${p.min}% to ${p.max}%).`,
    level: "Visitor level", lv_low: "Low", lv_medium: "Medium", lv_peak: "Peak",
    lvRate: (r, s) => `${r} ${r === 1 ? "person" : "persons"}/s for ${s} s`,
    lvNote: "A small test zone; these are not Expo visitor numbers.",
    densKey: (y, r) => [`Under ${y} persons/m²`, `${y} to ${r} persons/m²`, `Over ${r} persons/m²`],
    densNote: (r) => `Dot colour = people within ${r} m of the visitor, divided by the circle's area.`,
    asmH: "Assumptions",
    asmSub: "Values we did not measure: chosen by us or simulator defaults.",
    asm: (a, s) => [
      `Density colours: green under ${a.dens_yellow}, yellow ${a.dens_yellow} to ${a.dens_red}, red over ${a.dens_red} persons/m² (circle of ${a.dens_r} m radius).`,
      `Visitor levels: ${s.levels.low}, ${s.levels.medium} and ${s.levels.peak} persons/s for ${s.arrive_s} s; runs stop at ${s.cap_s} s and anyone left counts as "not out".`,
      `Warning limits: watch from ${a.warn_watch} person/m², alert from ${s.warn_alert} persons/m² forecast in a gate zone 10 s ahead.`,
      `Response time: a solution starts ${s.response_delay} s after the alert.`,
      `The extra gate is 1 m wide, and people who see it head for the nearest open gate.`,
      `Share of people who follow stewards: ${s.compliance.map((c) => Math.round(c * 100) + "%").join(", ")}.`,
      `Batched entry: ${Math.round(s.batch_factor * 100)}% of the arrival rate for ${s.batch_s} s.`,
      `Walking speed ${a.speed} m/s (JuPedSim default), person radius ${a.radius} m.`,
    ],
    doors: "Doors", d_one: "One door closed", d_two: "Both doors open (to compare)",
    zoneH: "West gate zone",
    pause: "Pause", play: "Play",
    warnH: "Early warning",
    warnSub: "People in front of each gate, now and in 10 seconds.",
    warnNone: "No forecast for this scenario: the model was trained on the gradual-arrival layout only.",
    resH: "Results over several runs",
    limH: "Honest limits",
    lim1: "The layout is a test layout (two rooms, two gates, one exit), not the Expo site.",
    lim2: "The model is trained on our own simulations, so results show the method works inside the simulator, not on real crowds.",
    lim3: "The solutions are tested in this layout only; response time and compliance are assumptions.",
    lim4: "We do not model fire or smoke, and this is not a certified evacuation plan.",
    now: "Now", in10: "In 10 s (forecast)", was: "Forecast 10 s ago",
    ok: "Normal", watch: "Watch", alert: "Crowding expected",
    actualKey: "Actual", fcKey: "Forecast (drawn at its target time)",
    hover: (t, a, f) => `At ${t} s: actual ${a}, forecast ${f}`,
    doorA: "Main gate", doorB: "Side gate", gateShort: { A: "Main", B: "Side", C: "Extra" },
    exit: "Exit", entry: "From metro", closedDoor: "closed", zoneNote: "Dashed box = counting zone in front of each gate.",
    acc: (m, s, n) => `In this run: forecast error ${m} people per gate, versus ${s} if we assume the count stays the same (${n} readings).`,
    k_people: "Visitors in this run", k_total: "Average total time", k_dens: "Highest density", k_notout: "Not out",
    k_avg: "Average time", k_last: "Last out", k_left: "Still inside",
    alertMsg: (t, d) => `Alert at ${t} s: the model forecasts ${d} persons/m² or more at a gate within 10 s.`,
    respMsg: (t, d) => `A solution starts at ${t} s (${d} s after the alert).`,
    noAlert: "No alert in the replay run at this level.",
    solH: "Solutions after the alert",
    solNote: "The alert comes from the forecast model; the solutions are tested by simulation.",
    solSub: (n, a) => `Mean of ${n} runs; each solution uses the same seed and the same arrival sequence as "before". The alert was raised in ${a} of ${n}. Small numbers = lowest and highest value. Sorted best to worst: first by people not out, then by average total time. Average time counts only people who got out, so it is not enough on its own (we changed the ranking to this after seeing the results).`,
    solNone: (n) => `No alert in any of the ${n} runs at this level, so no solution started and the results equal "before".`,
    v_extra_gate: "Open an extra gate", v_extra_gate_d: (s) => `A new opening in the wall, opened ${s.response_delay} s after the alert.`,
    v_stewards: (c) => `Deploy stewards (${c}% follow)`, v_stewards_d: (c, s) => `After ${s.response_delay} s, ${c}% of arrivals and of people in the entry room are sent to the less crowded gate.`,
    v_batch: "Batched entry", v_batch_d: (s) => `Entry drops to ${Math.round(s.batch_factor * 100)}% for ${s.batch_s} s; waiting outside counts in the total time.`,
    m: { avg_total_s: "Average total time (s)", avg_wait_outside_s: "Waiting outside (s)", peak_density: "Highest density (persons/m²)", danger_s: "Time with red dots (s)", not_out: "Not out" },
    before: "Before (no action)", after: "After",
    tryBtn: "Try it", cmpH: (n) => `Before and after: ${n}`, cmpClose: "Close comparison",
    cmpSub: (n) => `Both replays are the display run (seed ${n}); the table is the mean over all runs.`,
    col: { metric: "Measure", before: "Before", after: "After", diff: "Change", case: "Case", avg: "Average time (s)", last: "Last out (s)", peak: "Peak crowd" },
    resSubEvac: (n) => `${n} runs with different start positions. Mean, with lowest and highest value below.`,
    two: "Both doors open", one: "One door closed",
    f_closed: (p) => `Closing one door raised the time for the last person to get out by ${p.mean}% on average (${p.min}% to ${p.max}%).`,
    s: "s",
    aiH: "What does the AI base its forecast on?",
    aiRows: ["Inputs", "Output", "Model type", "Training data", "Accuracy on data it never saw"],
    aiGate: (g) => ({
      h: "Early warning at the gate",
      v: [
        "People in front of the gate now and 5 and 10 seconds ago, people heading to it, arrivals in the last 5 seconds, and which gate.",
        "People in front of each gate 10 seconds from now.",
        "Gradient boosting (a sequence of decision trees, scikit-learn).",
        `Simulation only: ${g.runs} runs of our simulator (${g.rows} readings). No real crowd data.`,
        `On ${g.test_runs} runs it never trained on: error ${g.mae_model} people on average, versus ${g.mae_same} if we assume the count stays the same (mean count ${g.mean_target}).`,
      ],
    }),
    calH: "Checking the simulator against real data",
    calSrc: "Source: Seyfried et al. 2007, Jülich experiment, arXiv:physics/0702004, Table 2.",
    calLede: (c) => `We rebuilt a real experiment inside the simulator: a bottleneck ${c.width} m wide and ${c.length} m long, people starting in front of it at ${c.rho} persons/m², and we count how many pass per second. Each case ran ${c.seeds} times.`,
    calCol: { n: "People", real: "Real (persons/s)", sim: "Simulator (persons/s)", diff: "Difference" },
    calFind: (lo, hi) => `With its default settings the simulator passes about half the real flow (${lo}% to ${hi}% lower). So crowding in our simulations is probably larger than in reality, and absolute numbers (times, peaks) do not carry over as they are. Comparisons between solutions still use the same simulator. Calibrating the simulator to these values is future work.`,
    calLim: [
      "Students and staff walking calmly in a lab, not expo visitors of all ages carrying bags.",
      "The holding area width (4 m) is our assumption; the paper gives the density and the distance only.",
      "FLOW = 1.3 in the routing rule stays an assumption; we did not change it.",
    ],
  },
};

const ZONE_AREA = { A: 3.5 * 5, B: 3.5 * 3 };
const SHOWN = ["avg_total_s", "avg_wait_outside_s", "peak_density", "danger_s", "not_out"];
const ICON = { extra_gate: "🚪", stewards: "🦺", batch: "⏸️" };

const state = { lang: Nasaq.lang, scenario: "normal", doors: "one", level: "medium", fire: "closure", cmp: null };
const cache = {};
let summary = null, sol = null, fire = null, run = null, cmpRun = null;
let t = 0, playing = true, last = null;

const $ = (s) => document.querySelector(s);
const tr = () => Nasaq.t();
const reduced = Nasaq.reduced;
const store = Nasaq.store, load = Nasaq.load;
const asm = () => summary.assumptions;
const set = () => sol.settings;

async function getJSON(name) {
  if (!cache[name]) {
    const res = await fetch(window.DATA_URL + name + ".json");
    if (!res.ok) throw new Error(name + ".json: " + res.status);
    cache[name] = await res.json();
  }
  return cache[name];
}

function runName() {
  if (state.scenario === "closed") return state.doors === "one" ? "evac_one_door" : "evac_two_doors";
  if (state.scenario === "fire") return "fire_" + state.fire;
  return "sol_" + state.level + "_before";
}

function vName(v) {
  const L = tr();
  if (v.startsWith("stewards")) return L.v_stewards(Math.round(parseFloat(v.split("_")[1]) * 100));
  return L["v_" + v];
}
function vDesc(v) {
  const L = tr();
  if (v.startsWith("stewards")) return L.v_stewards_d(Math.round(parseFloat(v.split("_")[1]) * 100), set());
  return L["v_" + v + "_d"](set());
}

/* ---------- language: site.js swaps the strings, then calls this ---------- */
function applyLang() {
  state.lang = Nasaq.lang;
  setPlay();
  renderStatic();
}

function setPlay() {
  document.querySelectorAll(".play-btn").forEach((b) => {
    b.querySelector(".play-txt").textContent = playing ? tr().pause : tr().play;
    b.querySelector("use").setAttribute("href", playing ? "#i-pause" : "#i-play");
  });
}

/* ---------- numbers count up to their new value ---------- */
function countTo(el, to, dec, unit) {
  if (to === null || to === undefined) { el.textContent = "–"; delete el.dataset.v; return; }
  const fmt = (v) => v.toFixed(dec) + (unit ? `<small>${unit}</small>` : "");
  const from = parseFloat(el.dataset.v);
  el.dataset.v = to;
  if (reduced.matches || isNaN(from) || from === to) { el.innerHTML = fmt(to); return; }
  const t0 = performance.now(), dur = 650;
  (function step(now) {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.innerHTML = fmt(from + (to - from) * e);
    if (k < 1 && el.dataset.v == to) requestAnimationFrame(step);
  })(t0);
}

/* ---------- stage background: visitors squeeze through a gap and spread out again ---------- */
(function flowField() {
  const c = $("#flowbg"); if (!c) return;
  const g = c.getContext("2d");
  let w = 0, h = 0, on = true, raf = 0;
  const P = Array.from({ length: 220 }, () => ({ x: Math.random(), lane: (Math.random() + Math.random() - 1), v: 0.0008 + Math.random() * 0.0009, r: 0.9 + Math.random() * 1.3 }));
  function size() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * d; c.height = h * d; g.setTransform(d, 0, 0, d, 0, 0);
  }
  // half-width of the stream at position x: wide, narrowing to a gate at x = 0.62, then widening
  const spread = (x) => 0.025 + 0.3 * Math.pow(Math.min(1, Math.abs(x - 0.62) / 0.55), 1.4);
  function frame() {
    g.clearRect(0, 0, w, h);
    const rtl = document.documentElement.dir === "rtl";
    for (const p of P) {
      const slow = 1 - 0.55 * Math.exp(-Math.pow((p.x - 0.62) / 0.08, 2)); // people slow down at the gap
      if (!reduced.matches) p.x += p.v * slow;
      if (p.x > 1.02) { p.x = -0.02; p.lane = Math.random() * 2 - 1; }
      const px = (rtl ? 1 - p.x : p.x) * w, py = h * (0.7 + p.lane * spread(p.x));
      const near = Math.exp(-Math.pow((p.x - 0.62) / 0.1, 2));
      const tail = 10 * slow * (rtl ? 1 : -1);  // short streak behind each person
      g.strokeStyle = `rgba(${Math.round(125 + 120 * near)},${Math.round(182 - 8 * near)},${Math.round(240 - 150 * near)},${0.3 + 0.5 * near})`;
      g.lineWidth = p.r * 1.6; g.lineCap = "round";
      g.beginPath(); g.moveTo(px + tail, py); g.lineTo(px, py); g.stroke();
    }
    if (on && !reduced.matches) raf = requestAnimationFrame(frame);
  }
  size(); frame();
  new ResizeObserver(() => { size(); if (reduced.matches) frame(); }).observe(c);
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => {
    on = e.isIntersecting; cancelAnimationFrame(raf); if (on) frame();
  }).observe(c);
})();

/* ---------- replay drawing (shared by the main canvas and the two comparison canvases) ---------- */
const cv = $("#cv");
const S = 48, OX = 20, OY = 20;
const X = (x) => OX + x * S, Y = (y) => OY + (10 - y) * S;
// read colours from the canvas itself: it sits inside the always-dark stage
const css = (v) => getComputedStyle(cv).getPropertyValue(v).trim();

function poly(ctx, pts) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
  ctx.closePath();
}

function agentsAt(r, time) {
  const f = r.frames, step = f.length > 1 ? f[1].t - f[0].t : 0.5;
  const i = Math.max(0, Math.min(Math.floor(time / step), f.length - 1));
  const a = f[i], b = f[Math.min(i + 1, f.length - 1)];
  const w = b === a ? 0 : Math.min(1, Math.max(0, (time - a.t) / (b.t - a.t)));
  const next = new Map(b.a.map((p) => [p[3], p]));
  return a.a.map((p) => {
    const q = next.get(p[3]);
    return q ? [p[0] + (q[0] - p[0]) * w, p[1] + (q[1] - p[1]) * w, p[2], p[3], w < 0.5 ? p[4] : q[4]] : p;
  });
}

function drawRun(canvas, r, time) {
  const ctx = canvas.getContext("2d"), L = tr(), font = css("--font");
  const opened = r.poly_after && r.t_response !== null && time >= r.t_response;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  poly(ctx, opened ? r.poly_after : r.poly); ctx.fillStyle = css("--site"); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = css("--line-strong"); ctx.stroke();
  (opened ? r.holes_after : r.holes).forEach((h) => { poly(ctx, h); ctx.fillStyle = css("--wall"); ctx.fill(); });
  const burning = r.fire && time >= r.fire_t;
  if (burning) {  // the closed area: shown from the moment it closes; removed from the walkable map once empty
    const f = r.fire;
    ctx.fillStyle = css("--alert-bg"); ctx.fillRect(X(f[0]), Y(f[3]), (f[2] - f[0]) * S, (f[3] - f[1]) * S);
    ctx.strokeStyle = css("--alert"); ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
    ctx.strokeRect(X(f[0]), Y(f[3]), (f[2] - f[0]) * S, (f[3] - f[1]) * S); ctx.setLineDash([]);
    ctx.font = `600 14px ${font}`; ctx.fillStyle = css("--alert"); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(L.fireZone, X((f[0] + f[2]) / 2 + 0.3), Y(f[3] - 0.5));
  }

  ctx.font = `500 15px ${font}`; ctx.textBaseline = "middle";
  for (const [name, z] of Object.entries(r.zones)) {
    ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5;
    ctx.strokeStyle = css(name === "A" ? "--door-a" : "--door-b");
    ctx.strokeRect(X(z[0]), Y(z[3]), (z[2] - z[0]) * S, (z[3] - z[1]) * S);
    ctx.setLineDash([]);
  }
  r.doors.forEach((d) => {
    const yc = (d.y0 + d.y1) / 2;
    ctx.textAlign = "left";
    if (d.name === "C") {
      if (opened) { ctx.fillStyle = css("--ok"); ctx.fillText(L.gateShort.C, X(11.0), Y(yc)); }
    } else if (d.open && !(burning && d.name === "A")) {
      ctx.fillStyle = css(d.name === "A" ? "--door-a" : "--door-b");
      ctx.fillText(L.gateShort[d.name], X(11.0), Y(yc));
    } else {
      ctx.strokeStyle = css("--alert"); ctx.lineWidth = 4;
      const cx = X(10.2), cy = Y(yc), rr = 12;
      ctx.beginPath(); ctx.moveTo(cx - rr, cy - rr); ctx.lineTo(cx + rr, cy + rr);
      ctx.moveTo(cx + rr, cy - rr); ctx.lineTo(cx - rr, cy + rr); ctx.stroke();
      ctx.fillStyle = css("--alert");
      ctx.fillText(L.gateShort[d.name] + " " + L.closedDoor, X(11.0), Y(yc));
    }
  });
  const e = r.exit;
  ctx.fillStyle = css("--ok-bg"); ctx.fillRect(X(e[0]), Y(e[3]), (e[2] - e[0]) * S, (e[3] - e[1]) * S);
  ctx.textAlign = "center"; ctx.fillStyle = css("--ok"); ctx.fillText(L.exit, X(18.2), Y(6.0));
  ctx.fillStyle = css("--muted"); ctx.textAlign = "left"; ctx.fillText(L.entry, X(0.25), Y(9.6));

  // colour = local density level computed in sim/ (0 green, 1 yellow, 2 red)
  const col = [css("--ok"), css("--watch"), css("--alert")];
  agentsAt(r, time).forEach((p) => {
    ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 0.2 * S, 0, Math.PI * 2);
    ctx.fillStyle = col[p[4]]; ctx.fill();
  });
}

function endTime() {
  const e = run.frames[run.frames.length - 1].t;
  return cmpRun ? Math.max(e, cmpRun.frames[cmpRun.frames.length - 1].t) : e;
}

function tick(now) {
  if (last !== null && playing && run) {
    t += ((now - last) / 1000) * Number($("#speed").value);
    if (t > endTime()) t = 0;
  }
  last = now;
  if (run && summary) {
    drawRun(cv, run, t);
    if (cmpRun && !$("#compare").hidden) { drawRun($("#cv-before"), run, t); drawRun($("#cv-after"), cmpRun, t); }
    updateLive();
  }
  requestAnimationFrame(tick);
}

/* ---------- warning panel ---------- */
function statusOf(name, f) {
  const d = f / ZONE_AREA[name];
  return d >= set().warn_alert ? "alert" : d >= asm().warn_watch ? "watch" : "ok";
}

function renderDoors() {
  const box = $("#doors");
  box.innerHTML = "";
  const has = run.panel.length > 0;
  $("#warn-none").hidden = has;
  if (!has) { $("#accuracy").textContent = ""; return; }
  const L = tr();
  ["A", "B"].forEach((name) => {
    const c = name === "A" ? "var(--door-a)" : "var(--door-b)";
    const el = document.createElement("div");
    el.className = "door"; el.style.setProperty("--c", c); el.dataset.door = name;
    el.innerHTML = `
      <div class="door-top"><span class="door-name">${name === "A" ? L.doorA : L.doorB}</span><span class="status"></span></div>
      <div class="nums">
        <div><b data-k="now">0</b><small>${L.now}</small></div>
        <div><b data-k="f10">0</b><small>${L.in10}</small></div>
        <div><b data-k="was">-</b><small>${L.was}</small></div>
      </div>
      <svg dir="ltr" viewBox="0 0 300 86" preserveAspectRatio="none" role="img" aria-label="${L.actualKey} / ${L.fcKey}">
        <line class="axis" x1="0" y1="80" x2="300" y2="80"/>
        <path class="actual"/><path class="fc"/><line class="now" y1="0" y2="80"/>
        <text class="ymax" x="4" y="9"></text>
      </svg>
      <div class="chart-key"><span><i></i>${L.actualKey}</span><span><i class="dash"></i>${L.fcKey}</span></div>
      <p class="hint readout"></p>`;
    box.appendChild(el);
    const svg = el.querySelector("svg");
    svg.addEventListener("mousemove", (ev) => {
      const r = svg.getBoundingClientRect();
      const tt = (((ev.clientX - r.left) / r.width) * 300 - 24) / 276 * chartEnd();
      const k = Math.max(0, Math.min(run.panel.length - 1, Math.round(tt / 5)));
      const p = run.panel[k], pf = run.panel[k - 2];
      el.querySelector(".readout").textContent = L.hover(p.t, p[name].now, pf ? pf[name].f10 : "-");
    });
    svg.addEventListener("mouseleave", () => { el.querySelector(".readout").textContent = ""; });
  });
  const acc = [], base = [];
  run.panel.forEach((p) => ["A", "B"].forEach((n) => {
    if (p[n].a10 !== null) { acc.push(Math.abs(p[n].f10 - p[n].a10)); base.push(Math.abs(p[n].now - p[n].a10)); }
  }));
  const mean = (a) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  $("#accuracy").textContent = L.acc(mean(acc), mean(base), acc.length);
}

function chartEnd() { return run.panel[run.panel.length - 1].t + 10; }

function updateLive() {
  $("#clock").textContent = t.toFixed(1) + " " + tr().s;
  $("#scrub").value = Math.round((t / endTime()) * 1000);
  if ($("#cmp-clock")) { $("#cmp-clock").textContent = $("#clock").textContent; $("#cmp-scrub").value = $("#scrub").value; }
  const ab = $("#alert-bar");
  if (state.scenario === "fire") ab.classList.toggle("on", t >= run.fire_t);
  if (state.scenario === "normal" && run.t_alert !== undefined) {
    const on = run.t_alert !== null && t >= run.t_alert;
    ab.classList.toggle("on", on);
    ab.hidden = run.t_alert === null ? false : !on;
  }
  if (!run.panel.length) return;
  const k = Math.min(Math.floor(t / 5), run.panel.length - 1);
  const p = run.panel[k], pf = run.panel[k - 2];
  const ymax = Math.max(4, ...run.panel.flatMap((q) => [q.A.now, q.B.now, q.A.f10, q.B.f10]));
  const end = chartEnd();
  const px = (x) => 24 + (x / end) * 276, py = (y) => 80 - (y / ymax) * 70;
  document.querySelectorAll(".door").forEach((el) => {
    const n = el.dataset.door;
    el.querySelector('[data-k="now"]').textContent = p[n].now;
    el.querySelector('[data-k="f10"]').textContent = Math.round(p[n].f10);
    el.querySelector('[data-k="was"]').textContent = pf ? Math.round(pf[n].f10) : "-";
    const st = statusOf(n, p[n].f10), s = el.querySelector(".status");
    s.classList.remove("ok", "watch", "alert"); s.classList.add("status", st);
    if (s.dataset.st !== st || s.dataset.lang !== state.lang) {
      if (s.dataset.st) { s.classList.remove("bump"); void s.offsetWidth; s.classList.add("bump"); }
      s.dataset.st = st; s.dataset.lang = state.lang;
      s.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-${st}"/></svg>${tr()[st]}`;
    }
    const seen = run.panel.slice(0, k + 1);
    el.querySelector(".actual").setAttribute("d", seen.map((q, i) => (i ? "L" : "M") + px(q.t) + "," + py(q[n].now)).join(""));
    el.querySelector(".fc").setAttribute("d", seen.map((q, i) => (i ? "L" : "M") + px(q.t + 10) + "," + py(q[n].f10)).join(""));
    const nl = el.querySelector(".now");
    nl.setAttribute("x1", px(t)); nl.setAttribute("x2", px(t));
    el.querySelector(".ymax").textContent = Math.round(ymax);
  });
}

/* ---------- solutions: cards, then before/after ---------- */
const fmt1 = (v) => (v === null || v === undefined ? "–" : v.toFixed(1));
const rngTxt = (v) => (v ? `<small class="rng" dir="ltr">${fmt1(v.min)}–${fmt1(v.max)}</small>` : "");
const signed = (v) => (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(1);

function deltaCell(ch) {
  if (!ch) return "–";
  const cls = ch.mean < 0 ? "better" : ch.mean > 0 ? "worse" : "same";
  return `<span class="delta ${cls}" dir="ltr">${signed(ch.mean)}</span>${rngTxt(ch)}`;
}

function renderSolutions() {
  const L = tr(), lv = sol.levels[state.level], n = sol.seeds;
  $("#sol-note").textContent = L.solNote;
  if (!lv.alerts) {
    $("#sol-sub").textContent = L.solNone(n);
    $("#sol-cards").innerHTML = "";
    return;
  }
  $("#sol-sub").textContent = L.solSub(n, lv.alerts);
  const vs = Object.keys(lv.variants).filter((v) => v !== "before")
    // rank: fewest people not out first, then average total time (changed after seeing results, see CLAUDE.md)
    .sort((a, b) => (lv.variants[a].metrics.not_out.mean - lv.variants[b].metrics.not_out.mean)
      || (lv.variants[a].metrics.avg_total_s.mean - lv.variants[b].metrics.avg_total_s.mean));
  const before = lv.variants.before.metrics;
  $("#sol-cards").innerHTML = vs.map((v, i) => {
    const x = lv.variants[v];
    const rows = SHOWN.map((m) => `<tr><th scope="row">${L.m[m]}</th><td class="num">${fmt1(before[m].mean)}</td><td class="num">${fmt1(x.metrics[m].mean)}</td><td class="num">${deltaCell(x.change[m])}</td></tr>`).join("");
    return `<article class="sol-card${state.cmp === v ? " sel" : ""}">
      <header><span class="sol-rank">${i + 1}</span><span class="sol-ico" aria-hidden="true">${ICON[v.split("_")[0] === "extra" ? "extra_gate" : v.split("_")[0]]}</span><h3>${vName(v)}</h3></header>
      <p class="sol-d">${vDesc(v)}</p>
      <table class="sol-t"><thead><tr><th></th><th class="num">${L.col.before}</th><th class="num">${L.col.after}</th><th class="num">${L.col.diff}</th></tr></thead><tbody>${rows}</tbody></table>
      <button class="btn btn-primary try" type="button" data-v="${v}">${L.tryBtn}</button>
    </article>`;
  }).join("");
  document.querySelectorAll(".try").forEach((b) => b.addEventListener("click", () => openCompare(b.dataset.v)));
}

async function openCompare(v) {
  state.cmp = v;
  try { cmpRun = await getJSON("sol_" + state.level + "_" + v); } catch (e) { cmpRun = null; return; }
  $("#compare").hidden = false;
  renderCompare();
  renderSolutions();
  t = 0; playing = true; setPlay();
  $("#compare").scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
}

function closeCompare() {
  state.cmp = null; cmpRun = null;
  $("#compare").hidden = true;
  if (sol) renderSolutions();
}

function renderCompare() {
  if (!state.cmp || !cmpRun) return;
  const L = tr(), lv = sol.levels[state.level], v = state.cmp, x = lv.variants[v], b = lv.variants.before;
  $("#cmp-h").textContent = L.cmpH(vName(v));
  $("#cmp-sub").textContent = L.cmpSub(sol.replay_seed);
  $("#cmp-after-h").textContent = L.after + ": " + vName(v);
  $("#cmp-table").innerHTML = `<thead><tr><th>${L.col.metric}</th><th class="num">${L.col.before}</th><th class="num">${L.col.after}</th><th class="num">${L.col.diff}</th></tr></thead><tbody>` +
    SHOWN.map((m) => `<tr><td>${L.m[m]}</td><td class="num">${fmt1(b.metrics[m].mean)}${rngTxt(b.metrics[m])}</td><td class="num">${fmt1(x.metrics[m].mean)}${rngTxt(x.metrics[m])}</td><td class="num">${deltaCell(x.change[m])}</td></tr>`).join("") + "</tbody>";
}

/* ---------- AI card and simulator check (data/web/ai_card.json, calibration.json) ---------- */
let aiCard = null, calib = null;
function renderEvidence() {
  const L = tr();
  $("#aicard").hidden = !aiCard;
  if (aiCard) {
    const cards = [L.aiGate(aiCard.gate)];
    $("#ai-grid").innerHTML = cards.map((c) => `<article class="ai-card"><h3>${c.h}</h3><dl>${
      c.v.map((v, i) => `<div><dt>${L.aiRows[i]}</dt><dd>${v}</dd></div>`).join("")}</dl></article>`).join("");
  }
  $("#calib").hidden = !calib;
  if (calib) {
    const c = L.calCol;
    $("#cal-src").textContent = L.calSrc;
    $("#cal-lede").textContent = L.calLede(calib);
    $("#cal-table").innerHTML = `<thead><tr><th>${c.n}</th><th class="num">${c.real}</th><th class="num">${c.sim}</th><th class="num">${c.diff}</th></tr></thead><tbody>` +
      calib.rows.map((r) => `<tr><td>${r.n}</td><td class="num">${r.real.toFixed(2)}</td><td class="num">${r.sim.toFixed(2)}<small class="rng" dir="ltr">${r.sim_min.toFixed(2)}–${r.sim_max.toFixed(2)}</small></td><td class="num"><span dir="ltr">${r.diff_pct > 0 ? "+" : ""}${r.diff_pct}%</span></td></tr>`).join("") + "</tbody>";
    const d = calib.rows.map((r) => Math.abs(r.diff_pct));
    $("#cal-finding").textContent = L.calFind(Math.round(Math.min(...d)), Math.round(Math.max(...d)));
    $("#cal-limits").innerHTML = L.calLim.map((s) => `<li>${s}</li>`).join("");
  }
}

/* ---------- static parts ---------- */
function renderStatic() {
  renderEvidence();
  if (!summary || !run) return;
  const L = tr(), a = asm();
  const keys = L.densKey(a.dens_yellow, a.dens_red);
  $("#replay-legend").innerHTML = `<span style="--c:var(--ok)">${keys[0]}</span><span style="--c:var(--watch)">${keys[1]}</span><span style="--c:var(--alert)">${keys[2]}</span>`;
  $("#dens-note").textContent = L.densNote(a.dens_r) + (run.panel.length ? " " + L.zoneNote : "");
  if (sol) {
    document.querySelectorAll("[data-lv]").forEach((el) => { el.textContent = L.lvRate(set().levels[el.dataset.lv], set().arrive_s); });
    $("#thr").textContent = L.asm(a, set())[2];
    $("#asm-list").innerHTML = L.asm(a, set()).map((s) => `<li>${s}</li>`).join("");
  }
  renderDoors();
  if (run.panel.length) updateLive();

  const normal = state.scenario === "normal";
  $("#results").hidden = normal;
  $("#solutions").hidden = !normal;
  const ab = $("#alert-bar");
  ab.hidden = !normal;
  if (normal && sol) {
    const rr = sol.levels[state.level].variants.before.replay_run;
    const set4 = [[L.k_people, rr.people, 0, ""], [L.k_total, rr.avg_total_s, 1, L.s], [L.k_dens, rr.peak_density, 1, ""], [L.k_notout, rr.not_out, 0, ""]];
    set4.forEach(([lab, v, d, u], i) => { $("#k" + i + "-l").textContent = lab; countTo($("#k" + i), v, d, u); });
    ab.innerHTML = run.t_alert === null ? `<span>${L.noAlert}</span>`
      : `<svg class="ico" aria-hidden="true"><use href="#i-alert"/></svg><span>${L.alertMsg(run.t_alert, set().warn_alert)} ${run.t_response !== null ? L.respMsg(run.t_response, set().response_delay) : ""}</span>`;
    renderSolutions();
    renderCompare();
  } else if (state.scenario === "fire" && fire) {
    const rr = fire.replay_run[state.fire], c = L.fireCol;
    const set4 = [[L.k_people, fire.people, 0, ""], [L.k_avg, rr.avg_time_s, 1, L.s], [L.k_last, rr.last_out_s, 1, L.s], [L.k_notout, rr.not_out, 0, ""]];
    set4.forEach(([lab, v, d, u], i) => { $("#k" + i + "-l").textContent = lab; countTo($("#k" + i), v, d, u); });
    ab.hidden = state.fire !== "closure";
    ab.innerHTML = `<svg class="ico" aria-hidden="true"><use href="#i-alert"/></svg><span>${L.fireMsg(fire.fire_t, run.t_response)}</span>`;
    const cell = (v) => `${v.mean.toFixed(1)}<small class="rng" dir="ltr">${v.min.toFixed(1)}–${v.max.toFixed(1)}</small>`;
    const ms = ["last_out_s", "avg_time_s", "peak_near_gates", "peak_density", "not_out"];
    $("#res-sub").textContent = L.fireRes(fire.seeds, fire.people);
    $("#res-table").innerHTML = `<thead><tr><th>${c.m}</th><th class="num">${c.no}</th><th class="num">${c.yes}</th><th class="num">${c.diff}</th></tr></thead><tbody>` +
      ms.map((m) => `<tr><td>${L.fireM[m]}</td><td class="num">${cell(fire.cases.no_closure[m])}</td><td class="num">${cell(fire.cases.closure[m])}</td><td class="num">${deltaCell(fire.change[m])}</td></tr>`).join("") + "</tbody>";
    const p = fire.last_out_pct;
    $("#finding").textContent = p.max < 0 ? L.fireFind(p, fire.t_closed.mean) : L.fireFindPlain(p);
  } else {
    const r = run.run;
    const set4 = [[L.k_people, r.people, 0, ""], [L.k_avg, r.avg_time_s, 1, L.s], [L.k_last, r.last_out_s, 1, L.s], [L.k_left, r.unfinished, 0, ""]];
    set4.forEach(([lab, v, d, u], i) => { $("#k" + i + "-l").textContent = lab; countTo($("#k" + i), v, d, u); });
    const ev = summary.evac, c = L.col;
    const cell = (v) => `${v.mean.toFixed(1)}<small class="rng" dir="ltr">${v.min.toFixed(1)}–${v.max.toFixed(1)}</small>`;
    $("#res-sub").textContent = L.resSubEvac(ev.seeds);
    $("#res-table").innerHTML = `<thead><tr><th>${c.case}</th><th class="num">${c.last}</th><th class="num">${c.avg}</th><th class="num">${c.peak}</th></tr></thead><tbody>` +
      ev.rows.map((r) => {
        const sel = (r.case === "closed") === (state.doors === "one");
        return `<tr class="${sel ? "sel" : ""}"><td>${r.case === "closed" ? L.one : L.two}</td><td class="num">${cell(r.last_person_out_s)}</td><td class="num">${cell(r.average_time_s)}</td><td class="num">${cell(r.peak_crowd_before_wall)}</td></tr>`;
      }).join("") + "</tbody>";
    $("#finding").textContent = L.f_closed(ev.last_out_pct);
  }
}

async function select() {
  const closed = state.scenario === "closed";
  $("#door-set").hidden = !closed;
  $("#fire-set").hidden = state.scenario !== "fire";
  $("#level-set").hidden = state.scenario !== "normal";
  const flows = $("#flows");
  flows.classList.toggle("surge", state.scenario === "normal" && state.level === "peak");
  flows.classList.toggle("closed", closed);
  closeCompare();
  try {
    run = await getJSON(runName());
  } catch (err) {
    $("#run-meta").textContent = tr().loadErr(runName());
    return;
  }
  $("#run-meta").textContent = "";
  t = 0;
  renderStatic();
  const vf = $(".viewfinder");
  vf.classList.remove("scan"); void vf.offsetWidth; vf.classList.add("scan");
}

/* ---------- wiring ---------- */
document.querySelectorAll('input[name="scenario"], input[name="doors"], input[name="level"], input[name="fire"]').forEach((el) =>
  el.addEventListener("change", () => { state[el.name] = el.value; store("nasaq-" + el.name, el.value); select(); }));

document.querySelectorAll(".play-btn").forEach((b) => b.addEventListener("click", () => { playing = !playing; setPlay(); }));
$("#cmp-close").addEventListener("click", closeCompare);
// first-visit intro: shown until dismissed
if (load("nasaq-intro") !== "0") $("#intro").hidden = false;
$("#intro-close").addEventListener("click", () => { $("#intro").hidden = true; store("nasaq-intro", "0"); });

const scrubTo = (e) => { if (run) t = (e.target.value / 1000) * endTime(); };
$("#scrub").addEventListener("input", scrubTo);
$("#cmp-scrub").addEventListener("input", scrubTo);
$("#cmp-speed").addEventListener("change", (e) => { $("#speed").value = e.target.value; });
$("#speed").addEventListener("change", (e) => { $("#cmp-speed").value = e.target.value; });

(async function init() {
  for (const k of ["scenario", "doors", "level", "fire"]) {
    const v = load("nasaq-" + k);
    const input = v && document.querySelector(`input[name="${k}"][value="${v}"]`);
    if (input) { input.checked = true; state[k] = v; }
  }
  // URL overrides, e.g. ?lang=en&level=peak&try=extra_gate&t=90 (handy for screenshots and the backup video)
  const q = new URLSearchParams(location.search);
  for (const k of ["scenario", "doors", "level", "fire"]) {
    const input = q.get(k) && document.querySelector(`input[name="${k}"][value="${q.get(k)}"]`);
    if (input) { input.checked = true; state[k] = q.get(k); }
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) playing = false;
  try { summary = await getJSON("summary"); sol = await getJSON("solutions"); } catch (e) { /* shown via run-meta below */ }
  try { fire = await getJSON("fire"); } catch (e) { /* fire scenario shows the load error */ }
  try { aiCard = await getJSON("ai_card"); } catch (e) { /* card stays hidden */ }
  try { calib = await getJSON("calibration"); } catch (e) { /* section stays hidden */ }
  Nasaq.init(T, applyLang);
  await select();
  if (q.get("try") && state.scenario === "normal" && sol && sol.levels[state.level].variants[q.get("try")]) await openCompare(q.get("try"));
  if (q.has("t")) { t = Math.min(Number(q.get("t")) || 0, endTime()); playing = false; setPlay(); }
  requestAnimationFrame(tick);
})();
