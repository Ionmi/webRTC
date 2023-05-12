<script lang="ts">
  import { onMount } from "svelte";
  import {
    firstRender,
    handleResize,
    landscape,
    renderController,
    touchable,
  } from "./render";
  import {
    table as tableStore,
    controller as controllerStore,
    tableCtx,
    type IElementScrcs,
    controllerCtx,
    cornerGap,
    table,
  } from "./gemeElements";
  import { get } from "svelte/store";
  import { handlePaddleMove } from "./connector";

  let canvas: HTMLCanvasElement;
  let controller: HTMLCanvasElement;

  const srcs: IElementScrcs = {
    background: "/red_background.svg",
    ball: "/default_ball.svg",
    homePaddle: "/default_paddle.svg",
    awayPaddle: "/default_paddle.svg",
  };

  onMount(() => {
    tableStore.set(canvas);
    controllerStore.set(controller);
    tableCtx.set(canvas.getContext("2d") as CanvasRenderingContext2D);
    controllerCtx.set(controller.getContext("2d") as CanvasRenderingContext2D);

    // touchable.set(true);
    firstRender(srcs);
  });

  const handleTouchMove = (event: TouchEvent) => {
    const { left, right, top, bottom } =
      get(controllerStore).getBoundingClientRect();
    const { clientX, clientY } = event.touches[0];
    const { width } = window.screen;
    const gap = get(cornerGap);

    if (get(landscape)) {
      if (clientY < top + gap || clientY > bottom - gap) return;
      renderController(clientY - top);
      handlePaddleMove(clientY - top);
      return;
    }
    if (clientX < left + gap || clientX > right - gap) return;
    const x = clientX * -1 + width;
    renderController(x - left);
    handlePaddleMove(x - left);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const {
      left,
      right,
      top,
      bottom,
      width: w,
    } = get(table).getBoundingClientRect();
    const { clientX, clientY } = event;
    const width = w + left * 2;
    const gap = get(cornerGap);

    if (get(landscape)) {
      if (clientY < top + gap || clientY > bottom - gap) return;
      handlePaddleMove(clientY - top);
      return;
    }
    if (clientX < left + gap || clientX > right - gap) return;
    const x = clientX * -1 + width;
    handlePaddleMove(x - left);
  };
</script>

<div class:rotate={!$landscape} class="flex items-center gap-8">
  <canvas bind:this={canvas} on:mousemove={handleMouseMove} />
  <canvas
    bind:this={controller}
    on:touchmove|preventDefault={handleTouchMove}
    class=" bg-transparent"
  />
</div>
<svelte:window on:resize|passive={handleResize} />

<style>
  .rotate {
    transform: rotate(90deg);
  }
</style>
