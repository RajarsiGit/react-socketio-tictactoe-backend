import express from 'express';
import cors from 'cors';
import http from 'http'
import socketio from 'socket.io';

const app = express();
app.use(cors());

const PORT: string | number = process.env.PORT || 5000;
const room: { room: string, id: string[] }[] = new Array<{room: string, id: string[]}>();
let i: number = 0;
room[i] = {
    room: '',
    id: []
};
const httpServer = new http.Server(app)
const io = new socketio.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const getRoom = (socket: {id: string}, room: { id: string[]; room: string; }[]): string[] => {
    return room.map((room) => {
        if (room.id[0] === socket.id || room.id[1] === socket.id) {
            return room.room;
        }
    });
}

app.get('/', (_req, res) => {
    res.status(200).send('Javascript Template')
});

io.on('connection', socket => {
    console.log('User ' + socket.id + ' is trying to connect...')
    if (room[i].id.length === 2) {
        i++;
        room.push({
            room: 'room_' + i.toString(),
            id: []
        });
        room[i].id.push(socket.id);
        socket.join(room[i].room);
        console.log('User ' + socket.id + ' is connected to room: ' + room[i].room);
    } else {
        room[i].room = 'room_' + i.toString();
        room[i].id.push(socket.id);
        socket.join('room_' + i.toString());
        console.log('User ' + socket.id + ' is connected to room: ' + room[i].room);
    }
    socket.on('sendChoice', (data) => {
        socket.to(getRoom(socket, room)).emit('receiveChoice', data);
    });
    socket.on('sendMatrix', (data) => {
        socket.to(getRoom(socket, room)).emit('receiveMatrix', data);
    });
    socket.on('reload', (data) => {
        socket.to(getRoom(socket, room)).emit('reload', data);
    });
    socket.on('disconnect', () => {
       console.log('User ' + socket.id + ' is disconnected');
    });
});

httpServer.listen(PORT, () => {
    console.log('Listening on PORT: ' + PORT);
});