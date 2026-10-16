/* Führerschein Quest — licence roadmap for Osnabrück: two paths (Pakistani licence / no licence),
   12-week timeline, per-phase checklists, documents, places and costs. Last checked: October 2026. */
const Guide = (() => {
  const KEY = 'fq-guide-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const store = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage blocked */ } };
  const map = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const eur = n => n.toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' €';

  /* ---------- places ---------- */
  const PLACES = {
    buergeramt: { name: 'Bürgeramt Stadt Osnabrück', what: 'Register your address (Anmeldung) and get your Meldebescheinigung', addr: 'Stadthaus 1, Natruper-Tor-Wall 2, 49076 Osnabrück', how: 'Appointment only, book online at service.osnabrueck.de. Free of charge. Register within 2 weeks of moving in.' },
    fe: { name: 'Fahrerlaubnisbehörde (licence office) Stadt Osnabrück', what: 'Apply for your licence or the conversion of your Pakistani licence', addr: 'Stadthaus 1, Natruper-Tor-Wall 2, 1st floor, 49076 Osnabrück', how: 'Appointment only, book online at service.osnabrueck.de. Phone 0541 323-3339, fuehrerscheine@osnabrueck.de. People living in the city (also 49090) cannot use the Landkreis office.' },
    tuev: { name: 'TÜV NORD Station Osnabrück', what: 'Theory test, and the start of your practical test', addr: 'Rheinische Straße 17, 49084 Osnabrück', how: 'Driving licence office: Mon–Thu 08:00–16:00, Fri 08:00–13:30, fe-osnabrueckemsland@tuev-nord.de. Service line 0800 80 70 600. Usually your driving school books the test.' },
    optician: { name: 'Any optician (Optiker)', what: 'Eye test (Sehtest) for the licence', addr: 'Optiker Osnabrück Innenstadt', how: 'No appointment usually needed. Bring your passport. The certificate must not be older than 2 years.' },
    firstaid: { name: 'First-aid course (Erste-Hilfe-Kurs)', what: 'One-day course, 9 × 45 minutes', addr: 'Erste-Hilfe-Kurs Führerschein Osnabrück', how: 'Offered by DRK, Johanniter, Malteser and private providers. Book online. Many driving schools organise one for you.' },
    photo: { name: 'Biometric photo', what: '35 × 45 mm passport photo', addr: 'Passbild Osnabrück', how: 'Photo studio, drugstore photo booth, or the photo booth at the Stadthaus. Not older than about 1 year.' },
    adac: { name: 'ADAC licence translation', what: 'Translation and classification of your Pakistani licence', addr: 'ADAC Osnabrück', how: 'Order online at adac.de (“Führerschein übersetzen”) or at an ADAC office, about 65 €, ready in about 3–5 working days. A sworn translator (vereidigter Übersetzer) is also accepted.' },
    embassy: { name: 'Embassy of Pakistan, Berlin', what: 'Only if the licence office asks you to verify your licence', addr: 'Schaperstraße 29, 10719 Berlin', how: 'The licence office often checks the licence itself. Contact the embassy only if you are told to.' },
  };

  const SCHOOLS = [
    { n: 'Fahrschule Conen', a: 'Summerland 29, 49090 Osnabrück', area: 'Haste (49090)', t: '0541 6009608' },
    { n: 'Fahrschule Lachmann', a: 'Schwenkestraße 64, 49090 Osnabrück', area: '49090', t: '0541 129330' },
    { n: 'Fahrschule Telljohann', a: 'Lerchenstraße 28, 49088 Osnabrück', area: 'Sonnenhügel', t: '0541 6004050' },
    { n: 'Ulis Fahrschule', a: 'Lerchenstraße 57, 49088 Osnabrück', area: 'Sonnenhügel', t: '0541 75042687' },
    { n: 'Fahrschule Schweiger', a: 'Bramscher Straße 39, 49088 Osnabrück', area: 'Sonnenhügel', t: '0541 67676' },
    { n: 'Keck Fahrschule', a: 'In der Dodesheide 43, 49088 Osnabrück', area: 'Dodesheide', t: '0176 49817245' },
    { n: 'Fahrschule Kaiser', a: 'Prof.-Porsche-Straße 7, 49076 Osnabrück', area: 'Atter', t: '' },
    { n: 'Die Fahrschule Osnabrück', a: 'Hasestraße 63, 49074 Osnabrück', area: 'Altstadt', t: '' },
  ];

  /* ---------- paths ---------- */
  const PATHS = {
    a: {
      tab: 'I have a Pakistani licence',
      sub: 'With or without an International Driving Permit (IDP) from Pakistan',
      weeks: 10, length: 'about 6–10 weeks',
      intro: 'Pakistan is not on Germany’s list of states with a simplified conversion (Anlage 11 FeV). You keep your driving experience, but you must pass both the theory and the practical test in Germany. Driving lessons are not compulsory, but you need a driving school car for the practical test, and a few lessons to learn the German test style.',
      phases: [
        { id: 'a1', s: 'Arrive', w: [1, 1], title: 'Arrive, register, keep driving legally', where: ['buergeramt'],
          todo: ['Register your address at the Bürgeramt and keep the Meldebescheinigung', 'Write down the date you registered: your Pakistani licence is valid in Germany for 6 months from then', 'When driving, always carry the original Pakistani licence plus the IDP or a German translation', 'Check that your licence is a full licence (not a learner permit) and was issued while you lived in Pakistan'],
          docs: ['Passport and visa or residence permit', 'Rental contract and landlord confirmation (Wohnungsgeberbestätigung)', 'Pakistani driving licence (original)', 'International Driving Permit, if you have one'],
          costs: [['Address registration', 0, 0]] },
        { id: 'a2', s: 'Documents', w: [1, 2], title: 'Collect your documents', where: ['adac', 'optician', 'photo', 'firstaid'],
          todo: ['Order the ADAC translation of your licence (or use a sworn translator)', 'Do the eye test at an optician', 'Get a biometric photo', 'Do the one-day first-aid course (required by many offices for licences from non-listed states; confirm with the Osnabrück office)'],
          docs: ['Passport', 'Pakistani licence (original and copy)'],
          costs: [['ADAC translation and classification', 60, 70], ['Eye test', 7, 10], ['Biometric photo', 10, 20], ['First-aid course', 50, 70]] },
        { id: 'a3', s: 'Apply', w: [2, 2], title: 'Apply for the conversion (Umschreibung)', where: ['fe'],
          todo: ['Book an appointment at the licence office (book early, appointments fill up)', 'Hand in the application for conversion with all documents', 'Ask how long processing takes and whether they verify your licence with Pakistan', 'Ask whether the theory test can be booked directly with TÜV NORD or through a driving school'],
          docs: ['Passport and residence permit', 'Meldebescheinigung', 'Pakistani licence (original) and the translation', 'Eye test certificate', 'First-aid certificate', 'Biometric photo'],
          costs: [['Application fee (conversion with tests)', 40, 50]] },
        { id: 'a4', s: 'Learn the rules', w: [2, 6], title: 'Learn the German rules', where: [],
          todo: ['Practise theory every day: theorie24 for the official questions, Führerschein Quest for understanding', 'Focus on the differences: rechts vor links, priority signs, zebra crossings, Autobahn rules, 0.0 ‰ alcohol for new drivers', 'Pass 5 Führerschein Quest mock exams in a row with no more than 4 error points'],
          docs: [],
          costs: [['Learning app (you already have theorie24)', 0, 30]] },
        { id: 'a5', s: 'Driving lessons', w: [3, 7], title: 'Driving school for the practical part', where: ['school'],
          todo: ['Ask 2–3 driving schools for an “Umschreibung” package (lessons only, no compulsory special drives)', 'Take about 5–15 lessons to learn German test routes, mirror and shoulder checks and speed limits', 'Ask the instructor for a mock test drive'],
          docs: ['Passport', 'Confirmation from the licence office that your file was sent to TÜV NORD'],
          costs: [['Registration / base fee for conversion', 150, 400], ['Driving lessons, 5–15 × 45 min', 275, 1155]] },
        { id: 'a6', s: 'Theory test', w: [6, 7], title: 'Theory test at TÜV NORD', where: ['tuev'],
          todo: ['Take the theory test (choose English if German is hard for you)', 'Bring your passport', 'If you fail, you can retake it after at least 2 weeks'],
          docs: ['Passport'],
          costs: [['TÜV NORD theory test fee', 24.99, 24.99], ['Driving school fee for presenting you (if the school books it)', 0, 137]] },
        { id: 'a7', s: 'Practical test', w: [8, 10], title: 'Practical test and your German licence', where: ['tuev', 'school'],
          todo: ['Take the practical test in the driving school car with your instructor', 'Receive your German licence (card) after passing', 'Hand in your Pakistani licence if the office asks for it'],
          docs: ['Passport'],
          costs: [['TÜV NORD practical test fee', 129.83, 129.83], ['Driving school fee for presenting you', 180, 289]] },
      ],
    },
    b: {
      tab: 'I have no licence',
      sub: 'Full Class B training from zero',
      weeks: 12, length: 'about 12 weeks with daily study',
      intro: 'Three months is realistic if you start the paperwork in week 1, study theory every day and take 2–3 driving lessons a week. The application at the licence office takes several weeks, so it comes first.',
      phases: [
        { id: 'b1', s: 'Register', w: [1, 1], title: 'Register and prepare', where: ['buergeramt', 'optician', 'photo', 'firstaid'],
          todo: ['Register your address at the Bürgeramt and keep the Meldebescheinigung', 'Do the eye test at an optician', 'Get a biometric photo', 'Do the one-day first-aid course'],
          docs: ['Passport and visa or residence permit', 'Rental contract and landlord confirmation (Wohnungsgeberbestätigung)'],
          costs: [['Address registration', 0, 0], ['Eye test', 7, 10], ['Biometric photo', 10, 20], ['First-aid course', 50, 70]] },
        { id: 'b2', s: 'School + apply', w: [1, 2], title: 'Choose a driving school and apply', where: ['school', 'fe'],
          todo: ['Compare 2–3 driving schools near you (prices, English, waiting time for tests)', 'Sign the contract', 'Hand in the licence application at the licence office (some schools send it for you)'],
          docs: ['Passport and residence permit', 'Meldebescheinigung', 'Eye test certificate', 'First-aid certificate', 'Biometric photo'],
          costs: [['Application fee at the licence office', 43, 47]] },
        { id: 'b3', s: 'Theory classes', w: [2, 6], title: 'Theory classes and daily practice', where: ['school'],
          todo: ['Attend 14 double lessons of theory class (12 basic + 2 Class B)', 'Practise 45–60 minutes every day in theorie24 and Führerschein Quest', 'Pass 5 mock exams in a row with no more than 4 error points'],
          docs: [],
          costs: [['Driving school base fee (includes theory classes)', 350, 565], ['Learning app (you already have theorie24)', 0, 30]] },
        { id: 'b4', s: 'Theory test', w: [6, 7], title: 'Theory test at TÜV NORD', where: ['tuev'],
          todo: ['Your school books the test once the licence office has sent your file to TÜV NORD', 'Take the test (available in English)', 'If you fail, retake it after at least 2 weeks'],
          docs: ['Passport', 'Confirmation of completed theory classes (from your school)'],
          costs: [['TÜV NORD theory test fee', 24.99, 24.99], ['Driving school fee for presenting you', 60, 137]] },
        { id: 'b5', s: 'Driving lessons', w: [3, 11], title: 'Driving lessons', where: ['school'],
          todo: ['Take 2–3 lessons per week', 'Complete the 12 compulsory special drives: 5 country road, 4 motorway, 3 at night', 'Do a mock test drive with your instructor'],
          docs: [],
          costs: [['Normal lessons, about 20–35 × 45 min', 1100, 2700], ['Special drives, 12 × 45 min', 720, 1140]] },
        { id: 'b6', s: 'Practical test', w: [12, 12], title: 'Practical test and your licence', where: ['tuev', 'school'],
          todo: ['Take the practical test (about 55 minutes) in the school car', 'Receive your licence after passing', 'Remember: 2-year probation period and 0.0 ‰ alcohol'],
          docs: ['Passport'],
          costs: [['TÜV NORD practical test fee', 129.83, 129.83], ['Driving school fee for presenting you', 180, 289]] },
      ],
    },
  };

  const RULES = [
    ['6-month rule', 'A Pakistani licence is valid in Germany for 6 months after you register your residence. On application, it can be extended to 12 months only if you will not stay longer than 12 months in total. After that, driving with it counts as driving without a licence, a criminal offence.'],
    ['The IDP is not a licence', 'The International Driving Permit is only a translation. It is valid only together with your original Pakistani licence and does not replace the conversion.'],
    ['Theory test language', 'The theory test is available in German and several foreign languages, including English and Arabic. Urdu is not offered, so most people from Pakistan take it in English.'],
    ['Pass marks', 'Theory: 30 questions, at most 10 error points, and two wrong 5-point questions mean a fail. Practical: about 55 minutes of driving with basic manoeuvres.'],
    ['Order of tests', 'You must pass the theory test before the practical test. The theory pass is valid for 12 months.'],
    ['Retakes', 'Each retake costs the TÜV fee again, plus the school’s fee. The earliest retake is after about 2 weeks.'],
    ['Probation period', 'New licence holders have a 2-year probation period: 0.0 ‰ alcohol and stricter penalties. If you held your Pakistani licence for more than 2 years, ask the office whether the probation period applies to you.'],
  ];

  const APPS = [
    ['theorie24', 'You already have it: the official question catalogue with videos. Use it daily for the exact exam questions.'],
    ['TÜV NORD Fahrschüler-App', 'From the organisation that runs your test. Study content is available in several languages, including English and Arabic.'],
    ['Führerschein Quest (this app)', 'Understand the rules with animated clips and junction puzzles. Install it on your phone with the button below.'],
    ['Google Maps', 'Find every office and school in this guide. Practise the area around TÜV NORD as a passenger.'],
    ['DB Navigator', 'Train and bus connections, for example to Berlin if you ever need the embassy.'],
    ['DeepL or Google Translate', 'Understand letters from the licence office and the driving school contract.'],
  ];

  const SOURCES = [
    ['Stadt Osnabrück: Führerscheine (service portal)', 'https://service.osnabrueck.de/einrichtungen/-/egov-bis-detail/einrichtung/4959/show'],
    ['Landkreis Osnabrück Führerscheinstelle (only for people outside the city)', 'https://www.landkreis-osnabrueck.de/fachthemen/ordnung-und-verkehr/fuehrerscheinstelle'],
    ['TÜV NORD Station Osnabrück', 'https://www.tuev-nord.de/de/privatkunden/tuev-stationen/osnabrueck/'],
    ['ADAC: converting licences from outside the EU', 'https://www.adac.de/verkehr/rund-um-den-fuehrerschein/auslaendische-fuehrerscheine/staaten-auserhalb/'],
    ['Anlage 11 FeV (list of states with simplified conversion)', 'https://www.buzer.de/Anlage_11_FeV.htm'],
    ['ADAC: costs of a Class B licence', 'https://www.adac.de/verkehr/rund-um-den-fuehrerschein/erwerb/fuehrerschein-kosten/'],
  ];

  /* ---------- rendering ---------- */
  let S = load();
  const sum = ph => ph.costs.reduce((a, c) => [a[0] + c[1], a[1] + c[2]], [0, 0]);
  const range = ([lo, hi]) => lo === hi ? eur(lo) : `${eur(lo)} – ${eur(hi)}`;
  const placeCard = k => {
    if (k === 'school') return `<li class="g-place"><b>Your driving school</b><span>See the list of schools near 49090 below</span><a href="#guide-schools">Go to schools</a></li>`;
    const p = PLACES[k];
    return `<li class="g-place"><b>${p.name}</b><span>${p.what}</span><span class="g-addr">${p.addr}</span><span class="g-how">${p.how}</span><a href="${map(p.addr)}" target="_blank" rel="noopener">Open in Google Maps</a></li>`;
  };

  function render(view, arg) {
    const pid = arg === 'b' ? 'b' : 'a';
    const P = PATHS[pid];
    const items = P.phases.flatMap(ph => ph.todo.map((_, i) => ph.id + '.' + i));
    const done = items.filter(k => S[k]).length;
    const total = P.phases.reduce((a, ph) => { const s = sum(ph); return [a[0] + s[0], a[1] + s[1]]; }, [0, 0]);
    view.innerHTML = `
    <section class="page guide">
      <p class="eyebrow">Licence roadmap · Osnabrück 49090</p>
      <h1>Your German licence, step by step</h1>
      <p class="lead">Two paths, one for people with a Pakistani licence and one for people starting from zero. Every phase lists what to do, where to go, what to bring and what it costs. Tick the boxes as you go; your progress is saved on this device.</p>
      <div class="g-tabs" role="tablist">${Object.entries(PATHS).map(([k, p]) => `<a role="tab" aria-selected="${k === pid}" class="g-tab ${k === pid ? 'on' : ''}" href="#guide-${k}"><b>${p.tab}</b><span>${p.sub}</span></a>`).join('')}</div>

      <div class="g-summary">
        <div class="stat"><b>${P.length}</b><span>Typical duration</span></div>
        <div class="stat"><b>${eur(Math.round(total[0] / 10) * 10)} – ${eur(Math.round(total[1] / 10) * 10)}</b><span>Typical total cost</span></div>
        <div class="stat"><b>${done}/${items.length}</b><span>Steps done</span></div>
      </div>
      <p class="g-intro">${P.intro}</p>

      <h2 class="g-h">Timeline</h2>
      <div class="g-gantt" style="--weeks:${P.weeks}">
        <div class="g-weeks">${Array.from({ length: P.weeks }, (_, i) => `<span>W${i + 1}</span>`).join('')}</div>
        ${P.phases.map((ph, i) => `<a class="g-bar" href="#guide-${pid}" data-jump="${ph.id}" style="grid-column:${ph.w[0]} / ${ph.w[1] + 1}" title="${ph.title}"><b>${i + 1}</b> <span class="t">${ph.s}</span></a>`).join('')}
      </div>

      <h2 class="g-h">Phases</h2>
      <ol class="g-phases">${P.phases.map((ph, i) => {
        const s = sum(ph), pd = ph.todo.filter((_, j) => S[ph.id + '.' + j]).length;
        return `<li class="g-phase ${pd === ph.todo.length ? 'complete' : ''}" id="ph-${ph.id}">
          <header><span class="g-num">${i + 1}</span><div><p class="eyebrow">Week ${ph.w[0] === ph.w[1] ? ph.w[0] : ph.w[0] + '–' + ph.w[1]} · ${pd}/${ph.todo.length} done</p><h3>${ph.title}</h3></div><span class="g-cost">${range(s)}</span></header>
          <div class="g-cols">
            <div><h4>To do</h4><ul class="g-todo">${ph.todo.map((t, j) => `<li><label><input type="checkbox" data-k="${ph.id}.${j}" ${S[ph.id + '.' + j] ? 'checked' : ''}><span>${t}</span></label></li>`).join('')}</ul></div>
            <div>${ph.docs.length ? `<h4>Bring</h4><ul class="g-docs">${ph.docs.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
              <h4>Costs</h4><table class="g-costs">${ph.costs.map(c => `<tr><td>${c[0]}</td><td>${range([c[1], c[2]])}</td></tr>`).join('')}<tr class="tot"><td>Phase total</td><td>${range(s)}</td></tr></table></div>
          </div>
          ${ph.where.length ? `<h4>Where to go</h4><ul class="g-places">${ph.where.map(placeCard).join('')}</ul>` : ''}
        </li>`; }).join('')}</ol>

      <h2 class="g-h">Cost overview</h2>
      <table class="g-costs big"><thead><tr><th>Phase</th><th>Weeks</th><th>Cost</th></tr></thead><tbody>${P.phases.map((ph, i) => `<tr><td>${i + 1}. ${ph.title}</td><td>${ph.w[0] === ph.w[1] ? ph.w[0] : ph.w[0] + '–' + ph.w[1]}</td><td>${range(sum(ph))}</td></tr>`).join('')}<tr class="tot"><td>Total</td><td></td><td>${range(total)}</td></tr></tbody></table>
      <p class="g-note">Prices are typical ranges for 2026. Driving schools set their own prices, so ask for a written price list. Each failed test adds the test fee and the school’s fee again.</p>

      <h2 class="g-h">Important rules</h2>
      <dl class="g-rules">${RULES.map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>

      <h2 class="g-h" id="guide-schools-h">Driving schools near 49090</h2>
      <p class="g-note">Taken from public directories. Call before visiting: addresses and phone numbers can change. Ask each school: lessons in English? price per 45-minute lesson? base fee? conversion package for foreign licences? how long until a test date?</p>
      <ul class="g-schools">${SCHOOLS.map(s => `<li><b>${s.n}</b><span>${s.a}</span><span class="g-area">${s.area}</span>${s.t ? `<a href="tel:${s.t.replace(/\s/g, '')}">${s.t}</a>` : ''}<a href="${map(s.n + ', ' + s.a)}" target="_blank" rel="noopener">Map</a></li>`).join('')}</ul>

      <h2 class="g-h">Apps for your phone</h2>
      <ul class="g-apps">${APPS.map(a => `<li><b>${a[0]}</b><span>${a[1]}</span></li>`).join('')}</ul>
      <div class="panel g-install">
        <b>Install Führerschein Quest as an app</b>
        <p><b>Android (Chrome):</b> tap the button below, or open the menu ⋮ and choose “Install app”. <b>iPhone (Safari):</b> tap the Share button, then “Add to Home Screen”. After installing, the questions and this guide work offline.</p>
        <button type="button" class="btn primary" id="g-install" hidden>Install the app</button>
      </div>

      <h2 class="g-h">Sources</h2>
      <ul class="g-sources">${SOURCES.map(s => `<li><a href="${s[1]}" target="_blank" rel="noopener">${s[0]}</a></li>`).join('')}</ul>
      <p class="g-note">Last checked October 2026. This guide is general information, not legal advice. The licence office decides in your case, so confirm the documents and fees when you book your appointment.</p>
      <p><button type="button" class="btn ghost small" id="g-reset">Reset my checklist</button></p>
    </section>`;

    view.querySelectorAll('.g-todo input').forEach(cb => cb.addEventListener('change', () => { S[cb.dataset.k] = cb.checked; store(S); const y = window.scrollY; render(view, pid); window.scrollTo(0, y); }));
    view.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); document.getElementById('ph-' + a.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    view.querySelector('a[href="#guide-schools"]') && view.querySelectorAll('a[href="#guide-schools"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); document.getElementById('guide-schools-h').scrollIntoView({ behavior: 'smooth' }); }));
    view.querySelector('#g-reset').addEventListener('click', () => { if (confirm('Untick all steps on this device?')) { S = {}; store(S); render(view, pid); } });
    const ib = view.querySelector('#g-install');
    if (window.__fqInstall) { ib.hidden = false; ib.addEventListener('click', async () => { const p = window.__fqInstall; window.__fqInstall = null; ib.hidden = true; p.prompt(); try { await p.userChoice; } catch (e) { /* ignore */ } }); }
  }

  return { render };
})();
