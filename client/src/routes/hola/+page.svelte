<script lang="ts">
  import io from "socket.io-client";
  import type { Socket } from "socket.io-client";
  import { ICE_SERVERS } from "./webrtc";
  import { onDestroy, onMount } from "svelte";
  import { redirect } from "@sveltejs/kit";

  let peerConnection: RTCPeerConnection | null = null;
  let dataChannel: RTCDataChannel | null = null;
  let socket: Socket | null = null;
  let host = false;

  let inputValue: string = "";

  let messages: { sender: boolean; message: string }[] = [
    { sender: true, message: "My messages" },
    { sender: false, message: "Peer's messages" },
  ];

  const connect = () => {
    socket = io("http://0.0.0.0:3000", { path: "/socket" });

    socket.emit("joinRoom", "room1");

    socket.on("leave", () => {
      throw redirect(300, "/hola");
    });

    socket.on("created", () => {
      console.log("Created room as host");
      host = true;
    });

    socket.on("joined", () => {
      console.log("Joined room as guest");
      host = false;
      socket!.emit("ready", "room1");
    });

    socket.on("full", () => console.log("Room is full"));

    socket.on("ready", () => {
      console.log("Peers are ready");

      peerConnection = new RTCPeerConnection(ICE_SERVERS);
      console.log(
        "Created local peer connection object as " +
          (host === true ? "host" : "guest")
      );

      if (host === true) {
        dataChannel = peerConnection.createDataChannel("DataChannelA");
        dataChannel.onerror = (error) => {
          console.log("Data Channel Error:", error);
          return;
        };
        dataChannel.onmessage = (event) => {
          console.log("Got Data Channel Message:", event.data);
          messages = [...messages, { sender: false, message: event.data }];
        };
        console.log("dataChannel created");
      }

      peerConnection.onicecandidate = ({ candidate }) => {
        if (candidate !== null) {
          socket?.emit("iceCandidate", "room1", new RTCIceCandidate(candidate));
        }
      };

      peerConnection.ondatachannel = ({ channel }) => {
        console.log("Receive Channel Callback");
        dataChannel = channel;
        dataChannel.onmessage = (ev: MessageEvent<any>) =>
          (messages = [...messages, { sender: false, message: ev.data }]);
        dataChannel.onopen = onReceiveChannelStateChange;
        dataChannel.onclose = onReceiveChannelStateChange;
      };

      socket?.on("iceCandidate", async (candidate) => {
        try {
          await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.log("Failed to create session description: " + error);
        }
      });

      socket?.on("answer", async (answer) => {
        // Cannot set remote answer in state stable
        // await waitState();
        await peerConnection?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      socket?.on("offer", async (offer) => {
        try {
          await peerConnection?.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnection!.createAnswer();
          await peerConnection!.setLocalDescription(answer);
          socket!.emit("answer", "room1", answer);
        } catch (error) {
          console.log("Failed to create session description: " + error);
        }
      });

      try {
        peerConnection.createOffer().then(async (offer) => {
          await peerConnection!.setLocalDescription(offer);
          socket?.emit("offer", "room1", offer);
        });
      } catch (error) {
        console.log("Failed to create session description: " + error);
      }
    });
  };
  onDestroy(() => {
    socket?.emit("leave", "room1");
    console.log("Closing data channels");
    dataChannel?.close();
    console.log("Closed data channel with label: " + dataChannel?.label);
    dataChannel = null;
    peerConnection?.close();
    peerConnection = null;
    console.log("Closed peer connections");
    inputValue = "";
  });

  const sendData = (dataChannel: RTCDataChannel, message: string) => {
    if (message === "") return;
    messages = [...messages, { sender: true, message }];
    dataChannel.send(message);
  };

  const onReceiveChannelStateChange = () => {
    console.log(`Receive channel state is: ${dataChannel?.readyState}`);
  };
</script>

<div class="flex flex-col items-center justify-center w-screen">
  <div class="w-[50vw] h-[60vh] p-20">
    {#each messages as message}
      <div class="chat {message.sender ? 'chat-start' : 'chat-end'}">
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
        sendData(dataChannel, inputValue);
      }}
      class="btn btn-primary">SEND</button
    >
  </div>
  <button class="btn btn-secondary mt-6" on:click={connect}>Conectar</button>
</div>
