<script lang="ts">
  import { onMount } from "svelte";
  import { firstRender, handleResize, rotate, touchable } from "./render";
  import {
    table as tableStore,
    controller as controllerStore,
    tableCtx,
    type IElementScrcs,
    controllerCtx,
  } from "./gemeElements";
  import { get } from "svelte/store";

  let canvas: HTMLCanvasElement;
  let controller: HTMLCanvasElement;
  let rangeTrack: HTMLDivElement;

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

    touchable.set(true);
    firstRender(srcs);
  });

  function handleTouchMove(event: TouchEvent) {
    const clientX = event.touches[0].clientX;
    const clientY = event.touches[0].clientY;
    const min = rangeTrack.getBoundingClientRect().left;
    const max = rangeTrack.getBoundingClientRect().right;

    console.log("min = " + min);
    console.log("min = " + min);

    if (clientX < min || clientX > max) {
      return;
    }

    console.log("movementX = " + event.touches[0].clientX);
    console.log(min);

  }
</script>

<div class:rotate={$rotate} class="flex items-center gap-8">
  <canvas bind:this={canvas} />
  <canvas bind:this={controller} class=" bg-transparent" />
  <!-- <div
    bind:this={rangeTrack}
    on:touchmove|preventDefault={handleTouchMove}
    class="bg-primary-content rounded-full w-3 glowing-div"
  /> -->
</div>
<svelte:window on:resize|passive={handleResize} />

<style>
  .rotate {
    transform: rotate(90deg);
  }
</style>
