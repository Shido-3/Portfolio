import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

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

k.setBackground(k.Color.fromHex("#311047"));

const canvas = document.querySelector('canvas');

// Auto-refocus canvas when window regains focus
window.addEventListener('focus', () => {
    setTimeout(() => {
        if (canvas) {
            canvas.focus();
        }
    }, 100);
});

k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }

      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    const cam = k.camPos();
    const target = player.worldPos();
    // Lerp (linear interpolation) for smooth movement
    k.camPos(
      cam.x + (target.x - cam.x) * 0.1,
      cam.y + (target.y - cam.y) * 0.1
    );
  });


  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  function stopAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }

  k.onMouseRelease(stopAnims);

  k.onKeyRelease(() => {
    stopAnims();
  });

  k.onKeyDown((key) => {
    if (player.isInDialogue) return;
    
    const keyMap = {
      right: k.isKeyDown("right"),
      left: k.isKeyDown("left"),
      up: k.isKeyDown("up"),
      down: k.isKeyDown("down"),
    };

    // Calculate movement vector
    let moveX = 0;
    let moveY = 0;
    
    if (keyMap.right) moveX += 1;
    if (keyMap.left) moveX -= 1;
    if (keyMap.up) moveY -= 1;
    if (keyMap.down) moveY += 1;
    
    // No movement if no keys are pressed
    if (moveX === 0 && moveY === 0) return;
    
    // Normalize diagonal movement to maintain consistent speed
    const isDiagonal = moveX !== 0 && moveY !== 0;
    const normalizedSpeed = isDiagonal ? player.speed * 0.407 : player.speed;
    
    // Apply movement
    player.move(moveX * normalizedSpeed, moveY * normalizedSpeed);
    
    // Handle animations and direction based on priority
    // Horizontal movement takes precedence for sprite direction
    if (moveX !== 0) {
      player.flipX = moveX < 0; // true for left, false for right
      player.direction = moveX > 0 ? "right" : "left";
      if (player.curAnim() !== "walk-side") player.play("walk-side");
    } 
    // Vertical movement only if no horizontal movement
    else if (moveY !== 0) {
      player.direction = moveY < 0 ? "up" : "down";
      const animName = moveY < 0 ? "walk-up" : "walk-down";
      if (player.curAnim() !== animName) player.play(animName);
    }
  });
});

k.go("main");


// --- Audio controls ---
const audio = document.getElementById("audio");
const audioButton = document.getElementById("audioButton");
const audioIcon = audioButton.querySelector('img');


function toggleAudio() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause()
  }
  // audio.muted = !audio.muted;
  audioIcon.src = audio.paused ? "./mute.png" : "./unmute.png";
  audioButton.style.transform = "scale(1.2)";
  setTimeout(() => {
    audioButton.style.transform = "";
  }, 200);

  // Refocus the game canvas
  const canvas = document.getElementById('game');
  if (canvas) {
    canvas.focus();
  }

}

audioButton.addEventListener("click", toggleAudio);
document.addEventListener("keydown", (e) => { if (e.key === "m") toggleAudio(); });