import { create } from "qrcode";
import type { Socket } from "socket.io-client";
import { get, writable } from "svelte/store";

export const peerConnection = writable<RTCPeerConnection>();
export const dataChannel = writable<RTCDataChannel>();
export const socket = writable<Socket>();
export const room = writable<string>("joining room");
export const peer = writable<string | null>(null);

export let defMessages: { sender: boolean; message: string }[] = [
  { sender: true, message: "My messages" },
  { sender: false, message: "Peer's messages" },
];
export const messages = writable(defMessages);

export let host = false;

export const ICE_SERVERS: RTCConfiguration = {
  // iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
  iceServers: [
    {
      urls: "stun:a.relay.metered.ca:80",
    },
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
  // console.log(res);
  switch (res.type) {
    case "candidate":
      get(peerConnection).addIceCandidate(new RTCIceCandidate(res.payload));
      break;
    case "offer":
      onOffer(res.payload);
      break;
    case "answer":
      get(peerConnection).setRemoteDescription(
        new RTCSessionDescription(res.payload)
      );
      break;
    case "ready":
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
      host = false;
      room.set("peer left the room");
      get(socket).emit("join");
      console.log("peer left the room");
      break;

    default:
      console.log("undefined response");
      break;
  }
};

const createPeerConnection = () => {
  const connection = new RTCPeerConnection(ICE_SERVERS);
  connection.onicecandidate = ({ candidate }) => {
    if (candidate) {
      sendPayload({
        type: "candidate",
        payload: candidate,
      });
    }
  };
  connection.ondatachannel = ({ channel }) => {
    console.log("Data channel is created!");
    let receiveChannel = channel;
    receiveChannel.onopen = () => {
      console.log("Data channel is open and ready to be used.");
    };
    receiveChannel.onmessage = handleMessage;
    dataChannel.set(receiveChannel);
  };
  peerConnection.set(connection);
};

const createDataChannel = async () => {
  const connection = get(peerConnection);
  const channel = connection.createDataChannel("messenger");
  console.log("Data channel is created!");

  channel.onerror = (error) => {
    console.log("Error occured on datachannel:", error);
  };

  channel.onmessage = handleMessage;
  console.log("channel set");

  dataChannel.set(channel);

  try {
    const offer = await connection.createOffer();
    console.log("Offer created!");
    await connection.setLocalDescription(offer);
    sendPayload({
      type: "offer",
      payload: connection.localDescription,
    });
  } catch (error) {
    console.log(error);
  }
};

const onOffer = async (offer: any) => {
  const connection = get(peerConnection);
  try {
    await connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    sendPayload({
      type: "answer",
      payload: connection.localDescription,
    });
  } catch (error) {
    console.log(error);
  }
};

const handleMessage = ({ data }: { data: string }) => {
  try {
    console.log(data);

    const message = JSON.parse(data);
    addMessage(message.message);
  } catch (error) {
    console.log(error);
  }
};

const addMessage = (newMessage: string) => {
  // messages = [...messages, { sender: true, message: newMessage }];
  messages.update((messages) => [
    ...messages,
    { sender: true, message: newMessage },
  ]);
};

const sendPayload = (data: { peer?: string; type: string; payload: any }) => {
  const peerId = get(peer);
  if (!peerId) return;
  data.peer = peerId;
  get(socket).emit("message", JSON.stringify(data));
};

export const sendData = (message: string) => {
  if (message === "") return;
  addMessage(message);
  get(dataChannel).send(JSON.stringify({ message }));
};
