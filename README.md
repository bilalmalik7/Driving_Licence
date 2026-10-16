# Führerschein Quest

A gamified trainer for the German **Class B** driving theory test (TÜV | DEKRA): exam-style questions, animated traffic clips and a full mock exam marked like the real one.

> Independent practice tool. Not affiliated with TÜV, DEKRA or the publishers of the official question catalogue. The questions are original and based on the StVO, StVG, FeV and StVZO.

## Features

- **322 original questions** in 6 levels: Right of Way, Danger Sense, Traffic Flow, Sign Hunter, Driver & Planet, Class B Garage
- **54 animated road scenes** drawn in SVG (traffic lights, fog, rain, night, motorway slip roads and roadworks): play the clip to unlock the answers, then watch the solution replay
- **Mock exam:** 30 questions (20 Grundstoff + 10 Zusatzstoff B), 45 minutes, 2–5 points per question, no partial credit, fail at more than 10 error points or two wrong 5-pointers
- **21-day plan**, XP, levels, streaks, badges and a mistakes list
- Progress is stored in the browser (`localStorage`); no server or account needed

## Run locally

It is a static site with no build step. Serve the folder with any web server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish it (free)

**GitHub Pages:** in the repository go to *Settings → Pages*, choose *Deploy from a branch*, select `main` and `/ (root)`, then save. After a minute the site is live at
`https://bilalmalik7.github.io/Driving_Licence/`.

**Netlify / Vercel / Cloudflare Pages:** import the repository, leave the build command empty and set the output directory to the repository root.

## Project structure

```
index.html        page shell
css/style.css     all styles (light and dark theme)
js/signs.js       German traffic signs drawn as SVG
js/scenes.js      top-down traffic scene engine (layouts, actors, keyframes)
js/questions.js   levels, animated scenes and question batch 1 (122)
js/questions2.js  question batch 2 (100) with 20 more animated scenes
js/questions3.js  question batch 3 (100) with 13 more animated scenes
js/app.js         routing, practice sessions, mock exam, progress and gamification
```

## Adding questions

Questions are plain data in `js/questions*.js` (new batches push into `QUESTIONS` and add scenes to `SC`):

```js
mc('V01', 'vorfahrt', 5, 'Question text?',
  ['+correct option', '-wrong option', '+another correct option'],
  'Explanation shown after answering.',
  { sc: SC.V01, sg: ['205'], law: '§ 8 Abs. 1 StVO' });

num('B01', 'verhalten', 3, 'Number question?', 50, 'km/h', 'Explanation.');
```

`sc` attaches an animated scene, `sg` shows traffic signs by their Zeichen number, and `law` cites the rule.
