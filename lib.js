// 小螃蟹修 bug —— 画笔库：工具函数、配色、Clawd、虫子、道具、界面零件。
// 所有东西都是 Canvas 2D 按时间算出来的，不用任何图片。
"use strict";
const W = 1920, H = 1080, TAU = Math.PI * 2;
const cv = document.getElementById("c");
let ctx = cv.getContext("2d");

// ---------- 小工具 ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const sm = u => u * u * (3 - 2 * u);
const eio = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eout = u => 1 - Math.pow(1 - u, 3);
const ein = u => u * u * u;
const eback = (u, k = 1.70158) => 1 + (k + 1) * Math.pow(u - 1, 3) + k * Math.pow(u - 1, 2);
const eelastic = u => (u <= 0 ? 0 : u >= 1 ? 1 : Math.pow(2, -10 * u) * Math.sin((u * 10 - 0.75) * (TAU / 3)) + 1);
const within = (t, a, b) => t >= a && t < b;
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i; return lerp(hash(i + seed * 101.3), hash(i + 1 + seed * 101.3), sm(f)) * 2 - 1; }
// 在一组 [时间, 值] 关键帧之间插值（ease 默认 eio）
function keys(t, ks, ease = eio) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1], [t1, v1, e] = ks[i];
      const u = (e || ease)(inv(t0, t1, t));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], u)) : lerp(v0, v1, u);
    }
  }
  return ks[ks.length - 1][1];
}
// 跳跃：t0→t1 从 a 跳到 b，弧高 h；返回 {x, y, lift, u}
function jump(t, t0, t1, a, b, h) {
  const u = inv(t0, t1, t);
  return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), lift: 4 * h * u * (1 - u) + Math.max(0, lerp(a[1], b[1], u) - lerp(a[1], b[1], u)), u };
}

// ---------- 配色 ----------
const C = {
  bg: "#EFE4D0", bgDot: "#E0D1B6",
  win: "#FBF6EC", panel: "#FFFDF8", ink: "#3A2418", inkSoft: "#8C7A68", line: "#E4D8C6",
  shadow: "rgba(92,60,38,0.20)",
  orange: "#DA7856", orangeD: "#B55C3F", orangeL: "#F2A184",
  term: "#2A221E", termHead: "#352B26", termText: "#F3E9D9", termDim: "#9D8F80", termLine: "#463A33",
  mint: "#9EDFC5", mintD: "#4FAE88", pink: "#F6B4C5", pinkD: "#DE6F90", yellow: "#F8D466", yellowD: "#DDA42A",
  sky: "#A8D5F2", skyD: "#4E9BD0", lav: "#CDB9F3", lavD: "#8E70D6",
  red: "#EE6655", redD: "#C23F30", green: "#67C987", greenD: "#389A58", gray: "#D9D0C4", grayD: "#A99D8F",
  cork: "#E6C495", corkD: "#C99F66", note: "#FFE27F", noteD: "#E8BF3E",
};
const FH = '"Hannotate", "PingFang SC", sans-serif';
const FP = '"Wawa", "Hannotate", sans-serif';
const FM = 'Menlo, "Hannotate", "PingFang SC", monospace';

// ---------- 基础绘制 ----------
function txt(s, x, y, o = {}) {
  const size = o.size ?? 28;
  ctx.font = `${o.weight ?? 700} ${size}px ${o.font ?? FH}`;
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = o.base ?? "middle";
  if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.lw ?? size * 0.2; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.color ?? C.ink;
  ctx.fillText(s, x, y);
}
function tw(s, size, font = FH, weight = 700) { ctx.font = `${weight} ${size}px ${font}`; return ctx.measureText(s).width; }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function panel(x, y, w, h, o = {}) {
  const r = o.r ?? 22;
  if (o.shadow !== false) { ctx.fillStyle = C.shadow; rr(x + 6, y + 9, w, h, r); ctx.fill(); }
  ctx.fillStyle = o.fill ?? C.panel; rr(x, y, w, h, r); ctx.fill();
  ctx.lineWidth = o.lw ?? 4.5; ctx.strokeStyle = o.stroke ?? C.ink; ctx.stroke();
}
function ink(lw = 4.5, color = C.ink) { ctx.lineWidth = lw; ctx.strokeStyle = color; ctx.lineCap = "round"; ctx.lineJoin = "round"; }
function fillStroke(fill, lw = 4.5) { ctx.fillStyle = fill; ctx.fill(); ink(lw); ctx.stroke(); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
function withAlpha(a, fn) { if (a <= 0.001) return; ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); }
function star(x, y, r, rot = 0, pts = 5, inner = 0.45) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = rot + (i * Math.PI) / pts - Math.PI / 2, rr_ = i % 2 ? r * inner : r;
    ctx[i ? "lineTo" : "moveTo"](x + Math.cos(a) * rr_, y + Math.sin(a) * rr_);
  }
  ctx.closePath();
}
// 四角闪光（✦）
function sparkle(x, y, r, color = C.yellow, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4;
    ctx.quadraticCurveTo(Math.cos(a + Math.PI / 4) * r * 0.16, Math.sin(a + Math.PI / 4) * r * 0.16, Math.cos(a + Math.PI / 2) * r, Math.sin(a + Math.PI / 2) * r);
  }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ink(3); ctx.stroke();
  ctx.restore();
}

// ---------- Clawd ----------
// 原点在两脚中间的地面上，朝右为正（flip=-1 朝左）。身体 150×100，腿高 26（未缩放）。
// o: x y s sx sy rot lift flip, eyes（n/happy/squint/wide/dot/swirl/dead/sleep/shifty/wideR）, lookX lookY blink,
//    mouth（o/smile/wave/open/flat）, blush, sweat（0–1）, walk（腿的相位，undefined 表示站着）, tuck（腿缩起 0–1）,
//    armL/armR: {x, y, prop, ang}（手的位置，身体局部坐标，未缩放；不给就是小短手）, hat（安全帽）, t（时间，给转圈眼睛用）
const LEGX = [-56, -31, 31, 56];
function drawClawd(o) {
  const s = o.s ?? 0.9, sx = o.sx ?? 1, sy = o.sy ?? 1, lift = o.lift ?? 0;
  ctx.save();
  ctx.translate(o.x, o.y);
  if (o.shadow !== false) {
    const k = 1 / (1 + lift / 160);
    ctx.fillStyle = "rgba(70,40,22,0.18)";
    ctx.beginPath(); ctx.ellipse(0, 3, 82 * s * sx * k, 11 * s * k, 0, 0, TAU); ctx.fill();
  }
  ctx.translate(0, -lift);
  ctx.rotate(o.rot ?? 0);
  ctx.scale(s * sx * (o.flip ?? 1), s * sy);
  const alpha = o.alpha ?? 1;
  ctx.globalAlpha *= alpha;

  // 腿
  const tuck = o.tuck ?? 0;
  for (let i = 0; i < 4; i++) {
    let up = 0;
    if (o.walk !== undefined) up = Math.max(0, Math.sin(o.walk + (i % 2 ? Math.PI : 0))) * 11;
    if (o.tap !== undefined && i === 3) up = o.tap;
    const hL = 30 - tuck * 12;
    rr(LEGX[i] - 8, -26 - 4 - up, 16, hL, 5);
    fillStroke(C.orange, 4.5);
  }
  // 后面的手（伸长的手画在身体前面，短手画在身体后面露出一截）
  const armDefault = side => ({ x: side * 92, y: -60 });
  for (const side of [-1, 1]) {
    const a = side < 0 ? o.armL : o.armR;
    if (!a) { rr(side < 0 ? -97 : 71, -73, 26, 22, 8); fillStroke(C.orange, 4.5); }
  }
  // 身体
  rr(-75, -126, 150, 100, 13);
  ctx.fillStyle = C.orange; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = C.orangeD; ctx.globalAlpha *= 0.32; ctx.fillRect(-80, -46, 160, 24);
  ctx.restore();
  ink(5); rr(-75, -126, 150, 100, 13); ctx.stroke();
  rr(-60, -115, 36, 9, 4.5); ctx.fillStyle = C.orangeL; ctx.fill();
  rr(-17, -115, 9, 9, 4.5); ctx.fill();
  if (o.hat) drawHat(o.hat);
  // 脸
  drawEyes(o);
  if (o.blush) withAlpha(o.blush, () => {
    ctx.fillStyle = "#F58C8C";
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(side * 50 + (o.lookX ?? 0) * 6, -66, 11, 6, 0, 0, TAU); ctx.fill(); }
  });
  drawMouth(o);
  // 伸长的手
  for (const side of [-1, 1]) {
    const a = side < 0 ? o.armL : o.armR;
    if (a) drawArm(side, a, o);
  }
  if (o.sweat) drawSweat(o.sweat, o.t ?? 0);
  if (o.web) drawWeb(o.web);
  ctx.restore();
}
function drawEyes(o) {
  const kind = o.eyes ?? "n", lx = (o.lookX ?? 0) * 10, ly = (o.lookY ?? 0) * 7, bl = o.blink ?? 0, t = o.t ?? 0;
  for (const side of [-1, 1]) {
    const ex = side * 33 + lx, ey = -92 + ly;
    ctx.fillStyle = C.ink; ink(6);
    if (kind === "n" || kind === "big") {
      const k = kind === "big" ? 1.25 : 1;
      const h = Math.max(4, 30 * k * (1 - bl));
      rr(ex - 7.5 * k, ey - h / 2, 15 * k, h, 7 * k); ctx.fill();
      if (h > 14) { ctx.fillStyle = "#fff"; circle(ex - 2 * k, ey - h / 2 + 7 * k, 3.2 * k); ctx.fill(); }
    } else if (kind === "happy") {
      ctx.beginPath(); ctx.moveTo(ex - 11, ey + 6); ctx.quadraticCurveTo(ex, ey - 14, ex + 11, ey + 6); ctx.stroke();
    } else if (kind === "squint") {
      ctx.beginPath();
      if (side < 0) { ctx.moveTo(ex - 9, ey - 10); ctx.lineTo(ex + 8, ey); ctx.lineTo(ex - 9, ey + 10); }
      else { ctx.moveTo(ex + 9, ey - 10); ctx.lineTo(ex - 8, ey); ctx.lineTo(ex + 9, ey + 10); }
      ctx.stroke();
    } else if (kind === "wide") {
      ctx.beginPath(); ctx.ellipse(ex, ey, 14, 18, 0, 0, TAU); ctx.fillStyle = "#fff"; ctx.fill(); ink(4); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(ex + lx * 0.3, ey + 2 + ly * 0.3, 6.5, 9, 0, 0, TAU); ctx.fill();
    } else if (kind === "dot") {
      circle(ex, ey, 5); ctx.fill();
    } else if (kind === "swirl") {
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(t * 9 * side); ink(4);
      ctx.beginPath();
      for (let a = 0; a < 3.2 * Math.PI; a += 0.2) { const r = 1.5 + a * 1.25; ctx[a ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
      ctx.stroke(); ctx.restore();
    } else if (kind === "dead") {
      ink(5); ctx.beginPath(); ctx.moveTo(ex - 8, ey - 8); ctx.lineTo(ex + 8, ey + 8); ctx.moveTo(ex + 8, ey - 8); ctx.lineTo(ex - 8, ey + 8); ctx.stroke();
    } else if (kind === "sleep") {
      ctx.beginPath(); ctx.moveTo(ex - 11, ey + 2); ctx.quadraticCurveTo(ex, ey + 11, ex + 11, ey + 2); ctx.stroke();
    } else if (kind === "shifty") {
      rr(ex - 7.5, ey - 3, 15, 15, 5); ctx.fill();
      ink(5); ctx.beginPath(); ctx.moveTo(ex - 12, ey - 5); ctx.lineTo(ex + 12, ey - 5); ctx.stroke();
    } else if (kind === "flat") {
      ink(5); ctx.beginPath(); ctx.moveTo(ex - 10, ey); ctx.lineTo(ex + 10, ey); ctx.stroke();
    }
  }
}
function drawMouth(o) {
  const m = o.mouth; if (!m) return;
  const x = (o.lookX ?? 0) * 8, y = -60;
  ink(4.5);
  if (m === "o") { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(x, y, 7, 9, 0, 0, TAU); ctx.fill(); }
  else if (m === "O") { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(x, y + 2, 11, 14, 0, 0, TAU); ctx.fill(); }
  else if (m === "smile") { ctx.beginPath(); ctx.moveTo(x - 10, y - 3); ctx.quadraticCurveTo(x, y + 8, x + 10, y - 3); ctx.stroke(); }
  else if (m === "open") {
    ctx.beginPath(); ctx.moveTo(x - 13, y - 6); ctx.quadraticCurveTo(x, y + 18, x + 13, y - 6); ctx.closePath();
    ctx.fillStyle = C.ink; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = "#F07C8A"; circle(x, y + 12, 8); ctx.fill(); ctx.restore();
  } else if (m === "wave") {
    ctx.beginPath(); for (let i = 0; i <= 8; i++) ctx[i ? "lineTo" : "moveTo"](x - 14 + i * 3.5, y + (i % 2 ? -3 : 3)); ctx.stroke();
  } else if (m === "flat") { ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.stroke(); }
}
// 伸长的手：肩膀在身体侧边，a.x/a.y 是手的位置（身体局部坐标）
function drawArm(side, a, o) {
  const sx = side * 70, sy = -62;
  const hx = a.x, hy = a.y;
  const mx = (sx + hx) / 2, my = (sy + hy) / 2, dx = hx - sx, dy = hy - sy, L = Math.hypot(dx, dy) || 1;
  const bend = a.bend ?? 0.12;
  const cx = mx - (dy / L) * L * bend * side, cy = my + (dx / L) * L * bend * side;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, hx, hy);
  ctx.lineWidth = 27; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.lineWidth = 18; ctx.strokeStyle = C.orange; ctx.stroke();
  if (a.prop) { ctx.save(); ctx.translate(hx, hy); ctx.rotate(a.ang ?? 0); drawProp(a.prop, a, o); ctx.restore(); }
  circle(hx, hy, 13); fillStroke(C.orange, 4.5);
}
function drawHat(kind) {
  if (kind === "headset") { // 客服耳麦
    ctx.save(); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-82, -94); ctx.bezierCurveTo(-84, -172, 84, -172, 82, -94);
    ink(14, C.ink); ctx.stroke(); ink(7, "#6B7480"); ctx.stroke();
    for (const side of [-1, 1]) { rr(side * 84 - 12, -114, 24, 40, 10); fillStroke("#58606B", 4.5); }
    ctx.beginPath(); ctx.moveTo(-84, -80); ctx.quadraticCurveTo(-82, -40, -34, -44);
    ink(11, C.ink); ctx.stroke(); ink(5, "#6B7480"); ctx.stroke();
    circle(-30, -44, 8); fillStroke("#2F3238", 4);
    ctx.restore(); return;
  }
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-58, -124); ctx.quadraticCurveTo(-56, -178, 0, -180); ctx.quadraticCurveTo(56, -178, 58, -124); ctx.closePath();
  fillStroke(C.yellow, 5);
  rr(-72, -132, 144, 14, 7); fillStroke(C.yellowD, 5);
  ink(4); ctx.beginPath(); ctx.moveTo(0, -178); ctx.lineTo(0, -134); ctx.stroke();
  ctx.restore();
}
function drawSweat(k, t) {
  ctx.save(); ctx.translate(86, -118 + (t * 60) % 30 * 0); ctx.scale(k, k);
  ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(15, 0, 0, 10); ctx.quadraticCurveTo(-15, 0, 0, -26); ctx.closePath();
  fillStroke("#8FD0F5", 4); ctx.fillStyle = "#fff"; circle(-3, 0, 3); ctx.fill();
  ctx.restore();
}
function drawWeb(k) { // 头顶左上角的蜘蛛网
  withAlpha(k, () => {
    ctx.save(); ctx.translate(-75, -126); ink(2.2, "rgba(255,255,255,0.95)");
    for (let i = 0; i <= 4; i++) { const a = (i / 4) * (Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 70 * k, Math.sin(a) * 70 * k); ctx.stroke(); }
    for (let r = 18; r <= 66; r += 16) {
      ctx.beginPath();
      for (let i = 0; i <= 4; i++) { const a = (i / 4) * (Math.PI / 2), rr_ = r * k * (i % 2 ? 0.86 : 1); ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rr_, Math.sin(a) * rr_); }
      ctx.stroke();
    }
    ink(1.5, "rgba(58,36,24,0.35)");
    ctx.restore();
  });
}

// ---------- 虫子（bug 真的是只虫） ----------
// 侧视的小甲虫，原点在脚下，朝右。o: x y s flip lift rot walk tongue wings(0–1 展开) eyes(look/happy) t
function drawBug(o) {
  const s = o.s ?? 1;
  ctx.save();
  ctx.translate(o.x, o.y);
  if (o.shadow !== false && !o.inJar) { ctx.fillStyle = "rgba(70,40,22,0.16)"; ctx.beginPath(); ctx.ellipse(0, 2, 30 * s / (1 + (o.lift ?? 0) / 80), 5 * s, 0, 0, TAU); ctx.fill(); }
  ctx.translate(0, -(o.lift ?? 0));
  ctx.rotate(o.rot ?? 0);
  ctx.scale(s * (o.flip ?? 1), s);
  const w = o.walk ?? 0, t = o.t ?? 0;
  // 腿
  ink(3.5);
  for (let i = 0; i < 3; i++) {
    const bx = -16 + i * 16, sw = Math.sin(w + i * 2.1) * 7;
    ctx.beginPath(); ctx.moveTo(bx, -12); ctx.quadraticCurveTo(bx + sw - 4, -4, bx + sw, 0); ctx.stroke();
  }
  // 翅膀（飞的时候）
  if (o.wings) withAlpha(o.wings, () => {
    for (const k of [0, 1]) {
      const flap = Math.sin(t * 60 + k) * 0.5;
      ctx.save(); ctx.translate(-4 - k * 6, -34); ctx.rotate(-0.9 - flap - k * 0.3);
      ctx.beginPath(); ctx.ellipse(0, -18, 11, 22, 0, 0, TAU); ctx.fillStyle = "rgba(220,240,255,0.85)"; ctx.fill(); ink(3); ctx.stroke();
      ctx.restore();
    }
  });
  // 壳
  ctx.beginPath(); ctx.ellipse(-4, -24, 27, 18, 0, 0, TAU); fillStroke("#86CC6E", 4);
  ctx.save(); ctx.clip(); ctx.fillStyle = "#5FA84E"; ctx.fillRect(-40, -18, 80, 20); ctx.restore();
  ctx.beginPath(); ctx.ellipse(-4, -24, 27, 18, 0, 0, TAU); ink(4); ctx.stroke();
  ink(3); ctx.beginPath(); ctx.moveTo(-4, -42); ctx.lineTo(-4, -8); ctx.stroke();
  ctx.fillStyle = "#3E7D34"; for (const [x, y, r] of [[-17, -30, 4], [-14, -17, 3], [7, -31, 3.5], [10, -18, 3]]) { circle(x, y, r); ctx.fill(); }
  ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.ellipse(-14, -36, 7, 3, -0.4, 0, TAU); ctx.fill();
  // 头
  circle(22, -22, 12); fillStroke("#4A3A34", 4);
  // 触角
  ink(3);
  ctx.beginPath(); ctx.moveTo(26, -32); ctx.quadraticCurveTo(30, -48, 40 + Math.sin(t * 7) * 2, -52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20, -33); ctx.quadraticCurveTo(20, -50, 28 + Math.sin(t * 7 + 1) * 2, -57); ctx.stroke();
  ctx.fillStyle = C.ink; circle(40 + Math.sin(t * 7) * 2, -52, 3.5); ctx.fill(); circle(28 + Math.sin(t * 7 + 1) * 2, -57, 3.5); ctx.fill();
  // 眼睛
  if (o.eyes === "happy") { ink(3, "#fff"); ctx.beginPath(); ctx.arc(26, -22, 4.5, Math.PI, TAU); ctx.stroke(); }
  else {
    ctx.fillStyle = "#fff"; circle(27, -25, 6); ctx.fill();
    ctx.fillStyle = C.ink; circle(28.5 + (o.look ?? 0) * 2, -24.5, 3); ctx.fill();
  }
  // 吐舌头
  if (o.tongue) withAlpha(1, () => {
    ctx.save(); ctx.translate(31, -15); ctx.scale(o.tongue, o.tongue);
    rr(-3, -2, 9, 12, 4.5); fillStroke("#F27D93", 2.5); ctx.restore();
  });
  ctx.restore();
}

// ---------- 道具 ----------
// 道具在手的局部坐标里画（原点是手，ang 已经转好）
function drawProp(kind, a, o) {
  if (kind === "net") {
    ink(7, "#8A5A35"); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.stroke();
    ink(3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(150, 0); ctx.stroke();
    // 网兜
    ctx.save(); ctx.translate(190, 0);
    ctx.beginPath(); ctx.moveTo(-4, -38); ctx.quadraticCurveTo(-60 - (a.sag ?? 0), 0, -4, 38); ctx.closePath();
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fill();
    ctx.save(); ctx.clip(); ink(1.6, "rgba(58,36,24,0.55)");
    for (let i = -80; i < 80; i += 11) { ctx.beginPath(); ctx.moveTo(i - 40, -40); ctx.lineTo(i + 40, 40); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i + 40, -40); ctx.lineTo(i - 40, 40); ctx.stroke(); }
    ctx.restore();
    ink(3); ctx.beginPath(); ctx.moveTo(-4, -38); ctx.quadraticCurveTo(-60 - (a.sag ?? 0), 0, -4, 38); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 40, 0, 0, TAU); ink(6, "#8A5A35"); ctx.stroke(); ink(2.5); ctx.stroke();
    if (a.caught) drawBug({ x: -30, y: 14, s: 0.55, rot: -0.5, shadow: false, t: o.t, walk: (o.t ?? 0) * 30, eyes: "n" });
    ctx.restore();
  } else if (kind === "glass") {
    ink(9, "#8A5A35"); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(46, 0); ctx.stroke();
    ink(3); ctx.stroke();
    circle(46 + 40, 0, 40); ink(9, C.ink); ctx.stroke(); ink(6, "#C9A45E"); ctx.stroke();
  } else if (kind === "roller") {
    const L = a.len ?? 180;
    ink(7, "#8A5A35"); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L, 0); ctx.stroke(); ink(3); ctx.stroke();
    ctx.save(); ctx.translate(L, 0); ctx.rotate(-(a.ang ?? 0) + (a.rollerAng ?? 0));
    rr(-40, -2, 80, 30, 12); fillStroke(C.green, 4.5);
    ctx.fillStyle = "rgba(255,255,255,0.45)"; rr(-32, 3, 40, 6, 3); ctx.fill();
    ink(4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -16); ctx.stroke();
    ctx.restore();
  } else if (kind === "hammer") {
    ink(7, "#8A5A35"); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(70, 0); ctx.stroke(); ink(3); ctx.stroke();
    rr(62, -24, 30, 48, 6); fillStroke("#B8C2CC", 4.5);
  } else if (kind === "sponge") {
    rr(-6, -20, 58, 38, 10); fillStroke(C.yellow, 4.5);
    ctx.fillStyle = C.yellowD; for (const [x, y] of [[10, -8], [28, 4], [40, -10], [18, 8]]) { circle(x, y, 3.5); ctx.fill(); }
  } else if (kind === "jar") {
    drawJar(0, 40, 0.8, o.t ?? 0, a.bugIn ?? true);
  } else if (kind === "note") {
    ctx.save(); ctx.rotate(0.1); rr(-10, -70, 80, 80, 4); fillStroke(C.note, 4); ctx.restore();
  } else if (kind === "pencil") {
    ctx.save(); ctx.rotate(-0.6);
    rr(-8, -70, 16, 62, 3); fillStroke(C.yellow, 4);
    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(0, 10); ctx.lineTo(8, -8); ctx.closePath(); fillStroke("#F3D9B5", 4);
    rr(-8, -80, 16, 12, 3); fillStroke(C.pink, 4);
    ctx.restore();
  } else if (kind === "flag") {
    ink(5, "#8A5A35"); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -110); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -108); ctx.quadraticCurveTo(30, -118 + Math.sin((o.t ?? 0) * 10) * 6, 62, -100); ctx.lineTo(0, -76); ctx.closePath(); fillStroke(C.red, 4);
  }
}
function drawJar(x, y, s, t, bugIn = true, lidOpen = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-40, -96, 80, 96, 18);
  ctx.fillStyle = "rgba(205,236,255,0.45)"; ctx.fill();
  if (bugIn) drawBug({ x: Math.sin(t * 5) * 6, y: -8 - Math.abs(Math.sin(t * 9)) * 16, s: 0.62, flip: Math.sin(t * 2.3) > 0 ? 1 : -1, shadow: false, t, walk: t * 26 });
  rr(-40, -96, 80, 96, 18); ink(5); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.8)"; rr(-28, -80, 9, 50, 4.5); ctx.fill();
  ctx.save(); ctx.translate(-44, -98); ctx.rotate(-lidOpen * 1.9); rr(0, -16, 88, 20, 7); fillStroke("#E8B64C", 5); ctx.restore();
  ctx.restore();
}

// ---------- 效果 ----------
function popText(s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.25) return;
  const u = inv(t0, t0 + 0.28, t), out = inv(t1, t1 + 0.22, t);
  const k = eback(u, 2.6) * (1 - ein(out) * 0.6);
  const a = 1 - out;
  const size = o.size ?? 80;
  ctx.save(); ctx.translate(x, y); ctx.rotate((o.rot ?? -0.06) + Math.sin((t - t0) * 7) * 0.02); ctx.scale(k, k);
  ctx.globalAlpha *= a;
  const font = o.font ?? FP;
  txt(s, size * 0.05, size * 0.07, { size, font, weight: 400, align: "center", color: C.ink, stroke: C.ink, lw: size * 0.17 });
  txt(s, 0, 0, { size, font, weight: 400, align: "center", color: o.color ?? C.yellow, stroke: C.ink, lw: size * 0.15 });
  ctx.restore();
}
// 对话气泡：tail 指向 (tx, ty)
function bubble(s, x, y, tx, ty, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.2) return;
  const u = inv(t0, t0 + 0.22, t), out = inv(t1, t1 + 0.18, t);
  const k = eback(u, 2.2) * (1 - out * 0.4);
  const size = o.size ?? 44, font = o.font ?? FH, weight = o.weight ?? 700;
  const w = tw(s, size, font, weight) + size * 1.1, h = size * 1.75;
  ctx.save(); ctx.globalAlpha *= 1 - out; ctx.translate(tx, ty); ctx.scale(k, k); ctx.translate(-tx, -ty);
  ctx.fillStyle = C.shadow; rr(x - w / 2 + 5, y - h / 2 + 7, w, h, h / 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = o.fill ?? "#fff"; ctx.fill(); ink(5); ctx.stroke();
  // 尾巴
  const bx = lerp(x, tx, 0.18), by = y + (ty > y ? h / 2 - 3 : -h / 2 + 3);
  ctx.beginPath(); ctx.moveTo(bx - 16, by); ctx.lineTo(tx, ty); ctx.lineTo(bx + 16, by); ctx.closePath();
  ctx.fillStyle = o.fill ?? "#fff"; ctx.fill(); ink(5); ctx.stroke();
  ctx.fillRect(bx - 12, by - (ty > y ? 5 : -1), 24, 6);
  txt(s, x, y + 2, { size, font, weight, align: "center", color: o.color ?? C.ink });
  ctx.restore();
}
function puff(x, y, t, t0, n = 7, r = 60, seed = 1, color = "#fff") {
  const u = inv(t0, t0 + 0.55, t); if (u <= 0 || u >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + hash(seed + i) * 0.6, d = r * eout(u) * (0.7 + hash(seed + i * 3) * 0.6);
    const rr_ = (18 + hash(seed + i * 7) * 14) * (1 - u * 0.7);
    withAlpha(1 - ein(u), () => { circle(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.55, rr_); fillStroke(color, 3.5); });
  }
}
function dust(x, y, t, t0, seed = 3) { // 落地扬尘：往两边
  const u = inv(t0, t0 + 0.45, t); if (u <= 0 || u >= 1) return;
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1, d = (40 + i * 14) * eout(u), rr_ = (14 - i) * (1 - u * 0.6);
    withAlpha(1 - u, () => { circle(x + side * d, y - 8 - hash(seed + i) * 18 * u, rr_); fillStroke("#FFF8EC", 3); });
  }
}
function impactStars(x, y, t, t0, n = 5, r = 70) {
  const u = inv(t0, t0 + 0.9, t); if (u <= 0 || u >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + t * 5;
    withAlpha(1 - ein(u), () => { star(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.35, 13, t * 4 + i); fillStroke(C.yellow, 3.5); });
  }
}
function speedLines(x, y, dir, t, a = 1, n = 5, len = 120) {
  withAlpha(a, () => {
    ink(5, "rgba(58,36,24,0.55)");
    for (let i = 0; i < n; i++) {
      const yy = y - 20 - i * 22 + noise1(t * 20 + i) * 5, x0 = x - dir * (40 + hash(i * 5 + Math.floor(t * 20)) * 50);
      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 - dir * len * (0.5 + hash(i) * 0.5), yy); ctx.stroke();
    }
  });
}
// 彩带：t0 时从 (x, y) 喷出，dir 是大致方向（弧度）
const CONF_COL = [C.pink, C.yellow, C.mint, C.sky, C.lav, C.orange, C.red];
function confetti(x, y, t, t0, n, dir, spread, speed, seed) {
  const dt = t - t0; if (dt <= 0 || dt > 4) return;
  for (let i = 0; i < n; i++) {
    const a = dir + (hash(seed + i) - 0.5) * spread, v = speed * (0.55 + hash(seed + i * 2) * 0.6);
    const drag = 1.6, vx = Math.cos(a) * v, vy = Math.sin(a) * v;
    const k = (1 - Math.exp(-drag * dt)) / drag;
    const px = x + vx * k + Math.sin(dt * 5 + i) * 14 * clamp(dt), py = y + vy * k + 520 * (dt - k) / drag * 0.9;
    const rot = dt * (6 + hash(seed + i * 4) * 8) + i;
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot); ctx.scale(1, Math.cos(dt * 9 + i));
    ctx.globalAlpha *= clamp((4 - dt) / 0.8);
    ctx.fillStyle = CONF_COL[i % CONF_COL.length];
    if (i % 3) { ctx.fillRect(-7, -4, 14, 8); } else { circle(0, 0, 6); ctx.fill(); }
    ctx.restore();
  }
}
function cursor(x, y, s = 1, press = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - press * 0.12), s * (1 - press * 0.12));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 64); ctx.lineTo(16, 50); ctx.lineTo(28, 76); ctx.lineTo(39, 71); ctx.lineTo(27, 45); ctx.lineTo(47, 45); ctx.closePath();
  ctx.fillStyle = "rgba(58,36,24,0.25)"; ctx.save(); ctx.translate(5, 7); ctx.fill(); ctx.restore();
  fillStroke("#fff", 5);
  ctx.restore();
}
function clickRing(x, y, t, t0) {
  const u = inv(t0, t0 + 0.4, t); if (u <= 0 || u >= 1) return;
  withAlpha(1 - u, () => { circle(x, y, 10 + 50 * eout(u)); ink(5, C.skyD); ctx.stroke(); });
}
function lightbulb(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2; ink(5, C.yellowD); ctx.beginPath(); ctx.moveTo(Math.cos(a) * 48, Math.sin(a) * 48 - 8); ctx.lineTo(Math.cos(a) * 64, Math.sin(a) * 64 - 8); ctx.stroke(); }
  circle(0, -10, 32); fillStroke(C.yellow, 5);
  rr(-14, 18, 28, 20, 5); fillStroke("#B8C2CC", 4.5);
  ctx.fillStyle = "#fff"; circle(-11, -20, 7); ctx.fill();
  ctx.restore();
}
