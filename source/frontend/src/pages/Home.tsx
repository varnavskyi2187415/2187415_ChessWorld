import React, {memo, useEffect, useState} from 'react';
import {GetUserId} from "../behavior/auth/helpers";
import FindGame from "components/rooms/FindGame";
import ActiveGamesList from "components/rooms/ActiveGamesList";
import AllActiveGamesList from "components/rooms/AllRoomsList";
import CreateEmptyRoom from "components/rooms/CreateEmptyRoom";
import {useTimer} from "react-use-precision-timer";
import {Button, Grid2 as Grid} from "@mui/material";
import {socket} from "../lib/socket";


const Home = () => {
  useEffect(() => {
    socket.close();
  }, []);
  return (<>
    <div className="container">
      <Grid container columns={12} direction={'row'} marginTop={'50px'} marginBottom={'50px'}>
        <Grid size={3}>
          <FindGame/>
        </Grid>
        <Grid size={7}>
        </Grid>
        <Grid size={2} alignContent={'center'} alignItems={'center'}>
          <CreateEmptyRoom/>
        </Grid>
      </Grid>
      <ActiveGamesList/>
      <AllActiveGamesList/>
    </div>
  </>)
}

export default memo(Home);