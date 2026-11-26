# Pixel Hatch

**English** · [Русский](README.ru.md)

A pocket-sized pixel workshop for BUSY Bar. Press **Start** and one pixel falls into the silhouette. When the last pixel lands, the shape comes to life.

![A filled heart pulses on the BUSY Bar front display](screenshots/cover.png)

Built for the [BUSY JS Apps Contest](https://busy.app/pages/js-apps-contest).

## How it works

The **72 × 16 front display** shows a silhouette. Each tap drops one pixel from the top edge. Pixels settle from the bottom up, and fast taps queue up so several pixels can fall at once. Hold **Start** to drop a single pixel.

The **160 × 80 rear display** shows the selected shape, landed pixels, and the number needed to finish. Each shape remembers its progress while the app is open.

| Control | Action |
| --- | --- |
| **Start / Pause** | Drop one pixel. |
| **Turn the wheel** | Choose a shape. |
| **OK** | Empty the selected shape and start over. |
| **Back** | Exit the app. |

## Shape gallery

All frames were captured in the official BUSY Bar Emulator.

| Shape | Empty | After filling |
| --- | :---: | :---: |
| **Heart**<br>Beats in time with the pulse traces. | ![Empty heart](screenshots/scenes/heart-empty.png) | ![Beating heart](screenshots/scenes/heart-alive.png) |
| **Piggy Bank**<br>Gallops from side to side. | ![Empty piggy bank](screenshots/scenes/pig-empty.png) | ![Piggy bank galloping](screenshots/scenes/pig-alive.png) |
| **Popcorn**<br>Kernels burst out of the bucket and scatter across the display. | ![Empty popcorn bucket](screenshots/scenes/popcorn-empty.png) | ![Popcorn scattering](screenshots/scenes/popcorn-alive.png) |
| **Spaceship**<br>Lifts off in a plume and leaves a crater. | ![Empty spaceship at the launch pad](screenshots/scenes/rocket-empty.png) | ![Spaceship lifting off](screenshots/scenes/rocket-alive.png) |
| **Car**<br>Fills up at the pump, then drives across the display. | ![Car waiting for fuel](screenshots/scenes/car-empty.png) | ![Car on the road](screenshots/scenes/car-alive.png) |
| **Ghost**<br>Glides across the screen with glowing eyes. | ![Empty ghost](screenshots/scenes/ghost-empty.png) | ![Glowing drifting ghost](screenshots/scenes/ghost-alive.png) |
| **Jellyfish**<br>Swims with waving tentacles and a trail of bubbles. | ![Empty jellyfish](screenshots/scenes/jelly-empty.png) | ![Jellyfish swimming](screenshots/scenes/jelly-alive.png) |
| **Flower**<br>Opens a ring of bright petals. | ![Empty flower bud](screenshots/scenes/flower-empty.png) | ![Flower in bloom](screenshots/scenes/flower-alive.png) |

| One pixel falling | A halfway-filled heart | Rear dashboard | Crater after launch |
| :---: | :---: | :---: | :---: |
| ![A pixel above the heart](screenshots/falling-pixel.png) | ![Heart filling from the bottom](screenshots/heart-filling.png) | ![Rear progress and controls](screenshots/dashboard.png) | ![Crater left on the launch pad](screenshots/crater.png) |

## Build and run

Use Node.js **22.12 or later** and start the [official BUSY Bar Emulator](https://github.com/busy-app/busybar-emulator).

```sh
npm ci
npm test
npm run build
npm run app:install -- --addr 127.0.0.1:8640
npm run app:run -- --addr 127.0.0.1:8640
```

The build produces `dist/io.github.realzel.pixelhatch.tgz`. You can also upload this package through your BUSY Bar's web interface. Both displays and controls are available on the [emulator page](http://127.0.0.1:8640/emulator).

Pixel Hatch runs offline on BUSY Bar. Progress is kept in memory for the current session.
