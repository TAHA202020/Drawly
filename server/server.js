const app=require("express")()
const http=require("http").Server(app)
const {Server}=require("socket.io")
const Room =require("./Room")
const port =process.env.PORT || 4000
const io=new Server(http,{
    cors :{origin:"*"}
})
const Rooms=new Map()
io.on("connection",(socket)=>
    {
        /*Room Logic*/
        socket.room=null
        socket.on("create-room",(data)=>{
            if(data.username===""){
                socket.emit("error",{message:"Please enter a Name a Zebi"})
                return
            }
            if(data.room_id===null)
            {
                let id=generateId()
                let room=new Room(id,socket.id)
                Rooms.set(id,room)
                room.PlayerJoin(socket.id,data.username)
                socket.room=room
                socket.join(id)
                socket.emit("room-joined",{roundCounter:room.roundCounter,number_of_rounds:room.NumberOfRounds,room_id:id, owner:true , players:room.getPlayersArray(), drawer:room.drawer&&{id:room.drawer,username:room.players.get(room.drawer).username.username},user:{id:socket.id,username:data.username} ,gameStarted:room.gameStarted, drawerChoosing:room.drawerChoosing,wordLenght:room.wordtoDraw?room.wordtoDraw.length:null, wordchoosingTime:room.wordChoosingTime,roundTime:room.roundTime,showingPlayerPoints:false,showingRoundCounter:false, playerPoints:null})
            }
            else if(Rooms.get(data.room_id))
            {
                let room=Rooms.get(data.room_id)
                if(room.maxPlayers==room.players.size)
                    {
                        socket.emit("error",{message:"The Game is Full "})
                        return
                    }
                room.PlayerJoin(socket.id,data.username)
                socket.room=room
                socket.to(data.room_id).emit("player-joined",[socket.id,data.username,0])
                socket.join(data.room_id)
                socket.emit("room-joined",{roundCounter:room.roundCounter,number_of_rounds:room.NumberOfRounds,room_id:data.room_id, owner:false , players:room.getPlayersArray(), drawer:room.drawer&&{id:room.drawer,username:room.players.get(room.drawer).username.username},user:{id:socket.id,username:data.username} ,gameStarted:room.gameStarted, drawerChoosing:room.drawerChoosing,wordLenght:room.wordtoDraw?room.wordtoDraw.length:null,wordchoosingTime:room.wordChoosingTime,roundTime:room.roundTime,showingPlayerPoints:room.showingPlayerPoints,showingRoundCounter:room.showingRoundCounter, playerPoints:room.showingPlayerPoints?room.getRoundPoints():null})
                
            }
            else
            {
                socket.emit("error",{message:"Room Not Found"})
            
            }})
        socket.on("max-players",({maxPlayers})=>
            {
                socket.room.maxPlayers=maxPlayers
            })
        socket.on("round-timer",({roundTimer})=>
            {
                socket.room.maxRoundTimer=roundTimer
            })
        socket.on("word-timer",({wordtimer})=>
            {
                socket.room.maxWordPickingTimer=wordtimer
            })
            socket.on("max-rounds",({maxRounds})=>
            {
                socket.room.NumberOfRounds=maxRounds
            })
        /*Canvas Events*/
        socket.on("draw",(data)=>{
            let room =socket.room
            socket.to(room.id).emit("draw",data)
        })
        socket.on("draw-start",(data)=>{
            let room =socket.room
            if(socket.id!==room.drawer)
                return
            socket.to(room.id).emit("draw-start",data)
        })
        socket.on("draw-end",(data)=>{
            let room =socket.room
            if(socket.id!==room.drawer)
                return
            socket.to(room.id).emit("draw-end",data)
        })
        socket.on("fill", (data) => {
            let room =socket.room
            if(socket.id!==room.drawer)
                return
            socket.to(room.id).emit("fill", data);
          });
        socket.on("clear-canvas",()=>{
            let room=socket.room
            if(socket.id!==room.drawer)
                return
            io.to(socket.room.id).except(socket.id).emit("clear-canvas")
        })



        /*Guesses Logic*/
        socket.on("message",async (data)=>{
            let room=socket.room
            if(room.wordtoDraw)
            {
                if(data.message.toLowerCase()===room.wordtoDraw.toLowerCase())
                {
                    if(socket.id==room.drawer)
                        return
                    let points=room.guessedRight(socket.id)
                    if(points===null)
                        return
                    io.to(room.id).emit("message",{name:"Server",message:`${data.name} guessed the word`,points:points,id:socket.id,color:"green-msg"})
                    
                    if(room.playerGuessed===room.players.size-1)
                    { 
                        room.wordtoDraw=null
                        room.showingPlayerPoints=true
                        io.to(room.id).emit("players-points",room.getRoundPoints())
                        let isnotcanceled=await delay(5000,room.abortController.signal)
                        if(!isnotcanceled)
                            return
                        room.showingPlayerPoints=false
                        if(room.nextTurn()){
                            startNewTurn(io,room)
                        }
                        else if(room.NextRound())
                        {
                            room.startRound()
                            io.to(room.id).emit("new-round",{roundCounter:room.roundCounter})
                            let isnotcanceled=await delay(5000,room.abortController.signal)
                            if(!isnotcanceled)
                                return
                            this.showingRoundCounter=false
                            startNewTurn(io,room)
                        }
                        else
                        {
                            room.resetRoom()
                            io.to(room.id).emit("end-game")
                            
                        }
                    }
                    return
                }
            }

            io.to(room.id).emit("message",{name:data.name,message:data.message})
        })



        /*Game Logic*/
        socket.on("gameStarted",async () => {
            let room=socket.room
            if(room.players.size<=1)
            {
                socket.emit("error",{message:"can't start the game with one player"})
                return ;
            }
            room.setGameStarted(true)
            room.startRound()
            io.to(room.id).emit("new-round",{roundCounter:room.roundCounter ,gameStarted:true})
            let isnotcanceled=await delay(5000,room.abortController.signal)
            if(!isnotcanceled)
            return
            room.showingRoundCounter=false
            room.nextDrawer()
            io.to(socket.room.drawer).emit("words-choosing", {words:socket.room.wordstoChoose,gameStarted:true ,drawer:{id:room.drawer,username:room.players.get(room.drawer).username.username},maxWordPickingTimer:room.maxWordPickingTimer});
            io.to(socket.room.id).except(socket.room.drawer).emit("drawer-choosing",{gameStarted:true,drawer:{id:room.drawer,username:room.players.get(room.drawer).username.username},maxWordPickingTimer:room.maxWordPickingTimer});
            room.wordChoosingTime=room.maxWordPickingTimer
            room.wordChoosingTimer=setInterval(() => {
                if(room.wordChoosingTime===0)
                {
                    clearInterval(room.wordChoosingTimer)
                    room.wordtoDraw=room.wordstoChoose[0]
                    room.drawerChoosing=false
                    io.to(room.drawer).emit("wordChosen", {word:room.wordstoChoose[0],roundmaxTimer:room.maxRoundTimer});
                    io.to(room.id).except(room.drawer).emit("wordLength", {wordLenght:room.wordtoDraw.length,roundmaxTimer:room.maxRoundTimer});
                    startTurnTimer(io,room)
                }
                room.wordChoosingTime--;
                io.to(room.id).emit("word-timer",{time:room.wordChoosingTime});
                
                
            },1000)
        }); 
          socket.on("wordChosen", (word) => {
            let room = socket.room;
            clearInterval(room.wordChoosingTimer)
            room.wordChoosingTimer=null
            room.wordtoDraw=word
            room.drawerChoosing=false
            socket.emit("wordChosen", {word:word,roundmaxTimer:room.maxRoundTimer});
            io.to(room.id).except(socket.id).emit("wordLength", {wordLenght:word.length,roundmaxTimer:room.maxRoundTimer});
            startTurnTimer(io,room) 
          });
        socket.on("disconnect",async ()=>{
            let room=socket.room
            if(room!==null)
            {
                let newOwner=room.PlayerLeave(socket.id)
                
                if(room.players.size==0){
                    clearInterval(room.roundTimer)
                    clearInterval(room.wordChoosingTimer)
                    Rooms.delete(room.id)
                    return 
                }
                if(newOwner!==null){
                    io.to(newOwner).emit("ownership",{owner:true})
                }
                if(room.players.size<2)
                {
                    room.resetRoom()
                    io.to(room.id).emit("end-game")
                    
                }
                io.to(room.id).emit("player-left",{playerId:socket.id})
                if(room.drawer===socket.id)
                {
                    clearInterval(room.wordChoosingTimer)
                    clearInterval(room.roundTimer)
                    room.wordtoDraw=null
                    room.drawerChoosing=true
                    room.wordChoosingTime=0
                    room.wordChoosingTimer=null
                    room.roundTime=0
                    room.roundTimer=null;
                    room.abortController.abort()
                    room.abortController=new AbortController()
                    room.showingPlayerPoints=true
                    io.to(room.id).emit("players-points",room.emptyPlayerPoints())
                    await delay(5000,room.abortController.signal)
                    let isnotcanceled=await delay(5000,room.abortController.signal)
                    if(!isnotcanceled)
                        return
                    room.showingPlayerPoints=false
                    if(room.nextTurn()){
                        startNewTurn(io,room)
                    }
                    else if(room.NextRound())
                    {
                        room.startRound()
                        io.to(room.id).emit("new-round",{roundCounter:room.roundCounter})
                        let isnotcanceled=await delay(5000,room.abortController.signal)
                        if(!isnotcanceled)
                            return
                        room.showingRoundCounter=false
                        startNewTurn(io,room)
                    }
                    else
                    {
                        io.to(room.id).emit("end-game")
                        room.resetRoom()
                    }
                }
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
    function delay(ms, signal) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(true), ms);
    
            if (signal) {
                signal.addEventListener("abort", () => {
                    clearTimeout(timeout);
                    resolve(false);
                });
            }
        });
    }
function startTurnTimer(io,room)
{
    room.roundTime=room.maxRoundTimer
    room.roundTimer=setInterval(async () => {
        if(room.roundTime===0)
        {
            clearInterval(room.roundTimer)
            room.wordtoDraw=null
            room.showingPlayerPoints=true
            io.to(room.id).emit("players-points",room.getRoundPoints())
            let isnotcanceled=await delay(5000,room.abortController.signal)
            if(!isnotcanceled)
            return
            room.showingPlayerPoints=false
            if(room.nextTurn()){
                startNewTurn(io,room)
            }
            else if(room.NextRound())
            {
                room.startRound()
                io.to(room.id).emit("new-round",{roundCounter:room.roundCounter})
                let isnotcanceled=await delay(5000,room.abortController.signal)
                if(!isnotcanceled)
                    return
                room.showingRoundCounter=false
                startNewTurn(io,room)
            }
            else
            {
                io.to(room.id).emit("end-game")
                room.resetRoom()
            }
            
        }
        room.roundTime--;
        io.to(room.id).emit("round-timer",{time:room.roundTime});
        

    },1000)

}


function startNewTurn(io,room)
{
    clearInterval(room.roundTimer)
    room.roundTimer=null;
    room.roundTime=0;
    room.PlayerPoints=new Map()
    room.nextDrawer()
    io.to(room.drawer).emit("words-choosing", {words:room.wordstoChoose,round_counter:room.roundCounter,drawer:{id:room.drawer,username:room.players.get(room.drawer).username},maxWordPickingTimer:room.maxWordPickingTimer});
    io.to(room.id).except(room.drawer).emit("drawer-choosing",{round_counter:room.roundCounter,drawer:{id:room.drawer,username:room.players.get(room.drawer).username},maxWordPickingTimer:room.maxWordPickingTimer});
    room.wordChoosingTime=room.maxWordPickingTimer
    room.wordChoosingTimer=setInterval(() => {
        if(room.wordChoosingTime===0)
        {
            clearInterval(room.wordChoosingTimer)
            room.wordChoosingTime=room.maxWordPickingTimer
            room.wordtoDraw=room.wordstoChoose[0]
            room.drawerChoosing=false
            io.to(room.drawer).emit("wordChosen", {word:room.wordstoChoose[0]});
            io.to(room.id).except(room.drawer).emit("wordLength", {wordLenght:room.wordtoDraw.length});
            room.wordstoChoose=[]
            startTurnTimer(io,room)
        }
        
        
        io.to(room.id).emit("word-timer",{time:room.wordChoosingTime});
        room.wordChoosingTime--;
        
    },1000)
}


http.listen(port,()=>
    {
        console.log("server listenening on port 4000")
    })
