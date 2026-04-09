# 🎬 FRAMED Demo Script - Happy Path

## 🎯 Demo Goal
Show all Midnight Network privacy features in a 4-player game:
- Secret ballots (encrypted votes)
- Anonymous whistleblowing
- Sabotage (vote blackout)
- Zero-knowledge role privacy

---

## 🛠️ Setup (Before Demo)

### 1. Prepare 4 Wallets
- Open 4 browser windows/profiles with Lace wallet
- Each wallet needs:
  - Configured for **preprod** network
  - tNight tokens from faucet
  - DUST tokens (auto-generated)

### 2. Start Frontend
```bash
cd skity-game
npm run dev
```
Open http://localhost:5173 in all 4 browsers

### 3. Contract Address
Use deployed contract: `344d8ad330d47d56b8175c73e00fac279d196610a73e2621b110b28369a25f29`

---

## 🎮 Demo Flow (10 minutes)

### Phase 1: Lobby (2 min)

**Browser 1 (Host/Moderator):**
1. Connect wallet → "Connect Wallet" button
2. Join room → Use default contract address
3. Click "Join Game" → Enter username "Alice"
4. ✅ See Alice's card appear in waiting room

**Browser 2-4 (Players):**
1. Connect wallets
2. Join same contract address
3. Click "Join Game" → Enter usernames: "Bob", "Carol", "Dave"
4. ✅ All 4 player cards visible

**Browser 1 (Host):**
5. Click "Start Game" button
6. 🎉 Confetti effect + "Game Started" toast
7. ✅ Game advances to Night Phase

**🎤 Narration:**
> "Four players join the lobby. Notice how each player's wallet address is used as their identity, but their roles remain completely private. The blockchain knows they joined, but not what role they'll get."

---

### Phase 2: Night Phase (3 min)

**All Players:**
1. Click "Reveal My Role" button
2. 🎴 Dramatic card flip animation shows role
3. Roles assigned:
   - Alice: Citizen (0)
   - Bob: Mafia (1)
   - Carol: Doctor (2)
   - Dave: Detective (3)

**Browser 2 (Bob - Mafia):**
1. Click on Carol's card
2. Click "Kill" button
3. ✅ Toast: "Action taken"
4. ✅ Bob's card shows "Acted" badge

**Browser 3 (Carol - Doctor):**
1. Click on herself
2. Click "Save" button
3. ✅ Carol's card shows "Acted" badge

**Browser 4 (Dave - Detective):**
1. Click on Bob's card
2. Click "Investigate" button
3. ✅ Dave's card shows "Acted" badge
4. 🔍 Private state stores: "Bob is Mafia" (not on-chain!)

**Browser 4 (Dave - Whistleblower Feature):**
1. Click "Blow Whistle" button (🚨 icon)
2. Select Bob from dropdown
3. Click "Send Alert"
4. 🎺 Whistle sound + confetti
5. ✅ Alert appears at top: "⚠️ Suspicious activity reported near Player 1"
6. **KEY POINT**: Alert shows location, but NOT who reported it!

**🎤 Narration:**
> "During night phase, each role takes their action. The Mafia kills, Doctor saves, Detective investigates. Notice the whistleblower alert - it shows WHERE suspicious activity happened, but the blockchain has NO IDEA who reported it. That's zero-knowledge privacy in action."

**Browser 1 (Host):**
1. Click "Advance to Voting" button
2. ✅ Game moves to Voting Phase

---

### Phase 3: Voting Phase (3 min)

**Browser 2 (Bob - Mafia - Sabotage Feature):**
1. Click "Trigger Sabotage" button (💣 icon)
2. 💥 Screen goes dark/blurred
3. ✅ Toast: "Sabotage activated! 30s blackout"
4. ✅ Vote buttons disabled for all players
5. ⏱️ Countdown timer shows 30 seconds

**🎤 Narration:**
> "The Mafia triggers sabotage - a 30-second voting blackout. This is anonymous - the blockchain knows sabotage is active, but NOT who triggered it. Only the Mafia player's private state knows they used this ability."

**Wait 30 seconds or manually deactivate:**
- Browser 1 (Host): Call `deactivateSabotage()` from console if needed
- ✅ Screen clears, voting enabled

**All Players (Secret Ballot Feature):**
1. Click on a player card to vote
2. Click "Vote to Eliminate"
3. 🎊 Confetti + "Vote cast" toast
4. ✅ Vote progress bar updates: "3/4 players voted"
5. **KEY POINT**: No one can see WHO you voted for!

**Voting Results:**
- Alice votes Bob
- Bob votes Alice
- Carol votes Bob
- Dave votes Bob
- **Bob gets 3 votes** (majority)

**🎤 Narration:**
> "Each player casts a secret ballot. The votes are encrypted using zero-knowledge proofs. Even the blockchain can't see who you voted for - it only knows you voted. The tally is computed without revealing individual votes."

**Browser 1 (Host):**
1. Click "Reveal Results" button
2. ⏳ 5-second countdown with dramatic music
3. 💀 Bob's card flips to show "ELIMINATED"
4. ✅ Bob's card turns grayscale
5. ✅ Toast: "Bob was eliminated"

---

### Phase 4: Round Complete (2 min)

**Show Results:**
- Bob eliminated (was Mafia)
- Carol saved herself (Doctor action worked)
- Dave investigated Bob (Detective found Mafia)
- Whistleblower alert was correct!

**Browser 1 (Host):**
1. Click "Start Next Round" button
2. 🔄 Game resets to Night Phase
3. ✅ All "Acted" and "Voted" badges cleared
4. ✅ Bob's card still shows "Dead"

**🎤 Narration:**
> "The round completes. Notice how the game state is fully on-chain - player status, votes cast, sabotage used - but all the PRIVATE information stays private. Roles, vote targets, and whistleblower identity never touch the blockchain."

---

## 🎯 Key Features Demonstrated

### ✅ Zero-Knowledge Proofs
- **Role Privacy**: Roles stored in private state, never on-chain
- **Secret Ballots**: Vote targets encrypted, only tally revealed
- **Anonymous Actions**: Whistleblower and sabotage have no identity link

### ✅ On-Chain Game State
- Player registry (who joined)
- Game phase (lobby → night → voting → reveal)
- Alive/dead status
- Action/vote flags
- Alert locations (but not reporters)

### ✅ Privacy Features
1. **Secret Ballots** - `castPrivateVote()` circuit
2. **Whistleblowing** - `blowWhistle()` circuit (anonymous)
3. **Sabotage** - `triggerSabotage()` circuit (anonymous)
4. **Role Commitments** - Prove role assignment without revealing

### ✅ UI Polish
- Confetti effects (6 types)
- Toast notifications (10+ types)
- Dark mode toggle
- Loading skeletons
- Countdown timers
- Vote progress bar
- Role reveal animation (3D card flip)
- Smooth phase transitions

---

## 🐛 Troubleshooting

### Wallet Won't Connect
- Check Lace is on preprod network
- Refresh page and try again
- Check console for "coinPublicKey" field

### Transaction Fails
- Wait 5-10 seconds between transactions
- Check you have DUST tokens
- Verify contract address is correct

### Vote Doesn't Work
- Make sure sabotage is deactivated
- Check you haven't voted already
- Verify you're in voting phase

### Game Stuck
- Host can advance phases manually
- Check all players have acted/voted
- Refresh and reconnect if needed

---

## 📊 Metrics to Highlight

- **13 Circuits** - All game logic uses ZK proofs
- **4 Privacy Features** - Roles, votes, whistleblower, sabotage
- **0 Private Data On-Chain** - Everything sensitive stays local
- **100% Decentralized** - No backend server needed
- **Real-time Updates** - Contract state polls every 3 seconds

---

## 🎤 Closing Statement

> "FRAMED demonstrates the power of Midnight Network's zero-knowledge technology. We built a fully functional social deduction game where players can vote, report, and take actions - all while keeping their sensitive information completely private. The blockchain handles game state and verification, but never sees your role, your votes, or your identity when reporting suspicious activity. This is the future of privacy-preserving applications."

---

## 🚀 Backup Plan (If Live Demo Fails)

1. **Screen Recording**: Pre-record the full demo flow
2. **Screenshots**: Capture each phase with annotations
3. **Code Walkthrough**: Show contract circuits and explain ZK proofs
4. **Architecture Diagram**: Explain how Midnight SDK works

---

## ⏱️ Timing Breakdown

- Setup/Intro: 1 min
- Lobby: 2 min
- Night Phase: 3 min
- Voting Phase: 3 min
- Results: 1 min
- Q&A: 5 min

**Total: 15 minutes**

---

## 🎯 Questions to Prepare For

**Q: How do you prevent cheating?**
A: Zero-knowledge proofs verify actions without revealing private data. The contract validates you have the right role before allowing actions.

**Q: What if someone loses their private state?**
A: They can rejoin with the same wallet. Role commitments on-chain prove their original role assignment.

**Q: Can the moderator see votes?**
A: No! Even the moderator can't see individual votes. Only the encrypted tally is on-chain.

**Q: How does whistleblowing stay anonymous?**
A: The circuit proves you witnessed an event without revealing your identity. The blockchain only records the location, not the reporter.

**Q: What's the gas cost?**
A: Midnight uses DUST tokens for computation. Each action costs ~1-10 DUST depending on circuit complexity.

---

Good luck with your demo! 🎉
