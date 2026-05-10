using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.Utility;
using static Operations.Utility.DataGroupingHelper;

namespace Operations.AnaliticOperations
{
    public class AnaliticAbsentismoOperation
    {
        // Definición del modelo para validación de tipos
        static readonly Dictionary<string, ModelProperty> ModelObject = new Dictionary<string, ModelProperty>
        {
            ["Total_Dias_Ausente_Lag"] = new ModelProperty { Type = "NUMBER" }
        };
        public static object GetByPeriodo(DateTime desde, DateTime hasta)
        {
            // Consulta a la vista/entidad
            var bdData = new V_Analisis_Absentismo_Predictor().Where<V_Analisis_Absentismo_Predictor>(
                FilterData.GreaterEqual("Fecha", desde),
                FilterData.LessEqual("Fecha", hasta)
            ); // 👈 Importante: materializar la consulta

            // Configuración de parámetros
            var groupParams = new List<string> { "Anio", "Nombre_Mes", "Contrato", "Departamento_Area" };
            var evalParams = new List<string> { "Total_Dias_Ausente_Lag" };


            // Ejecución del helper genérico
            var result = DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: groupParams,
                evalParams: evalParams,
                modelObject: ModelObject,
                title: "Test",
                isFinalGroupedData: true
            );

            return result;
        }

        public static object? GetByPeriodo(DataAnaliticRequest request)
        {
            // Consulta a la vista/entidad
            var bdData = new V_Analisis_Absentismo_Predictor().Where<V_Analisis_Absentismo_Predictor>(
                FilterData.GreaterEqual("Fecha", request.Desde),
                FilterData.LessEqual("Fecha", request.Hasta)
            ); // 👈 Importante: materializar la consulta

            // Ejecución del helper genérico
            var result = DataGroupingHelper.GroupData(
                data: bdData,
                groupParams: request.GroupParams,
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Test",
                isFinalGroupedData: true
            );

            return result;
        }
    }
}