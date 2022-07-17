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

const roomExists = (p_room: string): boolean => {
    let exists: boolean = false;
    room.forEach((room) => {
        if (room.room === p_room) {
            exists === true;
        }
    });
    return exists;
}

app.get('/', (_req, res) => {
    res.status(200).send('Javascript Template')
});

io.on('connection', socket => {
    console.log('User ' + socket.id + ' is trying to connect')
    socket.on('sendRoom', (data) => {
        if (room[i].id.length === 2) {
            i++;
            if (roomExists(data)) {
                socket.emit('roomFull', 'Room Full!');
                room.push({
                    room: '',
                    id: []
                });
            } else {
                room.push({
                    room: data,
                    id: [socket.id]
                });
            }
        } else {
            room[i].room = data;
            room[i].id.push(socket.id);
            socket.join(data);
            console.log('User ' + socket.id + ' is connected to room: ' + room[i].room);
        }
        console.log(room);
    });
    socket.on('sendChoice', (data) => {
        socket.to(data.key).emit('receiveChoice', data);
    });
    socket.on('sendMatrix', (data) => {
        socket.to(data.key).emit('receiveMatrix', data);
    });
    socket.on('reload', (data) => {
        socket.to(data.key).emit('reload', data);
    });
    socket.on('disconnect', () => {
       console.log('User ' + socket.id + ' is disconnected');
    });
});

httpServer.listen(PORT, () => {
    console.log('Listening on PORT: ' + PORT);
});