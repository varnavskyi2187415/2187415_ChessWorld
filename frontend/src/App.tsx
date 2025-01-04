import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Navbar from 'components/Navbar';
import {gameRoute, homeRoute, loginRoute, registerRoute} from 'routing/constants';
import {socket} from "./lib/socket";
import {useAppDispatch, useAppSelector} from "./behavior/hooks";
import {setConnected, socketNotReady, socketReady} from "./behavior/socket/socketSlice";
import {roomCreated, setInFindGame} from "./behavior/room/roomSlice";
import {GetUserEmail, GetUserId} from "./behavior/auth/helpers";
import axios from "axios";


const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const isSocketReady = useAppSelector(state => state.socket.isSocketReady);

  function emitSetUserData(){
    const userId = GetUserId();
    const userEmail = GetUserEmail();
    socket.emit('user:setUserData', {userId, userEmail});
  }
  
  useEffect(() => {
    if (!isAuthenticated)
      return;

    function onConnect() {
      console.log("onConnect");
      setTimeout(() => emitSetUserData(), 100);
      dispatch(setConnected(true));
    }

    function onDisconnect() {
      dispatch(setConnected(false));
      dispatch(socketNotReady());
    }

    function handleRoom(message: string) {
      alert(`!handleRoom! ${message}`);
    }

    function handleRoomCreated(roomId: string) {
      console.log('roomCreated, id', roomId);
      dispatch(roomCreated(roomId));
      dispatch(setInFindGame(false));
      navigate({
        pathname: gameRoute,
        search: `?roomId=${roomId}`,
      });
      socket.close();
    }
    
    function handleUserDataSet(){
      dispatch(socketReady());
    }
    
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room', handleRoom);
    socket.on('roomCreated', handleRoomCreated)
    socket.on('userDataSet', handleUserDataSet);
    return () => {
      socket.close();
    }
  }, []);
  
  return (
    <>
      <Navbar/>
    </>
  );
};

export default App;
