import { WebSocketServer, WebSocket }   from "ws";

const rooms = new Map<string, Set<WebSocket>>();


function joinRoom(roomId: string, socket: WebSocket): void {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    rooms.get(roomId)!.add(socket);
}

function leaveRoom(roomId: string,  socket: WebSocket): void{
    const room= rooms.get(roomId);
    if (!room) return;
    room.delete(socket);

    if (room.size === 0) rooms.delete(roomId);
}

function broadcastToRoom(roomId: string, message:  object, exclude?:WebSocket): void{
    const room = rooms.get(roomId);
    if (!room) return;

    const data= JSON.stringify(message);
    room.forEach((client) =>{
        if (client !== exclude && client.readyState === WebSocket.OPEN){
            client.send(data);
        }
    });
}

const wss= new WebSocketServer({port: 8080});

wss.on('connection', (ws) =>{
    ws.on('message', (data) =>{
        const {action, roomId, payload}= JSON.parse(data.toString());

        if (action === 'join') {
            joinRoom(roomId,ws);
            ws.send(JSON.stringify({type: 'joined', roomId}));
        }

        if (action === 'message'){
            broadcastToRoom(roomId, {type: 'message', payload}, ws);
        }
    });
    
    ws.on('close', ()=>{
        rooms.forEach((_, roomId) => leaveRoom(roomId, ws));
    })
});


