import { Chess, BLACK, Square, Move } from "chess.js";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { Chessboard, ClearPremoves } from "react-chessboard";
import { toast } from "react-toastify";

const Board = () => {
  const chessboardRef = useRef<ClearPremoves>();
  const [game, setGame] = useState(new Chess());
  const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout>();
  const currentTurn = game.turn();

  const updateGame = (chess: Chess) => {
    const copy = new Chess();
    copy.loadPgn(chess.pgn());
    setGame(copy);
  };

  useEffect(() => {
    if (currentTurn === BLACK) {

      const makeRandomMove = () => {
        const possibleMoves = game.moves({});
        // exit if the game is over
        if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) return;
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        const randomMove = possibleMoves[randomIndex];
        game.move(randomMove);
        updateGame(game);
      };

      setTimeout(() => makeRandomMove(), 2000);
    }
  }, [currentTurn, game]);

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: string) {
    const copyGame = new Chess();
    copyGame.load(game.fen());
    let move: Move;
    try {
      const temp_move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q"
      });
      move = temp_move;
    } catch (error) {
      chessboardRef.current?.clearPremoves();
      toast.error('Illigalmove');
      return false;
    }
    updateGame(game);
    // illegal move
    if (move === null) return false;
    return true;
  }

  return (
    <div className="board">
      <Chessboard id="mainBoard" arePremovesAllowed position={game.fen()} onPieceDrop={onDrop} />

      <button className='btn btn-danger' onClick={() => {
        chessboardRef.current?.clearPremoves();
        updateGame(new Chess());
        clearTimeout(currentTimeout);
      }}>
        reset
      </button>
      <button className='btn btn-primary' onClick={() => {
        game.undo()
        updateGame(game);
        clearTimeout(currentTimeout);
      }}>
        undo
      </button>
      <button className="btn btn-dark">test</button>

    </div>
  );
}

export default Board;