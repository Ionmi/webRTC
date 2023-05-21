import { get } from "svelte/store";
import { confetti as confettiStore, table as tableStore } from "./gemeElements";

import * as confettiLib from "canvas-confetti";

import { landscape } from "./render";

let launch: any;
export const setConfettiLib = () => {
  const confetti = get(confettiStore);
  launch = confettiLib.create(confetti);

//   if (!get(landscape)) {
//     const table = get(tableStore);
//     const { width, height } = table;
//     confetti.width = height;
//     confetti.height = width;
//     confetti.style.width = `${Math.floor(height)}px`;
//     confetti.style.height = `${Math.floor(width)}px`;

//     // confetti.style.transformOrigin = "top left";
//     // confetti.style.transform = " rotate(-90deg)";
//     confetti.style.bottom = width * -1 + "px";
//   }
};

const duration = 1500;
const defaults = {
  startVelocity: 10,
  spread: 360,
  ticks: 60,
  zIndex: 0,
  shapes: ["square"],
};
const randomInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const fireworks = () => {
  const animationEnd = Date.now() + duration;
  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    launch(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.9) },
      })
    );
    launch(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.9) },
      })
    );
  }, 250);
};

export const launchConfetti = () => {
  fireworks();
};
