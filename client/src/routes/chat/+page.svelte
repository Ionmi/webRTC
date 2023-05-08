<script lang="ts">
  import { onMount } from "svelte";
  import { socket, messages, sendData, room, setSocket } from "./chatHelper";
  import { get } from "svelte/store";

  let inputValue = "";
  onMount(() => {
    setSocket();
    return () => {
      console.log("Closing socket");
      socket.close();
      inputValue = "";
    };
  });

  const submit = () => {
    sendData(inputValue);
    inputValue = "";
  };
</script>

<div class="flex flex-col items-center justify-center w-screen">
  <h1>room: {$room}</h1>
  <div class="w-[50vw] h-[60vh] p-20">
    {#each $messages as message}
      <div class="chat {message.sender ? 'chat-end' : 'chat-start'}">
        <div class="chat-bubble">
          {message.message}
        </div>
      </div>
    {/each}
  </div>
  <div class="flex">
    <input
      class="rounded-lg pl-4"
      type="text"
      placeholder="hey que tal"
      name=""
      id=""
      bind:value={inputValue}
    />
    <span class="w-2" />
    <button on:click={submit} class="btn btn-primary">SEND</button>
  </div>
</div>
