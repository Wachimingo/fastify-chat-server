import Fastify from "fastify";
import { Message } from "./interfaces/message";

const server = Fastify();

let users: string[] = [];

await server.register(import("@fastify/cors"), {
  origin: false
});

await server.register(import("fastify-socket.io"), {
  cors: {
    origin: "*"
  }
});
server.io.on("connection", (socket: any) => {
  socket.on("newUser", (userName: string) => {
    const user = `${userName}_${socket.id}`;
    if (users.indexOf(user) < 0) users.push(user);
    console.log(users);
    socket.emit("newUserResponse", users);
  });

  socket.on("message", (data: Message) => {
    socket.emit("messageResponse", data);
    socket.broadcast.emit("messageResponse", data);
  });

  socket.on("changeUserName", (data: any) => {
    const oldUser = `${data.oldUserName}_${socket.id}`;
    const index = users.indexOf(oldUser);
    if (index < 0) {
      users[index] = `${data.userName}_${socket.id}`;
    }
    socket.emit("newUserResponse", users);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    users = users.filter((user: string) => user.split("_")[1] !== socket.id);
    console.log(users);
    socket.emit("newUserResponse", users);
    socket.disconnect();
  });
});

// await server.register(async (server: any) => {
//   server.get("/", (req: any, res: any) => {
//     server.io.send("Hello");
//   });
// });

server.listen({ port: 3000, host: "0.0.0.0" } as any, (error, address) => {
  if (error) {
    console.log(
      `\x1b[31m Caught following error initializing fastify server:\x1b[0m ${error}`
    );
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
