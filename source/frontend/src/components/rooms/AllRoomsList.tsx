import axios from "axios";
import {useEffect} from "react";
import {GetActiveRoomsApiRoute, GetAllRoomsApiRoute} from "behavior/apiConstants";
import {useAppDispatch, useAppSelector} from "behavior/hooks";
import {setActiveRooms, setAllActiveRooms} from "behavior/room/roomSlice";
import {toast} from "react-toastify";
import {Button, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import apiClient from "behavior/apiClient";
import {gameRoute} from "routing/constants";
import {useNavigate} from "react-router-dom";

const AllActiveGamesList = () => {
  const dispatch = useAppDispatch();
  const allRooms = useAppSelector(state => state.room.allActiveRooms);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get(GetAllRoomsApiRoute)
      .then((response) => dispatch(setAllActiveRooms(response.data)))
      .catch((error) => toast.error(error));
  }, []);

  const onJoinClick = (roomId: string) => {
    navigate({
      pathname: gameRoute,
      search: `?roomId=${roomId}`,
    });
  }
  
  return (<>
    <h3>All rooms</h3>
  {allRooms && <TableContainer>
      <Table title={'All rooms'}>
          <TableHead>
              <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell align="right">Actions</TableCell>
              </TableRow>
          </TableHead>
          <TableBody>
            {allRooms.map(room =>
              <TableRow key={room.id}>
                <TableCell>{room.title}</TableCell>
                <TableCell>
                  <ButtonGroup>
                    <Button color={'success'} onClick={() => onJoinClick(room.id)}>Join</Button>
                  </ButtonGroup>
                </TableCell>
              </TableRow>)}
          </TableBody>
      </Table>
  </TableContainer>}
  </>)
};

export default AllActiveGamesList;