import { Server } from 'socket.io';

let io;
export const initSocket = (server, options) => {
  io = new Server(server, options);
  io.on('connection', (socket) => {
    socket.on('join', (room) => socket.join(room));
  });
  return io;
};

export const getIO = () => io;
