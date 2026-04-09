# CRITICAL: You MUST Rebuild and Redeploy

## The Problem

We changed the witness functions in `contract/src/witnesses.ts`. These changes include:
1. Fixed `localWitnessedEvents` to return exactly 10 events
2. Made secret key generation consistent
3. Added logging

**Witness functions are compiled INTO the contract.** The deployed contract still has the OLD witness functions, which is why you're getting the proof server error.

## Required Steps (IN ORDER)

### Step 1: Rebuild the Contract
```bash
cd skity-game/contract
npm run build
```

This compiles the new witness functions.

### Step 2: Copy ZK Keys
```bash
cd ..
cp -r contract/src/managed/game/keys/* public/zk-keys/
```

### Step 3: Deploy New Contract
```bash
cd skity-cli
npm run preprod
```

**IMPORTANT**: This will give you a NEW contract address. Save it!

### Step 4: Clear Browser Storage
1. Open DevTools (F12)
2. Application tab → Local Storage
3. Clear all
4. Refresh page

### Step 5: Use New Contract
1. Connect wallet
2. Enter the NEW contract address (from Step 3)
3. Join game

## Why This is Required

The proof server validates that the witness data matches the contract's expectations. When you change witness functions, you create a mismatch:

```
OLD Contract (deployed) → Expects old witness format
NEW Witness Functions → Sends new witness format
Proof Server → REJECTS (400 error)
```

After redeployment:
```
NEW Contract (deployed) → Expects new witness format
NEW Witness Functions → Sends new witness format
Proof Server → ACCEPTS ✅
```

## Alternative: Test Locally First

If you want to test without deploying to preprod:

```bash
cd skity-cli
npm run standalone
```

This runs a local Midnight network for testing.

## What Changed

### Before (Broken)
- `midnight-functions.ts` used SHA-256 for secret key
- `witnesses.ts` used XOR mixing for secret key
- Keys didn't match → derived public keys different → proof server rejected

### After (Fixed)
- Both use XOR mixing
- Keys match
- But contract still has OLD code until redeployed

## Verification

After redeployment, you should see in console:
```
🎮 Joining game...
   Wallet address: 0x...
   Private state exists: true
🔑 localSecretKey witness called
   Using existing secret key
🔑 Our derived public key: 0x...
   Calling joinGame circuit...
✅ Joined game successfully
```

## If Still Failing

1. Check you're using the NEW contract address
2. Verify browser storage is cleared
3. Check console for witness logs
4. Verify contract was rebuilt: `ls -la contract/dist/`
5. Check ZK keys were copied: `ls -la public/zk-keys/`

## Quick Command Sequence

```bash
# From skity-game directory
cd contract && npm run build && \
cd .. && cp -r contract/src/managed/game/keys/* public/zk-keys/ && \
cd skity-cli && npm run preprod
```

Then use the new contract address in the UI.
