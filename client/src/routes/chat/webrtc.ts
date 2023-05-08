import { writable } from "svelte/store";
import { ICE_SERVERS } from "./iceServers";
import { sendPayload } from "./signailg";

export let peerConnection: RTCPeerConnection;
export let dataChannel: RTCDataChannel;
export const messages = writable<{ sender: boolean; message: string }[]>([]);

export const addIceCandidate = async (payload: any) => {
  await peerConnection.addIceCandidate(new RTCIceCandidate(payload));
};

export const setRemoteDescription = async (payload: any) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(payload));
};

export const clearMessages = () => {
  messages.set([]);
};

const GOOGLE_STUN_SERVER: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.1.google.com:19302" }],
};

export const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(ICE_SERVERS ?? GOOGLE_STUN_SERVER);
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

export const createDataChannel = async () => {
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

export const onOffer = async (offer: any) => {
  try {
    await setRemoteDescription(offer);
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
  messages.update((messages) => [...messages, { sender, message }]);
};

export const sendData = (message: string) => {
  if (message === "") return;
  addMessage(message, true);
  dataChannel.send(JSON.stringify({ message }));
};
