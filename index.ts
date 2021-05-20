import express from 'express';
import cors from 'cors';
import http from 'http'
import socketio from 'socket.io';

const app = express();
app.use(cors());

const httpServer = new http.Server(app)
const io = new socketio.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.get('/', (_req, res) => {
    res.status(200).send('Javascript Template')
});

io.on('connection', socket => {
    console.log('User ' + socket.id + ' is trying to connect...')
    if (io.sockets.adapter.sids.size > 2) {
        console.log('Room Full!')
        return;
    }
    socket.join('prod');
    console.log('User ' + socket.id + ' is connected');
    socket.on('sendChoice', (data) => {
        socket.to('prod').emit('receiveChoice', data);
    });
    socket.on('sendMatrix', (data) => {
        socket.to('prod').emit('receiveMatrix', data);
    });
    socket.on('reload', (data) => {
        socket.to('prod').emit('reload', data);
    });
    socket.on('disconnect', () => {
       console.log('User ' + socket.id + ' is disconnected');
    });
});

httpServer.listen(() => {
    console.log('Listening...');
});