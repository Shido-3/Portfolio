// Kaboom is a javascript library for quickly creating 2D games
import kaboom from "kaboom";

export const k = kaboom({
  global: false,
  touchToMouse: true,  // Converts touch inputs to mouse inputs
  canvas: document.getElementById("game"),
  debug: false, // set to false once ready for production
});