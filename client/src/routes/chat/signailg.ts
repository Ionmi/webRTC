import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import { writable } from "svelte/store";
import {
  addIceCandidate,
  clearMessages,
  createDataChannel,
  createPeerConnection,
  dataChannel,
  onOffer,
  peerConnection,
  setRemoteDescription,
} from "./webrtc";

export const room = writable<string>("joining room");
export let socket: Socket;
export let host = false;
let peer: string = "";

export const setSocket = () => {
  socket = io("http://0.0.0.0:3000", { path: "/chat" });
  socket.onAny((event: string) => {
    handleSocketEvent(event);
  });
  socket.emit("join");
};

const handleSocketEvent = (event: string) => {
  let res: { type: string; room?: string; payload?: any; peer?: string };
  try {
    res = JSON.parse(event);
  } catch (error) {
    console.log("error parsing json");
    return;
  }
  switch (res.type) {
    case "candidate":
      addIceCandidate(res.payload);
      break;
    case "offer":
      onOffer(res.payload);
      break;
    case "answer":
      setRemoteDescription(res.payload);
      break;
    case "ready":
      peer = res.peer as string;
      room.set(res.room as string);
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

  clearMessages();
  createPeerConnection();
  socket.emit("join");
  console.log("peer left the room");
};

export const sendPayload = (data: { peer?: string; type: string; payload: any }) => {
  if (!peer) return;
  data.peer = peer;
  socket.emit("message", JSON.stringify(data));
};
