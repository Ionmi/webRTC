<script lang="ts">
  import { renderable, canvasPosition, paddleMeasures, height } from "./game";
  import { spring, type Spring } from "svelte/motion";

  let color = "#ffe554";

  let coords: Spring<{ y: any }> = spring(
    { y: null },
    {
      stiffness: 0.5,
      damping: 1,
    }
  );

  renderable((props: any, dt: any) => {
    const { context, width, height, paddleMeasures, ballDiameter } = props;

    if ($coords.y === null) $coords.y = height / 2 - paddleMeasures.height / 2;
    else if ($coords.y < ballDiameter) $coords.y = ballDiameter * 1.2;
    else if ($coords.y > height - paddleMeasures.height - ballDiameter)
      $coords.y = height - paddleMeasures.height - ballDiameter * 1.2;

    context.lineCap = "butt";

    context.fillStyle = color;
    context.strokeStyle = color;
    context.fillRect(
      paddleMeasures.height,
      $coords.y,
      paddleMeasures.width,
      paddleMeasures.height
    );
    // context.strokeRect(paddleMeasures.width * 2, y, paddleMeasures.width, paddleMeasures.height );
    context.stroke();
  });

  const handleMouseMove = ({ clientY }: any) => {
    if (
      clientY - $canvasPosition.y < 0 ||
      clientY - $canvasPosition.y > $height
    )
      return;
    coords.set({ y: clientY - $canvasPosition.y - $paddleMeasures.height / 2 });
  };
</script>

<svelte:window on:mousemove={handleMouseMove} />
