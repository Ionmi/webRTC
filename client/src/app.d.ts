// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
  interface User {
    username: string;
    avatarPath: string;
    twoFactor: boolean;
  }
  interface LoginPending {
    oauth2Provider: string;
    oauth2Id: string;
  }

  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
