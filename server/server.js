const app=require("express")()
const http=require("http").Server(app)
const {Server}=require("socket.io")
const Room =require("./Room")
const { clear } = require("console")

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
                socket.emit("room-joined",{round_counter:0,number_of_rounds:room.NumberOfRounds,room_id:id, owner:true , players:Array.from(room.players.entries()), drawer:room.drawer,user:data.username ,gameStarted:room.gameStarted, drawerChoosing:room.wordtoDraw===null,wordLenght:room.wordtoDraw?room.wordtoDraw.length:null, wordchoosingTime:room.wordChoosingTime,roundTime:room.roundTime})
            }
            else if(Rooms.get(data.room_id))
            {
                let room=Rooms.get(data.room_id)
                room.PlayerJoin(socket.id,data.username)
                socket.room=room
                socket.to(data.room_id).emit("player-joined",[socket.id,data.username])
                socket.join(data.room_id)
                socket.emit("room-joined",{round_counter:0,number_of_rounds:room.NumberOfRounds,room_id:data.room_id, owner:false , players:Array.from(room.players.entries()), drawer:room.drawer,user:data.username,gameStarted:room.gameStarted, drawerChoosing:room.wordtoDraw===null,wordLenght:room.wordtoDraw?room.wordtoDraw.length:null,wordchoosingTime:room.wordChoosingTime,roundTime:room.roundTime})
                
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
            let room=socket.room
            if(room.wordtoDraw)
            {
                if(data.message.toLowerCase()===room.wordtoDraw.toLowerCase())
                {
                    io.to(room.id).emit("message",{name:"Server",message:`${data.name} guessed the word`})
                    room.guessedRight()
                    if(room.playerGuessed===room.players.size-1)
                    {
                        if(room.NextRound()){
                            endRound(io,room)
                    }
                    }
                }
            }

            socket.to(socket.room.id).emit("message",{name:data.name,message:data.message})
        })
        socket.on("fill", (data) => {
            socket.broadcast.emit("fill", data);
          });
        socket.on("gameStarted", () => {
            socket.room.setGameStarted(true)
            socket.room.randomDrawer()
            io.to(socket.room.drawer).emit("words-choosing", {words:socket.room.wordstoChoose,gameStarted:true});
            io.to(socket.room.id).except(socket.room.drawer).emit("drawer-choosing",{gameStarted:true});
            socket.room.wordChoosingTimer=setInterval(() => {
                if(socket.room.wordChoosingTime===0)
                {
                    clearInterval(socket.room.wordChoosingTimer)
                    socket.room.wordChoosingTime=10
                    socket.room.wordtoDraw=socket.room.wordstoChoose[0]
                    io.to(socket.room.drawer).emit("wordChosen", {word:socket.room.wordstoChoose[0]});
                    io.to(socket.room.id).except(socket.room.drawer).emit("wordLength", {wordLenght:socket.room.wordtoDraw.length});
                    socket.wordstoChoose=[]
                }
                socket.room.wordChoosingTime--;
                io.to(socket.room.id).emit("word-timer",{time:socket.room.wordChoosingTime});
                
                
            },1000)
        });
          socket.on("wordChosen", (word) => {
            let room = socket.room;
            console.log("interval cleared")
            clearInterval(room.wordChoosingTimer)
            room.wordChoosingTimer=null
            room.wordtoDraw=word
            socket.emit("wordChosen", {word:word});
            io.to(room.id).except(socket.id).emit("wordLength", {wordLenght:word.length});
            startRound(io,room) 
          });
        socket.on("disconnect",()=>{
            if(socket.room!==null)
            {
                let newOwner=socket.room.PlayerLeave(socket.id)
                if(newOwner!==null){
                    io.to(newOwner).emit("ownership",{owner:true})
                }
                io.to(socket.room.id).emit("player-left",{playerId:socket.id})
            }
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

function startRound(io,room)
{
    room.roundTime=201
    room.roundTimer=setInterval(() => {
        if(room.roundTime===0)
        {
            clearInterval(room.roundTimer)
            if(room.NextRound()){
                endRound(io,room)
        }
        }
        room.roundTime--;
        io.to(room.id).emit("round-timer",{time:room.roundTime});
        

    },1000)

}


function endRound(io,room)
{
    clearInterval(room.roundTimer)
    room.roundCounter++
    room.roundTime=0
    room.randomDrawer()
    io.to(room.drawer).emit("words-choosing", {words:room.wordstoChoose,round_counter:room.roundCounter});
    io.to(room.id).except(room.drawer).emit("drawer-choosing",{round_counter:room.roundCounter});
    room.wordChoosingTimer=setInterval(() => {
        if(room.wordChoosingTime===0)
        {
            clearInterval(room.wordChoosingTimer)
            room.wordChoosingTime=10
            room.wordtoDraw=room.wordstoChoose[0]
            io.to(room.drawer).emit("wordChosen", {word:room.wordstoChoose[0]});
            io.to(room.id).except(room.drawer).emit("wordLength", {wordLenght:room.wordtoDraw.length});
            room.wordstoChoose=[]
            startRound(io,room)
        }
        
        room.wordChoosingTime--;
        io.to(room.id).emit("word-timer",{time:room.wordChoosingTime});
        
    },1000)
}


http.listen(4000,()=>
    {
        console.log("server listenening on port 4000")
    })
