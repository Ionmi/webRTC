import { writable } from "svelte/store";

export const device = writable<"mobile" | "desktop">("mobile");
