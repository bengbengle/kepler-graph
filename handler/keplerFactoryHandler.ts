import {log,dataSource, Address, BigInt , ethereum, ipfs} from "@graphprotocol/graph-ts"

import { 
  Token,
  Pair
} from "../generated/schema"

import {
  TokenInfo,
  PairCreated
} from "../generated/KeplerFactory/KeplerFactory"

import {
  KeplerPair as KeplerPairTemplate
} from "../generated/templates"

export function handleTokenInfo(event: TokenInfo): void {
  log.info("[TokenInfo]: ", []);
  let token = event.params.token;
  let name = event.params.name;
  let symbol = event.params.symbol;
  let decimals = event.params.decimals;
  let tokenInfo =Token.load(token.toHex());
  if (tokenInfo == null) {
    tokenInfo = new Token(token.toHex());
    tokenInfo.name = name;
    tokenInfo.symbol = symbol;
    tokenInfo.decimals = decimals;
    tokenInfo.save();
  }
}

export function handlePairCreated(event: PairCreated): void {
  log.info("[PairCreated]: ", []);
  let token0 = event.params.token0;
  let token1 = event.params.token1;
  let pair = event.params.pair;
  let timestamp = event.block.timestamp;
  let pairInfo = Pair.load(pair.toHex());
  if (pairInfo == null) {
    pairInfo = new Pair(pair.toHex());
    pairInfo.token0 = token0.toHex();
    pairInfo.token1 = token1.toHex();
    pairInfo.reserve0 = BigInt.fromI32(0);
    pairInfo.reserve1 = BigInt.fromI32(0);
    pairInfo.totalSupply = BigInt.fromI32(0);
    pairInfo.createAt = timestamp;
    pairInfo.save();
  }
  KeplerPairTemplate.create(pair);
}
