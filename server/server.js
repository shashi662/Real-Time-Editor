const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const Actions = require("../client/src/Actions");
const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("../client/build"));

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});


const userSocketMap = {};
const getAllConnectedClients = (roomId) => {
  console.log(Array.from(io.sockets.adapter.rooms.get(roomId) || []));
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        userName: userSocketMap[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  socket.on(Actions.JOIN, ({ roomId, userName }) => {
    userSocketMap[socket.id] = userName;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.map(({ socketId }) => {
      io.to(socketId).emit(Actions.JOINED, { clients, userName, socketId });
    });
  });

  socket.on(Actions.CODE_CHANGE, ({ roomId, code }) => {
    socket.broadcast.emit(Actions.CODE_CHANGE, code);
  });

  socket.on(Actions.SYNC_CODE, ({ code, socketId }) => {
    io.to(socketId).emit(Actions.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.to(roomId).emit(Actions.DISCONNECTED, {
        userName: userSocketMap[socket.id],
        socketId: socket.id,
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const port = process.env.port || 5000;
server.listen(port, () => {
  console.log("Hello Peter Parker");
});
// 74a44148-1531-4566-b03e-4be40b48a3f1
