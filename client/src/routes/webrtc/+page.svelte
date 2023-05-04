<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    let localConnection: RTCPeerConnection;
    let remoteConnection: RTCPeerConnection;
    let sendChannel: RTCDataChannel;
    let receiveChannel: RTCDataChannel;

    const dataChannelSend = document.querySelector("textarea#dataChannelSend");
    const dataChannelReceive = document.querySelector(
      "textarea#dataChannelReceive"
    );
    const startButton: HTMLButtonElement | null =
      document.querySelector("button#startButton");
    const sendButton: HTMLButtonElement | null =
      document.querySelector("button#sendButton");
    const closeButton: HTMLButtonElement | null =
      document.querySelector("button#closeButton");

    startButton!.onclick = createConnection;
    sendButton!.onclick = sendData;
    closeButton!.onclick = closeDataChannels;

    function enableStartButton() {
      startButton!.disabled = false;
    }

    function disableSendButton() {
      sendButton!.disabled = true;
    }

    function createConnection() {
      dataChannelSend.placeholder = "";
      const servers = null;
      window.localConnection = localConnection = new RTCPeerConnection(servers);
      console.log("Created local peer connection object localConnection");

      sendChannel = localConnection.createDataChannel("sendDataChannel");
      console.log("Created send data channel");

      localConnection.onicecandidate = (e) => {
        onIceCandidate(localConnection, e);
      };
      sendChannel.onopen = onSendChannelStateChange;
      sendChannel.onclose = onSendChannelStateChange;

      window.remoteConnection = remoteConnection = new RTCPeerConnection(
        servers
      );
      console.log("Created remote peer connection object remoteConnection");

      remoteConnection.onicecandidate = (e) => {
        onIceCandidate(remoteConnection, e);
      };
      remoteConnection.ondatachannel = receiveChannelCallback;

      localConnection
        .createOffer()
        .then(gotDescription1, onCreateSessionDescriptionError);
      startButton.disabled = true;
      closeButton.disabled = false;
    }

    function onCreateSessionDescriptionError(error) {
      console.log("Failed to create session description: " + error.toString());
    }

    function sendData() {
      const data = dataChannelSend.value;
      sendChannel.send(data);
      console.log("Sent Data: " + data);
    }

    function closeDataChannels() {
      console.log("Closing data channels");
      sendChannel.close();
      console.log("Closed data channel with label: " + sendChannel.label);
      receiveChannel.close();
      console.log("Closed data channel with label: " + receiveChannel.label);
      localConnection.close();
      remoteConnection.close();
      localConnection = null;
      remoteConnection = null;
      console.log("Closed peer connections");
      startButton.disabled = false;
      sendButton.disabled = true;
      closeButton.disabled = true;
      dataChannelSend.value = "";
      dataChannelReceive.value = "";
      dataChannelSend.disabled = true;
      disableSendButton();
      enableStartButton();
    }

    function gotDescription1(desc) {
      localConnection.setLocalDescription(desc);
      console.log(`Offer from localConnection\n${desc.sdp}`);
      remoteConnection.setRemoteDescription(desc);
      remoteConnection
        .createAnswer()
        .then(gotDescription2, onCreateSessionDescriptionError);
    }

    function gotDescription2(desc) {
      remoteConnection.setLocalDescription(desc);
      console.log(`Answer from remoteConnection\n${desc.sdp}`);
      localConnection.setRemoteDescription(desc);
    }

    function getOtherPc(pc) {
      return pc === localConnection ? remoteConnection : localConnection;
    }

    function getName(pc) {
      return pc === localConnection
        ? "localPeerConnection"
        : "remotePeerConnection";
    }

    function onIceCandidate(pc, event) {
      getOtherPc(pc)
        .addIceCandidate(event.candidate)
        .then(onAddIceCandidateSuccess, onAddIceCandidateError);
      console.log(
        `${getName(pc)} ICE candidate: ${
          event.candidate ? event.candidate.candidate : "(null)"
        }`
      );
    }

    function onAddIceCandidateSuccess() {
      console.log("AddIceCandidate success.");
    }

    function onAddIceCandidateError(error) {
      console.log(`Failed to add Ice Candidate: ${error.toString()}`);
    }

    function receiveChannelCallback(event) {
      console.log("Receive Channel Callback");
      receiveChannel = event.channel;
      receiveChannel.onmessage = onReceiveMessageCallback;
      receiveChannel.onopen = onReceiveChannelStateChange;
      receiveChannel.onclose = onReceiveChannelStateChange;
    }

    function onReceiveMessageCallback(event) {
      console.log("Received Message");
      dataChannelReceive.value = event.data;
    }

    function onSendChannelStateChange() {
      const readyState = sendChannel.readyState;
      console.log("Send channel state is: " + readyState);
      if (readyState === "open") {
        dataChannelSend.disabled = false;
        dataChannelSend.focus();
        sendButton.disabled = false;
        closeButton.disabled = false;
      } else {
        dataChannelSend.disabled = true;
        sendButton.disabled = true;
        closeButton.disabled = true;
      }
    }

    function onReceiveChannelStateChange() {
      const readyState = receiveChannel.readyState;
      console.log(`Receive channel state is: ${readyState}`);
    }
  });
</script>

<div id="container">
  <h1>
    <a href="//webrtc.github.io/samples/" title="WebRTC samples homepage"
      >WebRTC samples</a
    >
    <span>Transmit text</span>
  </h1>

  <div id="buttons">
    <button id="startButton">Start</button>
    <button id="sendButton" disabled>Send</button>
    <button id="closeButton" disabled>Stop</button>
  </div>

  <div id="sendReceive">
    <div id="send">
      <h2>Send</h2>
      <textarea
        id="dataChannelSend"
        disabled
        placeholder="Press Start, enter some text, then press Send."
      />
    </div>
    <div id="receive">
      <h2>Receive</h2>
      <textarea id="dataChannelReceive" disabled />
    </div>
  </div>

  <p>View the console to see logging.</p>

  <p>
    The <code>RTCPeerConnection</code> objects <code>localConnection</code> and
    <code>remoteConnection</code> are in global scope, so you can inspect them in
    the console as well.
  </p>

  <p>
    For more information about RTCDataChannel, see <a
      href="http://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcdatachannel"
      title="RTCDataChannel section of HTML5 Rocks article about WebRTC"
      >Getting Started With WebRTC</a
    >.
  </p>

  <a
    href="https://github.com/webrtc/samples/tree/gh-pages/src/content/datachannel/basic"
    title="View source for this page on GitHub"
    id="viewSource">View source on GitHub</a
  >
</div>

<style>
  button {
    margin: 0 1em 1em 0;
    width: 90px;
  }
  div#buttons {
    margin: 0 0 1em 0;
  }
  div#send {
    margin: 0 20px 1em 0;
  }
  div#sendReceive {
    border-bottom: 1px solid #eee;
    margin: 0;
    padding: 0 0 10px 0;
  }
  div#sendReceive > div {
    display: inline-block;
    width: calc(50% - 20px);
  }

  textarea {
    color: #444;
    font-size: 0.9em;
    font-weight: 300;
    height: 7em;
    padding: 5px;
    width: calc(100% - 10px);
  }
</style>
