using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;
using Operations.EstadisticModule;
using static Operations.EstadisticModule.EstadisticConfig;

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
            var resultadoHipotesis = await EjecutarH4_ConsistenciaAsync(bdData);

            var result = DataGroupingHelper.GroupData(
                        data: bdData,
                        groupParams: request.GroupParams,
                        evalParams: request.EvalParams,
                        modelObject: ModelObject,
                        title: "Consistencia Premium",
                        isFinalGroupedData: true
                    );

            result.hipotesisTestResults = [resultadoHipotesis];

            return result;
        }

        public static async Task<HipotesisTestResult> EjecutarH4_ConsistenciaAsync(List<V_Analisis_H4_Consistencia> datos)
        {
            var config = new HipotesisTestConfig<V_Analisis_H4_Consistencia>()
                .ConVariableIndependiente("Es_Premium")
                .ConVariableDependiente("Cumplimiento_Pct")
                .ConControl("Objetivo_Salud")
                .ConSignificancia(0.05)
                .UsarPrueba("ANOVA");

            return await HipotesisTestService.EjecutarPruebaAsync(datos, config);
        }
    }
}