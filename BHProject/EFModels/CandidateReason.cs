using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EFModels
{
    public class CandidateReason : IEntity
    {
        public long ID { get; set; }
        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
        public string? Text { get; set; }
    }
}