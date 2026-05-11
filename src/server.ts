import { WebSocketServer, WebSocket } from 'ws';
// Create a WebSocket server on port 8080.
// The "port" option makes ws create an internal HTTP server for us.
const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server listening on ws://localhost:8080');
// The "connection" event fires once per connected client.
// ws: WebSocket is the socket for THAT specific client.
wss.on('connection', (ws: WebSocket, request) => {
 const clientIp = request.socket.remoteAddress ?? 'unknown';
 console.log(`Client connected from ${clientIp}`);
 console.log(`Total clients: ${wss.clients.size}`);
 // Send a welcome message to the newly connected client.
 ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to server!' }));
 // Listen for messages FROM this client.
 ws.on('message', (data: Buffer) => {
 try {
 // Messages arrive as Buffers; parse them as JSON.
 const message = JSON.parse(data.toString());
 console.log(`Received:`, message);
 // Echo the message back to the sender.
 ws.send(JSON.stringify({ type: 'echo', payload: message }));
 } catch {
 ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
 }
 });
 // The "close" event fires when the client disconnects.
 ws.on('close', (code: number, reason: Buffer) => {
 console.log(`Client disconnected. Code: ${code}, Reason: ${reason.toString()}`);
 });
 // Handle errors on this socket.
 ws.on('error', (err: Error) => {
 console.error(`Socket error:`, err.message);
 });
});