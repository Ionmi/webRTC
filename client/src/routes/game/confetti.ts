import { get, writable } from "svelte/store";
import { table } from "./gemeElements";

import * as confettiLib from "canvas-confetti";
import { landscape } from "./render";

export const confetti = writable<HTMLCanvasElement>();

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

let launch: Function;
export const setConfettiLib = () => {
  launch = confettiLib.create(get(confetti));
  //coger celebracion de user
  // golden = true;
  defaults.colors = ["#FFD700", "#c0c0c0F"];
};

const scalar = () => {
  const { width, height } = get(confetti);

  if (width < 500 || height < 500) {
    return 0.6;
  }
  if (width < 1000 || height < 1000) {
    return 1;
  }
  return 1.4;
};

const fireworks = () => {
  const animationEnd = Date.now() + 1500;
  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / 1500);

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
  const animationEnd = Date.now() + 1000;
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
  fireworks();
  // pride();
};

let prevLandscape = true;

export const setConfetti = () => {
  const currentConfetti = get(confetti);
  const { width, height } = get(table);
  if (get(landscape) === false) {
    currentConfetti.width = height;
    currentConfetti.height = width;
    currentConfetti.style.width = `${Math.floor(height)}px`;
    currentConfetti.style.height = `${Math.floor(width)}px`;

    currentConfetti.style.transformOrigin = "top left";
    currentConfetti.style.transform = " rotate(-90deg)";
    currentConfetti.style.bottom = width * -1 + "px";
    prevLandscape = false;
    setConfettiLib();
    return;
  }
  if (prevLandscape) {
    currentConfetti.width = width;
    currentConfetti.height = height;
    currentConfetti.style.width = `${Math.floor(width)}px`;
    currentConfetti.style.height = `${Math.floor(height)}px`;
    setConfettiLib();
    return;
  }
  const newConfetti = document.createElement("canvas");
  newConfetti.width = width;
  newConfetti.height = height;
  newConfetti.style.width = `${Math.floor(width)}px`;
  newConfetti.style.height = `${Math.floor(height)}px`;
  newConfetti.classList.add("absolute", "z-10");
  confetti.set(newConfetti);

  const parent = currentConfetti.parentElement;
  parent?.removeChild(currentConfetti);

  get(table).insertAdjacentElement("beforebegin", newConfetti);

  prevLandscape = true;
  setConfettiLib();
};
