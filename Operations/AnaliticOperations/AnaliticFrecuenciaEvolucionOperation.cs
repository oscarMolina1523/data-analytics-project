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

            return DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: request.GroupParams,
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Frecuencia vs Evolución Física",
                isFinalGroupedData: true
            );
        }
    }
}