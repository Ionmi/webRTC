import type { LayoutLoad } from "./$types";
import { PUBLIC_API_PATH } from "$env/static/public";
import { user } from "$lib/stores/user.store";
import {
  getSession,
  expireSession,
  setSession,
} from "$lib/helpers/cookies.helper";
import { get } from "svelte/store";

export const ssr = false;

export const load = (async ({ fetch }) => {
  try {
    if (get(user)) return;
    const accessToken = getSession();

    if (!accessToken) return;
    const res = await fetch(`${PUBLIC_API_PATH}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (res.status != 200) {
      expireSession();
      throw new Error(res.statusText);
    }
    const logedUser = await res.json();
    setSession(logedUser.accessToken);
    user.set(logedUser.user);
  } catch (error) {
    expireSession();
    user.set(null);
  }
}) satisfies LayoutLoad;
