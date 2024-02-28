import { io, Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }: { children: React.ReactNode }) => {

    const [socket, setSocket] = useState<Socket | null>(null);

    const socketUrl = import.meta.env.VITE_API_URL as string || window.location.origin;

    useEffect(() => {
        const _socket = io(socketUrl.replace('http', 'ws'));
        setSocket(_socket);
    }, []);

    return (
        <SocketContext.Provider value={socket} >
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;