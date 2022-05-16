using ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using EFModels;

namespace BHProject.Controllers
{
    public class APIController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly DatabaseContext _dbHandle;

        public APIController(ILogger<HomeController> logger, DatabaseContext dbHandle)
        {
            _logger = logger;
            _dbHandle = dbHandle;
        }

        [HttpPost]
        public IActionResult EditReasons(string? Reason1 = null, string? Reason2 = null, string? Reason3 = null)
        {
            if (string.IsNullOrEmpty(Reason1) || string.IsNullOrEmpty(Reason2) || string.IsNullOrEmpty(Reason3))
            {
                return Json(new
                {
                    success = false,
                    info = "One or more reasons were blank."
                });
            }
            //clear all records from table
            _dbHandle.Database.ExecuteSqlRaw("DELETE FROM CANDIDATEREASONS");
            _dbHandle.SaveChanges();
            _dbHandle.CandidateReasons.Add(new CandidateReason { Text = Reason1 });
            _dbHandle.CandidateReasons.Add(new CandidateReason { Text = Reason2 });
            _dbHandle.CandidateReasons.Add(new CandidateReason { Text = Reason3 });
            _dbHandle.SaveChanges();
            return Json(new
            {
                success = true,
                info = ""
            });
        }
    }
}