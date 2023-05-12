import { get } from "svelte/store";
import { aspectRatio, scala } from "./gemeElements";
import { render } from "./render";

export interface IPositions {
  ball: { x: number; y: number };
  homePaddle: number;
  awayPaddle: number;
}

const def = {
  ball: { x: aspectRatio.width / 2, y: aspectRatio.height / 2 },
  homePaddle: 0,
  awayPaddle: aspectRatio.height / 2,
};

export const handlePaddleMove = (absoluteY: number) => {
  const y = absoluteY / get(scala);
  //   console.log(y);
  def.homePaddle = y;

  render(def);
  //   renderHomePaddle(y);
};
