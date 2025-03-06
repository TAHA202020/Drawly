import Game from './component/Game';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Lobby from './component/Lobby';
import { UserProvider } from './context/UserContext';
import { GameContextProvider } from './context/GameContext';
export default function App() 
{
    return (
    <UserProvider>
      <GameContextProvider>
        <BrowserRouter>
            <Routes>
              <Route path='/:id' element={<Game/>}/>
              <Route path='/' element={<Lobby/>}  />
            </Routes>
      </BrowserRouter>
      </GameContextProvider>
    </UserProvider>
    
    );
}