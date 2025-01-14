const app=require("express")()
const http=require("http").Server(app)
const {Server}=require("socket.io")


const io=new Server(http,{
    cors :{origin:"*"}
})

io.on("connection",(socket)=>
    {
        console.log("a new client just connected")
        socket.on("draw",(data)=>
            {
                console.log(data)
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
    })


app.get("/",(req,res)=>
    {
        res.send("salam")   
    })



http.listen(4000,()=>
    {
        console.log("server listenening on port 4000")
    })
