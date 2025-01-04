import {MenuItem, Select, SelectChangeEvent} from "@mui/material";
import React from "react";

interface TimeControlProps {
  setTimeControlSelect: (value: React.SetStateAction<string>) => void
}

const TimeControlSelect = ({setTimeControlSelect}: TimeControlProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    setTimeControlSelect(event.target.value);
  }
  
  return (<>
    <Select onChange={handleChange} defaultValue={'10|10'} variant="filled" color={"info"}
            size={"small"}>
      <MenuItem value={'1|0'}>1|0</MenuItem>
      <MenuItem value={'1|1'}>1|1</MenuItem>
      <MenuItem value={'5|0'}>5|0</MenuItem>
      <MenuItem value={'5|5'}>5|5</MenuItem>
      <MenuItem value={'10|0'}>10|0</MenuItem>
      <MenuItem value={'10|10'}>10|10</MenuItem>
    </Select>
  </>)
};

export default TimeControlSelect;