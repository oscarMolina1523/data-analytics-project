using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;

namespace Operations.AnaliticOperations
{
    public class AnaliticSocialOperation
    {
        static readonly Dictionary<string, ModelProperty> ModelObject =
            new()
            {
                ["Volumen_Carga_Semanal"] = new ModelProperty { Type = "NUMBER" },
                ["Densidad_Interaccion_Recibida"] = new ModelProperty { Type = "NUMBER" },
                ["Score_Percepcion_Esfuerzo_Borg"] = new ModelProperty { Type = "NUMBER" },
                ["Total_Interacciones"] = new ModelProperty { Type = "NUMBER" }
            };

        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            var bdData =
                new V_Analisis_H5_Social()
                .Where<V_Analisis_H5_Social>(
                    FilterData.GreaterEqual("Fecha", request.Desde),
                    FilterData.LessEqual("Fecha", request.Hasta)
                );

            return DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: request.GroupParams,
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Factor Protector Social",
                isFinalGroupedData: true
            );
        }
    }
}