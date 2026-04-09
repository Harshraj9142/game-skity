# Contract Redeployment Guide

## When to Redeploy

You need to redeploy the contract when you change:
- ✅ Contract code (`.compact` files)
- ✅ Witness functions (`witnesses.ts`)
- ✅ Circuit logic or structure
- ❌ Frontend code only (no redeploy needed)

## Step-by-Step Redeployment

### 1. Rebuild the Contract

```bash
cd skity-game/contract
npm run build
```

This will:
- Clean the `dist` folder
- Recompile TypeScript
- Copy managed contract files
- Generate proper source maps

### 2. Copy ZK Keys to Public Folder

The ZK proving/verifying keys need to be accessible by the frontend:

```bash
# From the skity-game directory
cp -r contract/src/managed/game/keys/* public/zk-keys/
```

Or manually copy all `.prover` and `.verifier` files from:
- `contract/src/managed/game/keys/`

To:
- `public/zk-keys/`

### 3. Deploy to Preprod Network

```bash
cd skity-game/skity-cli
npm run preprod
```

This will:
1. Connect to preprod network
2. Deploy the contract
3. Return a new contract address

**Save the contract address!** You'll need it to connect.

### 4. Update Frontend (Optional)

If you want to use the new contract as default:

Edit `src/components/room-picker.tsx`:
```typescript
const [contractAddress, setContractAddress] = useState("YOUR_NEW_CONTRACT_ADDRESS");
```

### 5. Test the Deployment

1. Start the frontend:
```bash
cd skity-game
npm run dev
```

2. Open http://localhost:5173

3. Connect wallet

4. Enter the new contract address

5. Try joining the game

## Quick Commands

```bash
# Full rebuild and redeploy
cd skity-game/contract && npm run build && \
cd ../skity-cli && npm run preprod

# Just rebuild (no redeploy)
cd skity-game/contract && npm run build

# Copy ZK keys
cd skity-game && cp -r contract/src/managed/game/keys/* public/zk-keys/
```

## What Changed in This Update

### Witness Functions (`contract/src/witnesses.ts`)
- Fixed `localWitnessedEvents` to return exactly 10 events (padded with zeros)
- Added comprehensive logging to all witness functions
- Better error handling for missing secret keys

### Why This Requires Redeployment
The witness functions are compiled into the contract. When you change them, the contract's behavior changes, so you need a new deployment.

## Troubleshooting

### "Contract not found" Error
- Make sure you're using the NEW contract address
- Check you're on preprod network in Lace wallet
- Verify the deployment succeeded (check CLI output)

### "Proof server error" Still Happening
- Make sure you rebuilt the contract: `npm run build`
- Verify ZK keys were copied to `public/zk-keys/`
- Check browser console for witness function logs

### "Transaction failed" Error
- Wait 10-15 seconds between transactions
- Make sure you have tNight tokens
- Check you have DUST tokens (auto-generated)

### Deployment Takes Too Long
- Preprod deployment can take 2-5 minutes
- Don't interrupt the process
- Check your internet connection

## Alternative: Use Existing Contract

If you don't want to redeploy, you can use the existing deployed contract:
```
344d8ad330d47d56b8175c73e00fac279d196610a73e2621b110b28369a25f29
```

However, this contract has the OLD witness functions without the fixes, so you may still encounter errors.

## Deployment Checklist

- [ ] Contract code changes saved
- [ ] `cd skity-game/contract && npm run build` completed
- [ ] ZK keys copied to `public/zk-keys/`
- [ ] `cd skity-game/skity-cli && npm run preprod` completed
- [ ] New contract address saved
- [ ] Frontend updated with new address (optional)
- [ ] Tested joining with new contract
- [ ] Verified witness logs appear in console

## Next Steps After Deployment

1. Share the new contract address with other players
2. Test with multiple wallets/browsers
3. Verify all game phases work correctly
4. Check that player list updates properly

## Keeping Track of Deployments

Consider keeping a log of deployments:

```
# deployment-log.txt
2024-01-15 - Initial deployment
Contract: 344d8ad330d47d56b8175c73e00fac279d196610a73e2621b110b28369a25f29
Changes: Initial version

2024-01-16 - Fixed witness functions
Contract: [NEW_ADDRESS_HERE]
Changes: 
- Fixed localWitnessedEvents padding
- Added logging to witnesses
- Better error handling
```

This helps track which contract has which features.
