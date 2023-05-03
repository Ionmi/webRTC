import { getContext, onMount } from "svelte";
import { writable, derived } from "svelte/store";

// Some props for the app
export const width = writable<number>(0);
export const height = writable<number>(0);
export const context = writable<CanvasRenderingContext2D>();
export const canvas = writable<HTMLCanvasElement>();
export const canvasPosition = writable<{ x: number; y: number }>();
export const paddleMeasures = writable<{ width: number; height: number }>();
export const ballSize = writable<number>();
export const time = writable(0);
export const ballPos = writable<[number, number] | null>(null);
export const ballDir = writable<[number, number]>([0, 0]);
export const ballSpeed = writable<number>(5);

// A more convenient store for grabbing all game props
export const props = deriveObject({
  context,
  canvas,
  width,
  height,
  canvasPosition,
  paddleMeasures,
  ballSize,
  ballPos,
  ballSpeed,
  time,
});

export const key = Symbol();

export const getState = () => {
  const api: any = getContext(key);
  return api.getState();
};

export const setInitialDir = () => {
  const random = Math.floor(Math.random() * 12);
  const x = random % 2 ? -1 : 1;
  const y =
    random === 0
      ? -0.63
      : Math.round((0.103 * random - 0.63 + Number.EPSILON) * 100) / 100;
  ballDir.set([x, y]);
};

export const renderable = (render: any) => {
  const api: any = getContext(key);
  const element: any = {
    ready: false,
    mounted: false,
  };
  if (typeof render === "function") element.render = render;
  else if (render) {
    if (render.render) element.render = render.render;
    if (render.setup) element.setup = render.setup;
  }
  api.add(element);
  onMount(() => {
    element.mounted = true;
    return () => {
      api.remove(element);
      element.mounted = false;
    };
  });
};

function deriveObject(obj: any) {
  const keys = Object.keys(obj);
  const list = keys.map((key) => {
    return obj[key];
  });
  return derived(list, (array) => {
    return array.reduce((dict: any, value, i) => {
      dict[keys[i]] = value;
      return dict;
    }, {});
  });
}
