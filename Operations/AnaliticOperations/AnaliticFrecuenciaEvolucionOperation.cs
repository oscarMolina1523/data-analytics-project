// Independiente:
// Frecuencia_Semanal_Real

// Dependiente:
// Mejora_IMC_Pct

// Control:
// Tipo_Actividad

//Prueba
//Pearson
using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;
using Operations.EstadisticModule;
using static Operations.EstadisticModule.EstadisticConfig;

namespace Operations.AnaliticOperations
{
    public class AnaliticFrecuenciaEvolucionOperation
    {
        static readonly Dictionary<string, ModelProperty> ModelObject =
            new()
            {
                ["Frecuencia_Semanal_Real"] = new ModelProperty { Type = "NUMBER" },
                ["Mejora_Peso_Pct"] = new ModelProperty { Type = "NUMBER" },
                ["Mejora_IMC_Pct"] = new ModelProperty { Type = "NUMBER" },
                ["Mejora_Masa_Muscular_Pct"] = new ModelProperty { Type = "NUMBER" }
            };

        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            var bdData =
                new V_Analisis_H1_Frecuencia_Evolucion()
                .Where<V_Analisis_H1_Frecuencia_Evolucion>(
                    FilterData.GreaterEqual("Fecha", request.Desde),
                    FilterData.LessEqual("Fecha", request.Hasta)
                );

            var resultadoHipotesis = await EjecutarH1_FrecuenciaEvolucionAsync( bdData.ToList() );

            var result =
                DataGroupingHelper.GroupData(
                    data: bdData,
                    groupParams: request.GroupParams,
                    evalParams: request.EvalParams,
                    modelObject: ModelObject,
                    title: "Frecuencia vs Evolución Física",
                    isFinalGroupedData: true
                );

            result.hipotesisTestResults =
            [
                resultadoHipotesis
            ];

            return result;
        }

        public static async Task<HipotesisTestResult> EjecutarH1_FrecuenciaEvolucionAsync(List<V_Analisis_H1_Frecuencia_Evolucion> datos)
        {
            var config =
                new HipotesisTestConfig<V_Analisis_H1_Frecuencia_Evolucion>()

                .ConVariableIndependiente("Frecuencia_Semanal_Real")

                .ConVariableDependiente("Mejora_IMC_Pct")

                .ConControl("Tipo_Actividad")

                .ConSignificancia(0.05)

                .ConMinEfectoRelevante(0.10)

                .UsarPrueba("Pearson");

            return await HipotesisTestService
                .EjecutarPruebaAsync(datos, config);
        }
    }
}