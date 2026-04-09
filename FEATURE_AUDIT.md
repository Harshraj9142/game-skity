# FRAMED Game - Feature Audit Report

## 🚨 CRITICAL FINDING: Two Separate Implementations

Your project has **TWO COMPLETELY DIFFERENT BACKENDS**:

### 1. Frontend Implementation (React + FHE)
- **Chain**: 9090 (fhEVM/Zama Network)
- **Contract**: Solidity with FHE encryption (`mafia.json` ABI)
- **Location**: `src/lib/game-functions.ts`, `src/abi/mafia.json`
- **Status**: ✅ FULLY WIRED to UI

### 2. Backend Implementation (Midnight Network)
- **Chain**: Midnight Network (ZK blockchain)
- **Contract**: Compact smart contract (`game.compact`)
- **Location**: `contract/src/game.compact`, `skity-cli/`
- **Status**: ❌ NOT CONNECTED TO FRONTEND AT ALL

---

## 📊 Midnight Contract Features vs Frontend Status

### ✅ Implemented in Midnight Contract + CLI (NOT in Frontend)

| Feature | Contract Circuit | CLI Support | Frontend UI | Status |
|---------|-----------------|-------------|-------------|--------|
| **Join Game** | `joinGame()` | ✅ Yes | ❌ No | CLI only |
| **Initialize Game** | `initGame()` | ✅ Yes | ❌ No | CLI only |
| **Cast Private Vote** | `castPrivateVote()` | ✅ Yes | ❌ No | CLI only |
| **Take Action** | `takeAction()` | ✅ Yes | ❌ No | CLI only |
| **Blow Whistle** | `blowWhistle()` | ✅ Yes | ❌ No | CLI only |
| **Trigger Sabotage** | `triggerSabotage()` | ✅ Yes | ❌ No | CLI only |
| **Display Game State** | N/A (query) | ✅ Yes | ❌ No | CLI only |

### ❌ Missing from Frontend (Midnight Features)

| Feature | Contract Circuit | CLI Support | Frontend UI | Notes |
|---------|-----------------|-------------|-------------|-------|
| **Advance to Voting** | `advanceToVoting()` | ❌ No | ❌ No | Phase transition |
| **Start New Round** | `startNewRound()` | ❌ No | ❌ No | Round management |
| **Reveal Tally** | `revealTally()` | ❌ No | ❌ No | Threshold reveal |
| **Complete Reveal** | `completeReveal()` | ❌ No | ❌ No | Finalize voting |
| **Deactivate Sabotage** | `deactivateSabotage()` | ❌ No | ❌ No | End blackout |
| **Get Player Status** | `getPlayerStatus()` | ❌ No | ❌ No | Query alive status |
| **View Own Role** | `viewOwnRole()` | ❌ No | ❌ No | Check your role |

### 📋 Midnight Contract Features Breakdown

#### FULLY IMPLEMENTED (Contract + CLI)
1. ✅ **joinGame** - Player joins the game lobby
2. ✅ **initGame** - Host assigns roles and starts game
3. ✅ **castPrivateVote** - Secret ballot with nullifiers
4. ✅ **takeAction** - Night actions (kill/save/investigate)
5. ✅ **blowWhistle** - Anonymous whistleblower alerts
6. ✅ **triggerSabotage** - Mafia vote blackout ability

#### PARTIALLY IMPLEMENTED (Contract only, no CLI/UI)
7. ⚠️ **advanceToVoting** - Moderator transitions night → voting
8. ⚠️ **startNewRound** - Reset for next round
9. ⚠️ **revealTally** - Begin threshold reveal process
10. ⚠️ **completeReveal** - Finalize vote results
11. ⚠️ **deactivateSabotage** - End sabotage blackout
12. ⚠️ **getPlayerStatus** - Query if player is alive
13. ⚠️ **viewOwnRole** - Check your assigned role

---

## 🔍 What the Frontend Actually Uses (FHE Contract)

The React frontend connects to a **completely different contract** with these functions:

### FHE Contract Functions (from mafia.json)
- `joinGame(address)` - Join with address
- `initializeGame()` - Start game
- `action(bytes)` - Take encrypted action
- `castVote(uint8)` - Vote for player
- `viewOwnRole()` - Decrypt your role
- `viewCaught()` - Check detective result
- `generateUniqueRole()` - Role assignment
- `isMafiaKilled()` - Check win condition

### Frontend Game Flow
1. User joins via Privy wallet
2. Connects to chain 9090 (fhEVM)
3. Uses FHE encryption for roles/actions
4. GraphQL indexer for game state
5. Socket.io for real-time chat

---

## 🎯 Missing Midnight Features in Frontend

### 1. Secret Ballots (Midnight Feature)
- **Contract**: ✅ `castPrivateVote()` with nullifiers
- **CLI**: ✅ Implemented
- **Frontend**: ❌ Uses plain `castVote(uint8)` instead
- **Privacy**: Midnight = ZK proofs, Frontend = FHE encryption

### 2. Anonymous Whistleblower
- **Contract**: ✅ `blowWhistle()` - no caller identity on-chain
- **CLI**: ✅ Implemented
- **Frontend**: ❌ No UI element at all
- **Impact**: Unique privacy feature completely missing

### 3. Sabotage System
- **Contract**: ✅ `triggerSabotage()` + `deactivateSabotage()`
- **CLI**: ✅ Trigger implemented
- **Frontend**: ❌ No UI button or indicator
- **Impact**: Most innovative mechanic not accessible

### 4. Threshold Reveal
- **Contract**: ✅ `revealTally()` + `completeReveal()`
- **CLI**: ❌ Not implemented
- **Frontend**: ❌ No UI
- **Impact**: Votes revealed immediately instead of threshold

### 5. Round Management
- **Contract**: ✅ `startNewRound()` + `advanceToVoting()`
- **CLI**: ❌ Not implemented
- **Frontend**: ❌ No UI
- **Impact**: Can't play multiple rounds

### 6. Witness Events
- **Contract**: ✅ `WitnessEvent` struct + storage
- **Witnesses**: ✅ `localWitnessedEvents()` + `storeWitnessedEvent()`
- **CLI**: ⚠️ Partially used in `blowWhistle()`
- **Frontend**: ❌ No tracking
- **Impact**: Whistleblower system incomplete

---

## 📦 What Needs to Be Done

### Option A: Connect Frontend to Midnight (Recommended for Hackathon)

#### High Priority (Core Privacy Features)
1. **Replace FHE contract calls with Midnight SDK**
   - Install `@midnight-ntwrk/midnight-js` in frontend
   - Replace `game-functions.ts` with Midnight contract calls
   - Use `contract/src/managed/game/contract/index.js`

2. **Add Sabotage UI** ⭐ UNIQUE FEATURE
   - Button: "Trigger Sabotage" (Mafia only)
   - Indicator: "🚨 VOTING BLACKED OUT - 30s"
   - Timer countdown
   - Auto-deactivate after expiry

3. **Add Whistleblower UI** ⭐ UNIQUE FEATURE
   - Button: "🚨 Blow Whistle" (during night phase)
   - Input: Select suspected player
   - Display: Anonymous alerts list
   - Show location/round without revealing reporter

4. **Wire Round Management**
   - Moderator: "Advance to Voting" button
   - Moderator: "Start New Round" button
   - Display current round number
   - Reset player action/vote flags

#### Medium Priority (Complete Game Loop)
5. **Implement Threshold Reveal**
   - Moderator: "Reveal Votes" button
   - Countdown timer (3-5 seconds)
   - Then show results via `completeReveal()`

6. **Add Phase Indicators**
   - Show current `GamePhase` enum
   - Visual indicators for each phase
   - Disable actions based on phase

7. **Display Alerts**
   - Show whistleblower alerts
   - Format: "Alert: Crime at Location X (Round Y)"
   - No reporter identity

#### Low Priority (Polish)
8. **Add viewOwnRole circuit**
   - Already in contract, just wire to UI
   - Replace FHE decrypt with Midnight query

9. **Show Player Status**
   - Use `getPlayerStatus()` circuit
   - Display alive/dead state from contract

10. **Multi-round Support**
    - Track `roundCounter` from ledger
    - Display round history
    - "Play Again" button calls `startNewRound()`

### Option B: Keep FHE Frontend (Faster for Demo)

If you want to keep the working FHE frontend:

1. **Add missing UI elements for FHE contract**
   - Check if FHE contract has sabotage/whistle features
   - Add UI buttons for existing contract functions
   - Polish the current implementation

2. **Document Midnight as "Future Work"**
   - Show CLI demo of Midnight features
   - Explain ZK advantages over FHE
   - Position as "v2 with full privacy"

---

## 🏆 Hackathon Recommendation

### For Maximum Impact:

**Keep both implementations** and present them as:

1. **Demo Version (FHE)** - Working game you can play now
   - Fully functional UI
   - Real-time multiplayer
   - FHE encryption for roles

2. **Privacy Version (Midnight)** - Advanced ZK features
   - CLI demo of unique features
   - Sabotage system
   - Anonymous whistleblower
   - Explain why ZK > FHE for this use case

### Quick Wins (2-4 hours):
1. Add sabotage button to FHE frontend (if contract supports it)
2. Add whistleblower UI (if contract supports it)
3. Create comparison slide: FHE vs Midnight ZK
4. Record CLI demo showing Midnight features

### Full Integration (8-12 hours):
1. Replace FHE calls with Midnight SDK
2. Wire all 6 CLI-supported circuits to UI
3. Add the 7 missing circuits to CLI + UI
4. Test full game loop on Midnight testnet

---

## 📝 Summary

**Current State:**
- ✅ Working FHE game with basic features
- ✅ Complete Midnight contract with advanced privacy
- ❌ Midnight contract not connected to frontend
- ❌ Unique features (sabotage, whistle) not in UI

**Missing from Frontend:**
- Sabotage system (vote blackout)
- Anonymous whistleblower alerts
- Threshold reveal mechanism
- Round management
- Phase transitions
- Witness event tracking

**Recommendation:**
Demo the FHE version, show CLI for Midnight features, explain the privacy advantages. Or spend 8-12 hours integrating Midnight into the frontend for a complete submission.
