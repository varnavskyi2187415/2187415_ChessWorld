import axios from "axios";
import {useEffect, useState} from "react";
import {DeleteRoomApiRoute, GetActiveRoomsApiRoute, SurrenderRoomApiRoute} from "behavior/apiConstants";
import {useAppDispatch, useAppSelector} from "behavior/hooks";
import {setActiveRooms} from "behavior/room/roomSlice";
import {toast} from "react-toastify";
import {Button, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import apiClient from "behavior/apiClient";
import {useNavigate} from "react-router-dom";
import {gameRoute} from "routing/constants";
import {socket} from "../../lib/socket";

const ActiveGamesList = () => {
  const dispatch = useAppDispatch();
  const activeRooms = useAppSelector(state => state.room.activeRooms);
  const isSocketReady = useAppSelector(state => state.socket.isSocketReady);
  const navigate = useNavigate();
  const [forceReload, setForceReload] = useState(false);

  useEffect(() => {
    apiClient.get(GetActiveRoomsApiRoute)
      .then((response) => dispatch(setActiveRooms(response.data)))
      .catch((error) => toast.error(error));
  }, [forceReload]);

  const onJoinClick = (roomId: string) => {
    navigate({
      pathname: gameRoute,
      search: `?roomId=${roomId}`,
    });
  }

  const onDeleteClick = async (roomId: string) => {
    await apiClient.delete(`${DeleteRoomApiRoute}/${roomId}`);
    setForceReload(!forceReload);
  }

  const onSurrenderClick = async (roomId: string) => {
    await apiClient.post(`${SurrenderRoomApiRoute}/${roomId}`);
  }

  return (<>
    <h3>All available rooms</h3>
    {activeRooms && <TableContainer>
        <Table title={'All available rooms'}>
            <TableHead>
                <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
              {activeRooms.map(room =>
                <TableRow key={room.id}>
                  <TableCell>{room.title}</TableCell>
                  <TableCell>
                    <ButtonGroup>
                      <Button color={'success'} onClick={() => onJoinClick(room.id)}>Join</Button>
                      <Button color={'warning'} onClick={() => onSurrenderClick(room.id)}>Surrender</Button>
                      <Button color={'error'} onClick={() => onDeleteClick(room.id)}>Delete</Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>)}
            </TableBody>
        </Table>
    </TableContainer>}
  </>)
};

export default ActiveGamesList;