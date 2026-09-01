using TaxFlow.Backend.Models;

namespace TaxFlow.Backend.Services
{
    public interface IBankMatcherService
    {
        void ReconcileBankTransaction(BankTransaction txn, List<Party> parties);
    }

    public class BankMatcherService : IBankMatcherService
    {
        public void ReconcileBankTransaction(BankTransaction txn, List<Party> parties)
        {
            if (string.IsNullOrWhiteSpace(txn.Description)) return;

            string normalizedDesc = txn.Description.ToUpperInvariant();
            Party? bestMatch = null;
            double highestScore = 0;

            foreach (var party in parties)
            {
                string partyName = party.Name.ToUpperInvariant();
                double score = CalculateSimilarity(normalizedDesc, partyName);

                // Additional bonus if party name tokens match inside narration
                var tokens = partyName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                int tokenMatchCount = 0;
                foreach (var t in tokens)
                {
                    if (t.Length > 2 && normalizedDesc.Contains(t))
                    {
                        tokenMatchCount++;
                    }
                }

                if (tokens.Length > 0)
                {
                    double tokenScore = (double)tokenMatchCount / tokens.Length * 100.0;
                    score = Math.Max(score, tokenScore);
                }

                if (score > highestScore)
                {
                    highestScore = score;
                    bestMatch = party;
                }
            }

            if (bestMatch != null && highestScore >= 50.0)
            {
                txn.MatchedPartyId = bestMatch.Id;
                txn.MatchedPartyName = bestMatch.Name;
                txn.MatchConfidence = Math.Round((decimal)highestScore, 1);
            }
        }

        private double CalculateSimilarity(string source, string target)
        {
            if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target)) return 0;
            if (source.Contains(target) || target.Contains(source)) return 95.0;

            int stepsToScan = Math.Min(source.Length, target.Length);
            int matchingChars = 0;

            for (int i = 0; i < stepsToScan; i++)
            {
                if (source[i] == target[i]) matchingChars++;
            }

            return ((double)matchingChars / Math.Max(source.Length, target.Length)) * 100.0;
        }
    }
}
