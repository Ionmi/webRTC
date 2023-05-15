import { get, writable } from "svelte/store";
import {
  background,
  ball,
  table,
  tableCtx,
  scala,
  type IElementScrcs,
  awayPaddle,
  homePaddle,
  controller,
  controllerCtx,
  setSvgs,
  setDimensions,
  cornerGap,
  type IPositions,
  positions,
} from "./gemeElements";

export const touchable = writable<boolean>(false);
export const landscape = writable<boolean>(true);

let frame: number;

export const renderResize = () => {
  setDimensions();
  if (!get(touchable)) get(controller).style.display = "none";
  else renderController();
};

export const firstRender = async (srcs: IElementScrcs) => {
  await setSvgs(srcs);
  get(tableCtx).imageSmoothingQuality = "low";
  setDimensions();
  if (!get(touchable)) get(controller).style.display = "none";
  else renderController();
};

export const renderLoop = () => {
  (function loop() {
    frame = requestAnimationFrame(loop);
    render(get(positions));
  })();
  return () => {
    cancelAnimationFrame(frame);
  };
};

export const render = async ({ ball, homePaddle, awayPaddle }: IPositions) => {
  renderBackground();
  renderBall(ball.x, ball.y);
  renderHomePaddle(homePaddle);
  renderAwayPaddle(awayPaddle);
};

export const renderController = (pos: number = get(controller).height / 2) => {
  const { width, height } = get(controller);
  const context = get(controllerCtx);
  context.clearRect(0, 0, width, height);

  const gap = get(cornerGap);
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

  context.beginPath();
  context.arc(width / 2, pos, width / 2, 0, 2 * Math.PI);
  context.fillStyle = "#37BDF8";
  context.fill();
};

const renderBackground = () => {
  const { width, height } = get(table);
  get(tableCtx).drawImage(
    get(background),
    0,
    0,
    Math.floor(width),
    Math.floor(height)
  );
};

const renderBall = (x: number, y: number) => {
  const { size, radius, svg } = get(ball);
  const sc = get(scala);
  get(tableCtx).drawImage(
    svg,
    Math.floor(x * sc - radius),
    Math.floor(y * sc - radius),
    Math.floor(size),
    Math.floor(size)
  );
};

const renderHomePaddle = (y: number) => {
  const { width, height, x, svg } = get(homePaddle);
  const sc = get(scala);
  get(tableCtx).drawImage(
    svg,
    Math.floor(x),
    Math.floor(y * sc - height / 2),
    Math.floor(width),
    Math.floor(height)
  );
};

const renderAwayPaddle = (y: number) => {
  const { width, height, x, svg } = get(awayPaddle);
  const sc = get(scala);
  get(tableCtx).drawImage(
    svg,
    Math.floor(x),
    Math.floor(y * sc - height / 2),
    Math.floor(width),
    Math.floor(height)
  );
};
