 <h1>Simple WebRTC Chat with SvelteKit and NestJS</h1>
<p>This project provides a simple chat application that uses WebRTC and Socket.io as a signaling server. The project is built using the SvelteKit and NestJS frameworks and Docker.</p>
<h2>Usage</h2>
<p>To start the server and the client, run the following command:</p>
<pre><code>make dev</code></pre>
<p>The application will be available at <a href="http://localhost:8000/chat">http://localhost:3000/chat</a>.</p>
<h2>How It Works</h2>
<p>The application uses WebRTC to establish a peer-to-peer connection between two clients, and Socket.io as a signaling server to exchange metadata and control messages between clients. The NestJS server provides the Socket.io endpoint and manages the connections between clients.</p>

