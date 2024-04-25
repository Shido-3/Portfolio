import { k } from "./kaboomCtx";

k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    anims: {
      "idle-down": 936,
      "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
      "idle-side": 975,
      "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
      "idle-up": 1014,
      "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
    },
  });

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#FFDAB9"));

k.scene("main", async () => { // Objects
    const mapData = await (await fetch("./map.json")).json();
    const layers = mapData.layers;
  
    const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]); // Scales the pixel up, pixel art is really smol
  
    const player = k.make([
      k.sprite("spritesheet", { anim: "idle-down" }),
      k.area({
        shape: new k.Rect(k.vec2(0, 3), 10, 10),
      }),
      k.body(),
      k.anchor("center"), // By default the x,y coordinates are set to the top left of the Sprite, this makes it so that the x,y coordinates are in the center of the sprite
      k.pos(),
      k.scale(scaleFactor),
      {
        speed: 250,
        direction: "down",
        isInDialogue: false, // Player isn't allowed to perform any actions until dialogue box is closed
      },
      "player",
    ]);
});

k.go("main");