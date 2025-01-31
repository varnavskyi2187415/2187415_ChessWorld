import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {Room} from "./types";
import {RootState} from "../store";
import {getAccessTokenFromLocalStorage} from "../auth/tokenService";

// const baseQuery = fetchBaseQuery({
//   baseUrl: "http://localhost/room",
//   headers: 
// });

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost/",
  prepareHeaders: (headers) => {
    const accessToken = getAccessTokenFromLocalStorage();
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

export const roomApi = createApi({
  reducerPath: "roomApi", // Define a reducer path
  baseQuery,
  tagTypes: ["room"], // Add relevant tag types for caching/invalidations
  endpoints: (builder) => ({
    getRoomInfo: builder.query<Room, string>({
      query: (request) => ({
        url: `/${request}`,
      }),
    }),
    
  }),
});

// Export hooks for usage in functional components
export const { useGetRoomInfoQuery } = roomApi;
