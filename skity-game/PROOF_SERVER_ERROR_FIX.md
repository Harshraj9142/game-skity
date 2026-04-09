# Proof Server Error - Troubleshooting Guide

## Error Message
```
Unexpected error submitting scoped transaction '<unnamed>': 
Error: 'check' returned an error: 
Error: Failed Proof Server response: 
url="https://proof-server.preprod.midnight.network/check", 
code="400", status=""
```

## What This Means
The proof server is rejecting the transaction because the witness data doesn't match what the zero-knowledge circuit expects. This is a 400 Bad Request error, meaning the data format is incorrect.

## Common Causes

### 1. Vector Size Mismatch
**Problem**: Compact circuits expect fixed-size vectors, but JavaScript is sending variable-length arrays.

**Example**: `Vector<10, WitnessEvent>` requires exactly 10 elements, not 0-10.

**Fix**: Pad arrays to the exact size required:
```typescript
// WRONG - variable length
const events = witnessedEvents.map(e => ({ ... }));

// RIGHT - exactly 10 elements
const events = [];
for (let i = 0; i < 10; i++) {
  if (i < witnessedEvents.length) {
    events.push(witnessedEvents[i]);
  } else {
    events.push({ location: new Uint8Array(16), roundId: BigInt(0) });
  }
}
```

### 2. Missing or Undefined Private State
**Problem**: Witness functions are called but private state is not initialized.

**Fix**: Always initialize private state when connecting:
```typescript
const privateState: GamePrivateState = {
  role: 99,
  myVote: 0,
  witnessedEvents: [],
  secretKey: generatedKey,
};
```

### 3. Type Mismatches
**Problem**: JavaScript types don't match Compact types.

**Common Issues**:
- `number` vs `bigint` - Compact uses `Uint<8>` which becomes `bigint` in JS
- `Uint8Array` size - Must match exactly (e.g., `Bytes<32>` = 32 bytes)
- `string` vs `Uint8Array` - Never pass strings where bytes are expected

### 4. Incorrect Hash Computation
**Problem**: JavaScript computes hashes differently than the contract.

**Fix**: Use the contract runtime's hash functions:
```typescript
// WRONG - custom hash
const hash = await crypto.subtle.digest('SHA-256', data);

// RIGHT - use contract runtime
const hash = contractRuntime._derivePublicKey_0(secretKey);
```

## Fixes Applied

### 1. Fixed `localWitnessedEvents` Witness
```typescript
// Now returns exactly 10 events, padded with zeros
localWitnessedEvents(context): [GamePrivateState, WitnessEvent[]] {
  const events: WitnessEvent[] = [];
  for (let i = 0; i < 10; i++) {
    if (i < witnessedEvents.length) {
      events.push(witnessedEvents[i]);
    } else {
      events.push({
        location: new Uint8Array(16),
        roundId: BigInt(0),
      });
    }
  }
  return [context.privateState, events];
}
```

### 2. Added Comprehensive Logging
All witness functions now log when they're called and what data they're returning:
```typescript
localSecretKey(context) {
  console.log('🔑 localSecretKey witness called');
  console.log('   Private state:', context.privateState);
  // ...
}
```

### 3. Better Error Handling
Added detailed error logging in `joinGame`:
```typescript
catch (error) {
  console.error("❌ Failed to join game:", error);
  if (error instanceof Error) {
    console.error("   Error message:", error.message);
    console.error("   Error stack:", error.stack);
  }
  throw error;
}
```

## Debugging Steps

### 1. Check Console Logs
When joining, you should see:
```
🎮 Joining game...
   Wallet address: 0x...
   Private state exists: true
🔑 localSecretKey witness called
   Private state: { role: 99, myVote: 0, ... }
   Using existing secret key
🔑 Our derived public key: 0x...
   Calling joinGame circuit...
✅ Joined game successfully
```

### 2. Verify Private State
Check that private state has all required fields:
```javascript
console.log(gameContractInstance.privateState);
// Should show:
// {
//   role: 99,
//   myVote: 0,
//   witnessedEvents: [],
//   secretKey: Uint8Array(32) [...]
// }
```

### 3. Check Witness Data
Look for witness function logs:
- `🔑 localSecretKey witness called` - Should appear when joining
- `👁️ localWitnessedEvents witness called` - Should appear when blowing whistle
- `👤 localRole witness called` - Should appear when taking actions

### 4. Verify Contract Compilation
Make sure the contract is properly compiled:
```bash
cd contract
npm run build
```

Check that ZK keys exist in `public/zk-keys/`:
- `joinGame.prover`
- `joinGame.verifier`
- etc.

## Still Getting Errors?

### Check Network Configuration
Verify you're on the correct network:
```typescript
// In midnight-functions.ts
setNetworkId('preprod');  // Should be 'preprod' for testnet
```

### Verify Proof Server URL
```typescript
// In WalletContext.tsx
const proofServerUri = "https://prover.preprod.midnight.network";
```

### Check Contract Version
Make sure your contract matches the deployed version:
```bash
# Get contract address from UI
# Check it exists on preprod indexer
curl https://indexer.preprod.midnight.network/api/v3/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ contract(address:\"YOUR_ADDRESS\") { address } }"}'
```

### Rebuild Everything
Sometimes a clean rebuild helps:
```bash
# Clean and rebuild contract
cd contract
rm -rf dist node_modules
npm install
npm run build

# Clean and rebuild frontend
cd ..
rm -rf node_modules dist
npm install
npm run dev
```

## Prevention

### Always Initialize Private State
```typescript
const privateState: GamePrivateState = {
  role: 99,
  myVote: 0,
  witnessedEvents: [],
  secretKey: await generateSecretKeyFromWallet(walletAddress),
};
```

### Use Contract Runtime Functions
```typescript
// For hashing, key derivation, etc.
const derivedKey = contractRuntime._derivePublicKey_0(secretKey);
```

### Pad All Vectors
```typescript
// Any Vector<N, T> must have exactly N elements
const paddedArray = Array(N).fill(null).map((_, i) => 
  i < actualArray.length ? actualArray[i] : defaultValue
);
```

### Test Witness Functions
```typescript
// Test that witnesses return correct types
const [newState, result] = witnesses.localSecretKey(context);
console.assert(result instanceof Uint8Array);
console.assert(result.length === 32);
```

## Related Files
- `contract/src/witnesses.ts` - Witness function implementations
- `src/lib/midnight-functions.ts` - Contract interaction functions
- `contract/src/game.compact` - Contract circuits
- `src/context/WalletContext.tsx` - Proof server configuration
