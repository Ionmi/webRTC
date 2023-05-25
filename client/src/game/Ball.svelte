<script lang="ts">
  import { writable } from "svelte/store";
  import {
    renderable,
    width,
    height,
    ballPos,
    ballDir,
    ballSpeed,
  } from "./game";

  export let color = "#ffffff";

  export let startX = $width / 2;
  export let startY = $height / 2;
  export let moveSpeed = 0.2;
  export let maxVelocity = 5;

  renderable((props: any, dt: any) => {
    const { context, width, height, ballSize, canvasPosition, paddleMeasures } =
      props;

    // if ($ballPos !== null) {
    // }
    if ($ballPos === null) $ballPos = [width / 2, height / 2];
    if ($ballPos[0] < 0 || $ballPos[0] + ballSize >= width) $ballDir[0] *= -1;
    if ($ballPos[1] < 0 || $ballPos[1] + ballSize >= height) $ballDir[1] *= -1;

    $ballPos[0] = $ballPos[0] + $ballDir[0] * $ballSpeed;
    $ballPos[1] = $ballPos[1] + $ballDir[1] * $ballSpeed;

    context.fillStyle = color;
    context.fillRect($ballPos[0], $ballPos[1], ballSize, ballSize);
    // context.strokeStyle = color;
    // context.strokeRect(paddleMeasures.width * 2, y, paddleMeasures.width, paddleMeasures.height );
    // context.stroke();
  });
</script>
