export enum Events {
  setUserData = 'user:setUserData',
  startGameWithBot = 'user:startGameWithBot',
  createRoom = 'user:createRoom',
  handleMove = 'room:handleMove',
  joinRoom = 'room:joinRoom',
  deleteRoom = 'room:delete',
  handleOfferDraw = 'room:handleOfferDraw',
  leaveRoom = 'room:leaveRoom',
  getTime = 'room:getTime',
  pauseRoom = 'room:pauseRoom',
  timeRunOut = 'room:timeRunOut',
  startGame = 'user:startGame'
}