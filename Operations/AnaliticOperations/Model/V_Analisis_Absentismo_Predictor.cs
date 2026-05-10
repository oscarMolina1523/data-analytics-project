using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;

namespace Operations.AnaliticOperations.Model
{
    // ========================================================================
    // VISTA ANALÍTICA: H3 - Absentismo como Predictor Temporal
    // ========================================================================
    public class V_Analisis_Absentismo_Predictor : EntityClass
    {
        // Identificadores
        [PrimaryKey(Identity = false)]
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        public int? Id_Fecha_Seguimiento { get; set; }

        // Datos del usuario
        public string? Contrato { get; set; }
        public decimal? Antiguedad_Years { get; set; }
        public string? Departamento_Area { get; set; }

        // Estado objetivo
        public int? Estado_Inicial_Valor { get; set; }
        public int? Estado_Desfavorable_Binario { get; set; }

        // Predictor con lag
        public int? Flag_Absentismo_Salud_Lag { get; set; }
        public int? Total_Dias_Ausente_Lag { get; set; }
        public string? Gravedad_Absentismo_Lag { get; set; }

        // Control
        public int? Estado_Previo { get; set; }

        // Clasificación
        public string? Categoria_Riesgo { get; set; }

        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public int? Trimestre { get; set; }
        public DateTime? Fecha { get; set; }
        public string? Nombre_Mes { get; set; }


        // 👇 Requerida solo si isFinalGroupedData = true
        public int count { get; set; }  // Debe ser settable para MergeOrAddItem

        // ====================================================================
        // MÉTODOS DE CONSULTA ESPECÍFICOS PARA H3
        // ====================================================================

        /// <summary>
        /// Obtiene datos para modelo predictivo con variable rezagada
        /// </summary>
        public List<V_Analisis_Absentismo_Predictor> ParaModeloPredictivo()
        {
            return this.Where<V_Analisis_Absentismo_Predictor>(
                FilterData.NotNull("Estado_Desfavorable_Binario"),
                FilterData.NotNull("Flag_Absentismo_Salud_Lag"),
                FilterData.NotNull("Estado_Previo") // Control por estado anterior
            );
        }

        /// <summary>
        /// Filtra por categoría de riesgo para análisis comparativo
        /// </summary>
        public List<V_Analisis_Absentismo_Predictor> PorCategoriaRiesgo(string categoria)
        {
            return this.Where<V_Analisis_Absentismo_Predictor>(
                FilterData.Equal("Categoria_Riesgo", categoria)
            );
        }

        /// <summary>
        /// Filtra por período específico para validación temporal
        /// </summary>
        public List<V_Analisis_Absentismo_Predictor> PorPeriodo(int anio, int mesInicio, int mesFin)
        {
            return this.Where<V_Analisis_Absentismo_Predictor>(
                FilterData.Equal("Anio", anio),
                FilterData.And(
                    FilterData.GreaterEqual("Mes", mesInicio),
                    FilterData.LessEqual("Mes", mesFin)
                )
            );
        }

        /// <summary>
        /// Obtiene solo casos con absentismo relacionado a salud mental
        /// </summary>
        public List<V_Analisis_Absentismo_Predictor> ConAbsentismoSaludMental()
        {
            return this.Where<V_Analisis_Absentismo_Predictor>(
                FilterData.Equal("Flag_Absentismo_Salud_Lag", 1)
            );
        }
    }
}