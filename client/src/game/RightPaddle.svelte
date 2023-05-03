<script lang="ts">
  import { renderable, canvasPosition, paddleMeasures, height } from "./game";
  import { spring, type Spring } from "svelte/motion";

  let color = "#ffffff";

  let y: number | null = null;
  renderable((props: any, dt: any) => {
    const { context, width, height, paddleMeasures, ballSize } = props;

    if (y === null) y = height / 2 - paddleMeasures.height / 2;
    else if (y < ballSize * 1.5) y = ballSize * 1.5;
    else if (y > height - paddleMeasures.height - ballSize * 1.5)
      y = height - paddleMeasures.height - ballSize * 1.5;

    context.lineCap = "butt";

    context.fillStyle = color;
    context.strokeStyle = color;
    context.fillRect(
      width - paddleMeasures.height,
      y,
      paddleMeasures.width,
      paddleMeasures.height
    );
    // context.strokeRect(paddleMeasures.width * 2, y, paddleMeasures.width, paddleMeasures.height);
    context.stroke();
  });

  const handleMouseMove = ({ clientY }: any) => {
    if (
      clientY - $canvasPosition.y < 0 ||
      clientY - $canvasPosition.y > $height
    )
      return;
    y = clientY - $canvasPosition.y - $paddleMeasures.height / 2;
  };
</script>

<svelte:window
  on:mousemove={handleMouseMove}
  on:dragstart={(ev) => console.log(ev)}
/>
