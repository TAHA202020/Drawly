import { useState, useEffect, useRef, useContext } from "react";
import { socket } from "../utils/socket";
import { UserContext } from "../context/UserContext";

export default function Chat() {
  const [messages, setMessages] = useState([]); // State to store chat messages
  const chatRef = useRef();
  const {user}=useContext(UserContext)
  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });
  }, []);

  const Sendchat = (e) => {
    if (e.keyCode !== 13) return; // Send on Enter key

    const message = e.target.value;
    socket.emit("message", {name:user.username,message: message }); // Emit message to the server
    setMessages((prevMessages) => [...prevMessages, { name: "Me", message }]); // Update state with new message
    e.target.value = ""; // Clear input field
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="bg-black w-[15vw] flex flex-col h-full">
      <div className="text-white p-2 border-b border-gray-600">Chat</div>
      <div className="flex-1 overflow-y-auto p-2 text-white" ref={chatRef}>
        {messages.map((msg, index) => (
          <div key={index} className="py-1">{msg.name} : {msg.message}</div>
        ))}
      </div>
      <input
        placeholder="your guess ..."
        className="p-2 border-t border-gray-600 bg-gray-800 text-white outline-none"
        onKeyUp={Sendchat}
      />
    </div>
  );
}
