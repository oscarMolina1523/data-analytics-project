using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using Operations.AnaliticOperations.Model;

namespace Operations.AnaliticOperations
{
    public class AnaliticForosModeracionEstresOperation
    {
        public static  List<V_Analisis_Foros_Moderacion_Estres> GetByPeriodo(DateTime desde, DateTime hasta)
        {
            return new V_Analisis_Foros_Moderacion_Estres().Where<V_Analisis_Foros_Moderacion_Estres>(
                FilterData.GreaterEqual("Fecha", desde),
                 FilterData.LessEqual("Fecha", hasta)
            );
        }
    }
}