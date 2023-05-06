<script lang="ts">
  import io from "socket.io-client";
  import type { Socket } from "socket.io-client";
  import { ICE_SERVERS } from "./webrtc";
  import { onMount } from "svelte";
  import { redirect } from "@sveltejs/kit";

  let peerConnection: RTCPeerConnection;
  let dataChannel: RTCDataChannel;
  let remoteDataChannel: RTCDataChannel;
  let socket: Socket;
  let host = false;

  let inputValue: string = "";

  let messages: { sender: boolean; message: string }[] = [
    { sender: true, message: "My messages" },
    { sender: false, message: "Peer's messages" },
  ];

  onMount(() => {
    const waitState = (): Promise<boolean> => {
      return new Promise((resolve) => {
        const checkVar = () => {
          if (peerConnection.signalingState !== "stable") {
            console.log(
              "Waiting for signaling state to be stable :" +
                peerConnection.signalingState
            );

            resolve(true);
          } else {
            setTimeout(checkVar, 100);
          }
        };
        console.log("hola");

        checkVar();
      });
    };

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
      socket.emit("ready", "room1");
    });

    socket.on("full", () => console.log("Room is full"));

    socket.on("ready", () => {
      console.log("Peers are ready");

      peerConnection = new RTCPeerConnection(ICE_SERVERS);
      console.log(
        "Created local peer connection object as " +
          (host === true ? "host" : "guest")
      );

      dataChannel = peerConnection.createDataChannel(
        host === true ? "DataChannelA" : "DataChannelB"
      );
      console.log(
        "Created " + (host === true ? "DataChannelA" : "DataChannelB")
      );

      peerConnection.onicecandidate = (ev) => {
        if (ev.candidate !== null) {
          const candidate = new RTCIceCandidate(ev.candidate);
          socket.emit("iceCandidate", "room1", candidate);
        }
      };

      peerConnection.ondatachannel = (ev: RTCDataChannelEvent) =>
        receiveChannelCallback(ev);

      socket.on("iceCandidate", async (candidate) => {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.log("Failed to create session description: " + error);
        }
      });

      socket.on("answer", async (answer) => {
        // Cannot set remote answer in state stable
        // await waitState();
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("offer", async (offer) => {
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit("answer", "room1", answer);
        } catch (error) {
          console.log("Failed to create session description: " + error);
        }
      });

      peerConnection.createOffer().then(async (offer) => {
        await peerConnection.setLocalDescription(offer);
        socket.emit("offer", "room1", offer);
      });
    });
    return () => {
      socket.emit("leave", "room1");
      console.log("Closing data channels");
      dataChannel.close();
      console.log("Closed data channel with label: " + dataChannel.label);
      peerConnection.close();
      console.log("Closed peer connections");
      inputValue = "";
    };
  });

  const sendData = (dataChannel: RTCDataChannel, message: string) => {
    if (message === "") return;
    messages = [...messages, { sender: true, message }];
    dataChannel.send(message);
  };

  const receiveChannelCallback = (event: RTCDataChannelEvent) => {
    console.log("Receive Channel Callback");
    remoteDataChannel = event.channel;
    remoteDataChannel.onmessage = (ev: MessageEvent<any>) =>
      (messages = [...messages, { sender: false, message: ev.data }]);
    remoteDataChannel.onopen = onReceiveChannelStateChange;
    remoteDataChannel.onclose = onReceiveChannelStateChange;
  };

  const onReceiveChannelStateChange = () => {
    console.log(`Receive channel state is: ${dataChannel.readyState}`);
  };
</script>

<main class="flex flex-col items-center justify-center w-screen">
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
</main>
