import {Chess, BLACK, Square, Move} from "chess.js";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Chessboard, ClearPremoves} from "react-chessboard";
import TurnsHistory from "./TurnsHistory";
import {toast} from "react-toastify";
import {
  Button, Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2 as Grid,
  Modal, Stack,
  TextField
} from "@mui/material";
import ChessClock from "./ChessClock";
import {useAppSelector} from "behavior/hooks";
import {GetUserId} from "behavior/auth/helpers";
import {socket} from "lib/socket";
import {setIn} from "formik";
import BasicColumn from "../basic/BasicColumn";

const Board = () => {
  const chessboardRef = useRef<ClearPremoves>();
  const currentRoom = useAppSelector(state => state.room.currentRoom);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [game, setGame] = useState(new Chess());

  useEffect(() => {
    function onFocus() {
      if (currentRoom) {
        socket.emit('room:getTime', {roomId: currentRoom?.id});
      }
    }

    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    }
  }, [currentRoom]);

  const isPlayer = useMemo(() => {
    const userId = GetUserId();
    return currentRoom?.whiteUserId === userId || currentRoom?.blackUserId === userId;
  }, [currentRoom?.whiteUserId, currentRoom?.blackUserId, GetUserId()]);

  const myColor = useMemo<'w' | 'b'>(() => {
    if (!currentRoom) return 'w';
    const game = new Chess();
    game.loadPgn(currentRoom.gamePGN);
    const headers = game.header();
    const userId = GetUserId();
    if (headers['White'] === userId)
      return 'w';
    else if (headers['Black'] === userId)
      return 'b';
    return 'w'
  }, [currentRoom])

  const boardOrientation = useMemo<'white' | 'black'>(() => {
    return myColor === 'w' ? 'white' : 'black';
  }, [currentRoom]);

  useEffect(() => {
    if (currentRoom && !(currentRoom.gameStatus === 'The game is still ongoing.' || currentRoom.gameStatus === '')) {
      console.log('setIsGameRunning(false)');
      setShowGameOver(true);
      setGameOverMessage(currentRoom.gameStatus);
    }
    if (currentRoom?.gameStatus === 'The game is still ongoing.') {
    }
  }, [currentRoom?.gameStatus]);

  useEffect(() => {
    console.log('currentRoom', currentRoom);
    if (currentRoom && currentRoom.gamePGN) {
      updateGamePgn(currentRoom.gamePGN);
      return;
    }
  }, [currentRoom]);

  const updateGamePgn = (pgn: string) => {
    const copy = new Chess();
    copy.loadPgn(pgn.normalize("NFD"), {strict: false});
    setGame(copy);
  };

  const validateMove = (piece: string) => {
    if (currentRoom?.gameStatus !== 'The game is still ongoing.' && currentRoom?.gameStatus !== '') {
      toast.error(`Game is over. ${currentRoom?.gameStatus}`);
      socket.close();
      return false;
    }

    if (currentRoom?.attendees.filter(at => at.isPlayer).length < 2) {
      toast.error('Opponents missing');
      return false;
    }

    if (piece[0].toLowerCase() !== myColor) {
      toast.error('You can\'t move opponents pieces');
      return false;
    }

    if (piece[0].toLowerCase() === myColor && game.turn() !== myColor) {
      toast.error('Wait for your turn');
      return false;
    }
    return true;
  }

  const onDrop = (sourceSquare: Square, targetSquare: Square, piece: string) => {
    if (!validateMove(piece))
      return false;

    const moveData = {
      from: sourceSquare,   // Source square of the piece being moved
      to: targetSquare,     // Target square of the move
      promotion: piece[1].toLowerCase(),       // Always promote to a queen for simplicity
    } as Move;
    try {
      const move = game.move(moveData);

      if (move) {
        updateGamePgn(game.pgn());
        socket.emit('room:handleMove', {roomId: currentRoom?.id, move});
        return true;
      }
      return false;
    } catch (error) {
      toast.error('Illigal move');
      return false;
    }
  };

  if (!currentRoom)
    return <></>;

  return (
    <>
      <Grid container columns={12}>
        <Grid size={3} alignItems={'center'} alignContent={'center'}>
          <ChessClock myColor={myColor} game={game}/>
        </Grid>
        <Grid size={6}>
          <BasicColumn style={{maxHeight: 600, maxWidth: 600}}>
            {currentRoom &&
                <Chessboard id="mainBoard"
                            position={game.fen()}
                            onPieceDrop={onDrop}
                            showBoardNotation
                            snapToCursor
                            arePremovesAllowed
                            isDraggablePiece={() => isPlayer}
                            boardOrientation={boardOrientation}
                />
            }
          </BasicColumn>
        </Grid>
        <Grid size={3}>
          <TurnsHistory turns={game.history({verbose: true})}/>
        </Grid>
      </Grid>
      <div>
        {game && <TextField value={game.pgn({newline: "\n"})} multiline/>}
      </div>
      {
        currentRoom &&
          <Dialog open={showGameOver}>
              <DialogTitle>Game over</DialogTitle>
              <DialogContent>
                  <DialogContentText>
                    {currentRoom.gameStatus}
                  </DialogContentText>
              </DialogContent>
              <DialogActions>
                  <Button>Rematch</Button>
                  <Button>Leave</Button>
                  <Button onClick={() => setShowGameOver(false)}>Close</Button>
              </DialogActions>
          </Dialog>
      }
    </>
  )
    ;
}

export default Board;
