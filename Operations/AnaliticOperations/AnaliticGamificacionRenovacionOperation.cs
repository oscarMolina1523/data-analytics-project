using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;
using Operations.EstadisticModule;
using static Operations.EstadisticModule.EstadisticConfig;

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
            var resultadoHipotesis = await EjecutarH2_GamificacionRenovacionAsync(bdData.ToList());

            var result = DataGroupingHelper.GroupData(
                            data: bdData,
                            groupParams: request.GroupParams,
                            evalParams: request.EvalParams,
                            modelObject: ModelObject,
                            title: "Gamificación y Renovación",
                            isFinalGroupedData: true
                        );
            result.hipotesisTestResults = [resultadoHipotesis];

            return result;
        }

        public static async Task<HipotesisTestResult> EjecutarH2_GamificacionRenovacionAsync(List<V_Analisis_H2_Gamificacion_Renovacion> datos)
        {
            var config =
                new HipotesisTestConfig<V_Analisis_H2_Gamificacion_Renovacion>()
                    .ConVariableIndependiente("Pct_Cumplimiento_Retos")
                    .ConVariableDependiente("Flag_Renovacion_Suscripcion")
                    .ConControl("Antiguedad_Meses")
                    .ConSignificancia(0.05)
                    .ConMinEfectoRelevante(0.10)
                    .UsarPrueba("Pearson");

            return await HipotesisTestService.EjecutarPruebaAsync(
                datos,
                config
            );
        }
    }
}