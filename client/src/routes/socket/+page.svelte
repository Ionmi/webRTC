<script lang="ts">
  import io from "socket.io-client";
  import type { Socket } from "socket.io-client";

  let socket: Socket | null = null;
  let peerConnection: RTCPeerConnection | null = null;
  let dataChannel: RTCDataChannel | null = null;
  let otherUser = "";
  let localData = "";

  const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      // { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun.services.mozilla.com:3478" },
      // {
      //   urls: "turn:relay.backups.cz",
      //   credential: "webrtc",
      //   username: "webrtc",
      // },
      // {
      //   urls: "turn:relay.backups.cz?transport=tcp",
      //   credential: "webrtc",
      //   username: "webrtc",
      // },
      // {
      //   urls: "turn:turn.anyfirewall.com:443?transport=tcp",
      //   credential: "webrtc",
      //   username: "webrtc",
      // },
    ],
  };

  const connectToSocket = async () => {
    socket = io("http://localhost:3000", { path: "/socket" });

    socket.on("connect", () => {
      console.log("Connected to socket");
    });

    socket.emit("joinRoom", "room1");

    socket.on("created", () => {
      console.log("Created room");
    });

    socket.on("joined", () => {
      console.log("Joined room");
      console.log("Ready to call");

      socket!.emit("ready", "room1");
    });

    socket.on("full", () => {
      console.log("Room is full");
      disconnectFromSocket();
    });

    socket.on("ready", () => {
      console.log("Ready to call");
    });

    socket.on("leave", () => {
      console.log("Leave room");
      disconnectFromSocket();
    });

    // Listen for open event on data channel
    dataChannel?.addEventListener("open", () => {
      console.log("Data channel is open and ready to use!");
    });

    // Listen for incoming data from data channel
    dataChannel?.addEventListener("message", (event) => {
      console.log(`Received data: ${event.data}`);
    });

    peerConnection?.addEventListener("datachannel", (event) => {
      dataChannel = event.channel;
    });
    // Listen for offer from remote peer and send answer back
    socket.on("offer", handleReceivedOffer);

    // Listen for answer from remote peer
    socket.on("answer", async (answer) => {
      try {
        await peerConnection?.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    // Listen for answer from remote peer
    socket.on("iceCandidate", async (candidate) => {
      console.log("Received ice candidate");

      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        await peerConnection?.addIceCandidate(iceCandidate);
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    // Listen for errors on peer connection
    peerConnection?.addEventListener("error", (error) => {
      console.error("Peer connection error:", error);
    });

    // Listen for connection state changes on peer connection
    peerConnection?.addEventListener("connectionstatechange", (event: any) => {
      console.log(
        `Connection state changed to ${peerConnection?.connectionState}`
      );
    });

    // Create and send offer to remote peer via signaling server

    // socket.on("offer", (offer: any) => {
    //   console.log(offer); // { data: 'Hello, server!' }
    // });

    // socket.on("answer", (answer) => {});
    // socket.on("ice-candidate", (candidate) => {});

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });
  };

  // Create data channel
  // console.log(dataChannel);

  const createPeerConnection = () => {
    // We create a RTC Peer Connection
    const connection = new RTCPeerConnection(ICE_SERVERS);

    // We implement our onicecandidate method for when we received a ICE candidate from the STUN server
    connection.onicecandidate = (event: any) => {
      if (event.candidate) {
        console.log("Sending ice candidate");

        socket?.emit("iceCandidate", "room1", event.candidate);
      }
    };

    connection.addEventListener("connectionstatechange", (event) => {
      if (connection.connectionState === "connected") {
        // Peers connected!
        console.log("Peers connected!");
      }
    });

    // We implement our onTrack method for when we receive tracks
    // connection.ontrack = handleTrackEvent;
    // dataChannel = connection.createDataChannel("my-channel");
    // connection.ondatachannel = (event: any) => {
    //   console.log("Data channel is created!");

    //   dataChannel = event.channel;
    //   // ??????
    // };
    return connection;
  };

  const handleReceivedOffer = async (offer: any) => {
    try {
      peerConnection = createPeerConnection();

      peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket?.emit("answer", "room1", answer);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const initiateCall = async () => {
    try {
      peerConnection = createPeerConnection();
      // dataChannel = peerConnection.createDataChannel("data-channel");
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket?.emit("offer", "room1", offer);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const sendMessage = () => {
    dataChannel?.send("Hello, world!");
  };
  const disconnectFromSocket = () => {
    if (socket) {
      if (peerConnection) {
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.close();
        peerConnection = null;
      }
      socket.emit("leave", "room1");
      socket.disconnect();
      socket = null;
    }
  };
</script>

<button class="btn btn-primary" on:click={connectToSocket}
  >Connect to socket</button
>
<span class="h-10 min-w-[4rem] p-8" />
<button class="btn btn-primary" on:click={disconnectFromSocket}
  >Disconnect from socket</button
>
<span class="h-10 min-w-[4rem] p-8" />
<button class="btn btn-primary" on:click={initiateCall}>initiate call</button>
<span class="h-10 min-w-[4rem] p-8" />
<button class="btn btn-primary" on:click={sendMessage}>mensaje</button>
