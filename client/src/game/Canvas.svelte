<script lang="ts">
  import { onMount, onDestroy, setContext } from "svelte";

  import {
    key,
    width,
    height,
    canvas as canvasStore,
    context as contextStore,
    props,
    time,
    canvasPosition,
    ballDiameter,
    paddleMeasures,
  } from "./game";

  let clazz: string = "";
  export { clazz as class };

  export let killLoopOnError = true;
  export let attributes = {};

  let listeners: any = [];
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let frame: number;

  onMount(() => {
    // prepare canvas stores
    canvas.height = canvas.getBoundingClientRect().height;
    canvas.width = canvas.getBoundingClientRect().width;
    context = canvas.getContext("2d", attributes) as CanvasRenderingContext2D;

    height.set(canvas.height);
    width.set(canvas.width);
    paddleMeasures.set({
      width: canvas.width / 100,
      height: canvas.height / 8,
    });
    ballDiameter.set($paddleMeasures.height / 3);

    canvasPosition.set({
      x: canvas.getBoundingClientRect().left,
      y: canvas.getBoundingClientRect().top,
    });
    canvasStore.set(canvas);
    contextStore.set(context);

    // setup entities
    listeners.forEach(
      async (entity: { setup: (arg0: unknown) => any; ready: boolean }) => {
        if (entity.setup) {
          let p = entity.setup($props);
          if (p && p.then) await p;
        }
        entity.ready = true;
      }
    );

    // start game loop
    return createLoop((elapsed: number, dt: any) => {
      time.set(elapsed);
      render(dt);
    });
  });

  setContext(key, {
    add(fn: Function) {
      this.remove(fn);
      listeners.push(fn);
    },
    remove(fn: Function) {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    },
  });

  function render(dt: any) {
    context.save();
    // context.scale($pixelRatio, $pixelRatio);
    listeners.forEach(
      (entity: {
        mounted: any;
        ready: any;
        render: (arg0: unknown, arg1: any) => void;
      }) => {
        try {
          if (entity.mounted && entity.ready && entity.render) {
            entity.render($props, dt);
          }
        } catch (err) {
          console.error(err);
          if (killLoopOnError) {
            cancelAnimationFrame(frame);
            console.warn("Animation loop stopped due to an error");
          }
        }
      }
    );
    context.restore();
  }

  function handleResize() {
    $canvasStore.height = $canvasStore.getBoundingClientRect().height;
    $canvasStore.width = $canvasStore.getBoundingClientRect().width;
    width.set($canvasStore.width);
    height.set($canvasStore.height);
    paddleMeasures.set({
      width: $canvasStore.width / 100,
      height: $canvasStore.height / 8,
    });
    ballDiameter.set($paddleMeasures.height / 3);
    canvasPosition.set({
      x: $canvasStore.getBoundingClientRect().left,
      y: $canvasStore.getBoundingClientRect().top,
    });
    // pixelRatio.set(window.devicePixelRatio);
  }

  function createLoop(fn: Function) {
    let elapsed = 0;
    let lastTime = performance.now();
    (function loop() {
      frame = requestAnimationFrame(loop);
      const beginTime = performance.now();
      const dt = (beginTime - lastTime) / 1000;
      lastTime = beginTime;
      elapsed += dt;
      fn(elapsed, dt);
    })();
    return () => {
      cancelAnimationFrame(frame);
    };
  }
</script>

<!-- width={$width * $pixelRatio}
height={$height * $pixelRatio}
style="width: {$width}px; height: {$height}px;" -->
<canvas class={clazz} bind:this={canvas} />
<svelte:window on:resize|passive={handleResize} />
<slot />
