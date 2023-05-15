import { get } from "svelte/store";
import {
  aspectRatio,
  getBallDirY,
  positions as elementPositions,
  scala,
  updateBallPos,
  updatePaddlePos,
  ball,
  homePaddle,
} from "./gemeElements";

import { render } from "./render";

let ballSpeed = 0.05;
let ballDir: [number, number];
let ballPos: [number, number];
let hosting: boolean = true;

export const handlePaddleMove = (absoluteY: number) => {
  const y = absoluteY / get(scala);
  // if (!hosting) {
  //send to peer
  // }
  updatePaddlePos(y);
};

export const startGame = (x: -1 | 1) => {
  // if (hosting) {
  //   //send to peer
  // }
  const { x: xPos, y: yPos } = get(elementPositions).ball;
  ballPos = [xPos, yPos];
  ballDir = [x, getBallDirY()];
  console.log("fdkbnrtbrtnrynmtrmuuymr");

  gameLoop();
};

const calcualteBallPos = () => {
  const { width, height } = aspectRatio;
  const { radius } = get(ball);
  const scaledRad = radius / get(scala);
  const y = get(elementPositions).homePaddle;
  const x = get(homePaddle).x / get(scala);
  const paddleWidth = get(homePaddle).width / get(scala);
  const paddleHeight = get(homePaddle).height / 2 / get(scala);

  if (
    ballPos[0] + scaledRad >= x &&
    ballPos[0] + scaledRad < x + paddleWidth &&
    ballPos[1] <= y + paddleHeight &&
    ballPos[1] >= y - paddleHeight
  ) {
    ballDir[0] *= -1;
    ballPos[0] = x - scaledRad;
  }
  if (ballPos[0] < scaledRad || ballPos[0] + scaledRad >= width)
    ballDir[0] *= -1;
  if (ballPos[1] < scaledRad || ballPos[1] + scaledRad >= height)
    ballDir[1] *= -1;

  ballPos[0] += ballDir[0] * ballSpeed;
  ballPos[1] += ballDir[1] * ballSpeed;
};

const gameLoop = () => {
  const positions = get(elementPositions);

  setTimeout(() => {
    calcualteBallPos();
    // console.log(ballPos);

    updateBallPos(ballPos[0], ballPos[1]);
    //send to peer paddle position
    // if (host) send ball position
    render(positions);
    gameLoop();
  }, 10);
  // }, 16);
};
