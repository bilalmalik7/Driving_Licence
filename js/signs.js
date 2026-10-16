/* Führerschein Quest — German traffic signs drawn as SVG (viewBox 0 0 100 100). */
const Signs = (() => {
  let uid = 0;
  const R = '#c8102e', B = '#1d5aa6', Y = '#f2b705', K = '#1a1a1a', W = '#ffffff', G = '#1f7a3a', GR = '#6b6b6b';
  const FONT = "Barlow Condensed, 'Arial Narrow', Arial, sans-serif";

  const triUp = inner => `<polygon points="50,5 97,89 3,89" fill="${R}" stroke="${R}" stroke-width="5" stroke-linejoin="round"/><polygon points="50,25 81,79 19,79" fill="${W}"/>${inner}`;
  const triDown = () => `<polygon points="50,95 3,11 97,11" fill="${R}" stroke="${R}" stroke-width="5" stroke-linejoin="round"/><polygon points="50,75 19,21 81,21" fill="${W}"/>`;
  const ringRed = (inner = '') => `<circle cx="50" cy="50" r="47" fill="${R}"/><circle cx="50" cy="50" r="36" fill="${W}"/>${inner}`;
  const blueDisc = inner => `<circle cx="50" cy="50" r="47" fill="${B}" stroke="${W}" stroke-width="2"/>${inner}`;
  const blueSquare = inner => `<rect x="4" y="4" width="92" height="92" rx="8" fill="${B}" stroke="${W}" stroke-width="2"/>${inner}`;
  const txt = (s, x, y, size, fill, weight = 700) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" text-anchor="middle" font-family="${FONT}" fill="${fill}">${s}</text>`;
  const stripes = (clipShape, color = K) => {
    const id = 'sc' + (++uid);
    let l = '';
    for (let i = -2; i <= 2; i++) l += `<line x1="${22 + i * 9}" y1="${92 + i * 0}" x2="${86 + i * 9}" y2="${8}" stroke="${color}" stroke-width="2.6"/>`;
    return `<clipPath id="${id}">${clipShape}</clipPath><g clip-path="url(#${id})">${l}</g>`;
  };
  const carRear = (x, c) => `<path d="M${x - 11} 57 l3 -10 q1 -3 4 -3 h8 q3 0 4 3 l3 10 z" fill="${c}"/><rect x="${x - 13}" y="55" width="26" height="9" rx="2.5" fill="${c}"/><rect x="${x - 12}" y="63" width="6" height="5" rx="1" fill="${c}"/><rect x="${x + 6}" y="63" width="6" height="5" rx="1" fill="${c}"/><rect x="${x - 7}" y="47" width="14" height="6" rx="1" fill="${W}" opacity=".85"/>`;
  const child = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-17" r="4.2" fill="${K}"/><path d="M-4 -11 h8 l2 11 h-3 l-1 10 h-2.5 l-0.5 -9 l-0.5 9 h-2.5 l-1 -10 h-3 z" fill="${K}"/></g>`;

  const walker = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><circle cx="1" cy="-23" r="4.6"/><path d="M-3 -17 h7 l5 10 l-2 1.5 l-4 -6 l-1 9 l6 16 h-4 l-5 -12 l-4 12 h-4 l5 -16 l-0.5 -8 l-3 5 l-2 -1.5 z"/></g>`;
  const bicycle = (x, y, s, c, sw = 4) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${c}" stroke-width="${sw}" fill="none"><circle cx="-14" cy="6" r="9"/><circle cx="14" cy="6" r="9"/><path d="M-14 6 L-5 -12 L10 -12 L14 6 M-5 -12 L2 6 L10 -12 M-9 -18 h8 M8 -16 l3 -5"/></g>`;
  const draw = {
    '205': () => triDown(),
    '206': () => `<polygon points="93.4,32 68,6.6 32,6.6 6.6,32 6.6,68 32,93.4 68,93.4 93.4,68" fill="${W}"/><polygon points="90.6,33.2 66.8,9.4 33.2,9.4 9.4,33.2 9.4,66.8 33.2,90.6 66.8,90.6 90.6,66.8" fill="${R}"/>${txt('STOP', 50, 60, 27, W, 800)}`,
    '301': () => triUp(`<rect x="45.5" y="38" width="9" height="36" fill="${K}"/><rect x="34" y="53" width="32" height="4" fill="${K}"/>`),
    '102': () => triUp(`<line x1="38" y1="42" x2="62" y2="72" stroke="${K}" stroke-width="5.5"/><line x1="62" y1="42" x2="38" y2="72" stroke="${K}" stroke-width="5.5"/>`),
    '101': () => triUp(`<rect x="46" y="38" width="8" height="25" rx="2" fill="${K}"/><circle cx="50" cy="70" r="4.5" fill="${K}"/>`),
    '136': () => triUp(`${child(43, 76, 1.05)}${child(58, 76, 0.8)}`),
    '306': () => `<polygon points="50,2 98,50 50,98 2,50" fill="${W}" stroke="${K}" stroke-width="1.5"/><polygon points="50,15 85,50 50,85 15,50" fill="${Y}"/>`,
    '307': () => `<polygon points="50,2 98,50 50,98 2,50" fill="${W}" stroke="${K}" stroke-width="1.5"/><polygon points="50,15 85,50 50,85 15,50" fill="${Y}"/>${stripes('<polygon points="50,6 94,50 50,94 6,50"/>', '#333')}`,
    '274': n => ringRed(txt(n, 50, 64, n.length > 2 ? 32 : 40, K, 700)),
    '278': n => `<circle cx="50" cy="50" r="46" fill="${W}" stroke="#444" stroke-width="2"/>${txt(n, 50, 64, n.length > 2 ? 32 : 40, GR, 700)}${stripes('<circle cx="50" cy="50" r="44"/>', '#333')}`,
    '276': () => ringRed(`${carRear(36, R)}${carRear(64, K)}`),
    '282': () => `<circle cx="50" cy="50" r="46" fill="${W}" stroke="#444" stroke-width="2"/>${stripes('<circle cx="50" cy="50" r="44"/>', '#333')}`,
    '283': () => `<circle cx="50" cy="50" r="47" fill="${R}"/><circle cx="50" cy="50" r="37" fill="${B}"/><line x1="24" y1="24" x2="76" y2="76" stroke="${R}" stroke-width="9"/><line x1="76" y1="24" x2="24" y2="76" stroke="${R}" stroke-width="9"/>`,
    '286': () => `<circle cx="50" cy="50" r="47" fill="${R}"/><circle cx="50" cy="50" r="37" fill="${B}"/><line x1="24" y1="24" x2="76" y2="76" stroke="${R}" stroke-width="9"/>`,
    '267': () => `<circle cx="50" cy="50" r="47" fill="${R}"/><rect x="17" y="41" width="66" height="18" fill="${W}"/>`,
    '250': () => ringRed(),
    '220': () => `<rect x="2" y="28" width="96" height="44" rx="4" fill="${B}" stroke="${W}" stroke-width="2"/><path d="M14 50 H70" stroke="${W}" stroke-width="10"/><polygon points="66,36 88,50 66,64" fill="${W}"/>`,
    '224': () => `<circle cx="50" cy="50" r="47" fill="${G}"/><circle cx="50" cy="50" r="38" fill="${Y}"/>${txt('H', 50, 68, 50, G, 800)}`,
    '201': () => {
      const bar = rot => `<g transform="rotate(${rot} 50 50)"><rect x="3" y="42" width="94" height="16" fill="${R}"/><rect x="15" y="45.5" width="70" height="9" fill="${W}"/></g>`;
      return bar(36) + bar(-36);
    },
    '215': () => {
      const r = 25, p = a => [50 + r * Math.cos(a * Math.PI / 180), 50 + r * Math.sin(a * Math.PI / 180)];
      let s = '';
      [-30, 90, 210].forEach(a0 => {
        const a1 = a0 - 78; const [x0, y0] = p(a0), [x1, y1] = p(a1);
        const f = a1 * Math.PI / 180, dx = Math.sin(f), dy = -Math.cos(f), nx = Math.cos(f), ny = Math.sin(f);
        s += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${W}" stroke-width="8" fill="none"/>`;
        s += `<polygon points="${(x1 + dx * 11).toFixed(1)},${(y1 + dy * 11).toFixed(1)} ${(x1 + nx * 9).toFixed(1)},${(y1 + ny * 9).toFixed(1)} ${(x1 - nx * 9).toFixed(1)},${(y1 - ny * 9).toFixed(1)}" fill="${W}"/>`;
      });
      return blueDisc(s);
    },
    '314': () => blueSquare(txt('P', 50, 76, 72, W, 800)),
    '237': () => blueDisc(`<g stroke="${W}" stroke-width="4" fill="none"><circle cx="31" cy="62" r="11"/><circle cx="69" cy="62" r="11"/><path d="M31 62 L44 40 L62 40 L69 62 M44 40 L52 62 L62 40 M41 34 h8 M60 35 l3 -4"/></g><circle cx="52" cy="62" r="2.5" fill="${W}"/>`),
    '209': () => blueDisc(`<path d="M40 80 V50 Q40 38 52 38 H60" stroke="${W}" stroke-width="10" fill="none"/><polygon points="58,24 80,38 58,52" fill="${W}"/>`),
    '308': () => blueSquare(`<path d="M36 84 V34" stroke="${W}" stroke-width="10"/><polygon points="22,38 36,14 50,38" fill="${W}"/><path d="M66 18 V62" stroke="${R}" stroke-width="6"/><polygon points="57,58 66,74 75,58" fill="${R}"/>`),
    '310': () => `<rect x="2" y="20" width="96" height="60" rx="4" fill="${Y}" stroke="${K}" stroke-width="2.5"/>${txt('Musterstadt', 50, 52, 21, K, 700)}${txt('Kreis Beispiel', 50, 70, 12, K, 600)}`,
    '325': () => `<rect x="2" y="14" width="96" height="72" rx="5" fill="${B}" stroke="${W}" stroke-width="2"/><g fill="${W}"><path d="M10 66 V44 L22 34 L34 44 V66 Z"/><circle cx="48" cy="38" r="4.2"/><rect x="45" y="43" width="6.5" height="17" rx="2"/><circle cx="60" cy="47" r="3.2"/><rect x="57.6" y="51" width="5" height="11" rx="1.5"/><circle cx="70" cy="62" r="3.2"/><rect x="76" y="56" width="18" height="9" rx="3"/></g><rect x="8" y="70" width="86" height="3" fill="${W}"/>`,
    '720': () => `<rect x="10" y="28" width="80" height="44" rx="4" fill="${K}"/><path d="M24 50 H64" stroke="#2fbf4a" stroke-width="9"/><polygon points="60,37 80,50 60,63" fill="#2fbf4a"/>`,
    '114': () => triUp(`<path d="M37 70 q6 -16 13 -16 q7 0 13 16" stroke="${K}" stroke-width="3" fill="none"/><rect x="40" y="42" width="20" height="10" rx="3" fill="${K}"/><path d="M36 76 q4 -4 8 0 t8 0 t8 0 t8 0" stroke="${K}" stroke-width="2.4" fill="none"/>`),
    '120': () => triUp(`<path d="M41 75 V60 L45 50 V38 M59 75 V60 L55 50 V38" stroke="${K}" stroke-width="4.5" fill="none"/>`),
    '123': () => triUp(`<g fill="${K}"><circle cx="45" cy="44" r="3.6"/><path d="M42 49 l6 1 l4 8 l-3 1 l-3 -5 l-1 7 l4 11 h-4 l-3 -9 l-4 9 h-4 l5 -12 z"/><path d="M52 58 l8 -4 l1 2 l-8 4 z"/><path d="M58 72 l6 -10 h6 v10 z"/></g>`),
    '131': () => triUp(`<rect x="43" y="38" width="14" height="38" rx="3" fill="${K}"/><circle cx="50" cy="45" r="4" fill="${R}"/><circle cx="50" cy="57" r="4" fill="${Y}"/><circle cx="50" cy="69" r="4" fill="#2fbf4a"/>`),
    '133': () => triUp(walker(50, 64, 0.85, K)),
    '138': () => triUp(bicycle(50, 63, 0.62, K, 4.5)),
    '142': () => triUp(`<path d="M30 72 l4 -10 q2 -6 8 -7 l12 -1 l6 -8 l-1 -6 l3 -1 l2 5 l3 -5 l3 1 l-3 6 l3 2 l-2 4 l-5 -1 l-4 8 l-2 13 h-3 l-1 -10 l-10 1 l-4 9 z" fill="${K}"/>`),
    '208': () => ringRed(`<path d="M36 22 V62" stroke="${K}" stroke-width="7"/><polygon points="26,58 36,78 46,58" fill="${K}"/><path d="M64 82 V38" stroke="${R}" stroke-width="7"/><polygon points="54,42 64,22 74,42" fill="${R}"/>`),
    '222': () => blueDisc(`<path d="M34 30 L60 56" stroke="${W}" stroke-width="10"/><polygon points="50,66 70,66 70,46" fill="${W}"/>`),
    '239': () => blueDisc(walker(50, 58, 1.1, W)),
    '240': () => blueDisc(`<rect x="12" y="48.5" width="76" height="3" fill="${W}"/>${walker(50, 38, 0.62, W)}${bicycle(50, 72, 0.55, W, 4.5)}`),
    '241': () => blueDisc(`<rect x="48.5" y="12" width="3" height="76" fill="${W}"/>${walker(32, 60, 0.75, W)}${bicycle(70, 54, 0.45, W, 5)}`),
    '251': () => ringRed(`<path d="M32 58 l4 -10 q1 -3 4 -3 h20 q3 0 4 3 l4 10 v8 h-36 z" fill="${K}"/><circle cx="38" cy="67" r="4" fill="${K}"/><circle cx="62" cy="67" r="4" fill="${K}"/>`),
    '254': () => ringRed(bicycle(50, 52, 0.85, K, 3.8)),
    '264': n => ringRed(`<polygon points="22,50 32,42 32,58" fill="${K}"/><polygon points="78,50 68,42 68,58" fill="${K}"/>${txt((n || '2') + ' m', 50, 57, 20, K, 700)}`),
    '265': n => ringRed(`<polygon points="50,22 42,32 58,32" fill="${K}"/><polygon points="50,78 42,68 58,68" fill="${K}"/>${txt((n || '3,8') + ' m', 50, 57, 18, K, 700)}`),
    '311': () => `<rect x="2" y="20" width="96" height="60" rx="4" fill="${Y}" stroke="${K}" stroke-width="2.5"/>${txt('Beispiel', 50, 44, 17, K, 700)}${txt('Musterstadt', 50, 70, 15, K, 600)}<line x1="6" y1="76" x2="94" y2="24" stroke="${R}" stroke-width="6"/>`,
    '330': () => blueSquare(`<path d="M30 86 C36 60 40 40 44 18 M70 86 C64 60 60 40 56 18" stroke="${W}" stroke-width="7" fill="none"/><path d="M50 86 V74 M50 64 V54 M50 44 V36" stroke="${W}" stroke-width="3.5"/><path d="M18 32 Q50 14 82 32" stroke="${W}" stroke-width="6" fill="none"/><rect x="18" y="30" width="6" height="12" fill="${W}"/><rect x="76" y="30" width="6" height="12" fill="${W}"/>`),
    '331': () => blueSquare(`<path d="M50 86 V50" stroke="${W}" stroke-width="10"/><path d="M50 50 Q50 30 70 26 M50 50 Q50 30 30 26" stroke="${W}" stroke-width="7" fill="none"/><rect x="18" y="22" width="64" height="6" fill="${W}"/>`),
    '350': () => blueSquare(`<polygon points="50,12 88,82 12,82" fill="${W}"/>${walker(48, 66, 0.72, K)}<g fill="${K}">${[0, 1, 2, 3].map(i => `<rect x="${24 + i * 14}" y="74" width="8" height="5"/>`).join('')}</g>`),
    '357': () => blueSquare(`<rect x="42" y="36" width="16" height="54" fill="${W}"/><rect x="24" y="16" width="52" height="20" fill="${R}"/>`),
    '2741': n => `<rect x="4" y="8" width="92" height="84" rx="5" fill="${W}" stroke="${K}" stroke-width="2"/><circle cx="50" cy="40" r="24" fill="${R}"/><circle cx="50" cy="40" r="18" fill="${W}"/>${txt(n || '30', 50, 50, 26, K, 700)}${txt('ZONE', 50, 84, 18, K, 800)}`,
    '270': () => `<rect x="6" y="6" width="88" height="88" rx="5" fill="${W}" stroke="${K}" stroke-width="2"/><circle cx="50" cy="40" r="25" fill="none" stroke="${R}" stroke-width="5"/>${txt('Umwelt', 50, 46, 15, K, 700)}${txt('ZONE', 50, 84, 18, K, 800)}`,
  };

  const names = {
    '205': 'Give way · Vorfahrt gewähren (Zeichen 205)',
    '206': 'Stop and give way · Halt! Vorfahrt gewähren (Zeichen 206)',
    '301': 'Priority at the next junction · Vorfahrt (Zeichen 301)',
    '102': 'Junction with priority from the right (Zeichen 102)',
    '101': 'Danger point · Gefahrstelle (Zeichen 101)',
    '136': 'Children · Kinder (Zeichen 136)',
    '306': 'Priority road · Vorfahrtstraße (Zeichen 306)',
    '307': 'End of priority road (Zeichen 307)',
    '274': 'Maximum speed · Zulässige Höchstgeschwindigkeit (Zeichen 274)',
    '278': 'End of speed limit (Zeichen 278)',
    '276': 'No overtaking · Überholverbot (Zeichen 276)',
    '282': 'End of all restrictions (Zeichen 282)',
    '283': 'No stopping · Absolutes Haltverbot (Zeichen 283)',
    '286': 'Restricted stopping · Eingeschränktes Haltverbot (Zeichen 286)',
    '267': 'No entry · Verbot der Einfahrt (Zeichen 267)',
    '250': 'No vehicles of any kind (Zeichen 250)',
    '220': 'One-way street · Einbahnstraße (Zeichen 220)',
    '224': 'Bus or tram stop · Haltestelle (Zeichen 224)',
    '201': 'Level crossing · Andreaskreuz (Zeichen 201)',
    '215': 'Roundabout · Kreisverkehr (Zeichen 215)',
    '314': 'Parking · Parken (Zeichen 314)',
    '237': 'Cycle path · Radweg (Zeichen 237)',
    '209': 'Turn right · Vorgeschriebene Fahrtrichtung (Zeichen 209)',
    '308': 'Priority over oncoming traffic (Zeichen 308)',
    '310': 'Town sign · Ortstafel (Zeichen 310)',
    '325': 'Traffic-calmed area · Verkehrsberuhigter Bereich (Zeichen 325.1)',
    '720': 'Green arrow sign · Grünpfeil (Zeichen 720)',
    '114': 'Slippery road · Schleudergefahr (Zeichen 114)',
    '120': 'Road narrows · Verengte Fahrbahn (Zeichen 120)',
    '123': 'Roadworks · Arbeitsstelle (Zeichen 123)',
    '131': 'Traffic lights ahead · Lichtzeichenanlage (Zeichen 131)',
    '133': 'Pedestrians · Fußgänger (Zeichen 133)',
    '138': 'Cyclists · Radverkehr (Zeichen 138)',
    '142': 'Wild animals · Wildwechsel (Zeichen 142)',
    '208': 'Give way to oncoming traffic · Vorrang des Gegenverkehrs (Zeichen 208)',
    '222': 'Pass on the right · Vorgeschriebene Vorbeifahrt rechts (Zeichen 222)',
    '239': 'Footpath · Gehweg (Zeichen 239)',
    '240': 'Shared foot and cycle path · Gemeinsamer Geh- und Radweg (Zeichen 240)',
    '241': 'Separate foot and cycle path · Getrennter Rad- und Gehweg (Zeichen 241)',
    '251': 'No motor vehicles · Verbot für Kraftwagen (Zeichen 251)',
    '254': 'No cycles · Verbot für Radverkehr (Zeichen 254)',
    '264': 'Width limit · Verbot für Fahrzeuge über angegebener Breite (Zeichen 264)',
    '265': 'Height limit · Verbot für Fahrzeuge über angegebener Höhe (Zeichen 265)',
    '311': 'End of town · Ortstafel Rückseite (Zeichen 311)',
    '330': 'Motorway · Autobahn (Zeichen 330.1)',
    '331': 'Expressway · Kraftfahrstraße (Zeichen 331.1)',
    '350': 'Pedestrian crossing · Fußgängerüberweg (Zeichen 350)',
    '357': 'Dead end · Sackgasse (Zeichen 357)',
    '2741': 'Speed limit zone · Tempo-30-Zone (Zeichen 274.1)',
    '270': 'Low emission zone · Umweltzone (Zeichen 270.1)',
  };

  function parse(code) { const [c, arg] = String(code).split('-'); return { c, arg }; }
  function inner(code) { const { c, arg } = parse(code); return draw[c] ? draw[c](arg) : ''; }
  function svg(code, cls = 'sign') {
    const { c } = parse(code);
    return `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="${names[c] || 'Traffic sign'}">${inner(code)}</svg>`;
  }
  function nested(code, x, y, size) {
    return `<svg x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" viewBox="0 0 100 100">${inner(code)}</svg>`;
  }
  function name(code) { return names[parse(code).c] || ''; }
  return { svg, nested, name };
})();
