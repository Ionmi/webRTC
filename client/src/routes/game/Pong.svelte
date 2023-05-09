<script lang="ts">
  import { onMount } from "svelte";
  import { firstRender, handleResize, loadSvg } from "./render";
  import {
    background,
    canvas as canvasStore,
    context,
    type IElementScrcs,
  } from "./gemeElements";
  import { get } from "svelte/store";

  let canvas: HTMLCanvasElement;

  const srcs: IElementScrcs = {
    background: "/red_background.svg",
    ball: "/default_ball.svg",
    homePaddle: "/default_paddle.svg",
    awayPaddle: "/default_paddle.svg",
  };

  onMount(() => {
    canvasStore.set(canvas);
    context.set(canvas.getContext("2d") as CanvasRenderingContext2D);

    firstRender(srcs);
  });
</script>

<canvas class="bg-white" bind:this={canvas} />
<svelte:window on:resize|passive={handleResize} />
