const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();

const route = require("./route");
const { addUser, findUser, getRoomUsers, removeUser, updateUserTypingStatus } = require("./users");

app.use(cors({ origin: "*" }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }) => {
    socket.join(room);

    const { user, isExist } = addUser({ name, room });

    const userMessage = isExist
      ? `${user.name}, ты вернулся`
      : `Привет ${user.name}`;

    socket.emit("message", {
      data: { user: { name: "Админ" }, message: userMessage },
    });

    socket.broadcast.to(user.room).emit("message", {
      data: { user: { name: "Админ" }, message: `${user.name} присоединился` },
    });

    io.to(user.room).emit("room", {
      data: { users: getRoomUsers(user.room) },
    });
  });

  socket.on("sendMessage", ({ message, params }) => {
    const user = findUser(params);

    if (user) {
      io.to(user.room).emit("message", { data: { user, message } });
    }
  });

  socket.on("leftRoom", ({ params }) => {
    const user = removeUser(params);

    if (user) {
      const { room, name } = user;

      io.to(room).emit("message", {
        data: { user: { name: "Admin" }, message: `${name} покинул комнату` },
      });

      io.to(room).emit("room", {
        data: { users: getRoomUsers(room) },
      });
    }
  });

  socket.on("typing", (user) => {
    // Отправляем информацию о наборе текста всем участникам чата
    socket.broadcast.emit("userTyping", user);
  });
  
  socket.on("stopTyping", (user) => {
    // Отправляем информацию о завершении набора текста всем участникам чата
    socket.broadcast.emit("userStopTyping", user);
  });
  

  

  io.on("disconnect", () => {
    console.log("Сервер выключен");
  });
});

server.listen(5000, () => {
  console.log("Сервер запущен");
});