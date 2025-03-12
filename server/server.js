const app=require("express")()
const http=require("http").Server(app)
const {Server}=require("socket.io")
const Room =require("./Room")

const io=new Server(http,{
    cors :{origin:"*"}
})
const Rooms=new Map()
io.on("connection",(socket)=>
    {
        socket.room=null
        socket.on("create-room",(data)=>{
            if(data.room_id===null)
            {
                let id=generateId()
                let room=new Room(id,socket.id)
                Rooms.set(id,room)
                room.PlayerJoin(socket.id,data.username)
                socket.room=room
                socket.join(id)
                socket.emit("room-joined",{room_id:id, owner:true , players:Array.from(room.players.entries()), drawer:room.drawer,Word_Lenght:0,user:data.username ,gameStarted:room.gameStarted})
            }
            else if(Rooms.get(data.room_id))
            {
                let room=Rooms.get(data.room_id)
                room.PlayerJoin(socket.id,data.username)
                socket.room=room
                io.to(data.room_id).emit("player-joined",[socket.id,data.username])
                socket.join(data.room_id)
                socket.emit("room-joined",{room_id:data.room_id, owner:false , players:Array.from(room.players.entries()), drawer:room.drawer,Word_Lenght:0,user:data.username,gameStarted:room.gameStarted})
                
            }
            else
            {
                socket.emit("room-not-found")
            
            }})
        socket.on("draw",(data)=>{
        socket.broadcast.emit("draw",data)
        })
        socket.on("draw-start",(data)=>{
            socket.broadcast.emit("draw-start",data)
        })
        socket.on("draw-end",(data)=>{
            socket.broadcast.emit("draw-end",data)
        })
        socket.on("message",(data)=>{
            socket.to(socket.room.id).emit("message",{name:data.name,message:data.message})
        })
        socket.on("fill", (data) => {
            socket.broadcast.emit("fill", data);
          });
        socket.on("gameStarted", () => {
            socket.room.setGameStarted(true)
            socket.room.randomDrawer()
            io.to(socket.room.drawer).emit("words-choosing", {words:["potato","car","lighter"],gameStarted:true});
            io.to(socket.room.id).except(socket.room.drawer).emit("drawer-choosing",{gameStarted:true})
          });
          socket.on("wordChosen", (word) => {
            socket.emit("wordChosen", {word:word});
            io.to(socket.room.id).except(socket.id).emit("wordLength", {wordLenght:word.length});
          });
        socket.on("disconnect",()=>{
            if(socket.room!==null)
            {
                let newOwner=socket.room.PlayerLeave(socket.id)
                if(newOwner!==null){
                    io.to(newOwner).emit("ownership",{owner:true})
                }
                io.to(socket.room.id).emit("player-left",{playerId:socket.id})
                
                socket.room=null
            }
        })
        //gameLogic

        
    })

function generateId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }
    return id;
    }
http.listen(4000,()=>
    {
        console.log("server listenening on port 4000")
    })
