import Board from 'components/Board';
import React, { memo } from 'react';


const Game: React.FC = () => {
  return (<>
    <div className="container">
      <p>board</p>
      <Board />
    </div>
  </>)
}

export default memo(Game);