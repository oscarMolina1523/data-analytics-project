using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;

namespace Operations.AnaliticOperations
{
    public class AnaliticConsistenciaOperation
    {
        static readonly Dictionary<string, ModelProperty> ModelObject =
            new()
            {
                ["Cumplimiento_Pct"] = new ModelProperty { Type = "NUMBER" },
                ["Variacion_Metrica_Semanal"] = new ModelProperty { Type = "NUMBER" },
                ["Sesiones_Programadas"] = new ModelProperty { Type = "NUMBER" },
                ["Sesiones_Completadas"] = new ModelProperty { Type = "NUMBER" }
            };

        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            var bdData =
                new V_Analisis_H4_Consistencia()
                .Where<V_Analisis_H4_Consistencia>(
                    FilterData.GreaterEqual("Fecha", request.Desde),
                    FilterData.LessEqual("Fecha", request.Hasta)
                );

            return DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: request.GroupParams,
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Consistencia Premium",
                isFinalGroupedData: true
            );
        }
    }
}