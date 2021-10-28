import {log,dataSource, Address, BigInt , ethereum, ipfs} from "@graphprotocol/graph-ts"

import { 
  Crycle,
  User,
  LockInfo,
  LockOrder,
  Token,
  Pair
} from "../generated/schema"

import {
  Deposit,
  Withdraw
} from "../generated/MasterChef/MasterChef"

export function handleDeposit(event: Deposit): void {
  log.info("[Deposit]: ", []);
  let user = event.params.user;
  let inviter = event.params.inviter;
  let pair = event.params.pair;
  let lockId = event.params.lockId;
  let amount = event.params.amount;
  let shares = event.params.shares;
  let lockType = event.params.lockType;
  
  let lockOrderId = user.toHex() + "-" + pair.toHex() + "-" + lockId.toString();
  let lockOrder = new LockOrder(lockOrderId);
  lockOrder.lockId = lockId;
  lockOrder.user = user.toHex();
  lockOrder.pair = pair.toHex();
  lockOrder.amount = amount;
  lockOrder.shares = shares;
  lockOrder.lockType = lockType;
  lockOrder.lockAt = event.block.timestamp;
  let lockTime = BigInt.fromI32(0);
  if (lockType == BigInt.fromI32(1)) {
    lockTime = BigInt.fromI32(30 * 24 * 60 * 60);
  } else if (lockType == BigInt.fromI32(2)) {
    lockTime = BigInt.fromI32(90 * 24 * 60 * 60);
  } else if (lockType == BigInt.fromI32(3)) {
    lockTime = BigInt.fromI32(360 * 24 * 60 * 60);
  }
  lockOrder.expireAt = lockOrder.lockAt + lockTime;
  lockOrder.unlocked = false;
  lockOrder.save();
  
  let lockInfoId = user.toHex() + "-" + pair.toHex();
  let lockInfo = LockInfo.load(lockInfoId);
  if (lockInfo == null) {
    lockInfo = new LockInfo(lockInfoId);
    lockInfo.user = user.toHex();
    lockInfo.pair = pair.toHex();
    lockInfo.lockAmount = amount;
    lockInfo.lockShares = shares;
    lockInfo.inviteLockAmount = BigInt.fromI32(0);
    lockInfo.inviteLockShares = BigInt.fromI32(0);
  } else {
    lockInfo.lockAmount = lockInfo.lockAmount + amount;
    lockInfo.lockShares = lockInfo.lockShares + shares;
  }
  lockInfo.save();

  let inviterLockInfoId = inviter.toHex() + "-" + pair.toHex();
  log.info("inviter: {}", [inviter.toHex()]);
  let inviterLockInfo = LockInfo.load(inviterLockInfoId);
  if (inviterLockInfo == null) {
    inviterLockInfo = new LockInfo(inviterLockInfoId);
    inviterLockInfo.user = inviter.toHex();
    inviterLockInfo.pair = pair.toHex();
    inviterLockInfo.lockAmount = BigInt.fromI32(0);
    inviterLockInfo.lockShares = BigInt.fromI32(0);
    inviterLockInfo.inviteLockAmount = amount;
    inviterLockInfo.inviteLockShares = shares;
  } else {
    inviterLockInfo.inviteLockAmount = inviterLockInfo.inviteLockAmount + amount;
    inviterLockInfo.inviteLockShares = inviterLockInfo.inviteLockShares + shares;
  }
  inviterLockInfo.save();

  let pairInfo = Pair.load(pair.toHex());
  if (pairInfo != null ) {
    let token0 = Token.load(pairInfo.token0);
    let token1 = Token.load(pairInfo.token1);
    if (token0 != null && token1 != null && ((token0.symbol == 'USDT' && token1.symbol == 'SDS') || (token1.symbol == 'USDT' && token0.symbol == 'SDS'))) {
        let crycle = Crycle.load(user.toHex());
	if (crycle != null) {
	  crycle.amount = crycle.amount + amount; 
	}
    }
  }
}

export function handleWithdraw(event: Withdraw): void {
  log.info("[Withdraw]: ", []);
  let user = event.params.user;
  let inviter = event.params.inviter;
  let pair = event.params.pair;
  let lockId = event.params.lockId;
  let amount = event.params.amount;
  let shares = event.params.shares;
  let lockType = event.params.lockType;

  let lockInfoId = user.toHex() + "-" + pair.toHex() + "-" + lockId.toString();
  let lockOrder = LockOrder.load(lockInfoId);
  if (lockOrder != null) {
    lockOrder.unlocked = true;
    lockOrder.save();
  }

  let lockInfo = LockInfo.load(user.toHex());
  if (lockInfo != null) {
    lockInfo.lockAmount = lockInfo.lockAmount - amount;
    lockInfo.lockShares = lockInfo.lockShares - shares;
    lockInfo.save();
  }

  let inviterLockInfo = LockInfo.load(inviter.toHex());
  if (inviterLockInfo != null) {
    inviterLockInfo.inviteLockAmount = inviterLockInfo.inviteLockAmount - amount;
    inviterLockInfo.inviteLockShares = inviterLockInfo.inviteLockShares - shares;
    inviterLockInfo.save();
  }

  let pairInfo = Pair.load(pair.toHex());
  if (pairInfo != null ) {
    let token0 = Token.load(pairInfo.token0);
    let token1 = Token.load(pairInfo.token1);
    if (token0 != null && token1 != null && ((token0.symbol == 'USDT' && token1.symbol == 'SDS') || (token1.symbol == 'USDT' && token0.symbol == 'SDS'))) {
        let crycle = Crycle.load(user.toHex());
	if (crycle != null) {
	  crycle.amount = crycle.amount - amount; 
	}
    }
  }
}
