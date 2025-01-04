import Board from 'components/room/Board';
import React, {memo, useEffect, useState} from 'react';
import {socket} from "../lib/socket";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Attendee, Room} from "../behavior/room/types";
import {useAppDispatch, useAppSelector} from "../behavior/hooks";
import {setCurrentTime, setRoomData} from "../behavior/room/roomSlice";
import {Button, ButtonGroup, Snackbar, SnackbarCloseReason} from "@mui/material";
import {homeRoute} from "../routing/constants";
import {toast} from "react-toastify";
import {Chess} from "chess.js";

const Game = () => {
  const currentRoom = useAppSelector(state => state.room.currentRoom);
  const isSocketReady = useAppSelector(state => state.socket.isSocketReady);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [drawOfferRecieved, setDrawOfferRecieved] = useState(false);
  const [isDrawAccepted, setIsDrawAccepted] = useState(false);
  

  useEffect(() => {
    socket.connect();

    function handleRoomData(room: Room) {
      dispatch(setRoomData(room));
    }

    function handleJoinedOnOtherDevice() {
      toast.info("You have joined on other device.");
      dispatch(setRoomData(null));
      navigate({
        pathname: homeRoute,
      });
      socket.close();
    }

    function handleUserJoined(user: Attendee) {
      toast.info(`User ${user.userId} joined.`);
    }
    function handleUserLeaved(user: Attendee) {
      toast.info(`User ${user.userId} leaved.`);
    }

    function handleRoomDeleted() {
      clearRoomAndNavigateHome('Room was deleted.');
    }

    function handleJoinError(error: string) {
      clearRoomAndNavigateHome(error);
    }

    function handleCurrentTime(payload: { whiteTime: number, blackTime: number }) {
      dispatch(setCurrentTime(payload));
    }
    
    function handleDrawOffer(){
      setDrawOfferRecieved(true);
    }

    function handelDrawDenied() {
      toast.info(`Draw offer denied.`);
    }
    
    socket.on('roomData', handleRoomData);
    socket.on('joinError', handleJoinError);
    socket.on('joinedOnOtherDevice', handleJoinedOnOtherDevice);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeaved', handleUserLeaved);
    socket.on('roomDeleted', handleRoomDeleted);
    socket.on('currentTime', handleCurrentTime);
    socket.on('drawPropose', handleDrawOffer);
    socket.on('drawDenied', handelDrawDenied);
  }, []);

  useEffect(() => {
    if (!isSocketReady || currentRoom) return;
    const roomId = searchParams.get('roomId');
    socket.emit('room:joinRoom', {roomId});
  }, [isSocketReady, currentRoom]);

  async function handleDeleteRoom(): Promise<void> {
    if (!currentRoom) return;
    socket.emit('room:delete', {roomId: currentRoom.id});
  }

  function clearRoomAndNavigateHome(message?: string) {
    message && toast.info(message);
    dispatch(setRoomData(null));
    navigate({
      pathname: homeRoute,
    });
  }

  function handleLeaveRoom() {
    if (!currentRoom || !isSocketReady) return;
    socket.emit('room:leaveRoom', {roomId: currentRoom.id});
    clearRoomAndNavigateHome();
    socket.close();
  }

  function handleSurrender() {
    if (!currentRoom || !isSocketReady) return;
    socket.emit("room:surrender", {roomId: currentRoom.id});
  }

  function handleDrawOffer() {
    if (!currentRoom || !isSocketReady) return;
    const game = new Chess();
    game.loadPgn(currentRoom?.gamePGN);
    if (game.moveNumber() < 2)
    {
      toast.error('Draw cannot be proposed before 2 moves made.')
      return;
    }
    socket.emit("room:handleOfferDraw", {roomId: currentRoom.id});
  }

  const handleDenyDraw = () => {
    socket.emit('room:denyDraw', {roomId: currentRoom?.id});
    console.log('denyDraw emited');
    setDrawOfferRecieved(false);
  }
  
  const OnClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (!isDrawAccepted)
      handleDenyDraw();
  };
  
  const handleAcceptDraw = () => {
    socket.emit('room:acceptDraw', {roomId: currentRoom?.id})
    console.log('acceptDraw emited');
    setDrawOfferRecieved(false);
    setIsDrawAccepted(true);
  }

  const AcceptAction = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleAcceptDraw}>
        Accept
      </Button>
      <Button color="secondary" size="small" onClick={handleDenyDraw}>
        Deny
      </Button>
    </React.Fragment>
  );
  
  return (<>
    <div>
      <ButtonGroup>
        
      <Button variant={'contained'} color={'error'} onClick={handleDeleteRoom}>Delete room</Button>
        <Button variant={'contained'} color={'error'} onClick={handleLeaveRoom}>Leave</Button>
        <Button variant={'contained'} color={'warning'} onClick={handleSurrender}>Surrender</Button>
        <Button variant={'contained'} color={'warning'} onClick={handleDrawOffer}>Propose draw</Button>
      </ButtonGroup>
      <Board/>
    </div>
    <Snackbar 
      open={drawOfferRecieved}
      autoHideDuration={6000}
      onClose={OnClose}
      action={AcceptAction}
      message={'Do you accept the draw?'}
    />
  </>)
}

export default memo(Game);