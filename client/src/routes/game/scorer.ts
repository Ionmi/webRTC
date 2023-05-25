import { get, writable } from "svelte/store";
import { landscape } from "./render";

export const scorer = writable<HTMLCanvasElement>();
export const scorerCtx = writable<CanvasRenderingContext2D>();
let score = [0, 0];

export const renderScore = async (scorer: HTMLCanvasElement) => {
  const context = get(scorerCtx);
  context.clearRect(0, 0, scorer.width, scorer.height);
  const { height, width } = scorer;
  const [home, away] = score;

  await document.fonts.load("10px public-pixel");
  context.fillStyle = "white";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const y = height / 10;
  const x = width / 2;
  context.font = y + "px public-pixel";

  if (get(landscape)) {
    context.translate(x, y);

    context.fillText(away.toString(), -y, 0);
    context.fillText(home.toString(), y, 0);

    context.translate(-x, -y);
    return;
  }
  const rotationAngle = (270 * Math.PI) / 180;
  context.translate(x, height - y);
  context.rotate(rotationAngle);

  context.fillText(away.toString(), 0, -y);
  context.fillText(home.toString(), 0, y);

  context.rotate(-rotationAngle);
  context.translate(-x, -(height - y));
};

export const homeGoal = () => {
  score[0]++;
  renderScore(get(scorer));
};
export const awayGoal = () => {
  score[1]++;
  renderScore(get(scorer));
};

export const resetScorer = () => {
  score = [0, 0];
  renderScore(get(scorer));
};
