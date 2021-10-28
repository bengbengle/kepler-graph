import {log,dataSource, Address, BigInt , ethereum, ipfs} from "@graphprotocol/graph-ts"

import { 
  Crycle,
  CrycleUser,
  VoteInfo,
  VoteUserInfo,
  VoteCrycleInfo,
  Vote,
  LockInfo,
} from "../generated/schema"

import {
  NewCrycle,
  NewTitle,
  NewMainfest,
  NewTelegram,
  NewUser,
  NewVoteInfo,
  NewVote
} from "../generated/Crycle/Crycle"

export function handleNewCrycle(event: NewCrycle): void {
  log.info("[NewCrycle]: ", []);
  let creator = event.params.creator;
  let title = event.params.title;
  let mainfest = event.params.mainfest;
  let telegram = event.params.telegram;
  let timestamp = event.params.timestamp;
  let crycle = new Crycle(creator.toHex());
  crycle.creator = creator;
  crycle.title = title;
  crycle.mainfest = mainfest;
  crycle.telegram = telegram;
  crycle.userNum = BigInt.fromI32(0);
  crycle.createAt = timestamp;
  crycle.amount = BigInt.fromI32(0);
  crycle.save();
}

export function handleNewTitle(event: NewTitle): void {
  log.info("[NewTitle]: ", []);
  let creator = event.params.creator;
  let oldTitle = event.params.oldTitle;
  let newTitle = event.params.newTitle;
  let timestamp = event.params.timestamp;
  let crycle = Crycle.load(creator.toHex());
  crycle.title = newTitle;
  crycle.save();
}

export function handleNewMainfest(event: NewMainfest): void {
  log.info("[NewMainfest]: ", []);
  let creator = event.params.creator;
  let oldMainfest = event.params.oldMainfest;
  let newMainfest = event.params.newMainfest;
  let timestamp = event.params.timestamp;
  let crycle = Crycle.load(creator.toHex());
  crycle.mainfest = newMainfest;
  crycle.save();
}

export function handleNewTelegram(event: NewTelegram): void {
  log.info("[NewTelegram]: ", []);
  let creator = event.params.creator;
  let oldTelegram = event.params.oldTelegram;
  let newTelegram = event.params.newTelegram;
  let timestamp = event.params.timestamp;
  let crycle = Crycle.load(creator.toHex());
  crycle.telegram = newTelegram;
  crycle.save();
}

export function handleNewUser(event: NewUser): void {
  log.info("[NewUser]: ", []);
  let user = event.params.user;
  let creator = event.params.creator;
  let userNum = event.params.userNum;
  let timestamp = event.params.timestamp;
  let crycle = Crycle.load(creator.toHex());
  if (crycle == null) {
    return;
  }
  crycle.userNum = userNum;
  crycle.save();
  let crycleUser = new CrycleUser(user.toHex());
  crycleUser.user = user;
  crycleUser.crycle = crycle.id;
  crycleUser.joinAt = timestamp;
  crycleUser.save();
}

export function handleNewVoteInfo(event: NewVoteInfo): void {
  log.info("[NewVote]: ", []); 
  let voteId = event.params.voteId;
  let beginAt = event.params.beginAt;
  let countAt = event.params.countAt;
  let finishAt = event.params.finishAt;
  let reward = event.params.reward;
  let timestamp = event.block.timestamp;
  let voteInfo = new VoteInfo(voteId.toString());
  voteInfo.createAt = timestamp;
  voteInfo.beginAt = beginAt;
  voteInfo.voteAt = timestamp;
  voteInfo.finishAt = finishAt;
  voteInfo.reward = reward;
  voteInfo.voteNum = BigInt.fromI32(0);
  voteInfo.save();
}

export function handleNewVote(event: NewVote): void {
  log.info("[Vote]: ", []);
  let voteId = event.params.voteId;
  let user = event.params.user;
  let crycle = event.params.crycle;
  let num = event.params.num;
  let totalSended = event.params.totalSended;
  let totalReceived = event.params.totalReceived;
  let id = event.transaction.hash.toHex();
  let vote = new Vote(id);
  vote.voteInfo = voteId.toString();
  vote.user = user.toHex();
  vote.crycle = crycle.toHex();
  vote.voteNum = num;
  vote.voteAt = event.block.timestamp;
  vote.save();
  let crycleUser = CrycleUser.load(user.toHex()); 
  if (crycleUser == null) {
	crycleUser = new CrycleUser(user.toHex());
  	crycleUser.user = user;
  	crycleUser.crycle = crycle.toHex();
  	crycleUser.joinAt = event.block.timestamp;
  	crycleUser.save();
  }

  let voteCrycleInfoId = voteId.toString() + "-" + crycle.toHex();
  log.info("[UserVoteInfo]", []);
  log.info(voteId.toString(), []);
  log.info(crycle.toHex(), []);
  log.info("[UserVoteInfoFinish]", []);
  let crycleInfo = Crycle.load(crycle.toHex());
  if (crycleInfo == null) {
    return;
  }
  let voteCrycleInfo = VoteCrycleInfo.load(voteCrycleInfoId);
  if (voteCrycleInfo == null) {
    voteCrycleInfo = new VoteCrycleInfo(voteCrycleInfoId);
    voteCrycleInfo.voteInfo = voteId.toString();
    voteCrycleInfo.crycle = crycle.toHex();
    voteCrycleInfo.voteNum = num;
    voteCrycleInfo.lastVoteAt = event.block.timestamp;
  } else {
    voteCrycleInfo.voteNum = voteCrycleInfo.voteNum + num;
    voteCrycleInfo.lastVoteAt = event.block.timestamp;
  }
  voteCrycleInfo.save();

  let voteUserInfoId = voteId.toString() + "-" + user.toHex();
  let voteUserInfo = VoteUserInfo.load(voteUserInfoId);
  if (voteUserInfo == null) {
    voteUserInfo = new VoteUserInfo(voteUserInfoId);
    voteUserInfo.voteInfo = voteId.toString();
    voteUserInfo.user = user.toHex();
    voteUserInfo.crycle = crycle.toHex();
    voteUserInfo.voteNum = num;
    voteUserInfo.lastVoteAt = event.block.timestamp;
  } else {
    voteUserInfo.voteNum = voteUserInfo.voteNum + num;
    voteUserInfo.lastVoteAt = event.block.timestamp;
  }
  voteUserInfo.save();

  let voteInfo = VoteInfo.load(voteId.toString());
  voteInfo.voteNum = voteInfo.voteNum + num;
  voteInfo.save();
}

