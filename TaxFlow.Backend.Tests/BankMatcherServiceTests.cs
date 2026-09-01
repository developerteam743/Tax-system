using Xunit;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Tests
{
    public class BankMatcherServiceTests
    {
        private readonly IBankMatcherService _matcherService;
        private readonly List<Party> _testParties;

        public BankMatcherServiceTests()
        {
            _matcherService = new BankMatcherService();
            _testParties = new List<Party>
            {
                new Party { Id = "p-1", Name = "Shree Ram Metals", Gstin = "24AABCS1429B1ZX" },
                new Party { Id = "p-2", Name = "Patel Auto Spares GIDC", Gstin = "24AAGCP9872C1Z4" },
                new Party { Id = "p-3", Name = "Apex Electronics Ltd", Gstin = "27AAACA9999M1ZQ" }
            };
        }

        [Fact]
        public void ReconcileBankTransaction_ExactMatch_AssignsHighConfidence()
        {
            // Arrange
            var txn = new BankTransaction
            {
                Id = "t-1",
                Description = "NEFT CR-SHREE RAM METALS-AXISB0001",
                Amount = 54000,
                Type = BankTxnType.Credit
            };

            // Act
            _matcherService.ReconcileBankTransaction(txn, _testParties);

            // Assert
            Assert.Equal("p-1", txn.MatchedPartyId);
            Assert.Equal("Shree Ram Metals", txn.MatchedPartyName);
            Assert.True(txn.MatchConfidence >= 90m, $"Confidence was {txn.MatchConfidence}");
        }

        [Fact]
        public void ReconcileBankTransaction_PartialTokenMatch_MatchesCorrectParty()
        {
            // Arrange
            var txn = new BankTransaction
            {
                Id = "t-2",
                Description = "RTGS INW PATEL AUTO GIDC TRF",
                Amount = 120000,
                Type = BankTxnType.Credit
            };

            // Act
            _matcherService.ReconcileBankTransaction(txn, _testParties);

            // Assert
            Assert.Equal("p-2", txn.MatchedPartyId);
            Assert.Equal("Patel Auto Spares GIDC", txn.MatchedPartyName);
            Assert.True(txn.MatchConfidence >= 50m);
        }

        [Fact]
        public void ReconcileBankTransaction_UnrelatedNarration_DoesNotMatch()
        {
            // Arrange
            var txn = new BankTransaction
            {
                Id = "t-3",
                Description = "ATM CASH WDL AHMEDABAD MG ROAD",
                Amount = 10000,
                Type = BankTxnType.Debit
            };

            // Act
            _matcherService.ReconcileBankTransaction(txn, _testParties);

            // Assert
            Assert.Null(txn.MatchedPartyId);
            Assert.Null(txn.MatchedPartyName);
        }
    }
}
