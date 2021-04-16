class ChatRoomFns {
  constructor() {
    this.sockets = [];
    this.rooms = [
      {
        roomId: 1,
        roomName: "nodejs",
        participants: 0,
      },
      {
        roomId: 2,
        roomName: "reactjs",
        participants: 0,
      },
    ];
  }

  static registerUser(sock, data, sockets) {
    if (!sock.isRegistered) {
      let taken = false;
      sockets.forEach((x) => {
        console.log(x.displayName.toString(), data.slice(0, -1).toString());
        if (x.displayName.toString() === data.slice(0, -1).toString()) {
          taken = true;
        }
      });
      if (taken) {
        sock.write("Name already taken. Pick another...\n");
        return;
      }
      sock.isRegistered = true;
      sock.displayName = data.slice(0, -1);
      sock.write(
        "Name registered as " + data.toString() + "Enter a room name to join\n"
      );
    }
  }

  static broadcastToRooms(sockets, data, sock, rooms) {
    if (data.slice(0, -1).toString() === "#leave") {
      rooms.forEach((x) => {
        if (x.roomId === sock.currentRoomId) {
          x.participants -= 1;
        }
      });
      sock.currentRoomId = "NotAssigned";
      sock.write("Left the room\n");
      sock.write("Enter a room name to join\n");
      return;
    }
    sockets.forEach(function (socket, index, array) {
      if (socket !== sock) {
        if (socket.currentRoomId === sock.currentRoomId) {
          socket.write(sock.displayName + ":" + data + "\n");
        }
      } else {
        socket.write("\n");
      }
    });
  }

  static selectRoom(rooms, data, sock, sockets) {
    const [x, room] = this.checkValidRoom(rooms, data);
    if (x) {
      this.roomCheckin(sock, sockets, room);
    } else {
      this.rejectRoomJoin(data, sock);
    }
  }

  static checkValidRoom(rooms, data) {
    let res = false;
    let room = {};
    rooms.forEach((n) => {
      if (n.roomName.toString() === data.slice(0, -1).toString()) {
        res = true;
        room = n;
      }
    });
    return [res, room];
  }

  static roomCheckin(sock, sockets, room) {
    let str = sock.currentRoomId;
    sock.currentRoomId = room.roomId;
    if (typeof str !== "string") {
      sockets.push(sock);
    }
    room.participants += 1;
    sock.write("You have now joined " + room.roomName + "\n");
    sock.write("Room Statistics : ");
    sock.write(
      `Name: ${room.roomName} - Total Participants: ${room.participants}\n`
    );
  }

  static rejectRoomJoin(data, sock) {
    // console.log(data.slice(0, -1).toString(), sock.displayName.toString());
    if (data.slice(0, -1).toString() !== sock.displayName.toString()) {
      sock.write(
        "That room name wan't found. Please select a valid name to join a room\n"
      );
    }
  }
}
exports.ChatRoomFns = ChatRoomFns;
exports.fnsInstance = new ChatRoomFns();
