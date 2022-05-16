using EFModels;
namespace ViewModels
{
    public class ErrorViewModel
    {
        public string? RequestId { get; set; }
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
    public class EditReasonsViewModel
    {
        public EditReasonsViewModel(DatabaseContext DB)
        {
            var AllReasons = DB.CandidateReasons.ToArray();
            if (AllReasons.Length > 0) { Reason1 = AllReasons[0]; }
            if (AllReasons.Length > 1) { Reason2 = AllReasons[1]; }
            if (AllReasons.Length > 2) { Reason3 = AllReasons[2]; }
        }
        public CandidateReason? Reason1;
        public CandidateReason? Reason2;
        public CandidateReason? Reason3;
    }
    public class FetchRandomReasonViewModel
    {
        public FetchRandomReasonViewModel(DatabaseContext DB)
        {
            var AllReasons = DB.CandidateReasons.ToArray();
            RandomReason = (AllReasons.Length > 0) ? Helpers.RandomOrDefault(AllReasons) : null;
        }
        public CandidateReason? RandomReason;
    }
}