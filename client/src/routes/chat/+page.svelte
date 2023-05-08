<script lang="ts">
  import io from "socket.io-client";
  import { onMount } from "svelte";
  import {
    socket,
    messages,
    sendData,
    handleSocketEvent,
    room,
  } from "./chatHelper";
  import { get } from "svelte/store";

  let inputValue = "";
  onMount(() => {
    socket.set(io("http://0.0.0.0:3000", { path: "/chat" }));
    get(socket).onAny((event: string) => {
      handleSocketEvent(event);
    });

    get(socket).emit("join");
    return () => {
      console.log("Closing socket");
      get(socket).close();
    };
  });
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
    <button
      on:click={() => {
        sendData(inputValue);
      }}
      class="btn btn-primary">SEND</button
    >
  </div>
</div>
