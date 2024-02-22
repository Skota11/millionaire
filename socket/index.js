const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http , {cors: {
  origin: "*",
  methods: ["GET", "POST"]
}});

const crypto = require("crypto");

const data = new Map();
const roomsInviteNumber = new Map();
const roomsId = new Map();

io.on("connection", (socket) => {
    socket.on("createNewRoom" , (msg) => {
        const id = crypto.randomUUID();
        io.to(socket.id).emit("NewRoomId", {id :id});
        data.set(id , msg)
    })
    socket.on("joinRoom" , (msg) => {
        if (socket.rooms.size == 2) {
            socket.leave(Array.from(socket.rooms)[1])
        }
        socket.join(msg.roomId);
        const socketRoom = Array.from(socket.rooms)[1]
        io.to(socketRoom).emit("Join" , {username : msg.username , roomSettings : data.get(socketRoom) , id : socketRoom})
        socket.data.username = msg.username
    })
    socket.on("getInviteNumber" , (msg) => {
      const socketRoom = Array.from(socket.rooms)[1]
      if (msg == socketRoom) {
        if (roomsInviteNumber.has(msg)) {
          io.to(socket.id).emit("inviteNumber" , roomsInviteNumber.get(msg))
        } else {
            const temp = Math.floor( Math.random() * (19999 + 1 - 11000) ) + 11000
          const number = ( '' + temp ).slice( -4 )
          roomsInviteNumber.set(msg , number)
          roomsId.set(number , msg)
          
          io.to(socket.id).emit("inviteNumber" , roomsInviteNumber.get(msg))
        } 
      }
    })
    socket.on("getRoomId" , (msg) => {
      console.log(roomsId)
      console.log(msg)
      if (roomsId.has(msg.toString())) {
        io.to(socket.id).emit("roomId" , roomsId.get(msg.toString()))
      }else {
        io.to(socket.id).emit("roomId" , "invalidNumber")
      }
    })
  socket.on("disconnect", () => {
    console.log("dis")
    const socketRoom = Array.from(socket.rooms)[1]
    console.log(socketRoom)
    if (socketRoom !== undefined) {
      io.to(socketRoom).emit("Leave" , {id : socket.id , username : socket.data.username})
    }
  });
});

http.listen(10000, () => {
  console.log("listening on *:10000");
});