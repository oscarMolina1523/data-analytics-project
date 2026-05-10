using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using Operations.AnaliticOperations.Model;

namespace Operations.AnaliticOperations
{
    public class AnaliticEntrenamientoEvolucionOperation
    {
        public static  List<V_Analisis_Entrenamientos_Evolucion> GetByPeriodo(DateTime desde, DateTime hasta)
        {
            return new V_Analisis_Entrenamientos_Evolucion().Where<V_Analisis_Entrenamientos_Evolucion>(
                FilterData.GreaterEqual("Fecha", desde),
                 FilterData.LessEqual("Fecha", hasta)
            );
        }
    }
}