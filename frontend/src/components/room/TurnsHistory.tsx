import {Move} from "chess.js";
import React, {useEffect, useRef} from "react";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

interface Prop {
  turns: Move[];
}

interface Column {
  id: 'moveNumber' | 'whiteMoves' | 'blackMoves';
  label: string;
  minWidth?: number;
  align?: 'right' | 'left';
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  {id: 'moveNumber', label: '#', minWidth: 10},
  {id: 'whiteMoves', label: 'White', minWidth: 30, align: 'left'},
  {id: 'blackMoves', label: 'Black', minWidth: 30, align: 'left'},
];

const TurnsHistory = ({turns}: Prop) => {
  const movePairs = [];
  for (let i = 0; i < turns.length; i += 2) {
    movePairs.push([turns[i], turns[i + 1]]);
  }
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: tableContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [movePairs]);
  
  return (<>
    <TableContainer ref={tableContainerRef} sx={{maxHeight: 500, overflow:"auto"}}>
      <Table stickyHeader size={"small"}>
        <TableHead>
          <TableRow>
            {columns.map(column =>
              <TableCell
                key={column.id}
                align={column.align}
                style={{minWidth: column.minWidth}}
              >
                {column.label}
              </TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {movePairs.map((pair, index) =>
            <TableRow key={index}>
              <TableCell align={'left'}>
                {index+1}.
              </TableCell>
              <TableCell align={'left'}>
                {pair[0] && pair[0].san}
              </TableCell>
              <TableCell align={'left'}>
                {pair[1] && pair[1].san}
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </TableContainer>
  </>)
}

export default TurnsHistory;