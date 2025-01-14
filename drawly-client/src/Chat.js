import { useEffect, useRef } from "react"
import { socket } from "./socket"

export default function Chat()
{
    const chatRef=useRef()
    useEffect(()=>
        {
            socket.on("message",(data)=>
                {
                    let element =document.createElement("div")
                    element.innerText=data.name+" : "+data.message
                    chatRef.current.append(element)
                })
        }
    ,[])
    const Sendchat=(e)=>
        {
            if(!(e.keyCode==13))
                return
            socket.emit("message",({message:e.target.value}))
            let element =document.createElement("div")
            element.innerText="Me : "+e.target.value
            chatRef.current.append(element)
            e.target.value=""
            
        }
    return(<div className="bg-black w-[15vw] flex justify-start items-stretch flex-col">
        <div className="text-white">
            Chat
        </div>
        <div className="flex-1">
            <div className="overflow-y-scroll h-full text-white" ref={chatRef}>
                <div>fezfz</div>
                <div>fezfz</div>
                <div>fezfz</div>
                <div>fezfz</div>
                <div>fezfz</div>
                <div>fezfz</div>
                <div>fezfz</div>
                <div>fezfz</div>
                <div>fezfz</div>
                <div>fezfz</div>
            </div>
        </div>
        <input  placeholder="your guess ..." onKeyUp={Sendchat}/>
    </div>)
}