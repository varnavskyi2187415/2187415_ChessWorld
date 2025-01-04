import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'behavior/auth/authSlice';
import socketReducer from 'behavior/socket/socketSlice';
import roomReducer from "behavior/room/roomSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
    room: roomReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
