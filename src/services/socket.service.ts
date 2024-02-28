import { Server } from "socket.io";
import { Redis } from "ioredis";
import { getRandomUserId } from "../utils/socket.utils";
import ACTIONS from "../constants/socket.actions";

// created a redis instance to keep trake for active users in memory.
const redisClient = new Redis(process.env.REDIS_URL as string);

// key for storing data into the redis
const REDIS_KEY = process.env.REDIS_KEY as string || "users";

// socket server listeners
const initializeSocketIo = (io: Server) => {
    return io.on('connection', async (socket) => {
        try {

            const users = await redisClient.smembers(REDIS_KEY);

            socket.on(ACTIONS.JOIN, async () => {
                await redisClient.sadd(REDIS_KEY, socket.id);
                const randomUserId = getRandomUserId(users, socket.id);
                if (randomUserId) {
                    io.to(randomUserId).emit(ACTIONS.JOIN, socket.id);
                    await redisClient.srem(REDIS_KEY, randomUserId, socket.id);
                };
            });

            socket.on(ACTIONS.CANDIDATE, ({ candidate, userId }) => {
                io.to(userId).emit(ACTIONS.CANDIDATE, { candidate, userId: socket.id });
            });

            socket.on(ACTIONS.OFFER, ({ offer, userId }) => {
                io.to(userId).emit(ACTIONS.OFFER, { offer, userId: socket.id });
            });

            socket.on(ACTIONS.ANSWER, ({ answer, userId }) => {
                io.to(userId).emit(ACTIONS.ANSWER, { answer, userId: socket.id });
            });

            socket?.on(ACTIONS.LEAVE, async (userId) => {
                io.to(userId).emit(ACTIONS.LEAVE, socket.id);
                await redisClient.srem(REDIS_KEY, socket.id);
            });

            socket.on("disconnect", async () => {
                io.emit(ACTIONS.LEAVE, socket.id);
                await redisClient.srem(REDIS_KEY, socket.id);
            });

        } catch (error) {
            console.error("Socket error:", error);
        }
    });

};

export default initializeSocketIo;