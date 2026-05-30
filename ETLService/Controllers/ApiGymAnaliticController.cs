using Microsoft.AspNetCore.Mvc;
using Operations.AnaliticOperations;
using Operations.AnaliticOperations.Model;

namespace ETLService.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class ApiGymAnaliticController : ControllerBase
    {
        // H1
        [HttpPost]
        public async Task<ActionResult> FrecuenciaEvolucion(DataAnaliticRequest request)
        {
            return Ok(await AnaliticFrecuenciaEvolucionOperation.GetByPeriodo(request));
        }

        // H2
        [HttpPost]
        public async Task<ActionResult> GamificacionRenovacion(DataAnaliticRequest request)
        {
            return Ok(await AnaliticGamificacionRenovacionOperation.GetByPeriodo(request));
        }

        // H3
        [HttpPost]
        public async Task<ActionResult> ChurnPredictor(DataAnaliticRequest request)
        {
            return Ok(await AnaliticChurnOperation.GetByPeriodo(request));
        }

        // H4
        [HttpPost]
        public async Task<ActionResult> ConsistenciaPremium(DataAnaliticRequest request)
        {
            return Ok(await AnaliticConsistenciaOperation.GetByPeriodo(request));
        }

        // H5
        [HttpPost]
        public async Task<ActionResult> SocialFactorProtector(DataAnaliticRequest request)
        {
            return Ok(await AnaliticSocialOperation.GetByPeriodo(request));
        }
    }
}