import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import socketSlice from "../socket/socketSlice";
import {Room} from "./types";

interface RoomState {
  roomId: string;
  currentRoom: Room | null;
  isInFindGame: boolean,
  isInCreateEmptyRoom: boolean,
  activeRooms: Room[],
  allActiveRooms: Room[],
  currentTime: { whiteTime: number, blackTime: number },
}

const initialState: RoomState = {
  roomId: "",
  currentRoom: null,
  isInFindGame: false,
  isInCreateEmptyRoom: false,
  activeRooms: [],
  allActiveRooms: [],
  currentTime: {whiteTime: 0, blackTime: 0},
}

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    roomCreated: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    setRoomData: (state, action: PayloadAction<Room | null>) => {
      state.currentRoom = action.payload;
    },
    setInFindGame: (state, action: PayloadAction<boolean>) => {
      state.isInFindGame = action.payload;
    },
    setInCreateEmptyRoom: (state, action: PayloadAction<boolean>) => {
      state.isInCreateEmptyRoom = action.payload;
    },
    setActiveRooms: (state, action: PayloadAction<Room[]>) => {
      state.activeRooms = action.payload;
    },
    setAllActiveRooms: (state, action: PayloadAction<Room[]>) => {
      state.allActiveRooms = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<{ whiteTime: number, blackTime: number }>) => {
      state.currentTime = action.payload;
    }
  }
});

export const {
  roomCreated,
  setRoomData,
  setInFindGame,
  setActiveRooms,
  setAllActiveRooms,
  setInCreateEmptyRoom,
  setCurrentTime,
} = roomSlice.actions;

export default roomSlice.reducer;