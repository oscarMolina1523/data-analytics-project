using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;

namespace Operations.AnaliticOperations.Model
{
    // ========================================================================
    // VISTA ANALÍTICA: H5 - Foros como Moderador de Recuperación de Estrés
    // ========================================================================
    public class V_Analisis_Foros_Moderacion_Estres : EntityClass
    {
        

        // Identificadores
        [PrimaryKey(Identity = false)]
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        
        // Estado de estrés
        public int? Estado_Inicial_Estres { get; set; }
        public int? Estado_Final_Estres { get; set; }
        public decimal? Variacion_Puntaje { get; set; }
        public string? Tipo_Evolucion_Estres { get; set; }
        
        // Variable binaria
        public int? Recuperacion_Estres_Binaria { get; set; }
        
        // Moderadora: foros
        public int? N_Interacciones_Foro { get; set; }
        public int? Interaccion_Foro_Binaria { get; set; }
        
        // Término de interacción para modelo de moderación
        public int? Termino_Interaccion { get; set; }
        
        // Controles
        public string? Contrato { get; set; }
        public decimal? Antiguedad_Years { get; set; }
        public string? Departamento_Area { get; set; }
        
        // Clasificaciones
        public string? Nivel_Estres_Inicial { get; set; }
        public string? Categoria_Interaccion_Foro { get; set; }
        
        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public int? Trimestre { get; set; }
        public DateTime? Fecha { get; set; }        
        public string? Nombre_Mes { get; set; }

        // ====================================================================
        // MÉTODOS DE CONSULTA ESPECÍFICOS PARA H5
        // ====================================================================

        /// <summary>
        /// Obtiene datos para modelo de regresión con término de interacción (moderación)
        /// </summary>
        public List<V_Analisis_Foros_Moderacion_Estres> ParaModeloModeracion()
        {
            return this.Where<V_Analisis_Foros_Moderacion_Estres>(
                FilterData.NotNull("Recuperacion_Estres_Binaria"),
                FilterData.NotNull("Estado_Inicial_Estres"),
                FilterData.NotNull("Interaccion_Foro_Binaria"),
                FilterData.NotNull("Termino_Interaccion"), // Clave para probar moderación
                FilterData.NotNull("Contrato"), // Control
                FilterData.NotNull("Antiguedad_Years") // Control
            );
        }

        /// <summary>
        /// Filtra por nivel inicial de estrés para análisis estratificado
        /// </summary>
        public List<V_Analisis_Foros_Moderacion_Estres> PorNivelEstresInicial(string nivel)
        {
            return this.Where<V_Analisis_Foros_Moderacion_Estres>(
                FilterData.Equal("Nivel_Estres_Inicial", nivel)
            );
        }

        /// <summary>
        /// Compara tasas de recuperación entre grupos con/sin interacción en foros
        /// </summary>
        public List<V_Analisis_Foros_Moderacion_Estres> CompararRecuperacionPorInteraccion()
        {
            return this.Where<V_Analisis_Foros_Moderacion_Estres>(
                FilterData.In("Categoria_Interaccion_Foro", "Alta interacción", "Baja interacción", "Sin interacción"),
                FilterData.NotNull("Recuperacion_Estres_Binaria"),
                FilterData.OrderByAsc("Categoria_Interaccion_Foro")
            );
        }

        /// <summary>
        /// Filtra solo casos con estrés inicial crítico para análisis de efecto moderador
        /// </summary>
        public List<V_Analisis_Foros_Moderacion_Estres> ConEstresCriticoInicial()
        {
            return this.Where<V_Analisis_Foros_Moderacion_Estres>(
                FilterData.Equal("Nivel_Estres_Inicial", "Crítico"),
                FilterData.NotNull("Interaccion_Foro_Binaria"),
                FilterData.NotNull("Recuperacion_Estres_Binaria")
            );
        }
    }
}