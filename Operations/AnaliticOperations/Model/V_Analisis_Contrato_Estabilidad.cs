using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;

namespace Operations.AnaliticOperations.Model
{
    // ========================================================================
    // VISTA ANALÍTICA: H4 - Contrato vs Estabilidad Emocional
    // ========================================================================
    public class V_Analisis_Contrato_Estabilidad : EntityClass
    {
        // Identificadores
        [PrimaryKey(Identity = false)]
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        
        // Variable independiente
        public string? Contrato { get; set; }
        
        // Variable dependiente
        public int? Evolucion_Negativa_Binaria { get; set; }
        public string? Tipo_Evolucion { get; set; }
        
        // Estado
        public int? Estado_Inicial_Valor { get; set; }
        public int? Estado_Final_Valor { get; set; }
        public int? Delta_Bienestar { get; set; }
        
        // Dimensiones
        public string? Tipo_Bienestar { get; set; }
        public string? Nombre_Area { get; set; }
        
        // Controles
        public decimal? Antiguedad_Years { get; set; }
        public string? Edad_Etiqueta { get; set; }
        public string? Departamento_Area { get; set; }
        public string? Genero { get; set; }
        
        // Clasificación
        public string? Nivel_Experiencia { get; set; }
        
        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public int? Trimestre { get; set; }
        public DateTime? Fecha { get; set; }        
        public string? Nombre_Mes { get; set; }

        // ====================================================================
        // MÉTODOS DE CONSULTA ESPECÍFICOS PARA H4
        // ====================================================================

        /// <summary>
        /// Obtiene datos para prueba de proporciones entre tipos de contrato
        /// </summary>
        public List<V_Analisis_Contrato_Estabilidad> ParaPruebaProporciones()
        {
            return this.Where<V_Analisis_Contrato_Estabilidad>(
                FilterData.NotNull("Contrato"),
                FilterData.NotNull("Evolucion_Negativa_Binaria"),
                FilterData.In("Contrato", "Indefinido", "Temporal", "Por Proyecto", "Medio Tiempo")
            );
        }

        /// <summary>
        /// Filtra por tipo de contrato específico para análisis comparativo
        /// </summary>
        public List<V_Analisis_Contrato_Estabilidad> PorTipoContrato(string tipoContrato)
        {
            return this.Where<V_Analisis_Contrato_Estabilidad>(
                FilterData.Equal("Contrato", tipoContrato)
            );
        }

        /// <summary>
        /// Prepara datos para cálculo de Riesgo Relativo (RR) y Odds Ratio (OR)
        /// </summary>
        public List<V_Analisis_Contrato_Estabilidad> ParaCalculoRiesgo()
        {
            return this.Where<V_Analisis_Contrato_Estabilidad>(
                FilterData.NotNull("Evolucion_Negativa_Binaria"),
                FilterData.NotNull("Contrato"),
                FilterData.NotNull("Estado_Inicial_Valor"), // Control
                FilterData.NotNull("Antiguedad_Years") // Control
            );
        }

        /// <summary>
        /// Estratifica por nivel de experiencia para análisis de interacción
        /// </summary>
        public List<V_Analisis_Contrato_Estabilidad> PorNivelExperiencia(string nivel)
        {
            return this.Where<V_Analisis_Contrato_Estabilidad>(
                FilterData.Equal("Nivel_Experiencia", nivel)
            );
        }
    }
}