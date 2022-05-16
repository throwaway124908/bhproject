using ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace BHProject.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly DatabaseContext _dbHandle;

        public HomeController(ILogger<HomeController> logger, DatabaseContext dbHandle)
        {
            _logger = logger;
            _dbHandle = dbHandle;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
        public IActionResult EditReasons()
        {
            return View(new EditReasonsViewModel(_dbHandle));
        }
        public IActionResult FetchRandomReason()
        {
            return View(new FetchRandomReasonViewModel(_dbHandle));
        }
        public new IActionResult NotFound()
        {
            return View();
        }
    }
}