import { useState, useEffect, useRef, useContext } from "react";
import { socket } from "../utils/socket";
import { GameContext } from "../context/GameContext";
import chat from "../assets/chat.gif";
export default function Chat({messages}) {
   // State to store chat messages
  const chatRef = useRef();
  const {game}=useContext(GameContext)
  const Sendchat = (e) => {
    if (e.keyCode !== 13) return;

    const message = e.target.value;
    socket.emit("message", {name:game.user.username,message: message });
    e.target.value = "";
  };

  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="w-[15vw] flex flex-col h-full chat-container bg-white">
      <div className="flex items-center justify-between p-2 border-b border-[#333333]" >
        <p className="font-bold text-lg">Chat</p>
        <img src={chat} alt="chat"/>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden max-h-full chat-scroll" ref={chatRef}>
        {messages.map((msg, index) => (
          <div key={index} className="flex items-center gap-2 message-bg p-1 w-full "><p className="font-bold text-sm">{msg.name} : </p><p className="text-sm">{msg.message}</p></div>
        ))}
      </div>
      <input
        placeholder="your guess ..."
        className="p-2 outline-none guess-input"
        onKeyUp={Sendchat}
      />
    </div>
  );
}
