import React, {useEffect, useState} from "react";
import {
  Button,
  Card,
  MenuItem,
  Select,
  SelectChangeEvent
} from "@mui/material";
import {socket} from "lib/socket";
import {setInCreateEmptyRoom} from "behavior/room/roomSlice";
import {useAppDispatch, useAppSelector} from "behavior/hooks";
import BasicColumn from "components/basic/BasicColumn";
import BasicRow from "components/basic/BasicRow";
import TimeControlSelect from "./TimeControlSelect";

const CreateEmptyRoom = () => {
  const [selectedSide, setSelectedSide] = useState<string>('w');
  const [timeControl, setTimeControl] = useState<string>('10|10');
  const isSocketReady = useAppSelector(state => state.socket.isSocketReady);
  const isInCreateEmptyRoom = useAppSelector(state => state.room.isInCreateEmptyRoom);
  const dispatch = useAppDispatch();

  const handleSideChange = (event: SelectChangeEvent) => {
    setSelectedSide(event.target.value as string);
  };

  const handleCreateEmptyRoom = () => {
    socket.connect();
    dispatch(setInCreateEmptyRoom(true));
    console.log("socket.connect(); in CREATEEMPTYROOM")
  }

  useEffect(() => {
    console.log('isSocketReady, isInCreateEmptyRoom', isSocketReady, isInCreateEmptyRoom);
    if (!isSocketReady || !isInCreateEmptyRoom) return;
    socket.emit('user:createRoom', {selectedSide, timeControl});
  }, [isSocketReady, isInCreateEmptyRoom]);

  return (<>
      <Card style={{
        width: 220,
      }}>

        <BasicColumn style={{
          padding: 10,
          borderRadius: 20
        }}>
          <BasicRow>
            <span style={{marginRight: 10}}>My color:</span>
            <div style={{width: 120}}>
              <Select onChange={handleSideChange} defaultValue={'w'} variant="filled" color={"info"}
                      size={"small"}>
                <MenuItem value={'w'}>White</MenuItem>
                <MenuItem value={'b'}>Black</MenuItem>
              </Select>
            </div>
          </BasicRow>
          <BasicRow>
            <span style={{marginRight: 10}}>Time control:</span>
            <TimeControlSelect setTimeControlSelect={setTimeControl}/>
          </BasicRow>
          <Button variant="contained" onClick={handleCreateEmptyRoom} className="m-1">Create empty room</Button>
        </BasicColumn>
      </Card>
    </>
  );
}

export default CreateEmptyRoom;