using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;
using Operations.EstadisticModule;
using static Operations.EstadisticModule.EstadisticConfig;

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

            var resultadoHipotesis = await EjecutarH5_SocialAsync(bdData);

            var result = DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: request.GroupParams,
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Factor Protector Social",
                isFinalGroupedData: true
            );

            result.hipotesisTestResults = [resultadoHipotesis];

            return result;
        }

        public static async Task<HipotesisTestResult> EjecutarH5_SocialAsync(List<V_Analisis_H5_Social> datos)
        {
            var config =
                new HipotesisTestConfig<V_Analisis_H5_Social>()

                .ConVariableIndependiente(
                    "Densidad_Interaccion_Recibida")

                .ConVariableDependiente(
                    "Score_Percepcion_Esfuerzo_Borg")

                .ConControl(
                    "Volumen_Carga_Semanal")

                .ConSignificancia(0.05)

                .ConMinEfectoRelevante(0.10)

                .UsarPrueba("Spearman");

            return await HipotesisTestService
                .EjecutarPruebaAsync(
                    datos,
                    config);
        }
    }
}