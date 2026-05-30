using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;

namespace Operations.AnaliticOperations
{
    public class AnaliticChurnOperation
    {
        static readonly Dictionary<string, ModelProperty> ModelObject =
            new()
            {
                ["Dias_Inactividad_Consecutiva"] = new ModelProperty { Type = "NUMBER" },
                ["Probabilidad_Churn"] = new ModelProperty { Type = "NUMBER" }
            };

        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            var bdData =
                new V_Analisis_Churn_Predictor()
                .Where<V_Analisis_Churn_Predictor>(
                    FilterData.GreaterEqual("Fecha", request.Desde),
                    FilterData.LessEqual("Fecha", request.Hasta)
                );

            return DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: request.GroupParams,
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Predicción de Churn",
                isFinalGroupedData: true
            );
        }
    }
}