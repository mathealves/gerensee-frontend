import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000';

export function createBoardSocket(projectId: string, token?: string): Socket {
  const socket = io(WS_URL, {
    autoConnect: true,
    transports: ['websocket'],
    auth: token ? { token: `Bearer ${token}` } : undefined,
  });

  socket.on('connect', () => {
    socket.emit('joinBoard', { projectId });
  });

  return socket;
}
