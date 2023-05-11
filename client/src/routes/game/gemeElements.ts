import { get, writable } from "svelte/store";
import { rotate } from "./render";

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

export const table = writable<HTMLCanvasElement>();
export const tableCtx = writable<CanvasRenderingContext2D>();
export const controller = writable<HTMLCanvasElement>();
export const controllerCtx = writable<CanvasRenderingContext2D>();
export const scala = writable<number>();
export const background = writable<HTMLImageElement>();
export const ball = writable<IBall>();
export const homePaddle = writable<IPadle>();
export const awayPaddle = writable<IPadle>();

export const setDimensions = () => {
  setTable(get(table));
  setBall(get(table).width);
  setPaddles(get(table).width, get(table).height);
  setController(get(controller), get(controllerCtx));
};

const setController = (
  controller: HTMLCanvasElement,
  context: CanvasRenderingContext2D
) => {
  const { height } = get(table);
  const width = get(homePaddle).height * 0.75;

  controller.height = height;
  controller.width = width;

  const gap = height / 16 + get(ball).radius + 3;
  const radius = width / 4;

  context.beginPath();
  context.moveTo(radius, gap);
  context.lineTo(width - radius, gap);
  context.lineTo(width - radius, height - gap);
  context.lineTo(radius, height - gap);
  context.closePath();
  context.arc(width / 2, gap, radius, 0, 2 * Math.PI);
  context.arc(width / 2, height - gap, radius, 0, 2 * Math.PI);
  context.fillStyle = "#002A3C";
  context.fill();
};

const setTable = (table: HTMLCanvasElement) => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let maxWidth: number;
  let maxHeight: number;

  if (windowWidth < windowHeight) {
    rotate.set(true);
    maxWidth = window.innerWidth * 0.95;
    maxHeight = window.innerHeight * 0.95;
  } else {
    rotate.set(false);
    maxWidth = window.innerWidth * 0.8;
    maxHeight = window.innerHeight * 0.8;
  }

  const width = Math.min(maxWidth, maxHeight * aspectRatio.ratio);

  table.width = width;
  table.height = width / aspectRatio.ratio;
  scala.set(width / aspectRatio.width);
};

const setBall = (width: number) => {
  ball.update((ball) => {
    return { ...ball, size: width / 50, radius: width / 100 };
  });
};

const setPaddles = (width: number, height: number) => {
  const paddleWidth = width / 100;
  const paddleHeight = height / 8;

  homePaddle.update((paddle) => {
    return {
      ...paddle,
      width: paddleWidth,
      height: paddleHeight,
      x: paddleHeight,
    };
  });

  awayPaddle.update((paddle) => {
    return {
      ...paddle,
      width: paddleWidth,
      height: paddleHeight,
      x: width - paddleWidth - paddleHeight,
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
