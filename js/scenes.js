/* Führerschein Quest — top-down traffic scene engine.
   A scene = road layout + actors moving along SVG paths with [time, distance] keyframes.
   Coordinates: viewBox 0 0 400 400, north is up, traffic drives on the right. */
const Scene = (() => {
  const C = {
    grass: '#6d9a55', grass2: '#5f8b49', road: '#474c54', road2: '#525861', walk: '#c4bfb4', kerb: '#9c978c',
    line: '#f3f3ee', bike: '#b0573f', ballast: '#8a8275', rail: '#5d5d5d',
  };
  let uid = 0;

  /* ---------- layouts ---------- */
  const dash = (x1, y1, x2, y2, w = 2.5) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line}" stroke-width="${w}" stroke-dasharray="14 12"/>`;
  const solid = (x1, y1, x2, y2, w = 2.5) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.line}" stroke-width="${w}"/>`;
  const base = () => `<rect width="400" height="400" fill="${C.grass}"/><g opacity=".35">${[40, 110, 300, 360].map((x, i) => `<circle cx="${x}" cy="${[60, 340, 70, 330][i]}" r="22" fill="${C.grass2}"/>`).join('')}</g>`;

  function cross(o) {
    let s = base();
    s += `<rect x="146" y="0" width="108" height="400" fill="${C.walk}"/><rect x="0" y="146" width="400" height="108" fill="${C.walk}"/>`;
    s += `<rect x="160" y="0" width="80" height="400" fill="${C.road}"/><rect x="0" y="160" width="400" height="80" fill="${C.road}"/>`;
    if (o.bike) s += `<rect x="230" y="248" width="10" height="152" fill="${C.bike}"/>` + solid(230, 248, 230, 400, 1.6);
    s += dash(200, 0, 200, 150) + dash(200, 250, 200, 400) + dash(0, 200, 150, 200) + dash(250, 200, 400, 200);
    if (o.stop) s += `<rect x="200" y="246" width="40" height="5" fill="${C.line}"/>`;
    if (o.zebraE) for (let y = 163; y < 238; y += 10) s += `<rect x="256" y="${y}" width="22" height="6" fill="${C.line}"/>`;
    return s;
  }
  function tee() {
    let s = base();
    s += `<rect x="0" y="146" width="400" height="108" fill="${C.walk}"/><rect x="146" y="240" width="108" height="160" fill="${C.walk}"/>`;
    s += `<rect x="0" y="160" width="400" height="80" fill="${C.road}"/><rect x="160" y="160" width="80" height="240" fill="${C.road}"/>`;
    s += dash(0, 200, 150, 200) + dash(250, 200, 400, 200) + dash(200, 252, 200, 400);
    return s;
  }
  function straight(o) {
    let s = base();
    if (o.rural) {
      s += `<rect x="150" y="0" width="100" height="400" fill="${C.road}"/>` + solid(154, 0, 154, 400, 2) + solid(246, 0, 246, 400, 2);
    } else {
      const right = o.parking ? 300 : 274;
      s += `<rect x="126" y="0" width="${right - 126}" height="400" fill="${C.walk}"/><rect x="150" y="0" width="100" height="400" fill="${C.road}"/>`;
      if (o.parking) s += `<rect x="250" y="0" width="26" height="400" fill="${C.road2}"/>` + `<line x1="250" y1="0" x2="250" y2="400" stroke="${C.line}" stroke-width="1.2" stroke-dasharray="4 6" opacity=".7"/>`;
      s += `<line x1="150" y1="0" x2="150" y2="400" stroke="${C.kerb}" stroke-width="2"/><line x1="${o.parking ? 276 : 250}" y1="0" x2="${o.parking ? 276 : 250}" y2="400" stroke="${C.kerb}" stroke-width="2"/>`;
      s += `<g opacity=".25">${Array.from({ length: 20 }, (_, i) => `<line x1="126" y1="${i * 20}" x2="150" y2="${i * 20}" stroke="#7d786e"/><line x1="${right - 24}" y1="${i * 20}" x2="${right}" y2="${i * 20}" stroke="#7d786e"/>`).join('')}</g>`;
    }
    if (o.zebra != null) {
      s += dash(200, 0, 200, o.zebra - 22) + dash(200, o.zebra + 22, 200, 400);
      for (let x = 154; x < 248; x += 12) s += `<rect x="${x}" y="${o.zebra - 13}" width="7" height="26" fill="${C.line}"/>`;
    } else s += dash(200, 0, 200, 400);
    if (o.rail) {
      s += `<rect x="0" y="98" width="400" height="44" fill="${C.ballast}"/>`;
      s += `<rect x="150" y="98" width="100" height="44" fill="${C.road2}"/>`;
      for (let x = 4; x < 400; x += 14) if (x < 146 || x > 252) s += `<rect x="${x}" y="102" width="6" height="36" fill="#6b5a45"/>`;
      s += `<line x1="0" y1="110" x2="400" y2="110" stroke="${C.rail}" stroke-width="3"/><line x1="0" y1="130" x2="400" y2="130" stroke="${C.rail}" stroke-width="3"/>`;
      s += `<rect x="200" y="182" width="50" height="5" fill="${C.line}"/>`;
    }
    return s;
  }
  function motorway(o) {
    let s = base();
    s += `<rect x="10" y="0" width="100" height="400" fill="${C.road}"/>` + dash(60, 0, 60, 400) + solid(14, 0, 14, 400, 2) + solid(106, 0, 106, 400, 2);
    s += `<line x1="128" y1="0" x2="128" y2="400" stroke="#b9bec4" stroke-width="3"/><line x1="134" y1="0" x2="134" y2="400" stroke="#b9bec4" stroke-width="3"/>`;
    s += `<rect x="150" y="0" width="128" height="400" fill="${C.road}"/><rect x="250" y="0" width="28" height="400" fill="${C.road2}"/>`;
    s += solid(154, 0, 154, 400, 2) + dash(200, 0, 200, 400) + solid(250, 0, 250, 400, 3) + solid(275, 0, 275, 400, 2);
    if (o.ramp) {
      s += `<path d="M336 420 C336 340 264 336 264 262" stroke="${C.road}" stroke-width="28" fill="none"/>`;
      s += `<polygon points="250,70 250,120 278,120" fill="${C.road}"/><rect x="250" y="119" width="28" height="160" fill="${C.road}"/>`;
      s += `<line x1="250" y1="120" x2="250" y2="400" stroke="${C.road}" stroke-width="4"/><line x1="250" y1="80" x2="250" y2="300" stroke="${C.line}" stroke-width="4" stroke-dasharray="8 6"/>`;
      s += `<line x1="250" y1="70" x2="278" y2="120" stroke="${C.line}" stroke-width="2"/>` + solid(278, 120, 278, 270, 2);
    }
    return s;
  }
  function roundabout(o) {
    let s = base();
    s += `<rect x="146" y="0" width="108" height="400" fill="${C.walk}"/><rect x="0" y="146" width="400" height="108" fill="${C.walk}"/><circle cx="200" cy="200" r="112" fill="${C.walk}"/>`;
    s += `<rect x="160" y="0" width="80" height="400" fill="${C.road}"/><rect x="0" y="160" width="400" height="80" fill="${C.road}"/><circle cx="200" cy="200" r="100" fill="${C.road}"/>`;
    s += dash(200, 0, 200, 92) + dash(200, 308, 200, 400) + dash(0, 200, 92, 200) + dash(308, 200, 400, 200);
    s += `<circle cx="200" cy="200" r="54" fill="${C.walk}"/><circle cx="200" cy="200" r="48" fill="${C.grass}"/><circle cx="200" cy="200" r="20" fill="${C.grass2}"/>`;
    if (o.yield) s += `<line x1="202" y1="300" x2="240" y2="300" stroke="${C.line}" stroke-width="4" stroke-dasharray="6 4"/>`;
    return s;
  }
  const LAYOUTS = { cross, tee, straight, motorway, roundabout };

  /* ---------- actors ---------- */
  const ind = (x, y, side) => `<circle class="ind ind-${side}" cx="${x}" cy="${y}" r="2.4"/>`;
  const inds = (hx, hy) => ind(-hx, -hy, 'l') + ind(-hx, hy, 'l') + ind(hx, -hy, 'r') + ind(hx, hy, 'r');
  const lights = (hx, hy) => `<rect x="${-hx + 1}" y="${-hy - 0.6}" width="4" height="2.2" rx="1" fill="#fff6c4"/><rect x="${hx - 5}" y="${-hy - 0.6}" width="4" height="2.2" rx="1" fill="#fff6c4"/><rect class="tail" x="${-hx + 1}" y="${hy - 1.8}" width="4.2" height="2" rx="1"/><rect class="tail" x="${hx - 5.2}" y="${hy - 1.8}" width="4.2" height="2" rx="1"/>`;
  const SHAPES = {
    car: c => `<rect x="-9" y="-17" width="18" height="34" rx="4.5" fill="${c}" stroke="rgba(0,0,0,.35)" stroke-width=".8"/><rect x="-7" y="-10" width="14" height="7" rx="2" fill="#1c2833"/><rect x="-6.5" y="-3" width="13" height="9" rx="1.5" fill="rgba(0,0,0,.13)"/><rect x="-7" y="7" width="14" height="5" rx="1.5" fill="#1c2833"/>${lights(9, 17)}${inds(8.6, 15.4)}`,
    truck: c => `<rect x="-11" y="-24" width="22" height="13" rx="3" fill="${c}"/><rect x="-9" y="-21" width="18" height="5" rx="1.5" fill="#1c2833"/><rect x="-11.5" y="-10" width="23" height="34" rx="1.5" fill="#d9d4c7" stroke="rgba(0,0,0,.3)"/>${lights(11, 24)}${inds(10.6, 22.6)}`,
    bus: c => `<rect x="-12" y="-33" width="24" height="66" rx="4" fill="${c}" stroke="rgba(0,0,0,.35)"/><rect x="-10" y="-31" width="20" height="6" rx="2" fill="#1c2833"/><rect x="-10" y="-22" width="20" height="50" rx="2" fill="rgba(255,255,255,.28)"/><rect x="-6" y="-14" width="12" height="6" fill="rgba(0,0,0,.18)"/><rect x="-6" y="6" width="12" height="6" fill="rgba(0,0,0,.18)"/>${lights(12, 33)}${inds(11.4, 31.4)}`,
    ambulance: () => `<rect x="-10" y="-20" width="20" height="40" rx="3.5" fill="#f4f4f2" stroke="rgba(0,0,0,.35)"/><rect x="-10" y="-1" width="20" height="5" fill="#d32f2f"/><rect x="-8" y="-14" width="16" height="6" rx="2" fill="#1c2833"/><rect class="siren s1" x="-8" y="-6" width="7" height="3.4" rx="1"/><rect class="siren s2" x="1" y="-6" width="7" height="3.4" rx="1"/>${lights(10, 20)}${inds(9.6, 18.4)}`,
    bike: c => `<rect x="-1.3" y="-11" width="2.6" height="22" rx="1.2" fill="#222"/><ellipse cx="0" cy="1" rx="5.2" ry="4" fill="${c}"/><circle cx="0" cy="-1.5" r="3.2" fill="#f2c94c" stroke="#333" stroke-width=".6"/>`,
    moto: c => `<rect x="-2.6" y="-12" width="5.2" height="24" rx="2.4" fill="#222"/><ellipse cx="0" cy="1" rx="6" ry="4.6" fill="${c}"/><circle cx="0" cy="-2" r="3.6" fill="#111" stroke="#ddd" stroke-width=".8"/><circle cx="0" cy="-12" r="1.6" fill="#fff6c4"/>`,
    ped: c => `<ellipse cx="0" cy="0" rx="6.2" ry="4.4" fill="${c}"/><circle cx="0" cy="0" r="3.3" fill="#3b2a1e"/>`,
    child: c => `<g transform="scale(.75)"><ellipse cx="0" cy="0" rx="6.2" ry="4.4" fill="${c}"/><circle cx="0" cy="0" r="3.4" fill="#5a3b1e"/></g>`,
    cone: () => `<circle r="4.8" fill="#f57c00" stroke="#fff" stroke-width="1.8"/><circle r="1.6" fill="#fff"/>`,
    warn: () => `<polygon points="0,-7 6.5,5 -6.5,5" fill="none" stroke="#d32f2f" stroke-width="2.4" stroke-linejoin="round"/>`,
    tractor: c => `<rect x="-8" y="-20" width="16" height="15" rx="2" fill="${c}"/><rect x="-7" y="-5" width="14" height="14" rx="2" fill="${c}" stroke="rgba(0,0,0,.35)"/><rect x="-5" y="-3" width="10" height="7" rx="1" fill="#1c2833"/><rect x="-13" y="2" width="5" height="16" rx="2" fill="#222"/><rect x="8" y="2" width="5" height="16" rx="2" fill="#222"/><rect x="-11" y="-19" width="3.4" height="9" rx="1.5" fill="#222"/><rect x="7.6" y="-19" width="3.4" height="9" rx="1.5" fill="#222"/><circle cx="0" cy="-2" r="2" fill="#ffb300"/>${lights(8, 20)}${inds(7.6, 18.4)}`,
    police: () => `<rect x="-9" y="-17" width="18" height="34" rx="4.5" fill="#eef1f3" stroke="rgba(0,0,0,.35)" stroke-width=".8"/><rect x="-9" y="-2" width="18" height="6" fill="#1f6b4a"/><rect x="-7" y="-10" width="14" height="7" rx="2" fill="#1c2833"/><rect class="siren s1" x="-7" y="-3.5" width="6" height="3" rx="1"/><rect class="siren s2" x="1" y="-3.5" width="6" height="3" rx="1"/><rect x="-7" y="7" width="14" height="5" rx="1.5" fill="#1c2833"/>${lights(9, 17)}${inds(8.6, 15.4)}`,
    ball: () => `<circle r="4.6" fill="#e63946" stroke="#fff" stroke-width="1.6"/>`,
    deer: () => `<ellipse cx="0" cy="5" rx="6.5" ry="12" fill="#8a5a2b"/><ellipse cx="0" cy="-9" rx="3.6" ry="5.5" fill="#7a4e24"/><circle cx="-1.8" cy="-12.5" r="1.3" fill="#eaffb0"/><circle cx="1.8" cy="-12.5" r="1.3" fill="#eaffb0"/>`,
    train: () => `<g>${[0, 1, 2, 3].map(i => `<rect x="-13" y="${-100 + i * 50}" width="26" height="47" rx="5" fill="#c62828" stroke="rgba(0,0,0,.4)"/><rect x="-9" y="${-94 + i * 50}" width="18" height="35" rx="2" fill="rgba(255,255,255,.22)"/>`).join('')}</g>`,
  };

  /* ---------- easing: monotone cubic interpolation of distance over time ---------- */
  function interp(k) {
    if (!k || !k.length) return () => 0;
    if (k.length === 1) return () => k[0][1];
    const n = k.length, x = k.map(p => p[0]), y = k.map(p => p[1]), d = [], m = new Array(n);
    for (let i = 0; i < n - 1; i++) d[i] = (y[i + 1] - y[i]) / (x[i + 1] - x[i] || 1e-6);
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return t => {
      if (t <= x[0]) return y[0];
      if (t >= x[n - 1]) return y[n - 1];
      let i = 0; while (t > x[i + 1]) i++;
      const h = x[i + 1] - x[i], s = (t - x[i]) / h, s2 = s * s, s3 = s2 * s;
      return (2 * s3 - 3 * s2 + 1) * y[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * y[i + 1] + (s3 - s2) * h * m[i + 1];
    };
  }

  /* ---------- player ---------- */
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class Player {
    constructor(host, sc, o = {}) {
      this.host = host; this.sc = sc; this.o = o;
      this.mode = o.mode || sc.mode || 'video';
      this.freeze = sc.freeze || 3; this.end = sc.end || this.freeze;
      this.plays = o.plays || 0; this.maxPlays = o.maxPlays || Infinity;
      this.t = this.mode === 'picture' ? this.freeze : 0;
      this.speed = 1; this.raf = null; this.busy = false;
      this.unlocked = this.mode === 'picture' || this.plays > 0 || !!o.unlocked;
      this.id = 'scn' + (++uid);
      this.build();
      this.render(this.t);
      if (o.autoLoop) this.loop();
    }
    build() {
      const sc = this.sc, L = LAYOUTS[sc.layout] || cross;
      let svg = `<defs><radialGradient id="${this.id}b" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="#fff3b0" stop-opacity=".55"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs>`;
      svg += L(sc.opt || {});
      (sc.signs || []).forEach(g => { svg += `<line x1="${g.x}" y1="${g.y}" x2="${g.x}" y2="${g.y + g.s * 0.9}" stroke="#555" stroke-width="2"/>` + Signs.nested(g.c, g.x, g.y, g.s); });
      (sc.flash || []).forEach((f, i) => { svg += `<rect x="${f.x - 13}" y="${f.y - 7}" width="26" height="14" rx="7" fill="#222"/><g class="flashg" id="${this.id}f${i}"><circle class="flash f1" cx="${f.x - 6}" cy="${f.y}" r="4.6"/><circle class="flash f2" cx="${f.x + 6}" cy="${f.y}" r="4.6"/></g>`; });
      (sc.lights || []).forEach((l, i) => { svg += `<g transform="translate(${l.x} ${l.y}) rotate(${l.r || 0})"><rect x="-6" y="-16" width="12" height="32" rx="3" fill="#1b1d21" stroke="#555" stroke-width="1"/>${['r', 'y', 'g'].map((c, j) => `<circle id="${this.id}l${i}${c}" cx="0" cy="${-9 + j * 9}" r="3.6" fill="#3a3d42"/>`).join('')}</g>`; });
      if (sc.night) svg += `<rect width="400" height="400" fill="#050912" opacity=".66"/>`;
      svg += `<g class="paths">${sc.actors.map((a, i) => a.p ? `<path id="${this.id}p${i}" d="${a.p}" fill="none" stroke="none"/>` : '').join('')}</g>`;
      svg += sc.actors.map((a, i) => {
        const beam = a.you && sc.night ? `<polygon points="-8,-17 8,-17 46,-150 -46,-150" fill="url(#${this.id}b)"/>` : '';
        const door = a.door ? `<rect class="door" x="-10.5" y="-6" width="2.4" height="13" rx="1" fill="${a.c}" stroke="rgba(0,0,0,.4)" stroke-width=".6"/>` : '';
        const halo = a.you ? `<circle class="you-halo" r="25"/>` : '';
        const shape = (SHAPES[a.ty] || SHAPES.car)(a.c || '#888');
        return `<g class="actor ${a.you ? 'you' : ''}" id="${this.id}a${i}">${halo}${beam}${shape}${door}</g>`;
      }).join('');
      if (sc.fog) svg += `<defs><linearGradient id="${this.id}fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe4e8" stop-opacity=".96"/><stop offset=".55" stop-color="#dfe4e8" stop-opacity=".82"/><stop offset="1" stop-color="#dfe4e8" stop-opacity=".2"/></linearGradient></defs><rect width="400" height="400" fill="url(#${this.id}fog)"/>`;
      if (sc.rain) svg += `<defs><pattern id="${this.id}rain" width="24" height="40" patternUnits="userSpaceOnUse"><line x1="6" y1="0" x2="2" y2="12" stroke="#cfe3ff" stroke-width="1.3" opacity=".7"/><line x1="18" y1="20" x2="14" y2="32" stroke="#cfe3ff" stroke-width="1.3" opacity=".7"/></pattern></defs><rect width="400" height="400" fill="#1d2a3a" opacity=".28"/><rect class="rainfx" width="400" height="400" fill="url(#${this.id}rain)"/>`;
      svg += sc.actors.map((a, i) => a.you ? `<g class="you-tag" id="${this.id}t${i}"><rect x="-17" y="-8" width="34" height="15" rx="7.5"/><text y="3.6" text-anchor="middle">YOU</text></g>` : (a.label ? `<g class="you-tag other" id="${this.id}t${i}"><rect x="-${a.label.length * 3.6 + 7}" y="-8" width="${a.label.length * 7.2 + 14}" height="15" rx="7.5"/><text y="3.6" text-anchor="middle">${a.label}</text></g>` : '')).join('');

      const controls = this.mode === 'picture'
        ? `<span class="scn-badge">Still picture</span>`
        : `<button type="button" class="scn-btn play" data-act="play"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg><span>Play clip</span></button>`;
      this.host.innerHTML = `<div class="scene ${sc.night ? 'night' : ''}"><div class="scn-stage"><svg class="scn-svg" viewBox="0 0 400 400" role="img" aria-label="Animated traffic situation">${svg}</svg><div class="scn-cap" aria-live="polite"></div>${this.mode !== 'picture' && !this.unlocked ? '<button type="button" class="scn-overlay" data-act="play"><span class="scn-big"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg></span><span>Play the clip to unlock the question</span></button>' : ''}</div><div class="scn-hud">${controls}<button type="button" class="scn-btn ghost" data-act="slow" aria-pressed="false">0.5×</button><button type="button" class="scn-btn sol" data-act="solution" hidden><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg><span>Watch the solution</span></button><span class="scn-time"></span></div></div>`;
      this.svg = this.host.querySelector('svg.scn-svg');
      this.cap = this.host.querySelector('.scn-cap');
      this.timeEl = this.host.querySelector('.scn-time');
      this.playBtn = this.host.querySelector('[data-act="play"].scn-btn');
      this.solBtn = this.host.querySelector('[data-act="solution"]');
      this.host.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', e => {
        const act = b.dataset.act;
        if (act === 'play') this.playQuestion();
        else if (act === 'slow') { this.speed = this.speed === 1 ? 0.5 : 1; b.setAttribute('aria-pressed', this.speed !== 1); b.classList.toggle('on', this.speed !== 1); }
        else if (act === 'solution') this.playSolution();
      }));
      this.A = sc.actors.map((a, i) => {
        const el = this.svg.querySelector('#' + this.id + 'a' + i);
        const path = a.p ? this.svg.querySelector('#' + this.id + 'p' + i) : null;
        const len = path ? path.getTotalLength() : 0;
        return { a, el, path, len, f: interp(a.k), tag: this.svg.querySelector('#' + this.id + 't' + i), door: el.querySelector('.door'), cls: '' };
      });
      this.updatePlayBtn();
    }
    pose(A, t) {
      if (A.a.pos) return { x: A.a.pos[0], y: A.a.pos[1], r: A.a.pos[2] || 0 };
      const d = Math.max(0, Math.min(A.len, A.f(t)));
      const p = A.path.getPointAtLength(d);
      const p0 = A.path.getPointAtLength(Math.max(0, d - 1)), p1 = A.path.getPointAtLength(Math.min(A.len, d + 1));
      return { x: p.x, y: p.y, r: Math.atan2(p1.x - p0.x, -(p1.y - p0.y)) * 180 / Math.PI };
    }
    render(t) {
      this.t = t;
      for (const A of this.A) {
        const a = A.a, q = this.pose(A, t);
        const vis = !a.show || (t >= a.show[0] && t <= (a.show[1] ?? 1e9));
        A.el.style.display = vis ? '' : 'none';
        A.el.setAttribute('transform', `translate(${q.x.toFixed(2)} ${q.y.toFixed(2)}) rotate(${q.r.toFixed(1)})`);
        if (A.tag) { A.tag.style.display = vis ? '' : 'none'; A.tag.setAttribute('transform', `translate(${q.x.toFixed(1)} ${(q.y - 34).toFixed(1)})`); }
        let side = '';
        if (typeof a.blink === 'string') side = a.blink;
        else if (Array.isArray(a.blink)) { const b = a.blink.find(b => t >= b[1] && t <= b[2]); side = b ? b[0] : ''; }
        let brake = false;
        if (!a.pos && a.k && a.k.length > 1 && /car|truck|bus|ambulance/.test(a.ty || 'car')) {
          const v = A.f(t) - A.f(t - 0.1), v0 = A.f(t - 0.1) - A.f(t - 0.2);
          brake = (v0 - v > 0.25) || (v < 0.05 && t > 0.2);
        }
        const cls = `actor ${a.you ? 'you ' : ''}${side ? 'blink-' + side : ''} ${brake ? 'braking' : ''}`;
        if (cls !== A.cls) { A.el.setAttribute('class', cls); A.cls = cls; }
        if (A.door) {
          const [d0, d1] = a.door; const f = Math.max(0, Math.min(1, (t - d0) / (d1 - d0)));
          A.door.setAttribute('transform', `rotate(${(f * 62).toFixed(1)} -9.5 -6)`);
        }
      }
      (this.sc.lights || []).forEach((l, i) => {
        const st = (l.seq.filter(q => q[0] <= t + 1e-6).pop() || l.seq[0])[1];
        const on = { r: '#ff3b30', y: '#ffb300', g: '#34c759' };
        ['r', 'y', 'g'].forEach(c => { const el = this.svg.querySelector('#' + this.id + 'l' + i + c); if (el) el.setAttribute('fill', st.includes(c) ? on[c] : '#3a3d42'); });
      });
      if (this.sc.rain) { const r = this.svg.querySelector('#' + this.id + 'rain'); if (r) r.setAttribute('patternTransform', `translate(${(-t * 40) % 24} ${(t * 260) % 40})`); }
      (this.sc.flash || []).forEach((f, i) => {
        const g = this.svg.querySelector('#' + this.id + 'f' + i);
        if (g) g.style.display = f.until != null && t > f.until ? 'none' : '';
      });
      const caps = (this.sc.cap || []).filter(c => c[0] <= t + 1e-6);
      const qcaps = (this.sc.cap || []).filter(c => c[0] <= this.freeze);
      const cur = caps[caps.length - 1];
      if (cur) {
        const idx = qcaps.indexOf(cur);
        const label = cur[0] > this.freeze ? 'Solution' : `Frame ${idx + 1}/${qcaps.length}`;
        this.cap.innerHTML = `<b>${label}</b> ${cur[1]}`;
        this.cap.classList.toggle('sol', cur[0] > this.freeze);
      } else this.cap.innerHTML = '';
      this.cap.hidden = !cur || (this.mode === 'picture' && t === this.freeze && !this.solShown);
      this.timeEl.textContent = `t = ${t.toFixed(1)} s`;
    }
    run(from, to, done) {
      cancelAnimationFrame(this.raf);
      this.busy = true; this.host.querySelector('.scene').classList.add('playing');
      const ov = this.host.querySelector('.scn-overlay'); if (ov) ov.remove();
      if (reduce()) { this.render(to); this.busy = false; this.host.querySelector('.scene').classList.remove('playing'); done && done(); return; }
      let last = performance.now(), t = from;
      const step = now => {
        t += Math.min(0.05, (now - last) / 1000) * this.speed; last = now;
        if (t >= to) { this.render(to); this.busy = false; this.host.querySelector('.scene')?.classList.remove('playing'); done && done(); return; }
        this.render(t); this.raf = requestAnimationFrame(step);
      };
      this.render(from); this.raf = requestAnimationFrame(step);
    }
    playQuestion() {
      if (this.busy || this.plays >= this.maxPlays) return;
      this.plays++; this.o.onPlay && this.o.onPlay(this.plays);
      this.updatePlayBtn();
      this.run(0, this.freeze, () => {
        if (!this.unlocked) { this.unlocked = true; this.o.onUnlock && this.o.onUnlock(); }
        this.updatePlayBtn();
      });
    }
    playSolution() {
      if (this.busy) return;
      this.solShown = true;
      if (this.mode === 'picture') this.run(0, this.end);
      else this.run(this.freeze, this.end);
    }
    enableSolution() { if (this.end > this.freeze + 0.1) this.solBtn.hidden = false; }
    updatePlayBtn() {
      if (!this.playBtn) return;
      const left = this.maxPlays - this.plays, span = this.playBtn.querySelector('span');
      if (this.maxPlays !== Infinity) span.textContent = left > 0 ? `${this.plays ? 'Replay' : 'Play clip'} (${left} of ${this.maxPlays} left)` : 'No plays left';
      else span.textContent = this.plays ? 'Replay clip' : 'Play clip';
      this.playBtn.disabled = left <= 0;
    }
    loop() {
      const go = () => { if (!this.host.isConnected) return; this.run(0, this.end, () => { this.to = setTimeout(go, 1600); }); };
      if (reduce()) { this.render(this.freeze); return; }
      go();
    }
    destroy() { cancelAnimationFrame(this.raf); clearTimeout(this.to); }
  }

  return { Player };
})();
