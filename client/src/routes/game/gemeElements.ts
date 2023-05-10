import { writable } from "svelte/store";

export const aspectRatio = { width: 7, height: 5, ratio: 1.4 };

export interface IElementScrcs {
  background: string;
  ball: string;
  homePaddle: string;
  awayPaddle: string;
}

export interface IBackground {
  width: number;
  height: number;
  svg: HTMLImageElement;
}

export interface IBall {
  size: number;
  radius: number;
  svg: HTMLImageElement;
}

export interface IPadle {
  width: number;
  height: number;
  x: number;
  svg: HTMLImageElement;
}

export const canvas = writable<HTMLCanvasElement>();
export const range = writable<HTMLDivElement>();
export const context = writable<CanvasRenderingContext2D>();
export const scala = writable<number>();
export const background = writable<HTMLImageElement>();
export const ball = writable<IBall>();
export const homePaddle = writable<IPadle>();
export const awayPaddle = writable<IPadle>();
