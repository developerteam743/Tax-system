import { BankTransaction, Party } from '../types/tax';

export const matchBankTransaction = (txn: BankTransaction, parties: Party[]): { matchedParty?: Party; confidence: number } => {
  const desc = txn.description.toUpperCase();
  let bestParty: Party | undefined;
  let highestScore = 0;

  for (const party of parties) {
    const pName = party.name.toUpperCase();

    // 1. Direct Substring Check
    if (desc.includes(pName)) {
      highestScore = 96.5;
      bestParty = party;
      break;
    }

    // 2. Token Matching
    const partyTokens = pName.split(/\s+/).filter((t) => t.length > 2 && t !== 'PVT' && t !== 'LTD');
    let matchedTokens = 0;

    for (const token of partyTokens) {
      if (desc.includes(token)) {
        matchedTokens++;
      }
    }

    if (partyTokens.length > 0) {
      const score = (matchedTokens / partyTokens.length) * 92.0;
      if (score > highestScore && score >= 40) {
        highestScore = Math.round(score * 10) / 10;
        bestParty = party;
      }
    }
  }

  return {
    matchedParty: bestParty,
    confidence: highestScore,
  };
};
