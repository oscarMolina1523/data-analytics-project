using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;

namespace Operations.AnaliticOperations
{
    public class AnaliticGamificacionRenovacionOperation
    {
        static readonly Dictionary<string, ModelProperty> ModelObject =
            new()
            {
                ["Score_Gamificacion_Mensual"] = new ModelProperty { Type = "NUMBER" },
                ["Retos_Completados"] = new ModelProperty { Type = "NUMBER" },
                ["Pct_Cumplimiento_Retos"] = new ModelProperty { Type = "NUMBER" },
                ["Puntos_Ganados"] = new ModelProperty { Type = "NUMBER" }
            };

        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            var bdData =
                new V_Analisis_H2_Gamificacion_Renovacion()
                .Where<V_Analisis_H2_Gamificacion_Renovacion>(
                    FilterData.GreaterEqual("Fecha", request.Desde),
                    FilterData.LessEqual("Fecha", request.Hasta)
                );

            return DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: request.GroupParams,
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Gamificación y Renovación",
                isFinalGroupedData: true
            );
        }
    }
}