import React, {memo, useEffect, useState} from 'react';
import {GetUserId} from "../behavior/auth/helpers";
import FindGame from "components/rooms/FindGame";
import ActiveGamesList from "components/rooms/ActiveGamesList";
import AllActiveGamesList from "components/rooms/AllRoomsList";
import CreateEmptyRoom from "components/rooms/CreateEmptyRoom";
import { useTimer } from "react-use-precision-timer";
import {Button} from "@mui/material";
import {socket} from "../lib/socket";


const Home = () => {
  useEffect(() => {
    socket.close();
  }, []);
  return (<>
    <div className="container">
      <FindGame />
      <CreateEmptyRoom />
      <ActiveGamesList />
      <AllActiveGamesList />
    </div>
  </>)
}

export default memo(Home);