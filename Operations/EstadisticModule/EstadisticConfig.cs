using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;

namespace Operations.EstadisticModule
{
    public class EstadisticConfig
    {
        public class HipotesisTestConfig<T> where T : class
        {
            // Variables principales de la hipótesis
            public string VariableIndependiente { get; private set; } = string.Empty;
            public string VariableDependiente { get; private set; } = string.Empty;

            // Variables de control y agrupación
            public List<string> VariablesControl { get; } = new();
            public List<string> CamposAgrupacion { get; } = new();

            // Parámetros estadísticos
            public double Alpha { get; set; } = 0.05;
            public double MinEfectoRelevante { get; set; } = 0.10;  // Para Spearman: |ρ| ≥ 0.10
            public string TipoPrueba { get; set; } = "Spearman";  // "Spearman", "ANOVA", "ChiSquare"

            // Filtros adicionales (se aplican vía FilterData)
            public List<FilterData> FiltrosAdicionales { get; } = new();

            // Métodos Fluent para configuración legible
            public HipotesisTestConfig<T> ConVariableIndependiente(string propName)
            {
                VariableIndependiente = propName;
                return this;
            }

            public HipotesisTestConfig<T> ConVariableDependiente(string propName)
            {
                VariableDependiente = propName;
                return this;
            }

            public HipotesisTestConfig<T> ConControl(params string[] propNames)
            {
                VariablesControl.AddRange(propNames);
                return this;
            }

            public HipotesisTestConfig<T> AgruparPor(params string[] propNames)
            {
                CamposAgrupacion.AddRange(propNames);
                return this;
            }

            public HipotesisTestConfig<T> ConSignificancia(double alpha)
            {
                Alpha = alpha;
                return this;
            }

            public HipotesisTestConfig<T> ConMinEfectoRelevante(double minEffect)
            {
                MinEfectoRelevante = minEffect;
                return this;
            }

            public HipotesisTestConfig<T> UsarPrueba(string tipoPrueba)
            {
                TipoPrueba = tipoPrueba;
                return this;
            }

            public HipotesisTestConfig<T> ConFiltro(FilterData filtro)
            {
                FiltrosAdicionales.Add(filtro);
                return this;
            }

            // Validación de configuración
            public bool EsValida(out string mensajeError)
            {
                if (string.IsNullOrEmpty(VariableIndependiente))
                {
                    mensajeError = "VariableIndependiente no especificada";
                    return false;
                }
                if (string.IsNullOrEmpty(VariableDependiente))
                {
                    mensajeError = "VariableDependiente no especificada";
                    return false;
                }
                mensajeError = string.Empty;
                return true;
            }
        }
    }
}