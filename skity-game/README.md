# FRAMED - Privacy-Preserving Social Deduction Game

A fully on-chain social deduction game (Mafia/Werewolf) built on Midnight Network with zero-knowledge proofs.

## 🎮 Game Overview

FRAMED is a 4-player social deduction game where:
- **Citizens** try to identify and eliminate the Mafia
- **Mafia** tries to eliminate Citizens without being caught
- **Doctor** can save players from elimination
- **Detective** can investigate players' roles

All roles and votes are kept private using zero-knowledge proofs - even the blockchain can't see your role or who you voted for!

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- [Lace Wallet](https://www.lace.io/) browser extension
- Lace wallet configured for **preprod** network
- tNight tokens from [Preprod Faucet](https://faucet.preprod.midnight.network/)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve the connection in Lace
2. **Join/Create Game**: 
   - Use the default contract address: `344d8ad330d47d56b8175c73e00fac279d196610a73e2621b110b28369a25f29`
   - Or deploy your own contract using the CLI
3. **Wait for Players**: Game starts when 4 players join
4. **Play Rounds**:
   - **Night Phase**: Take role-specific actions (kill/save/investigate)
   - **Voting Phase**: Vote to eliminate a suspect
   - **Reveal Phase**: See who was eliminated

## 🔐 Privacy Features

### Secret Ballots
- Votes are encrypted using ZK proofs
- No one can see who you voted for
- Vote tallies are computed without revealing individual votes

### Anonymous Whistleblowing
- Report suspicious activity without revealing your identity
- Alerts show location but never the reporter

### Sabotage System
- Mafia can trigger a 30-second voting blackout
- Usable once per game
- Creates chaos and confusion

### Role Privacy
- Your role is stored in private state (never on-chain)
- Role commitments prove assignment without revealing the role
- Even the contract can't see your actual role

## 🏗️ Architecture

### Frontend
- **React + TypeScript** - UI framework
- **Vite** - Build tool with WASM support
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Midnight SDK** - Blockchain integration

### Smart Contract
- **Compact Language** - Zero-knowledge smart contract
- **13 Circuits** - Game logic with ZK proofs
- **Deployed on Preprod**: `344d8ad330d47d56b8175c73e00fac279d196610a73e2621b110b28369a25f29`

### Network Configuration
- **Network**: Preprod (testnet)
- **Indexer**: `https://indexer.preprod.midnight.network`
- **Proof Server**: `https://prover.preprod.midnight.network`
- **RPC**: `wss://rpc.preprod.midnight.network`

## 📁 Project Structure

```
skity-game/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Main game screens
│   │   └── in-game/       # Phase-specific components
│   ├── context/           # React contexts (Wallet, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Midnight SDK integration
│   └── types/             # TypeScript types
├── contract/              # Compact smart contract
│   └── src/
│       └── game.compact   # Main contract file
└── public/
    └── zk-keys/           # Zero-knowledge proving keys
```

## 🎨 Features

- **Dark Mode** - Toggle between light and dark themes
- **Real-time Updates** - Contract state polls every 3 seconds
- **Confetti Effects** - Celebrate game events
- **Toast Notifications** - User feedback for all actions
- **Loading Skeletons** - Smooth loading states
- **Countdown Timers** - Phase time limits
- **Vote Progress Bar** - See voting progress
- **Role Reveal Animation** - Dramatic 3D card flip

## 🛠️ Development

### Build Contract

```bash
cd contract
npm run build
```

### Deploy Contract (CLI)

```bash
cd skity-cli
npm run preprod
```

Follow the prompts to deploy a new game contract.

### Run Tests

```bash
npm run test
```

## 🔧 Configuration

### Change Network

Edit `src/lib/midnight-functions.ts`:

```typescript
// For preprod (testnet)
setNetworkId('preprod');

// For local development
setNetworkId('undeployed');
```

### Change Contract Address

Edit `src/components/room-picker.tsx`:

```typescript
const [contractAddress, setContractAddress] = useState("YOUR_CONTRACT_ADDRESS");
```

## 📝 Contract Circuits

The game contract includes 13 circuits:

1. `joinGame` - Join the game lobby
2. `initGame` - Start game and assign roles
3. `castPrivateVote` - Cast encrypted vote
4. `takeAction` - Night phase actions
5. `blowWhistle` - Anonymous alert
6. `triggerSabotage` - Mafia blackout ability
7. `deactivateSabotage` - End sabotage
8. `advanceToVoting` - Move to voting phase
9. `revealTally` - Start vote reveal
10. `completeReveal` - Eliminate player
11. `startNewRound` - Begin next round
12. `getPlayerStatus` - Check if player is alive
13. `viewOwnRole` - See your role

## 🐛 Troubleshooting

### Wallet Connection Issues

- Make sure Lace wallet is installed and configured for preprod
- Check that you have tNight tokens in your wallet
- Try refreshing the page and reconnecting

### Transaction Failures

- Ensure you have enough DUST tokens (generated automatically)
- Wait for previous transactions to confirm before submitting new ones
- Check browser console for detailed error messages

### Contract Connection Issues

- Verify the contract address is correct
- Make sure you're on the preprod network
- Check that the contract is deployed and accessible

## 📚 Resources

- [Midnight Documentation](https://docs.midnight.network)
- [Compact Language Guide](https://docs.midnight.network/develop/compact)
- [Lace Wallet](https://www.lace.io/)
- [Preprod Faucet](https://faucet.preprod.midnight.network/)

## 🎯 Hackathon Submission

Built for the Midnight Network Hackathon - showcasing:
- Zero-knowledge proof integration
- Privacy-preserving game mechanics
- Real-time blockchain interactions
- Polished UI/UX with animations
- Full-stack Midnight dApp

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

**Contract Address (Preprod)**: `344d8ad330d47d56b8175c73e00fac279d196610a73e2621b110b28369a25f29`

Built with ❤️ on Midnight Network
