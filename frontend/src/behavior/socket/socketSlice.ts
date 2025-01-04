import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import authSlice from "../auth/authSlice";

interface SocketState {
  isConnected: boolean;
  isSocketReady: boolean;
}

const initialState: SocketState = {
  isConnected: false,
  isSocketReady: false,
}

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers:{
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    socketReady: (state) => {
      state.isSocketReady = true;
    },
    socketNotReady: (state) => {
      state.isSocketReady = false;
    }
  }
});

export const {setConnected, socketReady, socketNotReady} = socketSlice.actions;

export default socketSlice.reducer;