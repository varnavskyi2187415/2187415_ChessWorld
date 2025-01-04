import React, {useState, useEffect, forwardRef, useImperativeHandle} from "react";
import {useTimer} from "react-use-precision-timer";
import {Card} from "@mui/material";
import {Chess} from "chess.js";
import {Room} from "../../behavior/room/types";
import {useAppSelector} from "../../behavior/hooks";
import {socket} from "../../lib/socket";

interface ChessClockProps {
  myColor: 'w' | 'b',
  game: Chess,
}

const ChessClock = ({myColor, game}: ChessClockProps) => {
  const currentTime = useAppSelector(state => state.room.currentTime);
  const currentRoom = useAppSelector(state => state.room.currentRoom);

  const [whiteTime, setWhiteTime] = useState(300);
  const [blackTime, setBlackTime] = useState(300);

  useEffect(() => {
    if (!currentRoom) return;

    if (currentRoom.gameStatus !== 'The game is still ongoing.')
      return;

    console.log('currentRoom.gameStatus', currentRoom.gameStatus);
    const timer = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime((time) => Math.max(0, time - 1));
      } else {
        setBlackTime((time) => Math.max(0, time - 1));
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    }
  }, [game.turn(), currentRoom?.gameStatus]);

  // useEffect(() => {
  //   setInterval(() => {
  //     socket.emit('room:getTime', {roomId: currentRoom?.id});
  //   }, 10000)
  // }, [currentRoom]);

  useEffect(() => {
    console.log('currentTime BOARD', currentTime);
    setWhiteTime(currentTime.whiteTime);
    setBlackTime(currentTime.blackTime);
  }, [currentTime]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(Math.trunc(time) / 60);
    const seconds = time % 60;
    return `${minutes}:${Math.trunc(seconds).toString().padStart(2, '0')}`;
  };

  const whiteRow = (
    <div style={{
      background: game.turn() === 'w' ? "#a6c2ff" : "transparent"
    }}>
      <h4>White {currentRoom?.whiteUserId}</h4>
      <p>{formatTime(whiteTime)}</p>
    </div>
  );

  const blackRow = (
    <div style={{
      background: game.turn() === 'b' ? "#a6c2ff" : "transparent"
    }}>
      <h4>Black {currentRoom?.blackUserId}</h4>
      <p>{formatTime(blackTime)}</p>
    </div>
  );

  return (
    <Card>
      {myColor === 'b' ?
        <>
          {whiteRow}
          {blackRow}
        </> :
        <>
          {blackRow}
          {whiteRow}
        </>}

    </Card>
  )
};

export default ChessClock;
