// # is an edge, + and * are fillable pixels, and @ is a permanent detail.
function shape(id, name, scene, action, offsetY, colors, art) {
  const rows = art.trim().split("\n").map((row) => row.trim());
  const width = Math.max(...rows.map((row) => row.length));
  const slots = [];
  for (let y = rows.length - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      if (rows[y][x] === "+" || rows[y][x] === "*") slots.push({ x, y });
    }
  }
  // Fill from the bottom up. Within a row, fill from the center outward.
  slots.sort((a, b) => b.y - a.y || Math.abs(a.x - (width - 1) / 2) - Math.abs(b.x - (width - 1) / 2));
  const order = rows.map(() => Array(width).fill(-1));
  slots.forEach(({ x, y }, index) => { order[y][x] = index; });
  return { id, name, scene, action, offsetY, colors, rows, width, slots, order };
}

export const SHAPES = [
  shape("heart", "Heart", "PULSE ROOM", "BEATING", 4,
    ["733151", "36182e", "e74669", "ff899f", "ad2c56", "ffe0dc"], `
      ..###...###..
      .#+*+#.#+*+#.
      #+++++#+*+++#
      #+++++++++++#
      .#+++++++++#.
      ..#+++++++#..
      ...#+++++#...
      ....#+++#....
      .....#+#.....
      ......#......
    `),
  shape("pig", "Piggy Bank", "COIN RUN", "GALLOPING", 5,
    ["723e58", "301c32", "ee7295", "ffc0ca", "b1416a", "ffe6b4"], `
      .....######.#...
      ....#++@@++#+#..
      .#.#+++++++++##.
      ..##+++++++@++##
      ...#*+++++++++@#
      ...#+++++++++##.
      ....#+++++++#...
      ....##.###.##...
    `),
  shape("popcorn", "Popcorn", "SNACK COUNTER", "POPPING", 4,
    ["77505f", "35242e", "ef6a69", "ffd166", "a73f52", "fff0b0"], `
      ...##.##.##...
      ..#**#**#**#..
      .#**********#.
      .############.
      ..#++++++++#..
      ..#++++++++#..
      ...#++++++#...
      ...#++++++#...
      ....#++++#....
      ....######....
    `),
  shape("rocket", "Spaceship", "LAUNCH PAD", "LIFTING OFF", 2,
    ["59679c", "252746", "8cafe9", "e4efff", "515bba", "ffb766"], `
      .....#.....
      ....#*#....
      ...#***#...
      ...#***#...
      ...#@@@#...
      ...#@@@#...
      ...#+++#...
      ..##+++##..
      .#+++++++#.
      .#++###++#.
      .###...###.
    `),
  shape("car", "Car", "FUEL STOP", "DRIVING", 6,
    ["396e71", "163034", "63d3bb", "b6fae4", "368785", "ffefac"], `
      ......#######......
      .....#@@@#@@@#.....
      ...##++++#++++##...
      ..#*+++++++++++*##.
      .#+++++++++++++++#.
      .#################.
      ...#@#.......#@#...
      ....#.........#....
    `),
  shape("ghost", "Ghost", "AFTER DARK", "FLOATING", 3,
    ["655597", "2b2245", "aa8be5", "e1d7ff", "7762b5", "a9ffec"], `
      ....#####....
      ...#+++++#...
      ..#+++++++#..
      .#++@+++@++#.
      .#++@+++@++#.
      .#++++@++++#.
      .#+++++++++#.
      .#+++++++++#.
      .#+##+##+#+#.
      ..#..#..#.#..
    `),
  shape("jelly", "Jellyfish", "DEEP WATER", "SWIMMING", 3,
    ["386c8d", "152d49", "4eadd9", "a3edff", "3476aa", "cbacff"], `
      ....#####....
      ..##+***+##..
      .#+++++++++#.
      #+++++++++++#
      #++@+++++@++#
      .###########.
      ..#.+.+.+.#..
      ...#+.+.+#...
      ..#.+...+.#..
      ...#.....#...
    `),
  shape("flower", "Flower", "GROW LIGHT", "BLOOMING", 3,
    ["59795e", "263837", "71c98c", "faacdf", "428263", "ffe68f"], `
      .....#.....
      ....#*#....
      ...#***#...
      ...#***#...
      ....#*#....
      .....+.....
      ..##.+.##..
      .#++#+#++#.
      ..###.###..
      ...#+++#...
      ...#####...
    `),
];

export function shapeX(shape) {
  return Math.floor((72 - shape.width) / 2);
}
