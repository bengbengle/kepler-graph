import {log,dataSource, Address, BigInt , ethereum, ipfs} from "@graphprotocol/graph-ts"

import { 
  User
} from "../generated/schema"

import {
  NewUser
} from "../generated/User/User"

export function handleNewUser(event: NewUser): void {
  log.info("[NewUser]: ", []);
  let user = event.params.user;
  let inviter = event.params.inviter;
  let timestamp = event.params.timestamp;

  let inviterUserInfo = User.load(inviter.toHex());
  if (inviterUserInfo == null) {
    inviterUserInfo = new User(inviter.toHex());
    inviterUserInfo.inviter = inviter.toHex();
    inviterUserInfo.registeAt = timestamp;
    inviterUserInfo.inviteNum = BigInt.fromI32(0);
    inviterUserInfo.save();
  }
  
  let userInfo = new User(user.toHex());
  userInfo.inviter = inviter.toHex();
  userInfo.registeAt = timestamp;
  userInfo.inviteNum = BigInt.fromI32(0);
  userInfo.save();

  let inviterInfo = User.load(inviter.toHex());
  if (inviterInfo != null) {
    inviterInfo.inviteNum = inviterInfo.inviteNum + BigInt.fromI32(1);
    inviterInfo.save();
  }
}
