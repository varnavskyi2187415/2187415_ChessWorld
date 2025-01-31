import {Injectable} from '@nestjs/common';
import axios from "axios";

@Injectable()
export class StockfishService {
  private apiUrl: string = 'https://stockfish.online/api/s/v2.php';

  async getBestMove(fen: string, depth: number) {
    try {
      const response = await axios.get(`${this.apiUrl}?fen=${fen}&depth=${depth}`);
      return response.data.bestmove.split(" ")[1];
    } catch (error) {
      throw error;
    }
  }
}
