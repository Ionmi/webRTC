<script lang="ts">
  import { onMount } from "svelte";
  import {
    firstRender,
    renderResize,
    landscape,
    renderController,
    touchable,
    renderLoop,
  } from "./render";
  import {
    table as tableStore,
    controller as controllerStore,
    confetti as confettiStore,
    scorer as scorerStore,
    tableCtx,
    type IElementScrcs,
    controllerCtx,
    cornerGap,
    table,
  } from "./gemeElements";
  import { get } from "svelte/store";
  import { handlePaddleMove, startGame } from "./gameLogic";

  let canvas: HTMLCanvasElement;
  let confetti: HTMLCanvasElement;
  let scorer: HTMLCanvasElement;
  let controller: HTMLCanvasElement;

  const srcs: IElementScrcs = {
    background: "/red_background.svg",
    ball: "/default_ball.svg",
    homePaddle: "/default_paddle.svg",
    awayPaddle: "/default_paddle.svg",
  };

  onMount(async () => {
    tableStore.set(canvas);
    confettiStore.set(confetti);
    scorerStore.set(scorer);
    controllerStore.set(controller);
    tableCtx.set(
      canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D
    );
    controllerCtx.set(controller.getContext("2d") as CanvasRenderingContext2D);
    touchable.set(true);
    await firstRender(srcs);
    startGame(-1); //send away player
    // return renderLoop();
  });

  const handleTouchMove = (event: TouchEvent) => {
    const { left, right, top, bottom } =
      get(controllerStore).getBoundingClientRect();
    const { clientX, clientY } = event.touches[0];
    const { width } = window.screen;
    const gap = get(cornerGap);
    let position: number;

    if (get(landscape)) {
      if (clientY < top + gap || clientY > bottom - gap) return;
      position = clientY - top;
    } else {
      if (clientX < left + gap || clientX > right - gap) return;
      position = clientX * -1 + width - left;
    }
    renderController(position);
    handlePaddleMove(position);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (get(touchable)) return;
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
    let position: number;

    if (get(landscape)) {
      if (clientY < top + gap || clientY > bottom - gap) return;
      position = clientY - top;
    } else {
      if (clientX < left + gap || clientX > right - gap) return;
      position = clientX * -1 + width - left;
    }
    handlePaddleMove(position);
  };
</script>

<div class:rotate={!$landscape} class="flex items-center gap-8">
  <div class="relative">
    <!-- <canvas class="bg-black opacity-30 absolute z-10 w-full h-full"></canvas> -->
    <canvas
      bind:this={scorer}
      class="absolute z-20 cursor-none"
      on:mousemove={handleMouseMove}
    />
    <canvas bind:this={confetti} class="absolute z-10" />
    <canvas bind:this={canvas} class=" z-0" />
  </div>
  <canvas
    bind:this={controller}
    on:touchmove|preventDefault={handleTouchMove}
    class=" bg-transparent"
  />
</div>
<svelte:window on:resize|passive={renderResize} />

<style>
  .rotate {
    transform: rotate(90deg);
  }
  /* .reverse-rotate {
    transform-origin: top left;
    transform: rotate(-90deg);
  } */
</style>
