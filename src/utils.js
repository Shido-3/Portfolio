// functions stored here

export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");

  dialogueUI.style.display = "block"; // "textbox-container" has a property called style, which is currently set to "none" which 
  // hides a bunch of underlying HTML, by setting it to "block" it reveals the underlying HTML

  // Makes it so that the text is rendered like a video game - character by character
  let index = 0;
  let currentText = "";
  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText; // "innerHTML" is bad practice - victim to XSS attacks, but it's okay in our case because we aren't accepting any
      // user input or sensitive information. This attribute is needed because we need our links to be rendered as links.
      index++;
      return;
    }
  
    clearInterval(intervalRef);
  }, 1);

  const closeBtn = document.getElementById("close");

  function onCloseBtnClick() {
    onDisplayEnd(); // Allows the player to perform actions again
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseBtnClick);

    k.focus(); // Refocus on the canvas to regain keyboard control
  }

  closeBtn.addEventListener("click", onCloseBtnClick);

  addEventListener("keydown", (key) => {
    if (key.code === "Escape") {
      closeBtn.click();
      k.focus(); // Refocus on the canvas to regain keyboard control
    }
  });
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
  } else {
    k.camScale(k.vec2(1.5));
  }
}