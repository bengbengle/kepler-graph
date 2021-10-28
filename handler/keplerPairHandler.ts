import {log,dataSource, Address, BigInt , ethereum, ipfs} from "@graphprotocol/graph-ts"

import { 
  Pair,
  SwapOrder,
} from "../generated/schema"

import {
  Burn,
  Mint,
  Swap,
  Sync,
} from "../generated/KeplerPair/KeplerPair"

export function handleMint(event: Mint): void {
  log.info("[Mint]: ", []);
  let sender = event.params.sender;
  let amount0 = event.params.amount0;
  let amount1 = event.params.amount1;
  let reserve0 = event.params.reserve0;
  let reserve1 = event.params.reserve1;
  let liquidity = event.params.liquidity;
  let totalSupply = event.params.totalSupply;
  let address = event.address;
  log.info("[Mint Address]: {}", [address.toHex()]);
  let pair = Pair.load(address.toHex());
  log.info("search pair", []);
  if (pair != null) {
    log.info("pair found:", []);
    pair.reserve0 = reserve0;
    log.info("reserve0: {}", [reserve0.toString()]);
    pair.reserve1 = reserve1;
    pair.totalSupply = totalSupply;
    log.info("pair reserve0: {}", [pair.reserve0.toString()]);
    pair.save();
  }
}

export function handleBurn(event: Burn): void {
  log.info("[Burn]: ", []);
  let sender = event.params.sender;
  let amount0 = event.params.amount0;
  let amount1 = event.params.amount1;
  let to = event.params.to;
  let reserve0 = event.params.reserve0;
  let reserve1 = event.params.reserve1;
  let liquidity = event.params.liquidity;
  let totalSupply = event.params.totalSupply;
  let address = event.address;

  let pair = Pair.load(address.toHex());
  if (pair != null) {
    pair.reserve0 = reserve0;
    pair.reserve1 = reserve1;
    pair.totalSupply = totalSupply;
    pair.save();
  }
}

export function handleSwap(event: Swap): void {
  log.info("[Swap]: ", []);
  let pair = Pair.load(event.address.toHex());
  if (pair == null) {
    return;
  }
  let swapOrderId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let swapOrder = new SwapOrder(swapOrderId);
  swapOrder.pair = event.address.toHex();
  swapOrder.fromAddress = event.params.sender;
  if (event.params.amount0In != BigInt.fromI32(0)) {
    swapOrder.fromToken = pair.token0;
    swapOrder.toToken = pair.token1;
    swapOrder.fromAmount = event.params.amount0In;
    swapOrder.toAmount = event.params.amount1Out;
  } else if (event.params.amount1In != BigInt.fromI32(0)) {
    swapOrder.fromToken = pair.token1;
    swapOrder.toToken = pair.token0;
    swapOrder.fromAmount = event.params.amount1In;
    swapOrder.toAmount = event.params.amount0Out;
  } else {
    return;
  }
  swapOrder.toAddress = event.params.to;
  swapOrder.transactionHash = event.transaction.hash;
  swapOrder.createAt = event.block.timestamp;
  swapOrder.save();
}

export function handleSync(event: Sync): void {
  log.info("[Sync]: ", []);
  let pair = Pair.load(event.address.toHex());
  if (pair == null) {
    return;
  } 
  pair.reserve0 = event.params.reserve0;
  pair.reserve1 = event.params.reserve1;
  pair.save();
}
