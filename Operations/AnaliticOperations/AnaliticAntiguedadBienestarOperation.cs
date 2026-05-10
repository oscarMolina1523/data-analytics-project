using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using Operations.AnaliticOperations.Model;
using Operations.EstadisticModule;
using Operations.Utility;
using static Operations.EstadisticModule.EstadisticConfig;

namespace Operations.AnaliticOperations
{
    public class AnaliticAntiguedadBienestarOperation
    {
        static readonly Dictionary<string, ModelProperty> ModelObject = new Dictionary<string, ModelProperty>
        {
            ["Estado_Inicial_Valor"] = new ModelProperty { Type = "NUMBER" },
            ["Estado_Final_Valor"] = new ModelProperty { Type = "NUMBER" },
            ["Estado_Final_Color"] = new ModelProperty { Type = "TEXT" },
            ["Estado_Final_Etiqueta"] = new ModelProperty { Type = "TEXT" }
        };
        public static List<V_Analisis_Antiguedad_Bienestar> GetByPeriodo(DateTime desde, DateTime hasta)
        {
            return new V_Analisis_Antiguedad_Bienestar().Where<V_Analisis_Antiguedad_Bienestar>(
                FilterData.GreaterEqual("Fecha", desde),
                 FilterData.LessEqual("Fecha", hasta)
            );
        }
        public static async Task<object?> GetByPeriodo(DataAnaliticRequest request)
        {
            // Consulta a la vista/entidad
            var bdData = new V_Analisis_Antiguedad_Bienestar
            {
                orderData = [
                OrdeData.Asc("Antiguedad_Years")
            ]
            }.Where<V_Analisis_Antiguedad_Bienestar>(
                FilterData.GreaterEqual("Fecha", request.Desde),
                FilterData.LessEqual("Fecha", request.Hasta)
            ); // 👈 Importante: materializar la consulta

            var camposAgrupacion = request.GroupParams?.Select(p => p).ToList() ?? new List<string>();

            var datosPreAgrupados = bdData
                .GroupBy(d => string.Join("|",
                    camposAgrupacion.Append("Id_Usuario") // Siempre incluir usuario
                        .Select(c => GetPropertyValue(d, c)?.ToString() ?? "NULL")))
                .Select(grupo => grupo.OrderByDescending(d => d.Fecha).First()) // ← Fecha máxima = estado válido
                .ToList();

            var resultado = await EjecutarH1_AntiguedadBienestarAsync(datosPreAgrupados);

            // Ejecución del helper genérico
            var result = DataGroupingHelper.GroupData(
                data: datosPreAgrupados.Cast<object>(),
                groupParams: request.GroupParams ?? [],
                evalParams: request.EvalParams,
                modelObject: ModelObject,
                title: "Test",
                isFinalGroupedData: true
            );
            result.hipotesisTestResults = [resultado];
            return result;
        }

        // Helper mínimo de reflexión (compatible con tu código existente)
        private static object? GetPropertyValue(object obj, string propName)
        {
            if (obj == null || string.IsNullOrEmpty(propName)) return null;
            return obj.GetType().GetProperty(propName)?.GetValue(obj);
        }
        // ========================================================================
        // EJEMPLO: Ejecutar prueba H1 con servicio genérico
        // ========================================================================
        public static async Task<HipotesisTestResult> EjecutarH1_AntiguedadBienestarAsync(List<V_Analisis_Antiguedad_Bienestar> datos)
        {
                        // 2. Configurar prueba con Fluent API
            var config = new HipotesisTestConfig<V_Analisis_Antiguedad_Bienestar>()
                .ConVariableIndependiente("Antiguedad_Years")      // Variable independiente
                .ConVariableDependiente("Estado_Final_Valor")      // Variable dependiente (ordinal 1-3)
                .ConControl("Contrato", "Departamento_Area")       // Variables de control
                .AgruparPor("Anio", "Trimestre")                   // Pre-agrupación temporal
                .ConSignificancia(0.05)                            // α = 0.05
                .ConMinEfectoRelevante(0.10)                       // |ρ| ≥ 0.10 para relevancia
                .UsarPrueba("Spearman")                            // Tipo de prueba
                .ConFiltro(FilterData.Equal("Tipo_Bienestar", "Laboral")); // Filtro adicional

            // 3. Ejecutar prueba genérica
            return await HipotesisTestService.EjecutarPruebaAsync(datos, config);
        }
    }

}