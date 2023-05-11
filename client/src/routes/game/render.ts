import { get, writable } from "svelte/store";
import {
  background,
  ball,
  table,
  tableCtx,
  scala,
  type IElementScrcs,
  aspectRatio,
  awayPaddle,
  homePaddle,
  controller,
  controllerCtx,
  setSvgs,
  setDimensions,
} from "./gemeElements";

// export let rotateCanvas: boolean = true;
export const touchable = writable<boolean>(false);
export const rotate = writable<boolean>(false);

export const handleResize = () => {
  setDimensions();
  renderBackground();
};

export const firstRender = async (srcs: IElementScrcs) => {
  await setSvgs(srcs);
  setDimensions();

  renderBackground();
  renderController(get(controller).height / 2);
  renderBall(aspectRatio.width / 2, aspectRatio.height / 2);
  renderHomePaddle(aspectRatio.height / 2);
  renderAwayPaddle(aspectRatio.height / 2);
};

const renderController = (height: number) => {
  const canvas = get(controller);
  const context = get(controllerCtx);
  context.beginPath();
  context.arc(canvas.width / 2, height, canvas.width / 2, 0, 2 * Math.PI);
  context.fillStyle = "#37BDF8";
  context.fill();
};

const renderBackground = () => {
  const { width, height } = get(table);
  get(tableCtx).drawImage(get(background), 0, 0, width, height);
};

const renderBall = (x: number, y: number) => {
  const { size, radius, svg } = get(ball);
  const sc = get(scala);
  get(tableCtx).drawImage(svg, x * sc - radius, y * sc - radius, size, size);
};

const renderHomePaddle = (y: number) => {
  const { width, height, x, svg } = get(homePaddle);
  const sc = get(scala);
  get(tableCtx).drawImage(svg, x, y * sc - height / 2, width, height);
};

const renderAwayPaddle = (y: number) => {
  const { width, height, x, svg } = get(awayPaddle);
  const sc = get(scala);
  get(tableCtx).drawImage(svg, x, y * sc - height / 2, width, height);
};
