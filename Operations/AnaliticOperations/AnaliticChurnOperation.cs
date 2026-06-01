using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;
using Operations.EstadisticModule;
using static Operations.EstadisticModule.EstadisticConfig;

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
                new V_Analisis_H3_Churn()
                .Where<V_Analisis_H3_Churn>(
                    FilterData.GreaterEqual("Fecha", request.Desde),
                    FilterData.LessEqual("Fecha", request.Hasta)
                );

            var resultadoHipotesis = await EjecutarH3_ChurnAsync(bdData);

            var result = DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: request.GroupParams,
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Predicción de Churn",
                isFinalGroupedData: true
            );

            result.hipotesisTestResults = [ resultadoHipotesis ];

            return result;
        }

        public static async Task<HipotesisTestResult> EjecutarH3_ChurnAsync(List<V_Analisis_H3_Churn> datos)
        {
            var config =
                new HipotesisTestConfig<V_Analisis_H3_Churn>()
                    .ConVariableIndependiente("Nivel_Riesgo")
                    .ConVariableDependiente("Flag_Abandono_Confirmado")
                    .ConControl("Tipo_Suscripcion")
                    .ConSignificancia(0.05)
                    .ConMinEfectoRelevante(0.10)
                    .UsarPrueba("ChiSquare");

            return await HipotesisTestService
                .EjecutarPruebaAsync(datos, config);
        }
    }
}