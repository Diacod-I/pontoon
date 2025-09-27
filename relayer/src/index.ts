import { ethers } from 'ethers';
import { ConvexHttpClient } from 'convex/browser';
import dotenv from 'dotenv';

dotenv.config();

const RPC_URL = process.env.RPC_URL!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;
const CONVEX_URL = process.env.CONVEX_URL!;

const CONTRACT_ABI = [
  "event RoundStarted(uint256 indexed matchId, uint256 indexed roundNumber, uint256 tilesCount)",
  "event RoundResolved(uint256 indexed matchId, uint256 indexed roundNumber, bool challengerSurvived, uint256 challengerChoice, uint256 trapChoice)",
  "event MatchFinished(uint256 indexed matchId, address indexed winner, uint256 reward)",
  
  "function submitMoves(uint256 matchId, bytes32 conmanCommit, bytes32 challengerCommit, bytes conmanSig, bytes challengerSig)",
  "function revealMoves(uint256 matchId, uint256 trapChoice, uint256 challengerChoice, uint256 conmanNonce, uint256 challengerNonce)",
  "function handleRevealTimeout(uint256 matchId)",
  "function getMatch(uint256 matchId) view returns (tuple(address player1, address player2, address challenger, address conman, address winner, uint256 betAmount, uint256 createdAt, uint256 readyDeadline, uint256 currentRound, bool player1Ready, bool player2Ready, uint8 status))",
] as const;

interface PendingMove {
  _id: string;
  matchId: number;
  roundNumber: number;
  player: string;
  role: 'challenger' | 'conman';
  commitment: string;
  signature: string;
  createdAt: number;
}

interface PendingReveal {
  _id: string;
  matchId: number;
  roundNumber: number;
  player: string;
  role: 'challenger' | 'conman';
  choice: number;
  nonce: string;
  createdAt: number;
}

class PontoonGameRelayer {
  private provider: ethers.WebSocketProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private convex: ConvexHttpClient;
  private activeTimeouts = new Map<string, NodeJS.Timeout>();
  private isProcessing = new Set<string>();

  constructor() {
    console.log('🚀 Starting Trap Game Relayer...');
    
    this.validateEnvironment();
    
    this.provider = new ethers.WebSocketProvider(RPC_URL);
    this.wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
    
    this.convex = new ConvexHttpClient(CONVEX_URL);
    
    this.initialize();
  }

  private validateEnvironment() {
    const required = ['RPC_URL', 'CONTRACT_ADDRESS', 'RELAYER_PRIVATE_KEY', 'CONVEX_URL'];
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
  }

  private async initialize() {
    try {
      await this.setupEventListeners();
      this.startProcessingLoop();
      console.log('✅ Relayer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize relayer:', error);
      process.exit(1);
    }
  }

  private async setupEventListeners() {
    console.log('👂 Setting up blockchain event listeners...');

    this.contract.on('RoundStarted', async (matchId, roundNumber, tilesCount, event) => {
      console.log(`🎯 Round ${roundNumber} started for match ${matchId} (${tilesCount} tiles)`);
    });

    this.contract.on('RoundResolved', async (matchId, roundNumber, survived, challengerChoice, trapChoice, event) => {
      console.log(`🎲 Match ${matchId} Round ${roundNumber} resolved - Challenger ${survived ? 'SURVIVED' : 'HIT TRAP'}`);
      
      const timeoutKey = `${matchId}-${roundNumber}`;
      if (this.activeTimeouts.has(timeoutKey)) {
        clearTimeout(this.activeTimeouts.get(timeoutKey)!);
        this.activeTimeouts.delete(timeoutKey);
        console.log(`⏰ Cleared timeout for match ${matchId} round ${roundNumber}`);
      }
    });

    this.contract.on('MatchFinished', async (matchId, winner, reward, event) => {
      console.log(`🏁 Match ${matchId} finished - Winner: ${winner}`);
      
      for (const [key, timeout] of this.activeTimeouts.entries()) {
        if (key.startsWith(`${matchId}-`)) {
          clearTimeout(timeout);
          this.activeTimeouts.delete(key);
        }
      }
    });

    this.provider.on('error', (error) => {
      console.error('❌ Provider error:', error);
      this.reconnect();
    });

    this.provider.on('close', () => {
      console.log('🔌 Connection closed, reconnecting...');
      this.reconnect();
    });
  }

  private startProcessingLoop() {
    console.log('📡 Starting move processing loop...');
    
    setInterval(async () => {
      try {
        await Promise.all([
          this.processPendingMoves(),
          this.processPendingReveals()
        ]);
      } catch (error) {
        console.error('❌ Error in processing loop:', error);
      }
    }, 2000);

    setInterval(() => {
      this.checkExpiredTimeouts();
    }, 5000);
  }

  private async processPendingMoves() {
    try {
      const pendingMoves = await this.convex.query('relayer:getPendingMoves' as any) as PendingMove[];
      
      if (pendingMoves.length === 0) return;

      const groupedMoves = new Map<string, PendingMove[]>();
      
      for (const move of pendingMoves) {
        const key = `${move.matchId}-${move.roundNumber}`;
        
        if (this.isProcessing.has(key)) continue;
        
        if (!groupedMoves.has(key)) {
          groupedMoves.set(key, []);
        }
        groupedMoves.get(key)!.push(move);
      }

      for (const [key, moves] of groupedMoves) {
        if (moves.length === 2) {
          const [matchId, roundNumber] = key.split('-').map(Number);
          await this.submitMovesToContract(matchId, roundNumber, moves);
        }
      }

    } catch (error) {
      console.error('❌ Error processing pending moves:', error);
    }
  }

  private async processPendingReveals() {
    try {
      const pendingReveals = await this.convex.query('relayer:getPendingReveals' as any) as PendingReveal[];
      
      if (pendingReveals.length === 0) return;

      const groupedReveals = new Map<string, PendingReveal[]>();
      
      for (const reveal of pendingReveals) {
        const key = `${reveal.matchId}-${reveal.roundNumber}`;
        
        if (this.isProcessing.has(key)) continue;
        
        if (!groupedReveals.has(key)) {
          groupedReveals.set(key, []);
        }
        groupedReveals.get(key)!.push(reveal);
      }

      for (const [key, reveals] of groupedReveals) {
        if (reveals.length === 2) {
          const [matchId, roundNumber] = key.split('-').map(Number);
          await this.submitRevealsToContract(matchId, roundNumber, reveals);
        }
      }

    } catch (error) {
      console.error('❌ Error processing pending reveals:', error);
    }
  }

  private async submitMovesToContract(matchId: number, roundNumber: number, moves: PendingMove[]) {
    const processKey = `${matchId}-${roundNumber}`;
    
    if (this.isProcessing.has(processKey)) {
      return; 
    }

    this.isProcessing.add(processKey);

    try {
      console.log(`📤 Submitting moves for match ${matchId} round ${roundNumber}`);

      const match = await this.contract.getMatch(matchId);
      
      const conmanMove = moves.find(m => 
        m.player.toLowerCase() === match.conman.toLowerCase() && m.role === 'conman'
      );
      const challengerMove = moves.find(m => 
        m.player.toLowerCase() === match.challenger.toLowerCase() && m.role === 'challenger'
      );

      if (!conmanMove || !challengerMove) {
        console.error('❌ Missing role moves for match', matchId);
        return;
      }

      const gasEstimate = await this.contract.submitMoves.estimateGas(
        matchId,
        conmanMove.commitment,
        challengerMove.commitment,
        conmanMove.signature,
        challengerMove.signature
      );

      const tx = await this.contract.submitMoves(
        matchId,
        conmanMove.commitment,
        challengerMove.commitment,
        conmanMove.signature,
        challengerMove.signature,
        { 
          gasLimit: gasEstimate + (gasEstimate * 20n / 100n)
        }
      );

      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Moves submitted! Gas used: ${receipt!.gasUsed}`);

      await this.convex.mutation('relayer:clearPendingMoves' as any, {
        matchId,
        roundNumber,
      });

      const timeoutKey = `${matchId}-${roundNumber}`;
      const timeout = setTimeout(() => {
        this.handleRevealTimeout(matchId, roundNumber);
      }, 30000);
      
      this.activeTimeouts.set(timeoutKey, timeout);
      console.log(`⏰ Reveal timeout set for match ${matchId} round ${roundNumber}`);

    } catch (error) {
      console.error('❌ Error submitting moves to contract:', error);
      
      if (error instanceof Error && error.message.includes('revert')) {
        console.error('💥 Contract reverted:', error.message);
      }
    } finally {
      this.isProcessing.delete(processKey);
    }
  }

  private async submitRevealsToContract(matchId: number, roundNumber: number, reveals: PendingReveal[]) {
    const processKey = `${matchId}-${roundNumber}`;
    
    if (this.isProcessing.has(processKey)) {
      return;
    }

    this.isProcessing.add(processKey);

    try {
      console.log(`🔓 Submitting reveals for match ${matchId} round ${roundNumber}`);

      const match = await this.contract.getMatch(matchId);
      
      const conmanReveal = reveals.find(r => 
        r.player.toLowerCase() === match.conman.toLowerCase() && r.role === 'conman'
      );
      const challengerReveal = reveals.find(r => 
        r.player.toLowerCase() === match.challenger.toLowerCase() && r.role === 'challenger'
      );

      if (!conmanReveal || !challengerReveal) {
        console.error('❌ Missing role reveals for match', matchId);
        return;
      }

      const gasEstimate = await this.contract.revealMoves.estimateGas(
        matchId,
        conmanReveal.choice,
        challengerReveal.choice,
        conmanReveal.nonce,
        challengerReveal.nonce
      );

      const tx = await this.contract.revealMoves(
        matchId,
        conmanReveal.choice,
        challengerReveal.choice,
        conmanReveal.nonce,
        challengerReveal.nonce,
        { 
          gasLimit: gasEstimate + (gasEstimate * 20n / 100n)
        }
      );

      console.log(`⏳ Reveal transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Reveals processed! Gas used: ${receipt!.gasUsed}`);

      await this.convex.mutation('relayer:clearPendingReveals' as any, {
        matchId,
        roundNumber,
      });

      const timeoutKey = `${matchId}-${roundNumber}`;
      if (this.activeTimeouts.has(timeoutKey)) {
        clearTimeout(this.activeTimeouts.get(timeoutKey)!);
        this.activeTimeouts.delete(timeoutKey);
        console.log(`✅ Cleared timeout for completed round ${matchId}-${roundNumber}`);
      }

    } catch (error) {
      console.error('❌ Error submitting reveals to contract:', error);
    } finally {
      this.isProcessing.delete(processKey);
    }
  }

  private async handleRevealTimeout(matchId: number, roundNumber: number) {
    try {
      console.log(`⚠️ Reveal timeout triggered for match ${matchId} round ${roundNumber}`);

      const reveals = await this.convex.query('relayer:getPendingRevealsByMatch' as any, {
        matchId,
        roundNumber,
      });

      console.log(`📊 Found ${reveals.length}/2 reveals on timeout`);

      const gasEstimate = await this.contract.handleRevealTimeout.estimateGas(matchId);
      
      const tx = await this.contract.handleRevealTimeout(matchId, {
        gasLimit: gasEstimate + (gasEstimate * 20n / 100n)
      });

      console.log(`⏳ Timeout transaction submitted: ${tx.hash}`);
      await tx.wait();
      console.log(`✅ Timeout handled successfully!`);

      await this.convex.mutation('relayer:clearAllPendingForMatch' as any, {
        matchId,
        roundNumber,
      });

      const timeoutKey = `${matchId}-${roundNumber}`;
      this.activeTimeouts.delete(timeoutKey);

    } catch (error) {
      console.error('❌ Error handling reveal timeout:', error);
    }
  }

  private checkExpiredTimeouts() {
  }

  private async reconnect() {
    console.log('🔄 Attempting to reconnect...');
    
    try {
      this.provider.destroy();
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      this.provider = new ethers.WebSocketProvider(RPC_URL);
      this.wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, this.provider);
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
      
      await this.setupEventListeners();
      
      console.log('✅ Reconnected successfully');
      
    } catch (error) {
      console.error('❌ Reconnection failed:', error);
      
      setTimeout(() => this.reconnect(), 10000);
    }
  }
}

console.log('🎮 Initializing Trap Game Relayer...');

export const relayer = new PontoonGameRelayer();

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down relayer gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down relayer gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
