import { FALL_MS } from "./round.js";
import { shapeX } from "./shapes.js";

const W = 72;
const H = 16;
const TAU = 2 * Math.PI;
const BACKGROUND = {
  ".": "080c16", n: "111b2c", m: "203347", s: "33526a", w: "708fae",
  k: "080b15", y: "d68447", Y: "ffc970", A: "fff1cf",
};
const headers = {};

function header(shape) {
  if (!headers[shape.id]) {
    const [D, I, F, H, B, W] = shape.colors;
    const colors = { ...BACKGROUND, D, I, F, H, B, W };
    const entries = Object.keys(colors);
    headers[shape.id] = "! XPM2\n72 16 " + entries.length + " 1\n" +
      entries.map((key) => key + " c #" + colors[key]).join("\n") + "\n";
  }
  return headers[shape.id];
}

function pixel(screen, x, y, color) {
  if (x >= 0 && x < W && y >= 0 && y < H) screen[y][x] = color;
}

function line(screen, x, y, end, color) {
  if (y >= 0 && y < H && x < W && end >= 0) {
    screen[y].fill(color, Math.max(0, x), Math.min(W, end + 1));
  }
}

function glint(screen, x, y, color) {
  pixel(screen, x, y, color);
  pixel(screen, x - 1, y, color);
  pixel(screen, x + 1, y, color);
  pixel(screen, x, y - 1, color);
  pixel(screen, x, y + 1, color);
}

function ground(screen, y, step, offset = 0) {
  line(screen, 0, y, W - 1, "n");
  for (let x = -offset; x < W; x += step) line(screen, x, y + 1, x + 3, "m");
}

function wave(screen, x, y, bright) {
  const trace = [0, 0, 0, 0, 0, 0, -1, -3, 2, 0, 0, 0, 0, 0, 0];
  trace.forEach((height, i) => {
    pixel(screen, x + i, y + height, height && bright ? "H" : "D");
    if (i && Math.abs(height - trace[i - 1]) > 1) {
      for (let dy = Math.min(height, trace[i - 1]) + 1; dy < Math.max(height, trace[i - 1]); dy++) {
        pixel(screen, x + i, y + dy, "D");
      }
    }
  });
}

function stars(screen, underwater) {
  const points = [[5, 3], [12, 8], [15, 2], [23, 6], [33, 1], [43, 3], [50, 1], [53, 8], [62, 4], [67, 7]];
  for (const [x, y] of points) pixel(screen, x, underwater ? H - y - 1 : y, "m");
  if (!underwater) {
    glint(screen, 11, 5, "n");
    glint(screen, 60, 3, "n");
  }
}

function pump(screen, inUse, level) {
  line(screen, 53, 4, 58, "s");
  line(screen, 53, 5, 58, "m");
  for (let y = 6; y <= 12; y++) line(screen, 53, y, 58, y === 6 || y === 10 ? "s" : "m");
  for (let y = 6; y <= 9; y++) line(screen, 54, y, 57, y >= 10 - level ? "F" : "n");
  line(screen, 52, 13, 59, "s");
  if (inUse) {
    line(screen, 47, 12, 52, "s");
    pixel(screen, 46, 11, "s");
    pixel(screen, 47, 11, "W");
  }
}

function scenery(screen, shape, elapsed, level) {
  switch (shape.id) {
    case "heart": {
      const bright = elapsed >= 0 && elapsed % 1050 < 280;
      wave(screen, 5, 8, bright);
      wave(screen, 51, 8, bright);
      break;
    }
    case "pig":
      ground(screen, 14, 8, elapsed < 0 ? 0 : Math.floor(elapsed / 75) % 8);
      line(screen, 6, 12, 17, "n");
      line(screen, 54, 12, 64, "n");
      break;
    case "popcorn":
      ground(screen, 14, 10);
      for (let i = 0; i < 5; i++) {
        pixel(screen, 13 + i * 2, 3 + i, "n");
        pixel(screen, 58 - i * 2, 3 + i, "n");
      }
      break;
    case "rocket":
      stars(screen, false);
      ground(screen, 14, 12);
      if (elapsed < 0 || elapsed < 1200) line(screen, 26, 13, 45, "s");
      break;
    case "car":
      ground(screen, 14, 12, elapsed < 0 ? 0 : Math.floor(elapsed / 45) % 12);
      pump(screen, elapsed < 0, Math.floor(level * 4));
      break;
    case "ghost":
      stars(screen, false);
      line(screen, 10, 14, 25, "n");
      line(screen, 50, 14, 62, "n");
      break;
    case "jelly":
      stars(screen, true);
      for (let x = 1; x < W; x += 6) pixel(screen, x, 15, "n");
      break;
    case "flower":
      ground(screen, 14, 9);
      line(screen, 3, 12, 20, "n");
      line(screen, 51, 12, 68, "n");
      break;
  }
}

function fillColor(shape, x, y, cell) {
  if (cell === "*") return "H";
  if (shape.id === "popcorn") return x % 3 === 0 ? "W" : "F";
  if (shape.id === "rocket" && y < 6) return "H";
  return (x + y * 2) % 7 === 0 ? "B" : "F";
}

function sprite(screen, shape, count, x, y, options = {}) {
  const { mirror, stretch, elapsed = 0 } = options;
  const full = count === shape.slots.length;
  for (let row = 0; row < shape.rows.length; row++) {
    const source = shape.rows[row];
    for (let col = 0; col < source.length; col++) {
      const cell = source[col];
      if (cell === ".") continue;
      const index = shape.order[row][col];
      let color = "D";
      if (cell === "@") color = full && shape.id === "ghost" ? "W" : "k";
      if (index >= 0) color = index < count ? fillColor(shape, col, row, cell) : "I";
      const waveOffset = full && shape.id === "jelly" && row > 5 ?
        Math.round(Math.sin(elapsed / 170 + row * 0.8 + col) * 0.8) : 0;
      const legOffset = full && shape.id === "pig" && row === shape.rows.length - 1 ?
        Math.round(Math.sin(elapsed / 54 + col) * 0.8) : 0;
      const px = x + (mirror ? shape.width - col - 1 : col) + waveOffset + legOffset;
      const py = y + row;
      const bump = stretch && col >= Math.floor(shape.width / 2) ? 1 : 0;
      pixel(screen, px + bump, py, color);
      if (stretch && col === Math.floor(shape.width / 2)) pixel(screen, px, py, color);
    }
  }
}

function sprinklePopcorn(screen, elapsed) {
  for (let i = 0; i < 31; i++) {
    const age = (elapsed - (i % 8) * 49 - Math.floor(i / 8) * 95) / 1000;
    if (age < 0) continue;
    const direction = i % 2 ? 1 : -1;
    const x = Math.round(36 + direction * (2 + (19 + i * 17 % 27) * age));
    const y = Math.round(7 - (8 + i * 13 % 11) * age + (5 + i % 4) * age * age);
    pixel(screen, x, y, i % 3 ? "W" : "H");
    if (i % 4 === 0) pixel(screen, x + direction, y, "Y");
  }
}

function launch(screen, shape, elapsed, count) {
  if (elapsed > 1050) {
    for (let row = 0; row < 3; row++) {
      const y = 13 + row;
      const span = 4 + row * 3;
      line(screen, 35 - span, y, 36 + span, row === 0 ? "m" : "k");
      pixel(screen, 34 - span, y, "D");
      pixel(screen, 37 + span, y, "D");
    }
    line(screen, 31, 14, 40, elapsed < 2300 ? "y" : "I");
  }
  if (elapsed < 1500) {
    const rise = Math.round(25 * Math.pow(Math.min(1, elapsed / 1500), 1.35));
    const base = shape.offsetY - rise;
    sprite(screen, shape, count, shapeX(shape), base);
    const bottom = base + shape.rows.length - 2;
    for (let y = bottom; y < bottom + 5; y++) {
      pixel(screen, 35 + (y % 2), y, y === bottom ? "W" : "Y");
      if (y <= bottom + 2) pixel(screen, 36 - (y % 2), y, "y");
    }
  }
  if (elapsed < 2420) {
    for (let i = 0; i < 16; i++) {
      const age = (elapsed - i * 43) / 1000;
      if (age < 0) continue;
      const x = 35 + Math.round(age * (i % 2 ? 1 : -1) * (5 + i % 10));
      const y = 14 - Math.round(age * (1 + i % 4));
      pixel(screen, x, y, age > 1 ? "n" : "D");
      if (age < 1.2) pixel(screen, x + 1, y, "m");
    }
  }
}

function finishedSprite(screen, shape, count, elapsed) {
  const center = shapeX(shape);
  const y = shape.offsetY;
  switch (shape.id) {
    case "heart": {
      const beat = elapsed % 1050;
      const bump = beat < 160 || (beat >= 240 && beat < 370);
      sprite(screen, shape, count, center - (bump ? 1 : 0), y - (bump ? 1 : 0), { stretch: bump });
      if (bump) {
        glint(screen, center - 5, y + 3, "H");
        glint(screen, center + shape.width + 4, y + 3, "H");
      }
      break;
    }
    case "pig": {
      const step = Math.floor(elapsed / 34);
      const range = center - 5;
      const phase = (step + range) % (4 * range);
      const distance = phase <= 2 * range ? phase : 4 * range - phase;
      const mirror = phase > 2 * range;
      const x = 5 + distance;
      sprite(screen, shape, count, x, y - Math.floor(elapsed / 115) % 2, { mirror, elapsed });
      for (let i = 0; i < 3; i++) {
        const tail = mirror ? x + shape.width + i * 2 + 1 : x - i * 2 - 2;
        pixel(screen, tail, 12 + i % 2, i === 0 ? "y" : "m");
      }
      break;
    }
    case "popcorn":
      sprite(screen, shape, count, center, y);
      if (elapsed < 3000) sprinklePopcorn(screen, elapsed);
      break;
    case "rocket":
      launch(screen, shape, elapsed, count);
      break;
    case "car": {
      const x = (center + shape.width + Math.floor(elapsed / 37)) % (W + shape.width + 2) - shape.width;
      sprite(screen, shape, count, x, y);
      pixel(screen, x + shape.width, y + 3, "Y");
      for (let i = 1; i < 5; i++) pixel(screen, x - i, y + 5 - i % 2, i % 3 ? "m" : "D");
      break;
    }
    case "ghost": {
      const x = center + Math.round(20 * Math.sin(elapsed / 720));
      const bob = Math.round(2 * Math.sin(elapsed / 240));
      sprite(screen, shape, count, x, y + bob);
      for (let i = 0; i < 5; i++) pixel(screen, x - 2 - i * 2, y + 6 + (i % 3), i % 2 ? "D" : "n");
      break;
    }
    case "jelly": {
      const x = center + Math.round(17 * Math.sin(elapsed / 780));
      const bob = Math.round(2 * Math.sin(elapsed / 370));
      sprite(screen, shape, count, x, y + bob, { elapsed });
      for (let i = 0; i < 6; i++) {
        const bubble = Math.floor(elapsed / 110 + i * 2) % H;
        pixel(screen, x + 15 + i * 3, 15 - bubble, i % 2 ? "s" : "D");
      }
      break;
    }
    case "flower": {
      sprite(screen, shape, count, center, y);
      const radius = Math.min(5, 1 + Math.floor(elapsed / 130));
      for (let petal = 0; petal < 8; petal++) {
        const angle = petal * TAU / 8 - Math.PI / 2;
        const x = 35 + Math.round(radius * Math.cos(angle));
        const py = Math.max(1, y + 3 + Math.round(radius * 0.75 * Math.sin(angle)));
        glint(screen, x, py, petal % 2 ? "H" : "W");
      }
      glint(screen, 35, y + 3, "Y");
      if (elapsed < 1600) {
        pixel(screen, 24 - Math.floor(elapsed / 300), 4, "W");
        pixel(screen, 46 + Math.floor(elapsed / 300), 7, "W");
      }
      break;
    }
  }
}

export function needsMotion(shape, round, now) {
  if (round.pending.length) return true;
  if (round.completedAt === null) return false;
  const elapsed = now - round.completedAt;
  if (shape.id === "popcorn") return elapsed < 3000;
  if (shape.id === "rocket") return elapsed < 2430;
  if (shape.id === "flower") return elapsed < 1610;
  return true;
}

export function renderFront(shape, round, now) {
  const pixels = Array.from({ length: H }, () => Array(W).fill("."));
  const elapsed = round.completedAt === null ? -1 : Math.max(0, now - round.completedAt);
  scenery(pixels, shape, elapsed, round.filled / shape.slots.length);
  if (elapsed >= 0) {
    finishedSprite(pixels, shape, round.filled, elapsed);
  } else {
    const x = shapeX(shape);
    sprite(pixels, shape, round.filled, x, shape.offsetY);
    round.pending.forEach((start, index) => {
      if (start > now) return;
      const slot = shape.slots[round.filled + index];
      const rise = Math.min(1, (now - start) / FALL_MS);
      pixel(pixels, x + slot.x, Math.floor((shape.offsetY + slot.y) * rise), "A");
    });
  }
  return header(shape) + pixels.map((row) => row.join("")).join("\n");
}
