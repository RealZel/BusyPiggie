import manifest from "./appmeta/manifest.json";
import { SHAPES } from "./shapes.js";
import { addDrop, advanceRound, newRound } from "./round.js";
import { needsMotion, renderFront } from "./render.js";

const FRAME_MS = 52;
const URL = "http://localhost/api/display/draw";
const WHITE = "#FFFFFFFF";
const GRAY = "#AAAAAAFF";

const rounds = SHAPES.map(newRound);
let selection = 0;
let timer = null;
let drawing = false;
let stopped = false;
let lastFront = "";
let lastRear = "";
let lastError = "";

function text(id, value, x, y, font = "tiny", color = WHITE, align = "top_left") {
  return { id, type: "text", display: "back", align, x, y, font, color, text: value, z_index: 3 };
}

function block(id, x, y, width, height, color, zIndex = 1) {
  return {
    id, type: "rectangle", display: "back", align: "top_left", x, y, width, height,
    fill: "solid", fill_colors: [color], border_width: 0, z_index: zIndex,
  };
}

function rear(shape, round, selected) {
  const capacity = shape.slots.length;
  const state = round.completedAt !== null ? "COMPLETE" : round.filled || round.pending.length ? "FILLING" : "READY";
  return [
    block("header", 0, 0, 148, 13, "#252525FF"),
    block("footer", 0, 63, 148, 17, "#252525FF"),
    text("title", "PIXEL HATCH", 5, 3, "small"),
    text("selected", (selected + 1) + "/" + SHAPES.length, 142, 3, "tiny", WHITE, "top_right"),
    text("shape", shape.name.toUpperCase(), 5, 17, "normal"),
    text("capacity", round.filled + " / " + capacity, 142, 20, "tiny", WHITE, "top_right"),
    text("scene", round.completedAt !== null ? shape.action : shape.scene, 5, 34, "tiny", GRAY),
    text("status", state, 142, 34, "tiny", WHITE, "top_right"),
    block("track", 5, 48, 137, 6, "#373737FF"),
    block("progress", 5, 48, Math.max(1, Math.floor(137 * round.filled / capacity)), 6,
      round.filled ? WHITE : "#373737FF", 2),
    text("drop", "START  DROP    OK  RESET", 5, 65),
    text("wheel", "WHEEL  SHAPE", 5, 73, "tiny", GRAY),
  ];
}

function schedule(delay = 0) {
  if (stopped) return;
  if (timer !== null) {
    if (delay) return;
    clearTimeout(timer);
  }
  timer = setTimeout(draw, delay);
}

async function draw() {
  timer = null;
  if (stopped) return;
  if (drawing) {
    schedule(FRAME_MS);
    return;
  }

  const now = Date.now();
  const selected = selection;
  const shape = SHAPES[selected];
  const round = rounds[selected];
  advanceRound(round, shape.slots.length, now);
  const key = [selected, round.filled, Boolean(round.pending.length), round.completedAt !== null].join("/");
  const bitmap = renderFront(shape, round, now);
  const elements = [];
  if (bitmap !== lastFront) elements.push({
    id: "stage", type: "xpmbitmap", display: "front", x: 0, y: 0, align: "top_left", data: bitmap,
  });
  if (key !== lastRear) elements.push(...rear(shape, round, selected));

  drawing = true;
  try {
    if (elements.length) {
      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_name: manifest.id, priority: 50, elements }),
      });
      if (!response.ok) throw new Error("Display HTTP " + response.status + " " + await response.text());
      lastFront = bitmap;
      lastRear = key;
      lastError = "";
    }
  } catch (error) {
    if (lastError !== String(error)) console.error(error);
    lastError = String(error);
  } finally {
    drawing = false;
    if (lastError) schedule(250);
    else if (needsMotion(shape, round, now)) schedule(FRAME_MS);
  }
}

const unbind = listen("input", (event) => {
  const now = Date.now();
  const round = rounds[selection];
  if (event.key === "encoder" && event.delta) {
    advanceRound(round, SHAPES[selection].slots.length, now);
    selection = ((selection + event.delta) % SHAPES.length + SHAPES.length) % SHAPES.length;
    schedule();
  } else if (event.key === "start" && event.action === "press") {
    if (addDrop(round, SHAPES[selection].slots.length, now)) schedule();
  } else if (event.key === "ok" && event.action === "short") {
    rounds[selection] = newRound();
    schedule();
  } else if (event.key === "back" && event.action === "short") {
    stopped = true;
    if (timer !== null) clearTimeout(timer);
    setTimeout(unbind, 0);
  }
});

schedule();
