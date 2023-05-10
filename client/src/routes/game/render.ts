import { get, writable } from "svelte/store";
import {
  background,
  ball,
  canvas,
  context,
  scala,
  type IElementScrcs,
  aspectRatio,
  awayPaddle,
  homePaddle,
  range,
} from "./gemeElements";

// export let rotateCanvas: boolean = true;
export const touchable = writable<boolean>(false);
export const rotate = writable<boolean>(false);

export const firstRender = async (srcs: IElementScrcs) => {
  setDimensions();
  const { width, height } = get(canvas);
  scala.set(width / aspectRatio.width);

  const backgroundSvg = await loadSvg(srcs.background);
  background.set(backgroundSvg);

  const ballSvg = await loadSvg(srcs.ball);
  ball.set({ size: width / 50, radius: width / 100, svg: ballSvg });

  const paddleWidth = width / 100;
  const paddleHeight = height / 8;

  const homePaddleSvg = await loadSvg(srcs.homePaddle);
  homePaddle.set({
    width: paddleWidth,
    height: paddleHeight,
    x: paddleHeight,
    svg: homePaddleSvg,
  });

  const awayPaddleSvg = await loadSvg(srcs.awayPaddle);
  awayPaddle.set({
    width: paddleWidth,
    height: paddleHeight,
    x: width - paddleWidth - paddleHeight,
    svg: awayPaddleSvg,
  });

  renderBackground();
  renderBall(aspectRatio.width / 2, aspectRatio.height / 2);
  renderHomePaddle(aspectRatio.height / 2);
  renderAwayPaddle(aspectRatio.height / 2);
};

const setDimensions = () => {
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
  const canv = get(canvas);

  const width = Math.min(maxWidth, maxHeight * aspectRatio.ratio);

  canv.width = width;
  canv.height = width / aspectRatio.ratio;

  get(range).style.height = `${canv.height}px`;
};

export const handleResize = () => {
  setDimensions();
  renderBackground();
};

const renderBackground = () => {
  const { width, height } = get(canvas);
  get(context).drawImage(get(background), 0, 0, width, height);
};

const renderBall = (x: number, y: number) => {
  const { size, radius, svg } = get(ball);
  const sc = get(scala);
  get(context).drawImage(svg, x * sc - radius, y * sc - radius, size, size);
};

const renderHomePaddle = (y: number) => {
  const { width, height, x, svg } = get(homePaddle);
  const sc = get(scala);
  get(context).drawImage(svg, x, y * sc - height / 2, width, height);
};

const renderAwayPaddle = (y: number) => {
  const { width, height, x, svg } = get(awayPaddle);
  const sc = get(scala);
  get(context).drawImage(svg, x, y * sc - height / 2, width, height);
};

const loadSvg = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const svg = new Image();
    svg.src = src;
    svg.onload = () => resolve(svg);
    svg.onerror = (error) => reject(error);
  });
};
