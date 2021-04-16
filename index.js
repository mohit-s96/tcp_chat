const net = require("net");

const { ChatRoomFns, fnsInstance } = require("./functions/handlers");

const server = net.createServer();
server.listen(3000, "localhost", () => {
  console.log("TCP Server is running on port " + 3000 + ".");
});

server.on("connection", function (sock) {
  console.log("CONNECTED: " + sock.remoteAddress + ":" + sock.remotePort);

  sock.write(
    "Welcome to FChat - Enter a name in the following prompt to register\n"
  );

  sock.on("data", function (data) {
    ChatRoomFns.registerUser(sock, data, fnsInstance.sockets);
    if (typeof sock.currentRoomId === "number") {
      ChatRoomFns.broadcastToRooms(
        fnsInstance.sockets,
        data,
        sock,
        fnsInstance.rooms
      );
    } else {
      ChatRoomFns.selectRoom(
        fnsInstance.rooms,
        data,
        sock,
        fnsInstance.sockets
      );
    }
  });
  sock.on("end", () => {
    fnsInstance.removeFromPool(sock);
  });
});
