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
        socket.on("create-room",(data)=>{
            let id=generateId()
            let room=new Room(id,socket.id)
            Rooms.set(id,room)
            socket.emit("room-created",{id:id})
            })
        socket.on("join-room",({id})=>
            {
                let room =Rooms.get(id)
                if(room)
                {
                    socket.room=room
                    socket.join(id)
                    console.log(socket.id)
                    console.log(room.owner)
                    console.log(socket.id==room.owner)
                    console.log("----------")
                    
                    socket.emit("room-info",{owner:socket.id==room.owner})
                }
                else{
                    socket.emit("invalid-room")
                }
            })
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
            socket.to(socket.room.id).emit("message",{name:socket.player_name,message:data.message})
        })
        socket.on("disconnect",()=>{
            console.log("player diconnected")
        })
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
