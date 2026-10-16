/* Führerschein Quest — app shell, practice missions, mock exam, progress. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const view = $('#view');
  const QMAP = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
  const WMAP = Object.fromEntries(WORLDS.map(w => [w.id, w]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const day = (d = new Date()) => d.toISOString().slice(0, 10);
  const DAYMS = 864e5;

  /* ---------------- storage ---------------- */
  const KEY = 'fq-progress-v1';
  const fresh = () => ({ xp: 0, q: {}, exams: [], plan: {}, badges: {}, streak: { d: '', n: 0 }, combo: 0, best: 0, sound: true, theme: '' });
  let S = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* storage blocked: run without saving */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  /* ---------------- theme & sound ---------------- */
  function applyTheme() { if (S.theme) document.documentElement.setAttribute('data-theme', S.theme); else document.documentElement.removeAttribute('data-theme'); }
  applyTheme();
  let actx = null;
  function tone(seq) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime;
      seq.forEach(([f, d, type = 'sine', v = 0.08]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d); t += d * 0.8;
      });
    } catch (e) { /* audio unavailable */ }
  }
  const sfx = { ok: () => tone([[660, .12], [990, .18]]), bad: () => tone([[180, .25, 'square', .05]]), up: () => tone([[523, .12], [659, .12], [784, .12], [1047, .3]]), tick: () => tone([[880, .05, 'sine', .03]]) };

  /* ---------------- progress model ---------------- */
  const RANKS = [[0, 'Fahrschüler'], [1500, 'Lernfahrer'], [4000, 'Straßenkenner'], [8000, 'Vorfahrt-Profi'], [13000, 'Prüfungsreif'], [20000, 'Führerschein-Legende']];
  const LVL = 600;
  const level = xp => Math.floor(xp / LVL) + 1;
  const rank = xp => RANKS.filter(r => xp >= r[0]).pop()[1];
  const qs = id => S.q[id] || { b: 0, r: 0, w: 0, lw: false, due: 0 };
  const BOX_DAYS = [0, 1, 3, 7, 14];
  function worldStats(wid) {
    const list = QUESTIONS.filter(q => q.w === wid);
    let seen = 0, mastered = 0, red = 0;
    list.forEach(q => { const s = S.q[q.id]; if (s) { seen++; if (s.b >= 2) mastered++; if (s.lw) red++; } });
    const pct = list.length ? mastered / list.length : 0;
    return { total: list.length, seen, mastered, red, pct, stars: pct >= 1 ? 3 : pct >= 0.75 ? 2 : pct >= 0.4 ? 1 : 0 };
  }
  function overall() {
    let seen = 0, mastered = 0, red = 0;
    QUESTIONS.forEach(q => { const s = S.q[q.id]; if (s) { seen++; if (s.b >= 2) mastered++; if (s.lw) red++; } });
    const last5 = S.exams.slice(-5);
    const goodRun = last5.filter(e => e.pass && e.pts <= 4).length;
    const ready = Math.round((mastered / QUESTIONS.length) * 60 + (goodRun / 5) * 40);
    return { seen, mastered, red, ready, goodRun, total: QUESTIONS.length, passed: S.exams.filter(e => e.pass).length };
  }
  function bumpStreak() {
    const t = day();
    if (S.streak.d === t) return;
    const y = day(new Date(Date.now() - DAYMS));
    S.streak.n = S.streak.d === y ? S.streak.n + 1 : 1; S.streak.d = t;
    if (S.streak.n >= 7) award('streak7');
  }
  function record(q, ok) {
    const s = Object.assign(qs(q.id), {});
    if (ok) { s.r++; s.b = Math.min(4, s.b + 1); s.lw = false; } else { s.w++; s.b = 0; s.lw = true; }
    s.due = Date.now() + BOX_DAYS[s.b] * DAYMS;
    S.q[q.id] = s;
    bumpStreak();
    if (Object.keys(S.q).length >= QUESTIONS.length) award('explorer');
    WORLDS.forEach(w => { if (worldStats(w.id).pct >= 1) award('world_' + w.id); });
  }
  function addXP(n, el) {
    const before = level(S.xp);
    S.xp += n; save();
    if (el) floatXP(el, '+' + n + ' XP');
    if (level(S.xp) > before) { sfx.up(); toast(`Level ${level(S.xp)} reached`, rank(S.xp), 'up'); confetti(60); }
    renderHUD();
  }

  /* ---------------- badges ---------------- */
  const BADGES = [
    ['first', 'First Gear', 'Answer your first question correctly'],
    ['combo10', 'On a Roll', '10 correct answers in a row'],
    ['streak7', 'Seven-Day Streak', 'Practise on 7 days in a row'],
    ['explorer', 'Catalogue Explorer', 'Answer every question at least once'],
    ['boss', 'Boss Slayer', 'Pass a full mock exam'],
    ['flawless', 'Ice-Cold', 'Finish a mock exam with 0 error points'],
    ['ready', 'Ready to Book', '5 mock exam passes in a row with ≤ 4 points'],
    ...WORLDS.map(w => ['world_' + w.id, w.name + ' Champion', `Master every question in “${w.name}”`]),
  ];
  function award(id) {
    if (S.badges[id]) return;
    S.badges[id] = Date.now(); save();
    const b = BADGES.find(b => b[0] === id);
    if (b) { setTimeout(() => { toast('Badge unlocked: ' + b[1], b[2], 'badge'); sfx.up(); confetti(80); }, 500); }
  }

  /* ---------------- fx ---------------- */
  function floatXP(el, text) {
    const r = el.getBoundingClientRect(), f = document.createElement('div');
    f.className = 'xp-float'; f.textContent = text;
    f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + window.scrollY - 6) + 'px';
    document.body.appendChild(f); setTimeout(() => f.remove(), 1300);
  }
  function toast(title, sub, kind = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + kind; t.setAttribute('role', 'status');
    t.innerHTML = `<b>${title}</b>${sub ? `<span>${sub}</span>` : ''}`;
    $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 3200); setTimeout(() => t.remove(), 3700);
  }
  const cv = $('#confetti'), cx = cv.getContext('2d'); let parts = [], cfRaf = null;
  function confetti(n = 120) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#f2b705', '#c8102e', '#1d5aa6', '#1f8a4c', '#ffffff'];
    for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 6, c: cols[i % 5], r: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 0 });
    if (!cfRaf) cfRaf = requestAnimationFrame(stepCf);
  }
  function stepCf() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
    parts = parts.filter(p => p.y < cv.height + 40 && p.life < 240);
    cfRaf = parts.length ? requestAnimationFrame(stepCf) : (cx.clearRect(0, 0, cv.width, cv.height), null);
  }

  /* ---------------- HUD ---------------- */
  function renderHUD() {
    const lv = level(S.xp), into = S.xp % LVL;
    $('#hud-level').textContent = 'Lv ' + lv;
    $('#hud-rank').textContent = rank(S.xp);
    $('#hud-xp').textContent = S.xp.toLocaleString('en') + ' XP';
    $('#hud-bar').style.width = (into / LVL * 100) + '%';
    $('#hud-streak').textContent = S.streak.n || 0;
    $('#btn-sound').setAttribute('aria-pressed', String(S.sound));
    $('#btn-sound').title = S.sound ? 'Sound on' : 'Sound off';
    $('#btn-theme').title = 'Theme: ' + (S.theme || 'system');
    $$('.nav a').forEach(a => a.classList.toggle('on', ('#' + route().name) === a.getAttribute('href') || (route().name === 'home' && a.getAttribute('href') === '#home')));
  }
  $('#btn-sound').addEventListener('click', () => { S.sound = !S.sound; save(); renderHUD(); if (S.sound) sfx.tick(); });
  $('#btn-theme').addEventListener('click', () => { S.theme = S.theme === '' ? 'light' : S.theme === 'light' ? 'dark' : ''; save(); applyTheme(); renderHUD(); toast('Theme: ' + (S.theme || 'follows your system')); });

  /* ---------------- shared bits ---------------- */
  const worldIcon = (w, cls = 'wsign') => w.sign === 'B' ? `<span class="${cls} bbadge" aria-hidden="true">B</span>` : `<span class="${cls}" aria-hidden="true">${Signs.svg(w.sign)}</span>`;
  const stars = n => `<span class="stars" aria-label="${n} of 3 stars">${[1, 2, 3].map(i => `<svg viewBox="0 0 20 20" class="${i <= n ? 'on' : ''}"><path d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6 4.8 17.5 6 11.7 1.6 7.7l5.9-.7z"/></svg>`).join('')}</span>`;
  const ptsChip = p => `<span class="chip pts p${p}">${p} ${p === 1 ? 'Punkt' : 'Punkte'}</span>`;
  const secLabel = q => q.s === 'B' ? 'Zusatzstoff B' : 'Grundstoff';
  let player = null;
  const killPlayer = () => { if (player) { player.destroy(); player = null; } };

  function mediaHTML(q) {
    if (q.sc) return `<div class="media" data-scene></div>`;
    if (q.sg) return `<div class="media signs">${q.sg.map(c => `<figure>${Signs.svg(c, 'sign big').replace(/aria-label="[^"]*"/, 'aria-label="Traffic sign shown in the question"')}</figure>`).join('')}</div>`;
    return '';
  }
  function answersHTML(q, order, sel, locked) {
    if (q.t === 'num') return `<div class="answers ${locked ? 'locked' : ''}"><label class="numin" for="numans"><span class="sr">Your answer</span><input id="numans" type="text" inputmode="decimal" autocomplete="off" placeholder="Enter a number" value="${sel != null ? sel : ''}"><span class="unit">${q.u || ''}</span></label></div>`;
    return `<div class="answers ${locked ? 'locked' : ''}" role="group" aria-label="Answers">${order.map((oi, k) => {
      const on = sel && sel.includes(oi);
      return `<button type="button" class="opt ${on ? 'sel' : ''}" role="checkbox" aria-checked="${!!on}" data-i="${oi}"><span class="box" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg></span><span class="letter">${'ABC'[k]}</span><span class="otext">${q.o[oi][0]}</span><span class="mark" aria-hidden="true"></span></button>`;
    }).join('')}</div>`;
  }
  function isCorrect(q, a) {
    if (q.t === 'num') { const v = parseFloat(String(a ?? '').replace(',', '.').trim()); return !isNaN(v) && Math.abs(v - q.a) < 1e-9; }
    const want = q.o.map((o, i) => o[1] ? i : -1).filter(i => i >= 0).sort().join();
    return (a || []).slice().sort().join() === want;
  }
  const isAnswered = (q, a) => q.t === 'num' ? String(a ?? '').trim() !== '' : !!(a && a.length);

  /* ---------------- router ---------------- */
  function route() { const h = (location.hash || '#home').slice(1); const [name, arg] = h.split('-'); return { name: name || 'home', arg }; }
  window.addEventListener('hashchange', render);
  function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }

  let SESSION = null, EXAM = null, EXAMRESULT = null;
  function render() {
    killPlayer(); clearInterval(timerInt);
    const r = route();
    view.classList.remove('enter'); void view.offsetWidth; view.classList.add('enter');
    if (r.name === 'home') renderHome();
    else if (r.name === 'world') startWorld(r.arg);
    else if (r.name === 'daily') startDaily();
    else if (r.name === 'mistakes') startMistakes();
    else if (r.name === 'play') SESSION ? renderPractice() : go('home');
    else if (r.name === 'exam') renderExamEntry();
    else if (r.name === 'guide') Guide.render(view, r.arg);
    else if (r.name === 'plan') renderPlan();
    else if (r.name === 'rules') renderRules();
    else if (r.name === 'bank') renderBank(r.arg);
    else renderHome();
    renderHUD();
    window.scrollTo(0, 0);
  }

  /* ---------------- home ---------------- */
  function nextWorld() { return WORLDS.find(w => worldStats(w.id).pct < 0.75) || WORLDS[0]; }
  function renderHome() {
    const o = overall(), nw = nextWorld(), lastEx = S.exams[S.exams.length - 1];
    view.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Klasse B · Theorieprüfung trainer</p>
        <h1>Pass the German theory test on your first attempt.</h1>
        <p class="lead">${QUESTIONS.length} exam-style questions, animated traffic clips, and a full 30-question mock exam marked exactly like the real one: 2–5 points per question, no partial credit, and you fail with two wrong 5-pointers.</p>
        <div class="cta">
          <a class="btn primary" href="#world-${nw.id}">Continue: Level ${nw.n} · ${nw.name}</a>
          <a class="btn boss" href="#exam">Boss fight: mock exam</a>
        </div>
        ${EXAM && !EXAM.done ? `<a class="resume" href="#exam">A mock exam is still running. Return to it</a>` : ''}
      </div>
      <div class="hero-demo">
        <div class="device">
          <div class="device-bar"><span>Frage 1 von 30</span><span class="chip pts p5">5 Punkte</span></div>
          <div id="hero-scene"></div>
          <p class="device-q">Who goes first at a crossroads with no signs?</p>
        </div>
      </div>
    </section>
    <section class="stats" aria-label="Your progress">
      <div class="stat"><b>${o.mastered}<small>/${o.total}</small></b><span>questions mastered</span></div>
      <div class="stat"><b>${o.ready}<small>%</small></b><span>exam readiness</span><i class="meter"><i style="width:${o.ready}%"></i></i></div>
      <div class="stat ${o.red ? 'warn' : ''}"><b>${o.red}</b><span>questions on your mistakes list</span></div>
      <div class="stat"><b>${o.passed}</b><span>mock exams passed${lastEx ? ` · last: ${lastEx.pts} pts` : ''}</span></div>
    </section>
    <div class="home-grid">
      <section class="route" aria-labelledby="route-h">
        <h2 id="route-h" class="sec-h">The route</h2>
        <ol class="stops">
          ${WORLDS.map(w => { const s = worldStats(w.id); return `
          <li class="stop ${w.side ? 'side' : ''} ${s.pct >= 1 ? 'done' : ''}">
            <div class="pin">${worldIcon(w)}</div>
            <div class="stop-card">
              <div class="stop-top"><span class="lvl">${w.side ? 'Side quest' : 'Level ' + w.n}</span>${stars(s.stars)}</div>
              <h3>${w.name} <span class="de">${w.de}</span></h3>
              <p>${w.blurb}</p>
              <div class="prog"><i style="width:${Math.round(s.pct * 100)}%"></i></div>
              <div class="stop-foot"><span>${s.mastered}/${s.total} mastered${s.red ? ` · <em>${s.red} to fix</em>` : ''}</span>
                <span class="stop-btns"><a class="btn small ghost" href="#bank-${w.id}">Browse</a><a class="btn small primary" href="#world-${w.id}">Play mission</a></span></div>
            </div>
          </li>`; }).join('')}
          <li class="stop boss-stop">
            <div class="pin">${Signs.svg('206', 'wsign')}</div>
            <div class="stop-card">
              <div class="stop-top"><span class="lvl">Boss fight</span></div>
              <h3>Full mock exam <span class="de">Prüfungssimulation</span></h3>
              <p>30 questions (20 Grundstoff + 10 Zusatzstoff B), 45 minutes, clips play up to 5 times, results only at the end. Pass with ≤ 10 error points and no more than one wrong 5-pointer.</p>
              <div class="stop-foot"><span>${S.exams.length ? `${S.exams.length} attempts · best ${Math.min(...S.exams.map(e => e.pts))} pts` : 'Not attempted yet'}</span><span class="stop-btns"><a class="btn small boss" href="#exam">Start exam</a></span></div>
            </div>
          </li>
        </ol>
      </section>
      <aside class="side">
        <div class="panel quest">
          <h2 class="sec-h">Daily quest</h2>
          <p>15 questions mixed from every level. Your mistakes and questions due for review come first.</p>
          <a class="btn primary full" href="#daily">Start daily quest</a>
        </div>
        <div class="panel ${o.red ? 'redlist' : ''}">
          <h2 class="sec-h">Mistakes list</h2>
          <p>${o.red ? `${o.red} questions you last answered wrong. Clear them before booking your exam.` : 'Empty. Every question you get wrong lands here until you answer it correctly.'}</p>
          <a class="btn full ${o.red ? 'danger' : 'ghost'}" href="#mistakes" ${o.red ? '' : 'aria-disabled="true" tabindex="-1"'}>Practise mistakes</a>
        </div>
        <div class="panel">
          <h2 class="sec-h">Badges <small>${Object.keys(S.badges).length}/${BADGES.length}</small></h2>
          <ul class="badges">${BADGES.map(b => `<li class="${S.badges[b[0]] ? 'got' : ''}" title="${b[2]}"><span class="medal" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.3 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8z"/></svg></span><b>${b[1]}</b><span>${b[2]}</span></li>`).join('')}</ul>
        </div>
      </aside>
    </div>`;
    player = new Scene.Player($('#hero-scene'), SC.V01, { mode: 'video', autoLoop: true, unlocked: true });
  }

  /* ---------------- practice sessions ---------------- */
  function priority(list) {
    const now = Date.now();
    return list.map(q => { const s = S.q[q.id]; const score = !s ? 2 : s.lw ? 0 : s.due <= now ? 3 + s.b : 10 + s.b; return [score + Math.random() * 0.9, q.id]; })
      .sort((a, b) => a[0] - b[0]).map(x => x[1]);
  }
  function startSession(kind, ids, title, back) {
    if (!ids.length) { go('home'); toast('Nothing to practise here yet'); return; }
    SESSION = { kind, ids, title, back, i: 0, sel: null, checked: false, ok: 0, xp: 0, orders: {}, wrong: [] };
    if (location.hash !== '#play') history.replaceState(null, '', '#play');
    renderPractice(); renderHUD();
  }
  function startWorld(wid) {
    const w = WMAP[wid]; if (!w) return go('home');
    startSession('world', priority(QUESTIONS.filter(q => q.w === wid)).slice(0, 10), `Level ${w.n} · ${w.name}`, wid);
  }
  function startDaily() { startSession('daily', shuffle(priority(QUESTIONS).slice(0, 15)), 'Daily quest'); }
  function startMistakes() { const ids = QUESTIONS.filter(q => S.q[q.id] && S.q[q.id].lw).map(q => q.id); startSession('mistakes', shuffle(ids).slice(0, 20), 'Mistakes list'); }

  function renderPractice() {
    killPlayer();
    const s = SESSION; if (!s) return go('home');
    if (s.i >= s.ids.length) return renderSummary();
    const q = QMAP[s.ids[s.i]], w = WMAP[q.w];
    if (!s.orders[q.id]) s.orders[q.id] = shuffle(q.o ? q.o.map((_, i) => i) : []);
    const video = q.sc && (q.sc.mode || 'video') === 'video';
    const comboTxt = S.combo >= 6 ? '×2 combo' : S.combo >= 3 ? '×1.5 combo' : '';
    view.innerHTML = `
    <section class="play">
      <div class="play-top">
        <a class="back" href="#home">← Route</a>
        <div class="play-title"><b>${s.title}</b><span>Question ${s.i + 1} of ${s.ids.length}</span></div>
        <span class="combo ${comboTxt ? 'on' : ''}" aria-live="polite">${comboTxt || (S.combo ? S.combo + ' in a row' : '')}</span>
      </div>
      <div class="segbar" aria-hidden="true">${s.ids.map((id, k) => `<i class="${k < s.i ? (s.wrong.includes(id) ? 'bad' : 'good') : k === s.i ? 'cur' : ''}"></i>`).join('')}</div>
      <article class="qcard">
        <header class="qmeta"><span class="chip sec">${secLabel(q)} · ${w.de}</span>${ptsChip(q.p)}${q.t === 'num' ? '<span class="chip">Number question</span>' : '<span class="chip">Tick all correct answers</span>'}<span class="qid">${q.id}</span></header>
        ${mediaHTML(q)}
        <h2 class="qtext">${q.q}</h2>
        ${answersHTML(q, s.orders[q.id], s.sel, video)}
        <div class="feedback" id="fb" hidden></div>
        <div class="actions"><button type="button" class="btn primary" id="check" ${video ? 'disabled' : ''}>Check answer</button></div>
      </article>
    </section>`;
    if (q.sc) player = new Scene.Player($('[data-scene]'), q.sc, { onUnlock: () => { $('.answers').classList.remove('locked'); $('#check').disabled = false; } });
    bindAnswers(q, v => { s.sel = v; });
    $('#check').addEventListener('click', () => s.checked ? nextQ() : checkQ(q));
  }
  function bindAnswers(q, onChange) {
    if (q.t === 'num') { const inp = $('#numans'); inp.addEventListener('input', () => onChange(inp.value)); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#check')?.click(); } }); return; }
    $$('.opt').forEach(b => b.addEventListener('click', () => {
      if (b.closest('.answers').classList.contains('locked') || b.closest('.answers').classList.contains('done')) return;
      const on = !b.classList.contains('sel'); b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); sfx.tick();
      onChange($$('.opt.sel').map(x => +x.dataset.i));
    }));
  }
  function checkQ(q) {
    const s = SESSION; const a = q.t === 'num' ? ($('#numans').value) : (s.sel || []);
    if (!isAnswered(q, a)) { $('.answers').classList.add('nudge'); setTimeout(() => $('.answers')?.classList.remove('nudge'), 500); toast('Choose at least one answer', 'In the real exam an empty answer counts as wrong.'); return; }
    const ok = isCorrect(q, a);
    s.checked = true;
    $('.answers').classList.add('done');
    if (q.t === 'mc') $$('.opt').forEach(b => { const i = +b.dataset.i, right = q.o[i][1], sel = b.classList.contains('sel'); b.classList.add(right ? (sel ? 'is-right' : 'is-missed') : (sel ? 'is-wrong' : 'is-neutral')); b.disabled = true; });
    else { const inp = $('#numans'); inp.disabled = true; inp.closest('.numin').classList.add(ok ? 'is-right' : 'is-wrong'); }
    record(q, ok);
    let gain = 0;
    if (ok) {
      S.combo++; S.best = Math.max(S.best, S.combo);
      const mult = S.combo >= 6 ? 2 : S.combo >= 3 ? 1.5 : 1;
      gain = Math.round(q.p * 25 * mult); s.ok++; s.xp += gain;
      award('first'); if (S.combo >= 10) award('combo10');
      sfx.ok(); $('.qcard').classList.add('pop');
    } else { S.combo = 0; s.wrong.push(q.id); sfx.bad(); $('.qcard').classList.add('shake'); }
    const fb = $('#fb');
    const correctTxt = q.t === 'num' ? `<p class="solution">Correct answer: <b>${String(q.a).replace('.', ',')} ${q.u || ''}</b></p>` : '';
    fb.innerHTML = `<div class="verdict ${ok ? 'good' : 'bad'}"><b>${ok ? 'Correct' : 'Not correct'}</b><span>${ok ? `+${gain} XP${S.combo >= 3 ? ` · ${S.combo} in a row` : ''}` : `In the exam this costs ${q.p} error points${q.p === 5 ? '. Two of these and you fail.' : '.'}`}</span></div>${correctTxt}<p>${q.e}</p>${q.law ? `<p class="law">${q.law}</p>` : ''}`;
    fb.hidden = false;
    $('#check').textContent = s.i + 1 < s.ids.length ? 'Next question' : 'See results';
    if (player) { player.enableSolution(); setTimeout(() => player && player.playSolution(), 500); }
    if (gain) addXP(gain, $('#check')); else { save(); renderHUD(); }
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function nextQ() { const s = SESSION; s.i++; s.sel = null; s.checked = false; renderPractice(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function renderSummary() {
    const s = SESSION, n = s.ids.length, pct = s.ok / n;
    const ws = s.back ? worldStats(s.back) : null;
    if (pct === 1) confetti(140);
    view.innerHTML = `
    <section class="summary">
      <p class="eyebrow">${s.title} · mission complete</p>
      <h1>${s.ok} of ${n} correct</h1>
      <div class="sum-ring" style="--p:${pct}"><span>${Math.round(pct * 100)}%</span></div>
      <div class="sum-stats"><div><b>+${s.xp}</b><span>XP earned</span></div><div><b>${s.wrong.length}</b><span>added to your mistakes list</span></div>${ws ? `<div>${stars(ws.stars)}<span>${ws.mastered}/${ws.total} mastered in this level</span></div>` : ''}</div>
      ${s.wrong.length ? `<ul class="sum-wrong">${s.wrong.map(id => `<li><span class="chip pts p${QMAP[id].p}">${QMAP[id].p}</span>${QMAP[id].q}</li>`).join('')}</ul>` : '<p class="lead">A clean run. Questions you get right twice in a row count as mastered.</p>'}
      <div class="cta">
        ${s.back ? `<a class="btn primary" href="#world-${s.back}">Next mission</a>` : `<a class="btn primary" href="#daily">Another daily quest</a>`}
        ${s.wrong.length ? `<a class="btn danger" href="#mistakes">Fix my mistakes</a>` : ''}
        <a class="btn ghost" href="#home">Back to the route</a>
      </div>
    </section>`;
    SESSION = null;
  }

  /* ---------------- mock exam ---------------- */
  let timerInt = null;
  function buildExam() {
    const pick = (w, n) => shuffle(QUESTIONS.filter(q => q.w === w)).slice(0, n);
    const g = shuffle([...pick('vorfahrt', 5), ...pick('gefahren', 5), ...pick('verhalten', 5), ...pick('zeichen', 3), ...pick('fahrer', 2)]);
    const ids = [...g, ...pick('klasseb', 10)].map(q => q.id);
    const orders = {}; ids.forEach(id => { const q = QMAP[id]; if (q.o) orders[id] = shuffle(q.o.map((_, i) => i)); });
    return { ids, orders, ans: {}, marked: {}, plays: {}, unlocked: {}, i: 0, start: Date.now(), dur: 45 * 60 * 1000, done: false };
  }
  function renderExamEntry() {
    if (EXAM && !EXAM.done) return renderExam();
    if (EXAMRESULT) return renderExamResult();
    view.innerHTML = `
    <section class="exam-intro">
      <div class="intro-sign">${Signs.svg('206', 'sign')}</div>
      <p class="eyebrow">Boss fight · Prüfungssimulation</p>
      <h1>Full mock exam, Class B</h1>
      <ul class="facts">
        <li><b>30</b><span>questions: 20 Grundstoff + 10 Zusatzstoff B</span></li>
        <li><b>45</b><span>minutes. When the time runs out, the exam is submitted automatically</span></li>
        <li><b>≤ 10</b><span>error points to pass. Each question is worth 2 to 5 points</span></li>
        <li><b>2 × 5</b><span>two wrong 5-point questions mean a fail, even with exactly 10 points</span></li>
      </ul>
      <p class="lead">There is no feedback until you submit. One missing tick or one extra tick makes the whole question wrong. Clips can be played up to 5 times, and the answers unlock after the first play. You can mark questions and go back to them before you submit.</p>
      <div class="cta"><button type="button" class="btn boss big" id="start-exam">Start the exam</button><a class="btn ghost" href="#rules">Read the rules first</a></div>
    </section>`;
    $('#start-exam').addEventListener('click', () => { EXAM = buildExam(); EXAMRESULT = null; renderExam(); });
  }
  const fmtTime = ms => { ms = Math.max(0, ms); const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };
  function renderExam() {
    killPlayer(); clearInterval(timerInt);
    const E = EXAM, q = QMAP[E.ids[E.i]], n = E.ids.length;
    const video = q.sc && (q.sc.mode || 'video') === 'video';
    const locked = video && !E.unlocked[q.id];
    view.innerHTML = `
    <section class="exam">
      <div class="exam-bar">
        <span class="eq">Frage <b>${E.i + 1}</b> von ${n}</span>
        <span class="chip sec">${secLabel(q)}</span>
        ${ptsChip(q.p)}
        <span class="timer" id="timer" aria-live="off">${fmtTime(E.dur - (Date.now() - E.start))}</span>
      </div>
      <div class="exam-body">
        <nav class="qgrid" aria-label="Questions">${E.ids.map((id, k) => `<button type="button" class="${k === E.i ? 'cur' : ''} ${isAnswered(QMAP[id], E.ans[id]) ? 'ans' : ''} ${E.marked[id] ? 'mk' : ''} ${QMAP[id].s === 'B' ? 'zb' : ''}" data-k="${k}" aria-label="Question ${k + 1}${E.marked[id] ? ', marked' : ''}">${k + 1}</button>`).join('')}
          <p class="legend"><i class="l-ans"></i>answered <i class="l-mk"></i>marked</p></nav>
        <article class="qcard exam-q">
          ${mediaHTML(q)}
          <h2 class="qtext">${q.q}</h2>
          ${answersHTML(q, E.orders[q.id] || [], E.ans[q.id], locked)}
        </article>
      </div>
      <div class="exam-foot">
        <button type="button" class="btn ghost ${E.marked[q.id] ? 'on' : ''}" id="mark" aria-pressed="${!!E.marked[q.id]}">${E.marked[q.id] ? 'Marked' : 'Mark'}</button>
        <span class="spacer"></span>
        <button type="button" class="btn ghost" id="prev" ${E.i === 0 ? 'disabled' : ''}>◀ Back</button>
        <button type="button" class="btn primary" id="next" ${E.i === n - 1 ? 'disabled' : ''}>Next ▶</button>
        <button type="button" class="btn boss" id="submit">Submit (Abgabe)</button>
      </div>
    </section>`;
    if (q.sc) player = new Scene.Player($('[data-scene]'), q.sc, {
      maxPlays: 5, plays: E.plays[q.id] || 0, unlocked: !!E.unlocked[q.id],
      onPlay: k => { E.plays[q.id] = k; }, onUnlock: () => { E.unlocked[q.id] = true; $('.answers').classList.remove('locked'); },
    });
    bindAnswers(q, v => { E.ans[q.id] = v; const b = $(`.qgrid [data-k="${E.i}"]`); b && b.classList.toggle('ans', isAnswered(q, v)); });
    $$('.qgrid [data-k]').forEach(b => b.addEventListener('click', () => { E.i = +b.dataset.k; renderExam(); }));
    $('#prev').addEventListener('click', () => { E.i--; renderExam(); });
    $('#next').addEventListener('click', () => { E.i++; renderExam(); });
    $('#mark').addEventListener('click', () => { E.marked[q.id] = !E.marked[q.id]; renderExam(); });
    $('#submit').addEventListener('click', confirmSubmit);
    timerInt = setInterval(() => {
      const left = E.dur - (Date.now() - E.start), el = $('#timer');
      if (el) { el.textContent = fmtTime(left); el.classList.toggle('low', left < 5 * 60000); }
      if (left <= 0) { clearInterval(timerInt); toast('Time is up', 'Your exam was submitted automatically.'); submitExam(); }
    }, 500);
  }
  function confirmSubmit() {
    const E = EXAM, open = E.ids.filter(id => !isAnswered(QMAP[id], E.ans[id])).length, mk = E.ids.filter(id => E.marked[id]).length;
    modal(`<h2>Submit the exam?</h2><p>${open ? `<b>${open} question${open > 1 ? 's' : ''} still unanswered.</b> Unanswered questions count as wrong.` : 'All questions are answered.'}${mk ? ` ${mk} question${mk > 1 ? 's are' : ' is'} marked for review.` : ''}</p><p>After you submit, you cannot change your answers.</p>`,
      [['Keep working', 'ghost', null], ['Submit (Abgabe)', 'boss', submitExam]]);
  }
  function submitExam() {
    const E = EXAM; if (!E || E.done) return;
    E.done = true; clearInterval(timerInt); killPlayer();
    const rows = E.ids.map(id => { const q = QMAP[id], a = E.ans[id], ok = isCorrect(q, a); return { id, ok, a }; });
    const wrong = rows.filter(r => !r.ok);
    const pts = wrong.reduce((t, r) => t + QMAP[r.id].p, 0), fives = wrong.filter(r => QMAP[r.id].p === 5).length;
    const max = E.ids.reduce((t, id) => t + QMAP[id].p, 0);
    const pass = pts <= 10 && fives < 2;
    rows.forEach(r => record(QMAP[r.id], r.ok));
    S.exams.push({ d: Date.now(), pts, fives, pass, secs: Math.round((Date.now() - E.start) / 1000) });
    EXAMRESULT = { rows, pts, fives, max, pass, E };
    let gain = 100 + rows.filter(r => r.ok).length * 10;
    if (pass) { gain += 500; award('boss'); }
    if (pts === 0) { gain += 1000; award('flawless'); }
    const last5 = S.exams.slice(-5); if (last5.length === 5 && last5.every(e => e.pass && e.pts <= 4)) award('ready');
    save(); renderExamResult(); addXP(gain, $('.stamp'));
    if (pass) { sfx.up(); confetti(200); } else sfx.bad();
  }
  function renderExamResult() {
    const R = EXAMRESULT, E = R.E;
    const reason = R.pass ? (R.pts === 0 ? 'Flawless. Not a single error point.' : `You stayed within the limit of 10 error points${R.fives ? ' with one wrong 5-point question' : ''}.`)
      : R.fives >= 2 ? `You answered ${R.fives} five-point questions wrong. That alone means a fail${R.pts <= 10 ? `, even though your total of ${R.pts} points is within the limit` : ''}.` : `${R.pts} error points is more than the 10 allowed.`;
    view.innerHTML = `
    <section class="result">
      <div class="stamp ${R.pass ? 'pass' : 'fail'}"><span>${R.pass ? 'Bestanden' : 'Nicht bestanden'}</span><small>${R.pass ? 'Passed' : 'Failed'}</small></div>
      <p class="lead center">${reason}</p>
      <div class="gauge" aria-label="${R.pts} error points of ${R.max}">
        <div class="g-track"><i class="g-fill ${R.pass ? '' : 'bad'}" style="width:${Math.min(100, R.pts / 30 * 100)}%"></i><i class="g-limit" style="left:${10 / 30 * 100}%"><span>limit 10</span></i></div>
        <div class="g-scale"><span>0</span><span>30+ points</span></div>
        <div class="g-nums"><span><b>${R.pts}</b> error points</span><span><b>${R.fives}</b> wrong 5-pointers (max 1)</span><span><b>${R.rows.filter(r => r.ok).length}</b>/30 correct</span></div>
      </div>
      <div class="cta center"><button type="button" class="btn boss" id="again">New mock exam</button>${R.rows.some(r => !r.ok) ? '<a class="btn danger" href="#mistakes">Practise my mistakes</a>' : ''}<a class="btn ghost" href="#home">Back to the route</a></div>
      <h2 class="sec-h">Review your answers</h2>
      <ol class="review">${R.rows.map((r, k) => { const q = QMAP[r.id]; return `
        <li class="${r.ok ? 'ok' : 'no'}"><details data-id="${r.id}"><summary><span class="rn">${k + 1}</span><span class="ri" aria-label="${r.ok ? 'correct' : 'wrong'}">${r.ok ? '✓' : '✕'}</span>${ptsChip(q.p)}<span class="rq">${q.q}</span></summary>
          <div class="rbody"><div class="rmedia"></div>${reviewAnswer(q, r.a, E.orders[q.id])}<p>${q.e}</p>${q.law ? `<p class="law">${q.law}</p>` : ''}</div></details></li>`; }).join('')}</ol>
    </section>`;
    $('#again').addEventListener('click', () => { EXAMRESULT = null; EXAM = buildExam(); renderExam(); });
    bindLazyMedia();
  }
  function reviewAnswer(q, a, order) {
    if (q.t === 'num') return `<p class="rans">Your answer: <b>${isAnswered(q, a) ? a + ' ' + (q.u || '') : 'none'}</b> · Correct: <b>${String(q.a).replace('.', ',')} ${q.u || ''}</b></p>`;
    order = order || q.o.map((_, i) => i);
    return `<ul class="ropts">${order.map((i, k) => { const sel = (a || []).includes(i), right = q.o[i][1]; return `<li class="${right ? 'right' : ''} ${sel ? 'sel' : ''}"><span class="rbox">${sel ? '☑' : '☐'}</span><span class="letter">${'ABC'[k]}</span>${q.o[i][0]}<em>${right ? (sel ? 'correct, ticked' : 'correct, missed') : (sel ? 'wrong, ticked' : '')}</em></li>`; }).join('')}</ul>`;
  }
  function bindLazyMedia() {
    $$('details[data-id]').forEach(d => d.addEventListener('toggle', () => {
      const box = $('.rmedia', d); if (!d.open || box.dataset.done) return; box.dataset.done = 1;
      const q = QMAP[d.dataset.id];
      if (q.sc) { box.className = 'rmedia media'; const p = new Scene.Player(box, q.sc, { mode: 'picture' }); p.enableSolution(); }
      else if (q.sg) box.innerHTML = `<div class="media signs">${q.sg.map(c => `<figure>${Signs.svg(c, 'sign')}<figcaption>${Signs.name(c)}</figcaption></figure>`).join('')}</div>`;
    }));
  }

  /* ---------------- modal ---------------- */
  function modal(html, buttons) {
    const m = document.createElement('div');
    m.className = 'modal'; m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">${html}<div class="cta">${buttons.map((b, i) => `<button type="button" class="btn ${b[1]}" data-b="${i}">${b[0]}</button>`).join('')}</div></div>`;
    document.body.appendChild(m);
    const close = () => m.remove();
    $$('[data-b]', m).forEach(b => b.addEventListener('click', () => { close(); const fn = buttons[+b.dataset.b][2]; fn && fn(); }));
    m.addEventListener('click', e => { if (e.target === m) close(); });
    $('[data-b]', m).focus();
  }

  /* ---------------- plan ---------------- */
  const PLAN = [
    { days: [1, 2, 3], title: 'Level 1 · Right of Way', link: '#world-vorfahrt', text: 'Start with the 5-point questions. Play missions until every right-of-way question is mastered. Say the rule out loud before you tick.' },
    { days: [4, 5, 6], title: 'Level 2 · Danger Sense', link: '#world-gefahren', text: 'Watch each clip once at 0.5× and once at full speed. Name the hazard before you read the answers.' },
    { days: [7, 8, 9], title: 'Level 3 · Traffic Flow', link: '#world-verhalten', text: 'Learn the four stopping-distance formulas on the Rules page, then all number questions by heart.' },
    { days: [10, 11, 12], title: 'Level 4–5 · Driver & Planet, Class B Garage', link: '#world-klasseb', text: 'Alcohol, tiredness and the Class B limits: weights, trailers, tyres, lights and load.' },
    { days: [13, 14, 15], title: 'Mistake grind', link: '#mistakes', text: 'Only your mistakes list and daily quests. Keep going until the list is under 10.' },
    { days: [16, 17, 18, 19, 20], title: 'Boss fights', link: '#exam', text: 'Two full mock exams a day under real conditions. Book the real exam after 5 passes in a row with no more than 4 points.' },
    { days: [21], title: 'Final boss', link: '#rules', text: 'The real exam at TÜV or DEKRA. Bring your ID. Read every option as true or false on its own.' },
  ];
  function renderPlan() {
    const done = Object.keys(S.plan).filter(k => S.plan[k]).length;
    view.innerHTML = `
    <section class="page">
      <p class="eyebrow">21-day campaign</p>
      <h1>Study plan</h1>
      <p class="lead">About 60–90 minutes a day. Do the sign side quest (15 minutes) every day alongside the main level. Tick off each day as you finish it.</p>
      <div class="plan-prog"><div class="prog"><i style="width:${done / 21 * 100}%"></i></div><span>${done} of 21 days done</span></div>
      <ol class="plan">${PLAN.map(p => `
        <li class="phase">
          <div class="phase-head"><h3>${p.title}</h3><a class="btn small primary" href="${p.link}">Open</a></div>
          <p>${p.text}</p>
          <div class="days">${p.days.map(d => `<button type="button" class="dayb ${S.plan[d] ? 'on' : ''}" data-d="${d}" aria-pressed="${!!S.plan[d]}"><small>Day</small>${d}</button>`).join('')}</div>
        </li>`).join('')}
      </ol>
      <div class="panel side-q"><b>Side quest, every day:</b> Sign Hunter. <a href="#world-zeichen">Play a sign mission</a> and name 10 signs on every walk or ride.</div>
    </section>`;
    $$('.dayb').forEach(b => b.addEventListener('click', () => { const d = b.dataset.d; S.plan[d] = !S.plan[d]; save(); if (S.plan[d]) { addXP(50, b); sfx.ok(); } renderPlan(); }));
  }

  /* ---------------- rules & calculator ---------------- */
  function renderRules() {
    view.innerHTML = `
    <section class="page rules">
      <p class="eyebrow">Know the game before you play it</p>
      <h1>Exam rules and scoring</h1>
      <div class="cols">
        <div class="panel"><h2 class="sec-h">The format</h2>
          <table class="tbl"><tbody>
            <tr><th>Questions</th><td>30: 20 Grundstoff (basic) + 10 Zusatzstoff (Class B)</td></tr>
            <tr><th>Time</th><td>45 minutes on a tablet or touchscreen at the TÜV or DEKRA test centre</td></tr>
            <tr><th>Types</th><td>Multiple choice with text, pictures or video clips, and number entry</td></tr>
            <tr><th>Weights</th><td>Each question is worth 2 to 5 error points, shown on screen</td></tr>
            <tr><th>Pass</th><td>At most 10 error points, and no more than one wrong 5-point question</td></tr>
            <tr><th>Language</th><td>German or one of several foreign languages, including English</td></tr>
          </tbody></table></div>
        <div class="panel"><h2 class="sec-h">How a question is marked</h2>
          <table class="tbl mark"><thead><tr><th>You ticked</th><th>Correct</th><th>Result</th></tr></thead><tbody>
            <tr><td>A + C</td><td>A + C</td><td class="good">0 points</td></tr>
            <tr><td>A</td><td>A + C</td><td class="bad">full points lost</td></tr>
            <tr><td>A + B + C</td><td>A + C</td><td class="bad">full points lost</td></tr>
            <tr><td>nothing</td><td>any</td><td class="bad">full points lost</td></tr>
          </tbody></table>
          <p>There is no partial credit. The screen never tells you how many answers are correct.</p></div>
      </div>
      <div class="panel trap"><h2 class="sec-h">The 5-point trap</h2>
        <p>Most right-of-way and danger questions are worth 5 points. Two wrong 5-pointers make exactly 10 points, which would normally pass, but the rules say <b>fail</b>. One wrong 5-pointer leaves you only 5 points for everything else.</p>
        <ol class="rules-list">
          <li><b>Judge each option on its own.</b> Ask “true or false?” for A, then B, then C. Don’t compare them with each other.</li>
          <li><b>Distrust absolutes.</b> “Always”, “never” and “in every case” are usually wrong. Traffic law is full of exceptions.</li>
          <li><b>Weaker does not mean priority.</b> Cyclists and pedestrians follow the same right-of-way rules. You still have to be careful around them.</li>
          <li><b>In danger questions, the cautious answer wins.</b> “Brake and be ready to stop” beats “sound the horn and continue”.</li>
          <li><b>Mark every 5-pointer and read it again</b> before you submit. Most mistakes come from reading too fast.</li>
        </ol></div>
      <div class="panel calc"><h2 class="sec-h">Stopping distance calculator</h2>
        <p>The exam uses these rules of thumb. Drag the speed and watch the distances change.</p>
        <label for="spd" class="spd-l">Speed <output id="spd-o">50</output> km/h</label>
        <input id="spd" type="range" min="10" max="200" step="10" value="50">
        <div class="formulas" id="formulas"></div>
        <div class="road-bar" id="roadbar" aria-hidden="true"><i class="rb-react"></i><i class="rb-brake"></i></div>
      </div>
    </section>`;
    const upd = () => {
      const v = +$('#spd').value, r = v / 10 * 3, b = (v / 10) ** 2, eb = b / 2, st = r + b;
      $('#spd-o').textContent = v;
      $('#formulas').innerHTML = `<div><span>Reaction distance</span><code>(${v} / 10) × 3</code><b>${r} m</b></div><div><span>Braking distance</span><code>(${v} / 10) × (${v} / 10)</code><b>${b} m</b></div><div><span>Emergency braking</span><code>${b} / 2</code><b>${eb} m</b></div><div class="tot"><span>Stopping distance</span><code>${r} + ${b}</code><b>${st} m</b></div><div><span>Following distance</span><code>half the speedometer</code><b>${v / 2} m</b></div>`;
      const max = 20 * 3 + 400;
      $('.rb-react').style.width = (r / max * 100) + '%'; $('.rb-brake').style.width = (b / max * 100) + '%';
    };
    $('#spd').addEventListener('input', upd); upd();
  }

  /* ---------------- question bank ---------------- */
  function renderBank(wid) {
    view.innerHTML = `
    <section class="page bank">
      <p class="eyebrow">${QUESTIONS.length} questions</p>
      <h1>Question bank</h1>
      <p class="lead">Browse every question with its answers and explanations. Original practice questions in the exam’s format, not the official TÜV/DEKRA catalogue.</p>
      <div class="filters"><div class="chips" role="group" aria-label="Filter by level"><button type="button" class="fchip ${!wid ? 'on' : ''}" data-w="">All</button>${WORLDS.map(w => `<button type="button" class="fchip ${wid === w.id ? 'on' : ''}" data-w="${w.id}">${w.name}</button>`).join('')}</div>
        <label class="search" for="bank-q"><span class="sr">Search</span><input id="bank-q" type="search" placeholder="Search questions, e.g. roundabout"></label></div>
      <ol class="review bank-list" id="bank-list"></ol>
    </section>`;
    let cur = wid || '';
    const draw = () => {
      const term = $('#bank-q').value.trim().toLowerCase();
      const list = QUESTIONS.filter(q => (!cur || q.w === cur) && (!term || (q.q + ' ' + q.e + ' ' + (q.o || []).map(o => o[0]).join(' ')).toLowerCase().includes(term)));
      $('#bank-list').innerHTML = list.length ? list.map(q => { const s = S.q[q.id]; return `
        <li class="${s ? (s.lw ? 'no' : s.b >= 2 ? 'ok' : '') : ''}"><details data-id="${q.id}"><summary><span class="rn">${q.id}</span>${ptsChip(q.p)}<span class="rq">${q.q}</span>${q.sc ? '<span class="chip">clip</span>' : ''}</summary>
        <div class="rbody"><div class="rmedia"></div>${q.t === 'num' ? `<p class="rans">Answer: <b>${String(q.a).replace('.', ',')} ${q.u || ''}</b></p>` : `<ul class="ropts">${q.o.map((o, i) => `<li class="${o[1] ? 'right' : ''}"><span class="rbox">${o[1] ? '☑' : '☐'}</span><span class="letter">${'ABC'[i]}</span>${o[0]}</li>`).join('')}</ul>`}<p>${q.e}</p>${q.law ? `<p class="law">${q.law}</p>` : ''}</div></details></li>`; }).join('') : '<li class="empty">No questions match your search.</li>';
      bindLazyMedia();
    };
    $$('.fchip').forEach(b => b.addEventListener('click', () => { cur = b.dataset.w; $$('.fchip').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    $('#bank-q').addEventListener('input', draw);
    draw();
  }

  /* ---------------- keyboard ---------------- */
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase(), idx = { 1: 0, 2: 1, 3: 2, a: 0, b: 1, c: 2 }[k];
    const opts = $$('.opt');
    if (idx != null && opts[idx] && !opts[idx].disabled) { opts[idx].click(); e.preventDefault(); }
    else if (k === 'enter' && $('#check') && !$('#check').disabled && document.activeElement.tagName !== 'BUTTON') { $('#check').click(); e.preventDefault(); }
    else if (EXAM && !EXAM.done && $('.exam')) { if (k === 'arrowright' && !$('#next').disabled) $('#next').click(); if (k === 'arrowleft' && !$('#prev').disabled) $('#prev').click(); }
  });

  render();
})();
