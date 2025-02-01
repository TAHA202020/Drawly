import { useEffect,useState } from "react";
import { socket } from "./socket";

export default function Timer() 
{
    
    const [time, setTime] = useState(60);
    const [timerOn, setTimerOn] = useState(false);
    useEffect(() => {
        socket.on("start-timer",()=>
            {
                setTimerOn(true)
    
            })
        let interval = null;
        if (timerOn && time >= 0) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerOn]);
    return (
        <div>
            <h1>{time}</h1>
        </div>
    );
}