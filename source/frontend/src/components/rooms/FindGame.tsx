import React, {useEffect, useMemo, useState} from "react";
import {
  Alert,
  Button,
  Card,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField
} from "@mui/material";
import {setInFindGame} from 'behavior/room/roomSlice';
import {socket} from "lib/socket";
import {useAppDispatch, useAppSelector} from "behavior/hooks";
import BasicColumn from "components/basic/BasicColumn";
import BasicRow from "components/basic/BasicRow";
import TimeControlSelect from "./TimeControlSelect";

const FindGame = () => {
  const [selectedSide, setSelectedSide] = useState('r');
  const [timeControl, setTimeControl] = useState('10|10');
  const [botDepth, setBotDepth] = useState(3);
  const [botDepthAlertMessage, setBotDepthAlertMessage] = useState('');
  const [gameType, setGameType] = useState<"player" | "bot">("bot");
  const isSocketReady = useAppSelector(state => state.socket.isSocketReady);
  const isInFindGame = useAppSelector(state => state.room.isInFindGame);
  const dispatch = useAppDispatch();

  const handleSideChange = (event: SelectChangeEvent) => {
    setSelectedSide(event.target.value as string);
  };

  const handleBotDepthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    function validateInteger(value: string) {
      return /^-?\d+$/.test(value);
    }

    const newValue: number = +event.target.value;
    setBotDepth(newValue);
    if (!validateInteger(event.target.value)) {
      setBotDepthAlertMessage('Bot depth must be integer value.');
      return;
    }
    if (newValue < 1 || newValue > 15) {
      setBotDepthAlertMessage('Bot depth must be between 1 and 15');
      return;
    }
    setBotDepthAlertMessage('');
  }

  const handleGameTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === 'player' || event.target.value === 'bot') {
      setGameType(event.target.value);
    }
  }

  const handleFindGame = () => {
    socket.connect();
    dispatch(setInFindGame(true));
    console.log("socket.connect(); in FINDGAME")
  }
  
  const handleStopFind = () => {
    dispatch(setInFindGame(false));
    socket.emit('user:stopGameFind');
  }

  useEffect(() => {
    console.log('isSocketReady, isInFindGame', isSocketReady, isInFindGame);
    if (!isSocketReady || !isInFindGame) return;
    console.log(`gametype ${gameType}`)
    if (gameType === "player") {
      socket.emit('user:startGame', {timeControl: timeControl});
      console.log(`startGame emited`);
      return;
    }
    socket.emit('user:startGameWithBot', {selectedSide, botDepth, timeControl});
    console.log(`startGameWithBot with botlevel: ${botDepth}`);
  }, [isSocketReady, isInFindGame]);

  return (<>
      <Card style={{
        width: 250,
      }}>
        <BasicColumn style={{
          padding: 10,
          borderRadius: 20
        }}>
          <BasicRow>
            <RadioGroup row defaultValue={"bot"} onChange={handleGameTypeChange}>
              <FormControlLabel value="player" control={<Radio size={"small"}/>} label="Player"/>
              <FormControlLabel value="bot" control={<Radio size={"small"}/>} label="Bot"/>
            </RadioGroup>
          </BasicRow>
          <BasicRow>
            <span style={{marginRight: 10}}>Time control:</span>
            <TimeControlSelect setTimeControlSelect={setTimeControl}/>
          </BasicRow>
          {gameType === "bot" && <>
              <BasicColumn style={{
                marginTop: 10,
                borderRadius: 20,
                width: 200,
              }}>
                  <BasicRow>
                      <span style={{marginRight: 10}}>My color:</span>
                      <div style={{width: 120}}>
                          <Select onChange={handleSideChange} defaultValue={'r'} variant="filled" color={"info"}
                                  size={"small"}>
                              <MenuItem value={'r'}>Random</MenuItem>
                              <MenuItem value={'w'}>White</MenuItem>
                              <MenuItem value={'b'}>Black</MenuItem>
                          </Select>
                      </div>
                  </BasicRow>
                  <BasicRow>
                      <span style={{marginRight: 1}}>Bot depth:</span>
                      <div style={{width: 120}}>
                          <TextField type="number" variant="filled" size={"small"} value={botDepth}
                                     onChange={handleBotDepthChange}/>
                      </div>
                  </BasicRow>
                {botDepthAlertMessage && <Alert severity={"error"}>{botDepthAlertMessage}</Alert>}
              </BasicColumn>
          </>
          }
          <Button variant="contained" onClick={handleFindGame} className="m-1" disabled={isInFindGame}>Find game</Button>
          {isInFindGame && <Button variant={'contained'} onClick={handleStopFind} className={'m-1'}>Stop find</Button>}
        </BasicColumn>
      </Card>
    </>
  );
};

export default FindGame;