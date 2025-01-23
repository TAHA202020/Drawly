import { createContext, useState } from 'react';
import App from './App';
import Lobby from './Lobby';
import {BrowserRouter, Route, Routes} from "react-router-dom"



export const userNameContext=createContext("")

export default function AppRoutes()
{
    const [userName,setUsername]=useState("")
    return (
        <BrowserRouter>
        <userNameContext.Provider value={{userName,setUsername}}>
        <Routes>
            <Route path='/:id' element={<App/>}/>
            <Route path='/' element={<Lobby/>}  />
        </Routes>
        </userNameContext.Provider>
        </BrowserRouter>
    )
}