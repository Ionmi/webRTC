<script lang="ts">
  import { onMount } from "svelte";
  import { firstRender, handleResize, rotate, touchable } from "./render";
  import {
    canvas as canvasStore,
    range as rangeStore,
    context,
    type IElementScrcs,
    range,
  } from "./gemeElements";
  import { get } from "svelte/store";

  let canvas: HTMLCanvasElement;
  let rangeTrack: HTMLDivElement;

  const srcs: IElementScrcs = {
    background: "/red_background.svg",
    ball: "/default_ball.svg",
    homePaddle: "/default_paddle.svg",
    awayPaddle: "/default_paddle.svg",
  };

  onMount(() => {
    canvasStore.set(canvas);
    rangeStore.set(rangeTrack);
    context.set(canvas.getContext("2d") as CanvasRenderingContext2D);

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

    // rangeCircle.style.position = "absolute";
    // rangeCircle.style.left = event.touches[0].clientY - rangeCircle.getBoundingClientRect().y + "px";
    // rangeCircle.style.top = rangeCircle.style.top + max + "px";
    // console.log("y = " + event.touches[0].clientY);
    // console.log("x = " + event.touches[0].clientX);
  }
</script>

<div class:rotate={$rotate} class="flex items-center gap-8">
  <canvas bind:this={canvas} />
  <div
    bind:this={rangeTrack}
    on:touchmove|preventDefault={handleTouchMove}
    class="bg-primary-content rounded-full w-3 glowing-div"
  />
</div>
<svelte:window on:resize|passive={handleResize} />

<style>
  @keyframes glow {
    0% {
      background-color: hsl(var(--bc) / var(--tw-bg-opacity));
      box-shadow: 0 0px 5px hsl(var(--bc) / var(--tw-bg-opacity));
      transform: scale(1);
    }
    33% {
      background-color: hsl(var(--bc) / var(--tw-bg-opacity));
      box-shadow: 0px 5px 10px hsl(var(--bc) / var(--tw-bg-opacity));
      transform: scale(1.02);
    }
    66% {
      background-color: hsl(var(--bc) / var(--tw-bg-opacity));
      box-shadow: 0px -5px 10px hsl(var(--bc) / var(--tw-bg-opacity));
      transform: scale(1.02);
    }
    100% {
      background-color: hsl(var(--bc) / var(--tw-bg-opacity));
      box-shadow: 0 0px 5px hsl(var(--bc) / var(--tw-bg-opacity));
      transform: scale(1);
    }
  }
  .glowing-div {
    animation: pulse 1s ease-in-out infinite; /* animación que genera el parpadeo */
    box-shadow: 0 0 8px hsl(var(--bc) / var(--tw-bg-opacity));
    animation: glow 1500ms infinite;
  }
  .rotate {
    transform: rotate(90deg);
  }
</style>
