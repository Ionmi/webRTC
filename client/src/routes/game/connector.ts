import { get } from "svelte/store";
import { aspectRatio, positions, scala } from "./gemeElements";

export const handlePaddleMove = (absoluteY: number) => {
  const y = absoluteY / get(scala);
  //send to peer
  positions.update((prev) => ({ ...prev, homePaddle: y }));
};
