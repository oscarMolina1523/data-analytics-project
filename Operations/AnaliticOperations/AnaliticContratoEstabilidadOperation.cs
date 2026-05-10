using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using Operations.AnaliticOperations.Model;

namespace Operations.AnaliticOperations
{
    public class AnaliticContratoEstabilidadOperation
    {
        public static  List<V_Analisis_Contrato_Estabilidad> GetByPeriodo(DateTime desde, DateTime hasta)
        {
            return new V_Analisis_Contrato_Estabilidad().Where<V_Analisis_Contrato_Estabilidad>(
                FilterData.GreaterEqual("Fecha", desde),
                 FilterData.LessEqual("Fecha", hasta)
            );
        }
    }
}