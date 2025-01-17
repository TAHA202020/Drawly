import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Lobby from './Lobby';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <Routes>
    <Route path='/:id' element={<App/>}/>
    <Route path='/' element={<Lobby/>}  />
  </Routes>
  </BrowserRouter>
);