import "dotenv/config";
import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import initializeSocketIo from "./services/socket.service";

// constants declaration
const app = express();
const PORT = Number(process.env.PORT) || 8000;
const httpServer = http.createServer(app);

// socket server initialised.
const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CORS_ORIGIN as string || "*",
        credentials: true
    }
});

// created pub-sub redis clients for socket scalibility.
const pubClient = new Redis(process.env.REDIS_URL as string);
const subClient = pubClient.duplicate();

// attach pub-sub client to socket server using redis adapter.
io.adapter(createAdapter(pubClient, subClient));

// middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN as string || "*",
    credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// server static assets
app.use(express.static('client/dist'));

// listening for socket events.
initializeSocketIo(io);

// initial route 
app.get('/*', (_, res) => {
    return res.sendFile(path.resolve('client/dist/index.html'));
});

// listening for http server.
httpServer.listen(PORT, () => console.log(`server started at - http://localhost:${PORT}`));