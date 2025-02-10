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
            room.clients.set(socket.id,data.name)
            socket.join(id)
            socket.emit("room-created",{id:id})
            })
        socket.on("join-room",({room_id,username})=>
            {
                let room =Rooms.get(room_id)
                if(room)
                {
                    socket.room=room
                    room.clients.set(socket.id,username)
                    io.to(room_id).emit("player-joined",{id:socket.id,name:username})
                    socket.join(room_id)
                }
                else{
                    socket.emit("invalid-room")
                }
            })
        socket.on("get-room-info",({room_id})=>
            {
                let room =Rooms.get(room_id)
                if(room)
                {
                    socket.room=room
                    let clients =Array.from(room.clients, ([id, name]) => ({ id, name }))
                    socket.emit("room-info",{owner:socket.id==room.owner,clients: clients})
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
            socket.to(socket.room.id).emit("message",{name:socket.room.clients.get(socket.id),message:data.message})
        })
        socket.on("disconnect",()=>{
            let room =socket.room
            if(room)
            {
                let transferOwnership=socket.id==room.owner
                let new_owner=room.removeClient(socket.id)
                if(new_owner==null)
                {
                    Rooms.delete(room.id)
                }
                else
                {
                    if(transferOwnership)
                        {
                            io.to(room.owner).emit("transfer-ownership")
                        }
                        
                }
                
                socket.to(room.id).emit("player-disconnected",{id:socket.id})
            }
        })
        //game Logic in here

        socket.on("start-game",async ()=>{
            let room=socket.room
            if(!room.owner==socket.id)
            {
                return
            }
            let words=await room.getRandomWords(3)
            let drawer=room.getDrawer()
            io.to(drawer).emit("word-to-draw",{words:words})
            room.clients.forEach((name,id)=>{
                if(id!=drawer)
                {
                    io.to(id).emit("player-selecting-word",{player:name})
                }
            })
        })
        socket.on("selected-word",({word})=>{
            let room=socket.room
            room.word=word
            io.to(room.drawer).emit("permission-to-draw",{word})
            room.clients.forEach((name,id)=>{
                if(id!=room.drawer)
                {
                    io.to(id).emit("word-selected",{lenght:word.length ,round_TimeEnd:50})
                }})
            room.createTimeout(()=>{
                io.to(room.id).emit("round-end")
            },50000)
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
