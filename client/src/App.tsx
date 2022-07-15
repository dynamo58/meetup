import React, { useEffect, useContext } from "react";
import {
  Divider,
  Flex
} from "@chakra-ui/react";

import Header from "./components/Header";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Room from "./pages/Room";
import RoomSelector from "./pages/RoomSelector";

import Modal from "./components/Modal";

import { SocketContext } from "./Context";

const App: React.FC = () => {
  const { initConnection } = useContext(SocketContext)!;

  useEffect(() => {
    initConnection();
  }, [])

  return (
    <>
      <Modal/>
      <Flex flexDir="column" minHeight="100vh">
        <Header />
        <Divider />
        <Routes>
          <Route path="/"     element={ <Home /> } />
          <Route path="/rooms" element={<RoomSelector />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </Flex>
    </>
  );
}

export default App;
