{
const HEAD = new Path2D("M277.992 0C401.305 0 501.269 104.017 501.27 232.329C501.27 232.596 501.269 232.863 501.268 233.13C501.266 233.763 501.842 234.24 502.468 234.141C505.011 233.739 507.586 233.641 510.177 233.867C538.915 236.381 558.757 277.907 554.495 326.617C550.233 375.327 523.483 412.775 494.745 410.262C491.737 409.999 488.826 409.306 486.03 408.224C485.405 407.982 484.706 408.391 484.626 409.056C467.626 550.319 381.919 657.764 278.745 657.764C175.332 657.764 89.4655 549.819 72.7463 408.072C72.664 407.374 71.907 406.966 71.2718 407.266C67.8043 408.902 64.1444 409.925 60.3271 410.259C31.5893 412.773 4.83775 375.324 0.576172 326.614C-3.68539 277.904 16.1567 236.378 44.8945 233.864C47.7865 233.611 50.6583 233.764 53.4892 234.291C54.1231 234.409 54.7198 233.928 54.717 233.283C54.7156 232.965 54.7148 232.647 54.7148 232.329C54.7149 104.017 154.68 0.000210287 277.992 0Z");
// eyes from Group 5512: two small four-point sparkles
// a single sparkle in the middle of the face
const EYE = new Path2D("M373 317.374L305.288 327.236C296.531 328.511 289.654 335.389 288.379 344.146L278.5 412L268.621 344.146C267.346 335.389 260.469 328.511 251.712 327.236L184 317.374L251.719 307.511C260.472 306.236 267.348 299.363 268.627 290.61L278.5 223L288.374 290.61C289.652 299.363 296.528 306.236 305.281 307.511L373 317.374Z");
const EYES = [[178, 300], [378, 300]];
const GAP = 1.5;
const GREEN = '#31AF00', MAG = '#FF00F7';

// The YouTube player loads in the gap. If the page isn't allowed to load
// YouTube (some previews block it), it falls back to a title card with a link.
const EMBED = true;

const PROJECTS = [
  {t: 'Midsummer Jam', m: 'Tidal Cycles', k: 'Piece', yt: 'yu1H1CDpYig'},
  {t: 'My Dog Can’t Get Enough Of Coke', m: 'Tidal Cycles & Hydra', k: 'Piece', yt: 'RejAFQb8uoY'},
  {t: 'Fermi', m: 'Tidal Cycles & Hydra', k: 'Piece', yt: 'M-kJGKlqnck'},
  {t: 'December', m: 'Tidal Cycles & Hydra', k: 'Piece', yt: '3WN4bQZVVB8'},
  {t: 'Remnants', m: 'Tidal Cycles & Hydra', k: 'Piece', yt: '0oXDRwqT9Lc'},
  {t: 'Intr0', m: 'Tidal Cycles & Hydra', k: 'Piece', yt: 'g2dHSozVDDQ'},
  {t: 'Shudh Schrott', m: 'Performed at Kunsthalle Düsseldorf', k: 'Piece', yt: 'FYQBgpGzx0A'},
  {t: 'Buttercup', m: 'Performed at Kunsthalle Düsseldorf', k: 'Piece', yt: 'thxyf0M7h1M'},
  {t: 'Xerox', m: 'Performed at Kunsthalle Düsseldorf', k: 'Piece', yt: 'qThgh7pGzWw'},
  {t: 'Dedicat', m: 'Coded music with Tidal Cycles', k: 'Piece', yt: 'bPvG42piodU'}
];


const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv = document.getElementById('c'), cv2 = document.getElementById('c2'), ctx2 = cv2.getContext('2d');
let ctx = cv.getContext('2d');
const foot = document.getElementById('foot'), bio = document.getElementById('bio');
const st = document.getElementById('st');

let KEEP = 0, MOB = false, TB = 32, DPR, VW, VH, F, B, X0, Y0, IW, IH, C, colW, cardH, s0, G, k;
let cols = [];
let mx = -1e4, my = -1e4, pmx = null, pmy = null, hovered = null;
let lastAct = performance.now(), hush = false, colour = false;
let shift = 0, P = 0, collapsed = false, lockUntil = 0;
let picked = null;
let vOpen = false, vProj = null, pending = null, Q = 0;
const OPEN_MS = 1150;   // same pace as the collapse
const SWAP_MS = 1150;   // how long the card flow takes between videos
let swapping = false, swapStart = 0, swapDir = 1;

function rng(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

// how far the capitals sit below the top of a line box, and the baseline above its bottom,
// so a column's first heading can start exactly where the dividers start (and the footer end where they end)
// each row of slashes holds as many whole slashes as fit its width, spaced out to fill it exactly
function fillSeps() {
  ctx.font = `500 ${SEP_FS}px Karla, sans-serif`;
  const cw = ctx.measureText('/').width;
  document.querySelectorAll('.bio .sep').forEach(e => {
    const w = e.clientWidth; if (!w) return;
    const n = Math.floor(w / (cw + 1));
    e.textContent = '/'.repeat(n); e.style.letterSpacing = ((w - n * cw) / n) + 'px';
  });
}
function lineTrim(fs, lh) {
  ctx.font = `500 ${fs}px Karla, sans-serif`;
  const m = ctx.measureText('H'), asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
  const half = (lh - asc - desc) / 2;
  return {top: Math.max(0, half + asc - m.actualBoundingBoxAscent), bottom: Math.max(0, half + desc)};
}
const SLIVER = 8;
let STICK = 0;
const NUDGE = 2.5, NUDGE_TOP = 4, SEP_FS = 20; // a touch of air between the dividers' ends and the text
const mHeads = () => [...document.querySelectorAll('.bio .mpieces > h2, .bio .lst .row > h2')];
function layout() {
  SPR = new Map();
  DPR = Math.min(2, devicePixelRatio || 1);
  VW = innerWidth; VH = innerHeight;
  cv.width = VW * DPR; cv.height = VH * DPR;
  cv2.width = VW * DPR; cv2.height = VH * DPR;
  cv2.style.width = VW + 'px'; cv2.style.height = VH + 'px';
  cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  // one measure for everything: the ticker's height is the margin on every side
  F = 15; TB = 0; // ticker parked for now (set TB back to 30 and show #tick to bring it back)
  B = F;
  X0 = F; Y0 = F; IW = VW - 2 * F; IH = VH - F - B;
  C = Math.max(5, Math.min(25, Math.round(IW / (VW < 600 ? 50 : 64))));
  if (C % 2 === 0) C += 1;
  if (VW >= 600) C = Math.max(9, Math.round(C / 6 - 0.5) * 6 + 3);
  MOB = VW < 600; KEEP = MOB ? (C - 1) / 2 : 0;
  colW = IW / C; cardH = colW * 1.16; s0 = cardH * 0.3; G = cardH * 0.8;
  k = (colW * 0.8) / 556;

  foot.style.display = 'none';
  // text view: face card in the corner, then two columns that scroll on their own down to the ticker
  const bl = X0 + colW + F, gap = F;
  if (MOB) {
    Object.assign(bio.style, {left: X0 + 'px', width: IW + 'px', top: '0px', height: (VH - TB) + 'px', columnGap: '0px', gridTemplateColumns: ''});
    Object.assign(document.getElementById('txt').style, {paddingRight: '', paddingLeft: ''});
    const lst = document.getElementById('lst'), txt = document.getElementById('txt');
    if (lst.parentNode !== txt) txt.appendChild(lst);
    lst.style.padding = '';
    document.getElementById('vids').style.paddingLeft = '';
    // phones start straight with the bio, its first capitals just under the top margin
    const tm = lineTrim(16, 24.5), ts = lineTrim(SEP_FS, 24.5);
    document.getElementById('txt').style.paddingTop = (Y0 + NUDGE - ts.top) + 'px';
    document.querySelector('.bio .ft').style.marginBottom = '';
    document.getElementById('txt').style.marginBottom = '';
    document.querySelector('#txt > p').style.marginTop = '';
  } else {
    // columns run from the very top of the screen, starting their content at the margin
    // three equal columns (bio, list, pieces); both lines sit on gap lines of the stack
    const third = C / 3, xa = X0 + third * colW, xb = X0 + 2 * third * colW;
    const tm = lineTrim(15, 23), ts = lineTrim(SEP_FS, 23);
    // first capitals sit just under where the dividers start, last baseline just above where they end
    // the windows end exactly where the dividers end; the footer's tail tucks into that edge
    const T = Y0 + NUDGE_TOP - ts.top, Bt = VH - F;
    document.querySelector('.bio .ft').style.marginBottom = '';
    document.getElementById('txt').style.marginBottom = -Math.max(0, tm.bottom - NUDGE) + 'px';
    Object.assign(bio.style, {left: '0px', width: (VW - F) + 'px', top: T + 'px', height: (Bt - T) + 'px', columnGap: '0px', gridTemplateColumns: `${xa}px ${xb - xa}px minmax(0,1fr)`});
    const lst = document.getElementById('lst');
    if (lst.parentNode !== bio) bio.insertBefore(lst, document.getElementById('txt').nextSibling);
    document.querySelectorAll('.bio .col').forEach(c => c.style.paddingTop = '0px');
    Object.assign(document.getElementById('txt').style, {paddingLeft: X0 + 'px', paddingRight: F + 'px'});
    document.querySelector('#txt > p').style.marginTop = '';
    Object.assign(lst.style, {padding: `0px ${F}px 0px ${F}px`});
    document.getElementById('vids').style.paddingLeft = F + 'px';
    Object.assign(document.getElementById('vline').style, {left: (xa - 0.375) + 'px', top: (Y0 - T) + 'px', height: IH + 'px'});
    Object.assign(document.getElementById('vline2').style, {left: (xb - 0.375) + 'px', top: (Y0 - T) + 'px', height: IH + 'px'});
  }
  // on phones the pieces move into their own collapsible section of the text column
  const vids = document.getElementById('vids'), slot = document.querySelector('.mpieces .mvids');
  if (MOB && vids.parentNode !== slot) slot.insertBefore(vids, slot.firstChild);
  if (!MOB && vids.parentNode !== bio) bio.appendChild(vids);
  if (MOB) vids.style.paddingTop = '0px';
  document.querySelectorAll('.bio .col').forEach(c => c.style.paddingBottom = F + 'px');
  if (!MOB) {
    ['txt', 'vids'].forEach(id => document.getElementById(id).style.paddingBottom = '0px');
    document.getElementById('lst').style.paddingBottom = '0px';
  }
  fillSeps();
  {
    const ft = document.querySelector('.bio .ft'), fp = ft.querySelector('p');
    ft.classList.remove('two');
    if (fp.scrollWidth > fp.clientWidth + 0.5) ft.classList.add('two');
  }
  {
    const t = MOB ? lineTrim(16, 24.5) : lineTrim(15, 23);
    document.querySelectorAll('#vids > .hd').forEach(h => h.style.marginBottom = (14.5 + t.top) + 'px');
    const mv = document.querySelector('.mvids'); if (mv) mv.style.marginTop = MOB ? (14.5 + t.top) + 'px' : '';
  }

  document.getElementById('vids').style.setProperty('--vg', Math.round(F * 0.8) + 'px');
  const tk = document.getElementById('tick'); tk.style.height = TB + 'px';
  tk.style.setProperty('--ts', Math.round(197 * k) + 'px');
  Object.assign(document.getElementById('home').style, {left: (X0 + KEEP * colW) + 'px', top: Y0 + 'px', width: colW + 'px', height: cardH + 'px'});
  document.getElementById('ctrl').style.cssText = `right:${F}px;height:${F}px;top:0`;
  build();
}

function build() {
  const r = rng(7);
  cols = Array.from({length: C}, () => ({cards: []}));
  let N = Math.round((IH - cardH) / s0) + 1;
  N = Math.max(N, 8);
  cols.forEach(col => {
    for (let i = 0; i < N; i++) col.cards.push({gv: Math.floor(r() * 3), p: null, rest: 0, b: 0, h: 0, bump: 0, tr: 0, tu: 0, y: 0, off: s0, blink: 0, flash: 0});
  });
  // the name window: an odd number of columns wide, centred, with a few cards taken out
  // of the middle of each so the card above shows its whole face and a black gap opens below it
  const sRest = (IH - cardH) / (N - 1);
  const wc = 3;
  ctx.font = `500 100px Karla, sans-serif`; ctx.letterSpacing = '0.02em';
  const fs = Math.round(Math.min(nameSize(), (wc * colW * 0.74) / (ctx.measureText(NAME + ' |').width / 100)));
  ctx.letterSpacing = '0px';
  const gapH = Math.max(fs * 2, cardH * 0.55);
  const nOut = Math.max(1, Math.ceil((gapH + cardH) / sRest) - 1);
  const mid = Y0 + IH / 2;
  let r0 = Math.round((mid - Y0 - ((nOut + 1) * sRest - cardH) / 2 - cardH) / sRest) + 1;
  r0 = Math.max(2, Math.min(N - 2 - nOut, r0));
  const c0 = (C - wc) / 2;
  WINS = [{c0, wc, r0, fs, name: true, x: X0 + c0 * colW, w: wc * colW,
    y: Y0 + (r0 - 1) * sRest + cardH, h: (nOut + 1) * sRest - cardH}];
  for (let ci = c0; ci < c0 + wc; ci++) for (let i = r0; i < r0 + nOut; i++) cols[ci].cards[i].out = true;
}

const NAME = 'd1 $ dinefining';
let WINS = [];
function nameSize() { return Math.round(Math.max(14, Math.min(30, cardH * 0.3))); }
function drawName(now) {
  WINS.forEach(b => {
    // each window fades as soon as its own columns start to gather
    const m = cols[Math.floor(C / 2)], pc = m && m.pc ? m.pc : 0;
    const a = 1 - Math.min(1, Math.max(0, (pc - 0.3) / 0.18));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `500 ${b.fs}px Karla, sans-serif`; ctx.letterSpacing = '0.02em';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    if (b.name) {
      // "d1 $ " in grey, the name in white, then a blinking text cursor, all centred together
      const pre = 'd1 $ ', name = 'dinefining', sp = b.fs * 0.18, cw = Math.max(1.5, b.fs * 0.07);
      const wp = ctx.measureText(pre).width, wn = ctx.measureText(name).width;
      let x = b.x + (b.w - (wp + wn + sp + cw)) / 2;
      // centre on the ink of "dinefining" (d/f to g); the cursor spans exactly that, so it can't tip the balance
      const ink = ctx.measureText(name), asc = ink.actualBoundingBoxAscent, desc = ink.actualBoundingBoxDescent;
      const yc = b.y + b.h / 2 + (asc - desc) / 2; // cursor: ascender to descender, dead centre
      const y = b.y + b.h / 2 + asc / 2;          // letters: ascender to baseline centred, so they read centred
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillText(pre, x, y); x += wp;
      ctx.fillStyle = '#fff'; ctx.fillText(name, x, y); x += wn + sp;
      if (reduce || Math.floor(now / 530) % 2 === 0) ctx.fillRect(x, yc - asc, cw, asc + desc);
    } else {
      const ink = ctx.measureText(b.text), asc = ink.actualBoundingBoxAscent, desc = ink.actualBoundingBoxDescent;
      ctx.fillStyle = '#fff';
      ctx.fillText(b.text, b.x + (b.w - ink.width) / 2, b.y + b.h / 2 + (asc - desc) / 2);
    }
    ctx.restore();
  });
}

/* ---------- motion ---------- */
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function update(now) {
  const dt = Math.min(50, now - (update.last || now)); update.last = now;
  const step = dt / COLLAPSE_MS;
  pullT = Math.max(0, pullT - dt / 450);
  const cap = 1 - 0.12 * pullT;
  P = collapsed ? (P < cap ? Math.min(cap, P + step) : Math.max(cap, P - step)) : Math.max(0, P - step);
  bio.classList.toggle('on', collapsed && P > 0.82);
  Q = vOpen ? Math.min(1, Q + dt / OPEN_MS) : Math.max(0, Q - dt / OPEN_MS);
  if (swapping && now - swapStart > SWAP_MS) swapping = false;
  const settled = vOpen && Q > 0.85;
  vid.classList.toggle('on', settled && (!swapping || now - swapStart > SWAP_MS * 0.6));
  [vx, vp, vn].forEach(b => {
    b.classList.toggle('on', settled);
    const under = swapping && !wallPassed(b, now);
    b.classList.toggle('swap', under);
    b.classList.toggle('was', swapping);
  });
  if (picked && !vOpen && Q === 0) picked = null;
  if (pending && P === 0) { const p = pending; pending = null; openVideo(p); }
  document.getElementById('home').classList.toggle('on', false);
  cv.style.pointerEvents = collapsed ? 'none' : '';

  prunePts(now);
  const sRest = (IH - cardH) / (cols[0].cards.length - 1);
  const GAP_AT = (cardH - sRest) / (cardH + G - sRest);
  cols.forEach((col, ci) => {
    const N = col.cards.length;
    const cx = X0 + (ci + 0.5) * colW;
    const colPts = activePts(cx, now);
    let L = 0;
    col.cards.forEach((c, i) => {
      let t = c.rest;
      if (hush) t = 0;
      c.b += (t - c.b) * 0.1;
      c.bump *= 0.9;
      c.h += (c.bump - c.h) * 0.2;
      let want = 0;
      if (!c.out && !hush && P < 0.01 && Q < 0.01 && i > 0 && i < N - 1 && colPts.length) want = field(cx, Y0 + (i + 0.5) * sRest, colPts, now);
      if ((c === snapped || (c === hovered && c.p)) && !hush && Q < 0.01 && i > 0 && i < N - 1) want = 1;
      const before = c.tr;
      // while the stack is folding away or a video gap is open, every card holds where it is
      // falling columns hold where they were; the side columns of the video frame settle back to rest
      const hold = collapsed || P > 0 || ((vOpen || Q > 0) && ci > 0 && ci < C - 1);
      if (!hold) c.tr += (want - c.tr) * EASE;
      if (before < GAP_AT && c.tr >= GAP_AT) snapFeedback(true);
      // top and bottom cards never lift
      c.lift = i > 0 && i < N - 1 ? Math.max(0, c.b + c.tr + c.h) : 0;
      L += c.lift;
    });
    // fit the column exactly: squeeze the closed cards, and if that isn't
    // enough, scale the openings down so the bottom row never moves
    const sMin = cardH * 0.15, room = IH - cardH;
    let s = N - 1 - L > 0.5 ? (room - L * (cardH + G)) / (N - 1 - L) : sMin;
    let f = 1;
    if (s < sMin) {
      s = sMin;
      f = L > 0 ? Math.max(0, (room - (N - 1) * sMin) / (L * (cardH + G - sMin))) : 1;
    }
    // collapse: right-hand columns fold first, the first column last
    // desktop: right to left into the first column; phone: from both edges into the middle one
    const rank = KEEP === 0 ? (C > 1 ? (C - 1 - ci) / (C - 1) : 0) : 1 - Math.abs(ci - KEEP) / KEEP;
    const pc = Math.min(1, Math.max(0, (P - rank * 0.45) / 0.55));
    col.pc = pc;
    const done = pc > 0.97 ? 1 : pc < 0.03 ? 0 : col.done;
    if (done !== col.done && col.done !== undefined) snapFeedback(true);
    col.done = done;
    const fold = ease(Math.min(1, Math.max(0, (pc - 0.8) / 0.2)));
    // video gap: inner columns part, cards drop into the bottom row
    let qc = 0;
    if (ci > 0 && ci < C - 1) {
      const mid = (C - 1) / 2, rk = Math.abs(ci - mid) / Math.max(1, mid);
      qc = Math.min(1, Math.max(0, (Q - rk * 0.35) / 0.65));
      const vd = qc > 0.97 ? 1 : qc < 0.03 ? 0 : col.vd;
      if (vd !== col.vd && col.vd !== undefined) snapFeedback(true);
      col.vd = vd;
    }
    // where each card sits normally
    const yn = [];
    let y = Y0;
    col.cards.forEach((c, i) => {
      yn.push(y);
      y += i < N - 1 ? s + c.lift * f * (cardH + G - s) : cardH;
    });
    col.top0 = Math.min(cardH, yn[1] - yn[0]); // how much of the top card shows right now
    // whole cards travel one after another, so the stack gathers and parts like a real deck
    const SPREAD = 0.55, yb = Y0 + IH - cardH;
    const ys = yn.map((v, i) => {
      if (pc > 0 && i > 0) {
        const d = (i - 1) / Math.max(1, N - 2);
        v += (Y0 - v) * ease(Math.min(1, Math.max(0, (Math.min(1, pc / 0.8) - d * SPREAD) / (1 - SPREAD))));
      }
      if (qc > 0 && i > 0 && i < N - 1) {
        const d = (N - 2 - i) / Math.max(1, N - 3);
        v += (yb - v) * ease(Math.min(1, Math.max(0, (qc - d * SPREAD) / (1 - SPREAD))));
      }
      return v;
    });
    col.cards.forEach((c, i) => {
      c.y = ys[i];
      c.off = i < N - 1 ? ys[i + 1] - ys[i] : cardH;
      // how much of the face shows: up to the next card that's actually there
      let j = i + 1; while (j < N && col.cards[j].out) j++;
      c.show = j < N ? ys[j] - ys[i] : cardH;
      c.vis = i === 0 && qc > 0 ? Math.min(cardH, (IH - cardH) / (N - 1)) : (pc >= 0.8 && i < N - 1 ? 0 : (i === N - 1 ? cardH * (1 - fold) : cardH));
    });
  });

}


/* ---------- drawing ---------- */
function draw(now) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, VW, VH);
  ctx.save();
  ctx.beginPath(); ctx.rect(X0, Y0, IW, IH); ctx.clip();
  drawName(now);

  // right-hand columns are drawn first, so a column sliding left tucks under its neighbour
  for (let ci = C - 1; ci >= 0; ci--) {
    const col = cols[ci];
    const x = X0 + ci * colW;
    col.cards.forEach(c => {
      if (c.y > Y0 + IH || c.y + cardH < Y0) return;
      drawCard(c, x, now, false);
    });
    // while a column gathers, its top card's crown stays in front, so the cards slide in
    // underneath it and the top edge stays identical to every other column
    if (col.pc > 0 && col.pc < 0.8) {
      const c0 = col.cards[0], sR = col.top0;
      drawCard({gv: c0.gv, y: Y0, off: sR, show: sR, vis: sR, blink: 0, flash: 0}, x, now);
      ctx.fillStyle = '#000'; ctx.fillRect(x, Y0 + sR, colW, GAP); // the line under it, like any card edge
    }
  }

  ctx.restore();

  // the sliding rows live on the top canvas, over the video and the buttons
  ctx2.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx2.clearRect(0, 0, VW, VH);
  if (swapping || popSwap) { const main = ctx; ctx = ctx2; try { if (swapping) drawWall(now); if (popSwap) popWall(now); } finally { ctx = main; } }
}

// between videos, the closed rows of the stack slide across the gap like shelves:
// each row a beat after the one above, right to left for next, left to right for previous
// how much of a button the passing rows hide: the row at the button's middle decides
function rowShift(i, now) {
  const N = cols[0].cards.length, gw = (C - 2) * colW;
  const T = (now - swapStart) / SWAP_MS, lag = 0.3;
  const u = Math.min(1, Math.max(0, (T - lag * (i - 1) / (N - 2)) / (1 - lag)));
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  return gw * (1 - 2 * e) * swapDir;
}
function wallPassed(b, now) {
  const q = b._r; if (!q) return true;
  const N = cols[0].cards.length, sRest = (IH - cardH) / (N - 1);
  const gx = X0 + colW, gw = (C - 2) * colW;
  const i0 = Math.max(1, Math.floor((q.top - Y0) / sRest));
  const i1 = Math.min(N - 2, Math.ceil((q.top + q.h - Y0) / sRest));
  for (let i = i0; i <= i1; i++) {
    const sh = rowShift(i, now), wl = gx + sh, wr = gx + sh + gw;
    if (swapDir > 0 ? wr > q.left : wl < q.left + q.w) return false;
  }
  return true;
}

function wallClip(b, now) {
  const q = b._r; if (!q) return '';
  const r = {left: q.left, right: q.left + q.w, top: q.top, height: q.h};
  const N = cols[0].cards.length, sRest = (IH - cardH) / (N - 1);
  const i = Math.min(N - 2, Math.max(1, Math.round((r.top + r.height / 2 - Y0) / sRest)));
  const gx = X0 + colW, gw = (C - 2) * colW, sh = rowShift(i, now);
  const wl = gx + sh, wr = gx + sh + gw, bl = r.left, br = r.right;
  if (wr <= bl || wl >= br) return '';
  if (wl <= bl && wr >= br) return 'inset(0 0 0 100%)';
  if (wl > bl) return `inset(0 ${br - wl}px 0 0)`;
  return `inset(0 0 0 ${wr - bl}px)`;
}

function drawWall(now) {
  const N = cols[0].cards.length, sRest = (IH - cardH) / (N - 1);
  const gx = X0 + colW, gw = (C - 2) * colW, gy = Y0 + sRest, gb = Y0 + IH - cardH;
  const T = (now - swapStart) / SWAP_MS, lag = 0.3;
  ctx.save();
  ctx.beginPath(); ctx.rect(gx, gy, gw, gb - gy); ctx.clip();
  for (let i = 1; i < N - 1; i++) {
    let u = Math.min(1, Math.max(0, (T - lag * (i - 1) / (N - 2)) / (1 - lag)));
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    if (u > 0.5 && !drawWall.passed[i]) { drawWall.passed[i] = true; snapFeedback(true); }
    const shift = gw * (1 - 2 * e) * swapDir;
    if (Math.abs(shift) >= gw) continue;
    const y = Y0 + i * sRest;
    for (let ci = 1; ci < C - 1; ci++) {
      const c = cols[ci].cards[i];
      drawCard({p: c.p, y, off: sRest, blink: c.blink, flash: 0}, X0 + ci * colW + shift, now);
    }
  }
  ctx.restore();
}
drawWall.passed = [];

// every card is drawn once into a small sprite per look, then just stamped:
// far cheaper than painting gradients and heads hundreds of times a frame
let SPR = new Map();
function sprite(inv, head, eyes, gv) {
  const key = (inv ? 'i' : 'n') + head + eyes + gv;
  let sp = SPR.get(key);
  if (sp) return sp;
  sp = document.createElement('canvas');
  sp.width = Math.ceil(colW * DPR); sp.height = Math.ceil(cardH * DPR);
  const g = sp.getContext('2d');
  g.scale(sp.width / colW, sp.height / cardH);
  const bare = inv && head === 'y' && MOB; // the gathered head on phones floats over the text
  if (!bare) { g.fillStyle = '#000'; g.fillRect(0, 0, colW, cardH); } // solid edges, so stacked cards can't leave speckled seams
  if (bare) g.fillStyle = 'rgba(0,0,0,0)';
  else if (inv) g.fillStyle = '#000';
  else { const l = g.createLinearGradient(0, 0, 0, cardH); l.addColorStop(0, '#ffffff'); l.addColorStop(1, '#ebebe9'); g.fillStyle = l; }
  g.fillRect(GAP / 2, 0, colW - GAP, cardH);
  if (!inv) {
    const pt = g.createPattern(DARK, 'repeat');
    pt.setTransform(new DOMMatrix().translate(-gv * 53, -gv * 37).scale(1 / DPR));
    g.fillStyle = pt; g.fillRect(GAP / 2, 0, colW - GAP, cardH);
  }
  if (!bare) { g.fillStyle = '#000'; g.fillRect(0, 0, colW, GAP); }
  g.save();
  g.translate(colW / 2 - 278 * k, colW * 0.12); g.scale(k, k);
  const tone = {b: ['#262626', '#000000'], w: ['#ffffff', '#cfcfcc'], y: ['#8dff6e', '#2fe000'], m: [MAG, MAG], p: ['#000', '#000']}[head];
  const r = g.createRadialGradient(200, 170, 20, 278, 330, 420); r.addColorStop(0, tone[0]); r.addColorStop(1, tone[1]);
  g.fillStyle = r; g.fill(HEAD);
  g.save(); g.clip(HEAD);
  const sp2 = g.createPattern(head === 'b' ? LIGHTSPECK : DARK, 'repeat');
  sp2.setTransform(new DOMMatrix().translate(gv * 41, gv * 29).scale(1 / (k * DPR)));
  g.fillStyle = sp2; g.fillRect(0, 0, 556, 658);
  g.restore();
  if (eyes !== 'n' && head !== 'p') {
    g.fillStyle = {w: '#fff', k: '#000', g: GREEN}[eyes];
    g.fill(EYE);
  }
  g.restore();
  SPR.set(key, sp);
  return sp;
}

function drawCard(c, x, now, invert) {
  if (c.out || (c.vis !== undefined && c.vis < 0.5)) return;
  const inv = !!(c.p || invert);
  const head = colour ? 'm' : invert ? 'y' : (c === snapped || c === picked) ? 'y' : inv ? 'w' : 'b';
  let eyes = 'n';
  if ((c.show ?? c.off) > colW * 0.12 + 415 * k && now > c.blink) eyes = colour || now < c.flash ? 'g' : inv ? 'k' : 'w';
  const sp = sprite(inv, head, eyes, c.gv || 0);
  const h = c.vis !== undefined && c.vis < cardH ? c.vis : cardH;
  ctx.drawImage(sp, 0, 0, sp.width, sp.height * h / cardH, x, c.y, colW, h);
}

function drawLabel(c, x) {
  const top = c.y + cardH, h = c.off - cardH;
  if (h < 30) return;
  const pad = 6, w = Math.min(colW * 2.4, X0 + IW - x) - pad * 2;
  ctx.font = '500 12px Karla, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  const lines = wrap(c.p.t, w);
  ctx.fillStyle = '#000';
  ctx.fillRect(x + GAP / 2, top + GAP, w + pad * 2, h - GAP);
  ctx.fillStyle = '#fff';
  let y = top + pad;
  lines.forEach(l => { if (y + 14 < top + h) ctx.fillText(l, x + pad, y); y += 15; });
  ctx.font = '400 11px Karla, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  wrap(c.p.m, w).forEach(l => { if (y + 13 < top + h) ctx.fillText(l, x + pad, y + 3); y += 14; });
}

function wrap(text, w) {
  const out = []; let line = '';
  text.split(' ').forEach(word => {
    const t = line ? line + ' ' + word : word;
    if (ctx.measureText(t).width > w && line) { out.push(line); line = word; }
    else line = t;
  });
  if (line) out.push(line);
  return out;
}


/* ---------- input ---------- */
function hit(x, y) {
  if (x < X0 || x > X0 + IW || y < Y0 || y > Y0 + IH) return null;
  const col = cols[Math.floor((x - X0) / colW)];
  if (!col) return null;
  const N = col.cards.length;
  for (let i = 0; i < N; i++) {
    const c = col.cards[i];
    const h = i === N - 1 ? cardH : c.off;
    if (y >= c.y && y < c.y + h) return c;
  }
  return null;
}

const COLLAPSE_MS = 1150; // how long the fold takes
const TRAIL_MS = 700;   // how long the tail lasts
const EASE = 0.16;       // smoothing per frame: lower = softer
let pts = [];            // recent cursor path

function addPts(x0, y0, x1, y1, now) {
  const d = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(d / 10));
  for (let j = 1; j <= steps; j++) {
    pts.push({x: x0 + (x1 - x0) * j / steps, y: y0 + (y1 - y0) * j / steps, t: now});
  }
}

function prunePts(now) {
  while (pts.length && now - pts[0].t > TRAIL_MS) pts.shift();
}

// points (plus the live cursor) that can reach this column
function activePts(cx, now) {
  const RX = colW * 2.0, out = [];
  if (mx > -1e3 && my <= Y0 + IH && Math.abs(mx - cx) < RX) out.push({x: mx, y: my, k: 1});
  for (let j = pts.length - 1; j >= 0; j -= 2) {
    const p = pts[j], k = 1 - (now - p.t) / TRAIL_MS;
    if (k > 0 && Math.abs(p.x - cx) < RX * k) out.push({x: p.x, y: p.y, k});
  }
  return out;
}

// biggest opening at this card: full near the cursor, tapering along the tail
function field(cx, cy, list) {
  const RX = colW * 2.0, RY = cardH * 0.62;
  let v = 0;
  for (const p of list) {
    const nx = (cx - p.x) / (RX * p.k), ny = (cy - p.y) / (RY * p.k);
    const d2 = nx * nx + ny * ny;
    if (d2 < 1) {
      const f = (1 - d2) * (1 - d2) * p.k;
      if (f > v) v = f;
    }
  }
  return v;
}

/* ---------- snap feedback: a tiny tick + haptic ---------- */
let actx = null, noise = null, lastTick = 0, soundOn = true, lastPtr = 'mouse';
function ensureAudio() {
  try {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      noise = actx.createBuffer(1, Math.floor(actx.sampleRate * 0.03), actx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
    }
    if (actx.state !== 'running') actx.resume();
  } catch (e) { actx = null; }
}
addEventListener('pointerdown', ensureAudio);
addEventListener('keydown', ensureAudio);

function snapFeedback(open) {
  if (lastPtr !== 'mouse' && navigator.vibrate) { try { navigator.vibrate(4); } catch (e) {} }
  if (!soundOn || !actx || actx.state !== 'running') return;
  const t = actx.currentTime;
  if (t - lastTick < 0.028) return;
  lastTick = t;
  const src = actx.createBufferSource(), bp = actx.createBiquadFilter(), g = actx.createGain();
  src.buffer = noise;
  bp.type = 'bandpass'; bp.Q.value = 9;
  bp.frequency.value = 2600 + Math.random() * 900;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.0015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
  src.connect(bp); bp.connect(g); g.connect(actx.destination);
  src.start(t); src.stop(t + 0.03);
}


function wake() {
  lastAct = performance.now();
}

function status() {
  st.textContent = hush ? 'hush' : colour ? 'colour' : '';
}

const cur = document.getElementById('cur');
cv.addEventListener('pointermove', e => {
  wake();
  lastPtr = e.pointerType;
  if (pmx !== null && !reduce) addPts(pmx, pmy, e.clientX, e.clientY, performance.now());
  mx = e.clientX; my = e.clientY;
  pmx = mx; pmy = my;
  hovered = hit(mx, my);
});

cv.addEventListener('pointerleave', () => { hovered = null; mx = my = -1e4; pmx = pmy = null; });

// the circle follows the mouse across the whole page, and turns green over anything clickable
let wx = -1e4, wy = -1e4, overUI = false;
addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') { cur.classList.add('hide'); document.documentElement.classList.remove('mouse'); return; }
  if (wx < -1e3) { cx = e.clientX; cy = e.clientY; }
  wx = e.clientX; wy = e.clientY;
  document.documentElement.classList.add('mouse');
  cur.classList.remove('hide');
  overUI = !!(e.target.closest && e.target.closest('button, a, [role=button], .who'));
}, {passive: true});
document.addEventListener('mouseleave', () => { cur.classList.add('hide'); wx = wy = -1e4; });

cv.addEventListener('click', e => {
  wake();
  const c = snapped || (hovered && hovered.p ? hovered : hit(e.clientX, e.clientY));
  if (!c) return;
  const ci = cols.findIndex(col => col.cards.includes(c));
  if (vOpen || Q > 0) return;
  if (c.p) { picked = c; openVideo(c.p); }
  else if (!MOB) setCollapsed(true);
  else { c.bump = 0.35; }
});

function setCollapsed(v) {
  if (v === collapsed || vOpen || Q > 0) return;
  collapsed = v;
  lockUntil = performance.now() + 700;
  if (!v) cols.forEach(col => col.cards.forEach(c => { c.tr = 0; c.h = 0; }));
  atTopSince = 0; acc = 0;
  pts = []; hovered = null;
  if (v) document.querySelectorAll('.bio .col, .bio .lst').forEach(c => c.scrollTop = 0);
  snapFeedback(true);
}

let acc = 0, accT = 0, atTopSince = 0, pullT = 0;
let scrollCol = null;
const colTop = () => !scrollCol || scrollCol.scrollTop <= 0;
function push(dy) {
  const now = performance.now();
  if (now < lockUntil) return;
  if (now - accT > 250) acc = 0;
  accT = now; acc += dy;
  if (!collapsed && acc > 40) { setCollapsed(true); acc = 0; }
  else if (collapsed) {
    // scrolling the text up to its top doesn't count; a fresh, firm pull from the top does
    if (!colTop()) { atTopSince = 0; acc = 0; return; }
    if (!atTopSince) { atTopSince = now; acc = 0; return; }
    if (now - atTopSince < 350) { acc = 0; return; }
    if (MOB) pullT = Math.max(pullT, Math.min(1, -acc / 220)); // phones: the cards start to come back as you pull
    if (acc < -220) { setCollapsed(false); acc = 0; atTopSince = 0; pullT = 0; }
  }
}

addEventListener('wheel', e => { scrollCol = e.target.closest ? e.target.closest(MOB ? '.bio .txt' : '.bio .lst, .bio .col') : null; if (!vOpen && Q === 0 && !popOpen) { wake(); push(e.deltaY); } }, {passive: true});

let ty = null;
addEventListener('touchstart', e => { ty = e.touches[0].clientY; scrollCol = e.target.closest ? e.target.closest(MOB ? '.bio .txt' : '.bio .lst, .bio .col') : null; }, {passive: true});
addEventListener('touchmove', e => {
  if (ty === null || popOpen) return;
  const y = e.touches[0].clientY;
  push((ty - y) * 1.5); ty = y;
}, {passive: true});

document.getElementById('home').addEventListener('click', () => setCollapsed(false));
const back = document.getElementById('back');
back.addEventListener('click', () => setCollapsed(false));
back.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(false); } });

let buf = '';
addEventListener('keydown', e => {
  wake();
  if (popOpen) {
    if (e.key === 'Escape') closePop();
    else if (e.key === 'ArrowRight') popStep(1);
    else if (e.key === 'ArrowLeft') popStep(-1);
    return;
  }
  if (vOpen) {
    if (e.key === 'Escape') closeWithCross();
    else if (e.key === 'ArrowRight') step(1, vn);
    else if (e.key === 'ArrowLeft') step(-1, vp);
    return;
  }
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { if (!collapsed) setCollapsed(true); return; }
  if ((e.key === 'ArrowUp' || e.key === 'PageUp') && collapsed && [...document.querySelectorAll('.bio .col, .bio .lst')].every(c => c.scrollTop <= 0)) { setCollapsed(false); return; }
  if (collapsed) return;
  if (e.key.length !== 1) return;
  buf = (buf + e.key.toLowerCase()).slice(-8);
  if (buf.endsWith('hush')) { hush = true; status(); return; }
  if (buf.endsWith('d1')) { hush = false; status(); }
  if (buf.endsWith('colour') || buf.endsWith('color')) { colour = !colour; status(); }

  if (/^[1-9]$/.test(e.key)) wave(+e.key - 1);
});

function wave(ci) {
  const col = cols[ci]; if (!col) return;
  col.cards.forEach((c, i) => setTimeout(() => {
    c.bump = 0.25;
  }, i * 26));
}

/* ---------- text index ---------- */
function buildIndex() {
  document.getElementById('vids').innerHTML = '<i class="sep dtop" aria-hidden="true"></i><h2 class="hd">Pieces</h2>' + PROJECTS.map((p, i) => p.yt
    ? `<div class="vcard"><button class="vtap" aria-label="Play ${p.t}"></button><iframe loading="lazy" title="${p.t}" src="https://www.youtube.com/embed/${p.yt}?rel=0&playsinline=1${location.origin.startsWith('http') ? '&origin=' + encodeURIComponent(location.origin) : ''}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
    : '').join('');
  const t = document.querySelector('#tick .track');
  t.innerHTML = Array(16).fill('<span>This website tastes best with a beer</span><svg class="tstar" viewBox="180 219 197 197"><path d="M373 317.374L305.288 327.236C296.531 328.511 289.654 335.389 288.379 344.146L278.5 412L268.621 344.146C267.346 335.389 260.469 328.511 251.712 327.236L184 317.374L251.719 307.511C260.472 306.236 267.348 299.363 268.627 290.61L278.5 223L288.374 290.61C289.652 299.363 296.528 306.236 305.281 307.511L373 317.374Z"/></svg>').join('');
}
buildIndex();
// phones: "3 / 9" under the strip of pieces
function vcount() {
  const v = document.getElementById('vids'), n = v.querySelectorAll('.vcard').length, c = v.querySelector('.vcard');
  if (!c) return;
  const i = Math.min(n, Math.round(v.scrollLeft / (c.offsetWidth + 10)) + 1);
  document.getElementById('vcount').textContent = `${i} / ${n}`;
}
document.getElementById('vids').addEventListener('scroll', vcount, {passive: true});
document.getElementById('vids').addEventListener('click', e => {
  const t = e.target.closest('.vtap'); if (!t) return;
  const f = t.nextElementSibling;
  if (f && !/autoplay=1/.test(f.src)) f.src = f.src + '&autoplay=1';
  t.remove();
});
vcount();
document.getElementById('vids').addEventListener('mouseover', e => { if (e.target.tagName === 'IFRAME') cur.classList.add('hide'); });
document.getElementById('vids').addEventListener('mouseout', e => { if (e.target.tagName === 'IFRAME') cur.classList.remove('hide'); });
// phone: section headings open and close their lists
document.querySelectorAll('.bio .row h2').forEach(h => {
  // headings are plain labels now
  const flip = () => {};
  h.addEventListener('click', flip);
  h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
});
const peek = document.getElementById('peek'), who = document.querySelector('.who');
// hovering the name deals photos into diagonal stacks, one after another, for as long as the hover lasts
const casc = document.createElement('div'); casc.className = 'casc'; casc.setAttribute('aria-hidden', 'true'); document.body.appendChild(casc);
let casT = null;
function casStart() {
  casStop();
  casc.style.setProperty('--ph', `url("${new URL('assets/ravi.jpg', location.href).href}")`);
  // a few trails start at once, one from the top-left corner; each steps diagonally, dropping a photo
  // every tick, and bounces off the screen margins like light off a mirror
  const S = Math.round(Math.min(200, Math.max(110, VW * 0.14))), st = Math.round(S * 0.2);
  const L = F, T = F, R = VW - F - S, Bm = VH - F - S;
  const runs = [
    {x: L, y: T, dx: st, dy: st},
    {x: L + (R - L) * 0.62, y: T, dx: st, dy: st},
    {x: L + (R - L) * 0.3, y: T + (Bm - T) * 0.55, dx: st, dy: st}
  ];
  const tick = () => {
    runs.forEach(r => {
      const d = document.createElement('i');
      d.style.cssText = `left:${r.x}px;top:${r.y}px;width:${S}px;height:${S}px`;
      casc.appendChild(d);
      // the step that would cross a margin lands exactly on it instead, then the trail turns back
      let nx = r.x + r.dx, ny = r.y + r.dy;
      if (nx >= R) { nx = R; r.dx = -Math.abs(r.dx); } else if (nx <= L) { nx = L; r.dx = Math.abs(r.dx); }
      if (ny >= Bm) { ny = Bm; r.dy = -Math.abs(r.dy); } else if (ny <= T) { ny = T; r.dy = Math.abs(r.dy); }
      r.x = nx; r.y = ny;
    });
    while (casc.children.length > 150) casc.firstChild.remove();
  };
  tick(); casT = setInterval(tick, 110);
}
function casStop() { clearInterval(casT); casT = null; casc.innerHTML = ''; }
who.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') casStart(); });
let holdT = null, held = false;
who.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse') return;
  held = false; clearTimeout(holdT);
  holdT = setTimeout(() => { held = true; casStart(); }, 280);
});
['pointerup', 'pointercancel'].forEach(t => who.addEventListener(t, e => { if (e.pointerType !== 'mouse') { clearTimeout(holdT); if (held) casStop(); } }));
who.addEventListener('click', e => { if (held) { e.preventDefault(); held = false; } });
who.addEventListener('contextmenu', e => e.preventDefault());
who.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') casStop(); });
who.addEventListener('focus', casStart);
who.addEventListener('blur', casStop);
bio.addEventListener('click', e => {
  const b = e.target.closest('button[data-i]');
  if (!b) return;
  openPop(PROJECTS[+b.dataset.i]);
});

/* ---------- piece popup ---------- */
const pop = document.getElementById('pop'), pbox = document.getElementById('pbox'), pframe = document.getElementById('pframe');
let popOpen = false, popProj = null, popSwap = false, popStart = 0, popDir = 1;

function sizePop() {
  const w = MOB ? IW : Math.min(IW - 2 * colW, (IH - 120) * 16 / 9, 1100);
  pbox.style.width = w + 'px';
}
function popEmbed(p) {
  const here = location.origin && location.origin !== 'null' ? location.origin : '';
  const originParam = here ? '&origin=' + encodeURIComponent(here) + '&widget_referrer=' + encodeURIComponent(location.href) : '';
  const card = `<div class="ph"><a href="https://www.youtube.com/watch?v=${p.yt}" target="_blank" rel="noopener">Watch on YouTube ↗</a></div>`;
  pframe._card = card;
  pframe.innerHTML = EMBED && !embedBlocked
    ? `<iframe onload="this.classList.add('ready')" src="https://www.youtube.com/embed/${p.yt}?autoplay=1&rel=0&playsinline=1${originParam}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="${p.t}"></iframe>`
    : card;
}
function openPop(p) {
  popProj = p; popOpen = true;
  sizePop(); popEmbed(p);
  pop.classList.add('on');
}
function closePop() {
  if (!popOpen) return;
  popOpen = false; popSwap = false;
  pop.classList.remove('on');
  setTimeout(() => { if (!popOpen) pframe.innerHTML = ''; }, 300);
}
function popStep(dir) {
  if (!popOpen || popSwap) return;
  const list = PROJECTS.filter(p => p.yt);
  const next = list[(list.indexOf(popProj) + dir + list.length) % list.length];
  popProj = next; popDir = dir; popStart = performance.now(); popSwap = true; popWall.passed = [];
  pframe.classList.add('out');
  setTimeout(() => { pframe.classList.remove('out'); popEmbed(next); }, SWAP_MS * 0.5);
}
document.getElementById('px').addEventListener('click', closePop);
document.getElementById('pprev').addEventListener('click', () => popStep(-1));
document.getElementById('pnext').addEventListener('click', () => popStep(1));
pop.addEventListener('click', e => { if (e.target === pop) closePop(); });

// rows of the stack slide across the video, like the shelves in the card view
function popWall(now) {
  const T = (now - popStart) / SWAP_MS;
  if (T >= 1) { popSwap = false; return; }
  // the rows sweep across the whole stack frame, over the popup
  const r = {left: X0, top: Y0, width: IW, height: IH};
  const sRest = (IH - cardH) / (cols[0].cards.length - 1);
  const R = Math.max(2, Math.ceil((r.height - cardH) / sRest) + 1), n = Math.ceil(r.width / colW) + 1;
  const lag = 0.3, gw = r.width + colW;
  ctx.save();
  ctx.beginPath(); ctx.rect(r.left, r.top, r.width, r.height); ctx.clip();
  for (let i = 0; i < R; i++) {
    const u = Math.min(1, Math.max(0, (T - lag * i / (R - 1)) / (1 - lag)));
    const e = ease(u);
    if (u > 0.5 && !popWall.passed[i]) { popWall.passed[i] = true; snapFeedback(true); }
    const sh = gw * (1 - 2 * e) * popDir;
    if (Math.abs(sh) >= gw) continue;
    const y = r.top + i * sRest, last = i === R - 1;
    for (let j = 0; j < n; j++) drawCard({y, off: cardH, gv: (i + j) % 3, blink: 0, flash: 0}, r.left + j * colW + sh, now);
  }
  ctx.restore();
}
popWall.passed = [];
document.addEventListener('securitypolicyviolation', e => {
  if (!/youtube/.test(e.blockedURI || '')) return;
  pframe.querySelectorAll('iframe').forEach(f => f.remove());
  if (pframe._card) pframe.innerHTML = pframe._card;
});

/* ---------- video gap ---------- */
const vid = document.getElementById('vid'), vframe = document.getElementById('vframe'), vx = document.getElementById('vx'), vp = document.getElementById('vp'), vn = document.getElementById('vn');

function placeVideo() {
  const sRest = (IH - cardH) / (cols[0].cards.length - 1);
  // the gap: everything inside the frame of cards, snapped to the grid
  const l = X0 + colW, r = X0 + IW - colW, t = Y0 + sRest, b = Y0 + IH - cardH;
  // close card sits in the gap's top-right cell, like one more card
  const cell = {width: (colW - GAP) + 'px', height: cardH + 'px'};
  Object.assign(vx.style, cell, {left: (r - colW + GAP / 2) + 'px', top: t + 'px'});
  Object.assign(vp.style, cell, {left: (l + GAP / 2) + 'px', top: (b - cardH) + 'px'});
  Object.assign(vn.style, cell, {left: (r - colW + GAP / 2) + 'px', top: (b - cardH) + 'px'});
  const bw = colW - GAP;
  vx._r = {left: r - colW + GAP / 2, top: t, w: bw, h: cardH};
  vp._r = {left: l + GAP / 2, top: b - cardH, w: bw, h: cardH};
  vn._r = {left: r - colW + GAP / 2, top: b - cardH, w: bw, h: cardH};
  // video spans whole columns, leaving one empty column each side
  const vl = l + colW, vr = r - colW, vt = t + cardH * 0.5, vb = b - cardH * 0.5;
  Object.assign(vid.style, {left: vl + 'px', top: vt + 'px', width: (vr - vl) + 'px', height: (vb - vt) + 'px'});
  vframe.style.width = Math.min(vr - vl, (vb - vt) * 16 / 9) + 'px';
}

function openVideo(p) {
  if (collapsed) { pending = p; setCollapsed(false); return; }
  vProj = p; vOpen = true;
  hovered = null; pts = [];
  placeVideo();
  fillVideo(p);
}

function fillVideo(p) {
  const link = p.url || (p.yt ? `https://www.youtube.com/watch?v=${p.yt}` : '');
  const label = p.url ? 'Listen on Bandcamp ↗' : 'Watch on YouTube ↗';
  const here = location.origin && location.origin !== 'null' ? location.origin : '';
  const originParam = here ? '&origin=' + encodeURIComponent(here) + '&widget_referrer=' + encodeURIComponent(location.href) : '';
  const card = `<div class="ph"><span class="k">${p.k}</span><h1>${p.t}</h1><span class="m">${p.m}</span>${link ? `<a href="${link}" target="_blank" rel="noopener">${label}</a>` : ''}</div>`;
  vframe._card = card;
  vframe.innerHTML = EMBED && p.yt && !embedBlocked
    ? `<iframe onload="this.classList.add('ready')" src="https://www.youtube.com/embed/${p.yt}?autoplay=1&rel=0&playsinline=1${originParam}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="${p.t}"></iframe>`
    : card;
}

// if the page's security policy refuses YouTube, drop the player and keep the title card
let embedBlocked = false;
document.addEventListener('securitypolicyviolation', e => {
  if (!/youtube/.test(e.blockedURI || '')) return;
  embedBlocked = true;
  vframe.querySelectorAll('iframe').forEach(f => f.remove());
  if (vframe._card) vframe.innerHTML = vframe._card;
});

function closeVideo() {
  if (!vOpen) return;
  vOpen = false;
  vframe.innerHTML = '';
  pts = []; hovered = null;
  cols.forEach(col => col.cards.forEach(c => { c.tr = 0; c.h = 0; }));
}
function closeWithCross() {
  if (!vOpen || vx.classList.contains('closing')) return;
  [vx, vp, vn].forEach(b => b.classList.add('closing'));
  setTimeout(() => { closeVideo(); [vx, vp, vn].forEach(b => b.classList.remove('closing')); }, 200);
}
vx.addEventListener('click', closeWithCross);

function step(dir, btn) {
  if (!vOpen || swapping || Q < 1) return;
  const i = PROJECTS.indexOf(vProj);
  const next = PROJECTS[(i + dir + PROJECTS.length) % PROJECTS.length];
  [vx, vp, vn].forEach(b => b.classList.add('closing'));
  setTimeout(() => {
    [vx, vp, vn].forEach(b => b.classList.remove('closing'));
    swapDir = dir; swapStart = performance.now(); swapping = true; drawWall.passed = [];
    vProj = next;
    // swap while hidden, so the new video is loading as the cards flow back
    setTimeout(() => fillVideo(next), SWAP_MS * 0.5);
  }, 200);
}
vp.addEventListener('click', () => step(-1, vp));
vn.addEventListener('click', () => step(1, vn));

/* ---------- clock + loop ---------- */
const clock = document.getElementById('clock');
function tickClock() {
  const t = new Date().toLocaleTimeString('en-GB', {timeZone: 'Europe/Berlin', hour12: false});
  clock.textContent = t + ' CET';
}
setInterval(tickClock, 1000); tickClock();

/* ---------- cursor with a gentle pull towards project cards ---------- */
let cx = 0, cy = 0, snapped = null;
function moveCursor() {
  if (wx < -1e3) return;
  const REACH = colW * 1.5, HOLD = colW * 2.1;
  let tx = wx, ty = wy, near = null, best = REACH;
  if (mx > -1e3 && !vOpen && Q === 0 && P === 0) {
    const sRest = (IH - cardH) / (cols[0].cards.length - 1);
    cols.forEach((col, ci) => col.cards.forEach((c, i) => {
      if (!c.p) return;
      // judge distance by where the card sits when closed, so the lens can't push it away
      const px = X0 + (ci + 0.5) * colW;
      const d = Math.hypot(px - mx, Y0 + (i + 0.5) * sRest - my);
      // the card you're already on keeps hold of the cursor for longer
      const reach = c === snapped ? HOLD : REACH;
      if (d < reach && (!near || d < best)) { best = d; near = {px, py: c.y + Math.min(c.off, cardH) * 0.5, c, reach}; }
    }));
  }
  if (near) {
    const t = Math.min(1, best / near.reach);
    const pull = 0.85 - 0.45 * t * t;
    tx = mx + (near.px - mx) * pull; ty = my + (near.py - my) * pull;
    if (snapped !== near.c) snapFeedback(true);
  }
  snapped = near ? near.c : null;
  const inText = collapsed && P > 0.5;
  cur.classList.toggle('snap', inText ? overUI : (!!near || overUI));
  cur.classList.toggle('text', inText);
  cx += (tx - cx) * (near ? 0.25 : 0.6);
  cy += (ty - cy) * (near ? 0.25 : 0.6);
  cur.style.transform = `translate(${cx}px, ${cy}px)`;
}

function frame(now) {
  requestAnimationFrame(frame);
  try { update(now); moveCursor(); draw(now); }
  catch (err) { console.error(err); swapping = false; }
}

let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (vOpen) placeVideo(); if (popOpen) sizePop(); }, 120); });
layout();
requestAnimationFrame(frame);
if (document.fonts) document.fonts.ready.then(() => layout());

// grain tiles: drawn once, then baked into the card images, the page and the buttons
function makeTile(dark) {
  const t = document.createElement('canvas'); t.width = t.height = 160;
  const g = t.getContext('2d'), d = g.createImageData(160, 160), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    const v = Math.random();
    if (dark) { if (v < 0.3) { a[i] = a[i + 1] = a[i + 2] = 0; a[i + 3] = 6 + Math.random() * 16; } }
    else if (v < 0.035) { a[i] = a[i + 1] = a[i + 2] = 255; a[i + 3] = 14 + Math.random() * 16; }
  }
  g.putImageData(d, 0, 0);
  return t;
}
const DARK = makeTile(true), LIGHTSPECK = makeTile(false);
document.body.style.backgroundImage = `url(${LIGHTSPECK.toDataURL()})`;
document.getElementById('peek').style.backgroundImage = `url(${DARK.toDataURL()}), url(assets/ravi.jpg)`;
document.querySelectorAll('.vx,.vp,.vn').forEach(b => b.style.backgroundImage = `url(${DARK.toDataURL()}), linear-gradient(#8dff6e,#2fe000)`);

console.log('%cd1 $ s "hello" # room 0.3\n-- you found the console. try typing hush on the page.', 'font-family:monospace;color:#31AF00');
}
