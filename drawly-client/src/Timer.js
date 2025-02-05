import { useContext, useEffect,useState } from "react";
import { TimerContext } from "./App";

export default function Timer() 
{
    
    const timerContext=useContext(TimerContext)
    useEffect(() => {
        let interval = null;
        if (timerContext.time > 0) {
            interval = setInterval(() => {
                timerContext.setTime((prevTime) => {
                    if(prevTime==1)
                    {
                        timerContext.timercallback()
                    }
                    return prevTime - 1});
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerContext.time]);
    return (<>
    {timerContext.time>0 && <h1>{timerContext.time}</h1>}
    </>
    );
}