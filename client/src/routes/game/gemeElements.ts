import { get, writable } from "svelte/store";
import { landscape } from "./render";
import { setConfetti } from "./confetti";
import {  scorer } from "./scorer";

export const aspectRatio = { width: 7, height: 5, ratio: 1.4 };

export interface IElementScrcs {
  background: string;
  ball: string;
  homePaddle: string;
  awayPaddle: string;
}

export interface IBall {
  size: number;
  radius: number;
  svg: HTMLImageElement;
}

export interface IPadle {
  width: number;
  height: number;
  x: number;
  svg: HTMLImageElement;
}

export interface IPositions {
  ball: { x: number; y: number };
  homePaddle: number;
  awayPaddle: number;
}

export interface INormDimensions {
  ballRadius: number;
  paddleWidth: number;
  paddleHalfHeight: number;
  paddleX: number;
  cornerGap: number;
}

export const defPositions = {
  ball: { x: aspectRatio.width / 2, y: aspectRatio.height / 2 },
  homePaddle: aspectRatio.height / 2,
  awayPaddle: aspectRatio.height / 2,
} as IPositions;
export const positions = writable<IPositions>(defPositions);

export const table = writable<HTMLCanvasElement>();
export const tableCtx = writable<CanvasRenderingContext2D>();
export const controller = writable<HTMLCanvasElement>();
export const controllerCtx = writable<CanvasRenderingContext2D>();
export const scala = writable<number>();
export const normalizedDimensions = writable<INormDimensions>();
export const cornerGap = writable<number>();
export const background = writable<HTMLImageElement>();
export const ball = writable<IBall>();
export const homePaddle = writable<IPadle>();
export const awayPaddle = writable<IPadle>();

export const setDimensions = () => {
  setTable(get(table), get(scorer));
  setConfetti();
  setBall(get(table).width);
  setPaddles(get(table).width, get(table).height);
  setNormalizedDimensions();
  setController(get(controller));
};

const setController = (controller: HTMLCanvasElement) => {
  const { height } = get(table);
  const width = get(homePaddle).height * 0.75;

  controller.height = height;
  controller.width = width;
};

const setTable = (table: HTMLCanvasElement, scorer: HTMLCanvasElement) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let maxWidth: number;
  let maxHeight: number;

  if (windowWidth < windowHeight) {
    landscape.set(false);
    maxWidth = window.innerWidth * 0.95;
    maxHeight = window.innerHeight * 0.95;
  } else {
    landscape.set(true);
    maxWidth = window.innerWidth * 0.8;
    maxHeight = window.innerHeight * 0.8;
  }

  const width = Math.min(maxWidth, maxHeight * aspectRatio.ratio);
  const height = width / aspectRatio.ratio;

  table.width = scorer.width = width;
  table.height = scorer.height = height;
  table.style.width = scorer.style.width = `${Math.floor(width)}px`;
  table.style.height = scorer.style.height = `${Math.floor(height)}px`;

  scala.set(width / aspectRatio.width);
  cornerGap.set(height / 16 + (width / 100) * 2);
};

const setNormalizedDimensions = () => {
  const sc = get(scala);
  normalizedDimensions.set({
    ballRadius: get(ball).radius / sc,
    paddleWidth: get(homePaddle).width / sc,
    paddleHalfHeight: get(homePaddle).height / 2 / sc,
    paddleX: get(homePaddle).x / sc,
  } as INormDimensions);
};

const setBall = (width: number) => {
  ball.update((ball) => {
    return { ...ball, size: width / 50, radius: width / 100 };
  });
};

export const getBallDirY = () => {
  const random = Math.floor(Math.random() * 12);
  const y =
    random === 0
      ? -0.63
      : Math.round((0.103 * random - 0.63 + Number.EPSILON) * 100) / 100;
  return y;
};

export const updateBallPos = (x: number, y: number) => {
  positions.update((prev) => ({ ...prev, ball: { x, y } }));
};

export const updatePaddlePos = (y: number, isHome: boolean = true) => {
  positions.update((prev) =>
    isHome ? { ...prev, homePaddle: y } : { ...prev, homePaddle: y }
  );
};

const setPaddles = (width: number, height: number) => {
  const paddleWidth = width / 100;
  const paddleHeight = height / 8;

  homePaddle.update((paddle) => {
    return {
      ...paddle,
      width: paddleWidth,
      height: paddleHeight,
      x: width - paddleWidth - paddleHeight,
    };
  });

  awayPaddle.update((paddle) => {
    return {
      ...paddle,
      width: paddleWidth,
      height: paddleHeight,
      x: paddleHeight,
    };
  });
};

export const setSvgs = async (srcs: IElementScrcs) => {
  const backgroundSvg = await loadSvg(srcs.background);
  background.set(backgroundSvg);

  const ballSvg = await loadSvg(srcs.ball);
  ball.set({ svg: ballSvg, size: 0, radius: 0 });

  const homePaddleSvg = await loadSvg(srcs.homePaddle);
  homePaddle.set({ svg: homePaddleSvg, width: 0, height: 0, x: 0 });

  const awayPaddleSvg = await loadSvg(srcs.awayPaddle);
  awayPaddle.set({ svg: awayPaddleSvg, width: 0, height: 0, x: 0 });
};

const loadSvg = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const svg = new Image();
    svg.src = src;
    svg.onload = () => resolve(svg);
    svg.onerror = (error) => reject(error);
  });
};
