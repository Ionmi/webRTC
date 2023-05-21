import { get } from "svelte/store";
import { confetti as confettiStore, table as tableStore } from "./gemeElements";

import * as confettiLib from "canvas-confetti";
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
  golden = true;
  defaults.colors = ["#FFD700"];
  //   defaults.colors = ["#FFD700"];
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

const pride = () => {
  const animationEnd = Date.now() + duration;
  const colors = golden ? ["#FFD700"] : ["#ff0000", "#ffffff"];
  (function frame() {
    launch({
      ...defaults,
      startVelocity: 20,
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 1 },
      colors,
    });
    launch({
      ...defaults,
      startVelocity: 20,
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 1 },
      colors,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();
};

export const launchConfetti = () => {
  fireworks();
  //   pride();
};
