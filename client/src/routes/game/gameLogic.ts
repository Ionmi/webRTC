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
  normalizedDimensions,
  defPositions,
} from "./gemeElements";

import { render } from "./render";
import { launchConfetti } from "./confetti";
import { awayGoal } from "./scorer";

const baseSpeed = 0.065;
let ballSpeed = baseSpeed;

let moveBall = false;
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
  moveBall = true;
  gameLoop();
};

const paddleCollision = () => {
  const { ballRadius, paddleWidth, paddleHalfHeight, paddleX } =
    get(normalizedDimensions);
  const y = get(elementPositions).homePaddle;

  if (
    ballPos[0] + ballRadius < paddleX ||
    ballPos[0] + ballRadius > paddleX + paddleWidth ||
    ballPos[1] - ballRadius >= y + paddleHalfHeight ||
    ballPos[1] + ballRadius <= y - paddleHalfHeight
  )
    return false;

  let intersectY = ballPos[1];
  if (intersectY > y + paddleHalfHeight) intersectY = y + paddleHalfHeight;
  else if (intersectY < y - paddleHalfHeight) intersectY = y - paddleHalfHeight;

  let relativeIntersectY = y - intersectY;
  relativeIntersectY = parseFloat(relativeIntersectY.toFixed(10));
  const normalizedRelativeIntersectionY = relativeIntersectY / paddleHalfHeight;
  const bounceAngle = normalizedRelativeIntersectionY * 60 * (Math.PI / 180);

  ballSpeed = (Math.abs(normalizedRelativeIntersectionY) + 1) * baseSpeed;

  ballDir = [Math.cos(bounceAngle) * -1, Math.sin(bounceAngle)];
  ballPos[0] = paddleX - ballRadius;
  ballPos[0] += ballDir[0] * ballSpeed;
  ballPos[1] += ballDir[1] * ballSpeed;
  return true;
};

const goal = () => {
  const { ballRadius, paddleWidth, paddleX } = get(normalizedDimensions);

  // if (ballPos[0] - ballRadius < paddleX + paddleWidth) return false;
  if (ballPos[0] + ballRadius < aspectRatio.width) return false;

  const { x, y } = defPositions.ball;
  ballSpeed = baseSpeed;
  ballDir = [1, getBallDirY()];
  ballPos = [x, y];

  moveBall = false;

  launchConfetti();
  awayGoal();

  setTimeout(() => {
    moveBall = true;
  }, 1500);
  return true;
};

const calcualteBallPos = () => {
  const { width, height } = aspectRatio;
  const { ballRadius } = get(normalizedDimensions);

  if (paddleCollision()) return;
  if (goal()) return;

  if (ballPos[0] < ballRadius) ballDir[0] *= -1;
  if (ballPos[1] < ballRadius || ballPos[1] + ballRadius >= height)
    ballDir[1] *= -1;

  ballPos[0] += ballDir[0] * ballSpeed;
  ballPos[1] += ballDir[1] * ballSpeed;
};

const gameLoop = () => {
  const positions = get(elementPositions);

  setTimeout(() => {
    if (moveBall) {
      calcualteBallPos();
      updateBallPos(...ballPos);
    }

    //send to peer paddle position
    // if (host) send ball position
    render(positions);
    gameLoop();
  }, 16);
  // }, 16);
};
