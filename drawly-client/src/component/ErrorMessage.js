import { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";

export default function ErrorMessage()
{
    const [errorMessage, setErrorMessage] = useState({ message: "" });
    const messageRef = useRef(null);
    useEffect(() => {
        socket.on("error", ({ message }) => {
            setErrorMessage((prevState) => ({
              ...prevState,
              message: message,
            }));
          });
        if (messageRef.current) {
          messageRef.current.style.animation = "none"; 
          void messageRef.current.offsetWidth;
          messageRef.current.style.animation = "slideDownFadeOut 4s ease-in-out forwards";
        }
      }, [errorMessage]);
    if(errorMessage.message==="")
        return null
    return(<div ref={messageRef} className="error-message">
        {errorMessage.message}
    </div>)
}