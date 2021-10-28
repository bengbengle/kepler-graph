import {log,dataSource, Address, BigInt , ethereum, ipfs} from "@graphprotocol/graph-ts"

import { 
  FeeDispatch
} from "../generated/schema"

import {
  TransferFeeFarm
} from "../generated/FeeDispatcher/FeeDispatcher"

export function handleTransferFeeFarm(event: TransferFeeFarm): void {
  log.info("[TransferFeeFarm]: ", []);
  let to = event.params.to;
  let token = event.params.token;
  let amount = event.params.amount;
  let farmType = event.params.farmType;
  let feeDispatchId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let feeDispatch = new FeeDispatch(feeDispatchId);
  feeDispatch.destination = to;
  feeDispatch.token = token.toHex();
  feeDispatch.amount = amount;
  feeDispatch.farmType = farmType;
  feeDispatch.createAt = event.block.timestamp;
  feeDispatch.save();
}
