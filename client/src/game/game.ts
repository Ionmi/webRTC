import { getContext, onMount } from "svelte";
import { writable, derived } from "svelte/store";

// Some props for the app
export const width = writable<number>(0);
export const height = writable<number>(0);
export const context = writable<CanvasRenderingContext2D>();
export const canvas = writable<HTMLCanvasElement>();
export const canvasPosition = writable<{ x: number; y: number }>();
export const paddleMeasures = writable<{ width: number; height: number }>();
export const ballDiameter = writable<number>();
export const time = writable(0);

// A more convenient store for grabbing all game props
export const props = deriveObject({
  context,
  canvas,
  width,
  height,
  canvasPosition,
  paddleMeasures,
  ballDiameter,
  time,
});

export const key = Symbol();

export const getState = () => {
  const api = getContext(key);
  return api.getState();
};

export const renderable = (render) => {
  const api = getContext(key);
  const element = {
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

function deriveObject(obj) {
  const keys = Object.keys(obj);
  const list = keys.map((key) => {
    return obj[key];
  });
  return derived(list, (array) => {
    return array.reduce((dict, value, i) => {
      dict[keys[i]] = value;
      return dict;
    }, {});
  });
}
