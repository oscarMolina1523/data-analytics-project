using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;

namespace Operations.AnaliticOperations.Model
{
   // ========================================================================
    // VISTA ANALÍTICA: H2 - Entrenamientos vs Evolución Positiva
    // ========================================================================
    public class V_Analisis_Entrenamientos_Evolucion : EntityClass
    {

        // Identificadores
        [PrimaryKey(Identity = false)]
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        
        // Datos del usuario
        public string? Contrato { get; set; }
        public decimal? Antiguedad_Years { get; set; }
        public string? Departamento_Area { get; set; }
        
        // Estado y evolución
        public int? Estado_Inicial_Valor { get; set; }
        public int? Estado_Final_Valor { get; set; }
        public int? Delta_Bienestar { get; set; }
        public string? Tipo_Evolucion { get; set; }
        
        // Métricas de interacción
        public int? Frecuencia_Entrenamientos { get; set; }
        public string? Max_Nivel_Interaccion { get; set; }
        public decimal? Promedio_Duracion { get; set; }
        public decimal? Promedio_Calificacion { get; set; }
        
        // Clasificaciones derivadas
        public string? Nivel_Interaccion_Categoria { get; set; }
        public int? Evolucion_Positiva_Binaria { get; set; }
        
        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public int? Trimestre { get; set; }
        public DateTime? Fecha { get; set; }        
        public string? Nombre_Mes { get; set; }

        // ====================================================================
        // MÉTODOS DE CONSULTA ESPECÍFICOS PARA H2
        // ====================================================================

        /// <summary>
        /// Obtiene datos para análisis de asociación entre frecuencia y evolución
        /// </summary>
        public List<V_Analisis_Entrenamientos_Evolucion> ParaAnalisisAsociacion()
        {
            return this.Where<V_Analisis_Entrenamientos_Evolucion>(
                FilterData.NotNull("Frecuencia_Entrenamientos"),
                FilterData.NotNull("Tipo_Evolucion"),
                FilterData.NotNull("Evolucion_Positiva_Binaria")
            );
        }

        /// <summary>
        /// Filtra por nivel de interacción categórico para comparación de grupos
        /// </summary>
        public List<V_Analisis_Entrenamientos_Evolucion> PorNivelInteraccion(string categoria)
        {
            return this.Where<V_Analisis_Entrenamientos_Evolucion>(
                FilterData.Equal("Nivel_Interaccion_Categoria", categoria)
            );
        }

        /// <summary>
        /// Filtra usuarios con alta frecuencia de entrenamientos (≥3)
        /// </summary>
        public List<V_Analisis_Entrenamientos_Evolucion> ConAltaFrecuencia(int minimo = 3)
        {
            return this.Where<V_Analisis_Entrenamientos_Evolucion>(
                FilterData.GreaterEqual("Frecuencia_Entrenamientos", minimo)
            );
        }

        /// <summary>
        /// Prepara datos para regresión logística: solo evolución binaria y controles
        /// </summary>
        public List<V_Analisis_Entrenamientos_Evolucion> ParaRegresionLogistica()
        {
            return this.Where<V_Analisis_Entrenamientos_Evolucion>(
                FilterData.NotNull("Evolucion_Positiva_Binaria"),
                FilterData.NotNull("Frecuencia_Entrenamientos"),
                FilterData.NotNull("Estado_Inicial_Valor"), // Control por punto de partida
                FilterData.NotNull("Contrato"), // Control por tipo contractual
                FilterData.NotNull("Antiguedad_Years") // Control por experiencia
            );
        }
    }
}