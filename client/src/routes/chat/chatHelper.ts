import { create } from "qrcode";
import type { Socket } from "socket.io-client";
import { get, writable } from "svelte/store";

let peerConnection: RTCPeerConnection;
let dataChannel: RTCDataChannel;
// export const peerConnection = writable<RTCPeerConnection>();
// export const dataChannel = writable<RTCDataChannel>();
export const socket = writable<Socket>();
export const room = writable<string>("joining room");
export const peer = writable<string | null>(null);

export let defMessages: { sender: boolean; message: string }[] = [
  { sender: true, message: "My messages" },
  { sender: false, message: "Peer's messages" },
];
export const messages = writable<{ sender: boolean; message: string }[]>([]);

export let host = false;

export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.1.google.com:19302" },
    { urls: "stun:a.relay.metered.ca:80" },
    {
      urls: "turn:a.relay.metered.ca:80",
      username: "d793e43965acbf2ec5082635",
      credential: "OXDoOyCUewlYjkNs",
    },
    {
      urls: "turn:a.relay.metered.ca:80?transport=tcp",
      username: "d793e43965acbf2ec5082635",
      credential: "OXDoOyCUewlYjkNs",
    },
    {
      urls: "turn:a.relay.metered.ca:443",
      username: "d793e43965acbf2ec5082635",
      credential: "OXDoOyCUewlYjkNs",
    },
    {
      urls: "turn:a.relay.metered.ca:443?transport=tcp",
      username: "d793e43965acbf2ec5082635",
      credential: "OXDoOyCUewlYjkNs",
    },
  ],
};

export const handleSocketEvent = (event: string) => {
  let res: { type: string; room?: string; payload?: any; peer?: string };
  try {
    res = JSON.parse(event);
  } catch (error) {
    console.log("error parsing json");
    return;
  }
  switch (res.type) {
    case "candidate":
      peerConnection.addIceCandidate(new RTCIceCandidate(res.payload));
      break;
    case "offer":
      onOffer(res.payload);
      break;
    case "answer":
      peerConnection.setRemoteDescription(
        new RTCSessionDescription(res.payload)
      );
      break;
    case "ready":
      console.log("host: ", host);

      peer.set(res.peer ?? "");
      room.set(res.room ?? "");
      host && createDataChannel();
      break;
    case "connected":
      createPeerConnection();
      break;
    case "created":
      host = true;
      room.set(res.room ?? "");
      console.log("waiting for peer");
      break;
    case "leave":
      handleLeave();
      break;

    default:
      console.log("undefined response");
      break;
  }
};

const handleLeave = () => {
  room.set("peer left the room");
  host = false;
  dataChannel.close();
  peerConnection.close();
  createPeerConnection();
  get(socket).emit("join");
  console.log("peer left the room");
};

const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(ICE_SERVERS);
  peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      sendPayload({
        type: "candidate",
        payload: candidate,
      });
    }
  };
  peerConnection.ondatachannel = ({ channel }) => {
    console.log("Data channel is created!");
    dataChannel = channel;
    dataChannel.onopen = () => {
      console.log("Data channel is open and ready to be used.");
    };
    dataChannel.onmessage = handleMessage;
  };
};

const createDataChannel = async () => {
  dataChannel = peerConnection.createDataChannel("messenger");
  console.log("Data channel is created!");

  dataChannel.onerror = (error) => {
    console.log("Error occured on datachannel:", error);
  };

  dataChannel.onmessage = handleMessage;

  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendPayload({
      type: "offer",
      payload: peerConnection.localDescription,
    });
  } catch (error) {
    console.log(error);
  }
};

const onOffer = async (offer: any) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    sendPayload({
      type: "answer",
      payload: peerConnection.localDescription,
    });
  } catch (error) {
    console.log(error);
  }
};

const handleMessage = ({ data }: { data: string }) => {
  try {
    const message = JSON.parse(data);
    addMessage(message.message, false);
  } catch (error) {
    console.log(error);
  }
};

const addMessage = (message: string, sender: boolean) => {
  // messages = [...messages, { sender: true, message: newMessage }];
  messages.update((messages) => [...messages, { sender, message }]);
};

const sendPayload = (data: { peer?: string; type: string; payload: any }) => {
  const peerId = get(peer);
  if (!peerId) return;
  data.peer = peerId;
  get(socket).emit("message", JSON.stringify(data));
};

export const sendData = (message: string) => {
  if (message === "") return;
  addMessage(message, true);
  dataChannel.send(JSON.stringify({ message }));
};
