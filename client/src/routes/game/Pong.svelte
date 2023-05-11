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
  } from "./gemeElements";
  import { get } from "svelte/store";

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

    touchable.set(true);
    firstRender(srcs);
  });

  const handleTouchMove = (event: TouchEvent) => {
    const { width, height } = window.screen;
    const { left, right, top, bottom } =
      get(controllerStore).getBoundingClientRect();
    const { clientX, clientY } = event.touches[0];
    const gap = get(cornerGap);

    // console.log(clientX);

    if (get(landscape)) {
      if (clientY < top + gap || clientY > bottom - gap) {
        return;
      }
      renderController(clientY - top);
    } else {
      if (clientX < left + gap || clientX > right - gap) {
        return;
      }
      const x = clientX * -1 + width;
      renderController(x - left);
    }
    // console.log(right);

    // console.log(width, height);

    // const min = rangeTrack.getBoundingClientRect().left;
    // const max = rangeTrack.getBoundingClientRect().right;

    // console.log("min = " + min);
    // console.log("min = " + min);

    // if (clientX < min || clientX > max) {
    //   return;
    // }

    // console.log("movementX = " + event.touches[0].clientX);
    // console.log(min);
  };
</script>

<div class:rotate={!$landscape} class="flex items-center gap-8">
  <canvas bind:this={canvas} />
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
