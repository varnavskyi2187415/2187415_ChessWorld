import Board from 'components/room/Board';
import React, {memo, useEffect} from 'react';
import {socket} from "../lib/socket";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Attendee, Room} from "../behavior/room/types";
import {useAppDispatch, useAppSelector} from "../behavior/hooks";
import {setCurrentTime, setRoomData} from "../behavior/room/roomSlice";
import {Button, ButtonGroup} from "@mui/material";
import {DeleteRoomApiRoute} from "../behavior/apiConstants";
import axios from "axios";
import {gameRoute, homeRoute} from "../routing/constants";
import {toast} from "react-toastify";

const Game = () => {
  const currentRoom = useAppSelector(state => state.room.currentRoom);
  const isSocketReady = useAppSelector(state => state.socket.isSocketReady);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  

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

    
    socket.on('roomData', handleRoomData);
    socket.on('joinError', handleJoinError);
    socket.on('joinedOnOtherDevice', handleJoinedOnOtherDevice);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeaved', handleUserLeaved);
    socket.on('roomDeleted', handleRoomDeleted);
    socket.on('currentTime', handleCurrentTime);
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

  function handlePauseRoom() {
    if (!currentRoom || !isSocketReady) return;
    socket.emit("room:pauseRoom", {roomId: currentRoom.id});
  }

  return (<>
    <div>
      <ButtonGroup>
        
      <Button variant={'contained'} color={'error'} onClick={handleDeleteRoom}>Delete room</Button>
        <Button variant={'contained'} color={'error'} onClick={handleLeaveRoom}>Leave</Button>
        <Button variant={'contained'} color={'warning'} onClick={handlePauseRoom}>Pause</Button>
        <Button variant={'contained'} color={'warning'} onClick={handlePauseRoom}>Propose draw</Button>
      </ButtonGroup>
      <Board/>
    </div>

  </>)
}

export default memo(Game);