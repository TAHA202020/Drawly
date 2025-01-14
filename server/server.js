const app=require("express")()
const http=require("http").Server(app)
const {Server}=require("socket.io")


const io=new Server(http,{
    cors :{origin:"*"}
})

io.on("connection",(socket)=>
    {
        socket.broadcast.emit("player-connected")
        socket.player_name=getRandomName()
        socket.on("draw",(data)=>
            {
                socket.broadcast.emit("draw",data)
            })
        socket.on("draw-start",(data)=>
            {
                socket.broadcast.emit("draw-start",data)
            })
        socket.on("draw-end",(data)=>
            {
                socket.broadcast.emit("draw-end",data)
        })
        socket.on("message",(data)=>{
            socket.broadcast.emit("message",{name:socket.player_name,message:data.message})
        })

        socket.on("disconnect",()=>
            {
                console.log("player diconnected")
            })
    })

function getRandomName() {
        const names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hannah", "Isaac", "Jack"];
        const randomIndex = Math.floor(Math.random() * names.length);
        return names[randomIndex];
}
http.listen(4000,()=>
    {
        console.log("server listenening on port 4000")
    })
