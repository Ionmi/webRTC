<script lang="ts">
  import Parallax from "$lib/components/Parallax.svelte";
  import LoginWrapper from "$lib/components/login/LoginWrapper.svelte";
  import { loginPending } from "$lib/stores/loginPending.store";
  import { user } from "$lib/stores/user.store";
  import LoginFormAction from "$lib/components/login/LoginFormAction.svelte";
  import LoginProvider from "$components/login/LoginProvider.svelte";
  import { get } from "svelte/store";
  import { oauth2Status } from "$lib/stores/oauth2Status.store";
  import UserCard from "$components/users/UserCard.svelte";
  import { each } from "svelte/internal";

  let showLogin: boolean = false;

  $: {
    let status = get(oauth2Status);
    if (
      get(user) === null &&
      (status.message !== null || status.loader !== null)
    )
      showLogin = true;
  }
</script>

<Parallax>
  {#if $loginPending && $user === null}
    <LoginFormAction bind:checked={showLogin} propValue={$loginPending} />
  {:else if showLogin && $user === null}
    <LoginProvider bind:checked={showLogin} />
  {/if}
  <div class="flex flex-wrap justify-center p-10 gap-10">
    <LoginWrapper bind:showLogin destination={"users/" + $user?.username}>
      <UserCard />
    </LoginWrapper>
    <LoginWrapper bind:showLogin destination={""}>
      <UserCard />
    </LoginWrapper>
  </div>
</Parallax>
