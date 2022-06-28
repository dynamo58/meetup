import React, { useContext, useState } from "react";
import {
  Divider,
} from "@chakra-ui/react";

import { SocketContext } from "./Context";
import Header from "./components/Header";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Room from "./pages/Room";

const App: React.FC = () => {
  return (
    <>
      <Header />
      <Divider />

      <Routes>
        <Route path="/"     element={ <Home /> } />
        <Route path="/room" element={ <Room /> } />
      </Routes>
      
    </>
  );
}

export default App;
