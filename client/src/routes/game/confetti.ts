import { get } from "svelte/store";
import { confetti as confettiStore, table as tableStore } from "./gemeElements";

import * as confettiLib from "canvas-confetti";
import { landscape } from "./render";
const duration = 1500;

let golden: boolean;

export type ParticleOptions = {
  startVelocity: number;
  ticks: number;
  zIndex: number;
  shapes: string[];
  colors?: string[];
};

const defaults: ParticleOptions = {
  startVelocity: 10,
  ticks: 60,
  zIndex: 0,
  shapes: ["square"],
};

let launch: any;
export const setConfettiLib = () => {
  launch = confettiLib.create(get(confettiStore));
  //coger celebracion de user
  // golden = true;
  // defaults.colors = ["#FFD700", "#c0c0c0F"];
};

const scalar = () => {
  const { width, height } = get(confettiStore);

  if (width < 500 || height < 500) {
    return 0.6;
  }
  if (width < 1000 || height < 1000) {
    return 1;
  }
  return 1.4;
};

const fireworks = () => {
  const animationEnd = Date.now() + duration;
  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);

    launch({
      ...defaults,
      scalar: scalar(),
      particleCount,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() },
    });
    launch({
      ...defaults,
      scalar: scalar(),
      particleCount,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() },
    });
  }, 250);
};

const pride = (homeSide: boolean = true) => {
  const animationEnd = Date.now() + duration;
  const colors = golden ? ["#FFD700", "#c0c0c0F"] : ["#ff0000", "#ffffff"];

  const { angles, origins } = setPride(homeSide, get(landscape));

  (function frame() {
    launch({
      shapes: ["square"],
      startVelocity: scalar() * 20,
      particleCount: 2,
      angle: angles[0],
      spread: 70,
      origin: origins[0],
      colors,
    });
    launch({
      shapes: ["square"],
      startVelocity: scalar() * 20,
      particleCount: 2,
      angle: angles[1],
      spread: 70,
      origin: origins[1],
      colors,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();
};

const setPride = (homeSide: boolean, landscape: boolean) => {
  if (homeSide) {
    return {
      angles: landscape ? [225, 135] : [45, 135],
      origins: landscape
        ? [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
          ]
        : [
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ],
    };
  }
  return {
    angles: landscape ? [315, 45] : [315, 225],
    origins: landscape
      ? [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
        ]
      : [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
  };
};

export const launchConfetti = () => {
  // fireworks();
  pride();
};
