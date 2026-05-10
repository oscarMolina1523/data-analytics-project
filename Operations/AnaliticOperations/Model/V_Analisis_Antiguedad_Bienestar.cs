using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using APPCORE;
using BusinessLogic.Connection;

namespace Operations.AnaliticOperations.Model
{
    public class V_Analisis_Antiguedad_Bienestar : EntityClass
    {

        // Identificadores
        [PrimaryKey(Identity = false)]
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        public int? Id_Fecha_Seguimiento { get; set; }

        // Datos del usuario
        public string? Id_Usuario_Origen { get; set; }
        public int? Edad { get; set; }
        public string? Edad_Etiqueta { get; set; }
        public string? Contrato { get; set; }
        public string? Antiguedad { get; set; }
        public decimal? Antiguedad_Years { get; set; }
        public string? Departamento_Area { get; set; }
        public string? Nombre_Empresa { get; set; }

        // Estado psicoemocional
        public int? Estado_Inicial_Valor { get; set; }
        public int? Estado_Final_Valor { get; set; }
        public int? Delta_Bienestar { get; set; }
        public bool? Flag_Alerta { get; set; }

        // Dimensiones descriptivas
        public string? Estado_Final_Color { get; set; }
        public string? Estado_Final_Etiqueta { get; set; }
        public string? Area_Evaluada { get; set; }
        public string? Tipo_Bienestar { get; set; }

        // Tiempo
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public int? Trimestre { get; set; }
        public DateTime? Fecha { get; set; }        
        public string? Nombre_Mes { get; set; }

        // Variable derivada
        public string? Rango_Antiguedad { get; set; }

        // ====================================================================
        // MÉTODOS DE CONSULTA ESPECÍFICOS PARA H1
        // ====================================================================

        /// <summary>
        /// Obtiene datos agrupados por rango de antigüedad para análisis de correlación
        /// </summary>
        public List<V_Analisis_Antiguedad_Bienestar> PorRangoAntiguedad()
        {
            return this.Where<V_Analisis_Antiguedad_Bienestar>(
                FilterData.NotNull("Rango_Antiguedad"),
                FilterData.NotNull("Estado_Final_Valor"),
                FilterData.OrderByAsc("Rango_Antiguedad")
            );
        }

        /// <summary>
        /// Filtra por período temporal específico
        /// </summary>
        public List<V_Analisis_Antiguedad_Bienestar> PorPeriodo(int anio, int? trimestre = null)
        {
            var filtros = new List<FilterData>
            {
                FilterData.Equal("Anio", anio)
            };

            if (trimestre.HasValue)
            {
                filtros.Add(FilterData.Equal("Trimestre", trimestre.Value));
            }

            return this.Where<V_Analisis_Antiguedad_Bienestar>(filtros.ToArray());
        }

        /// <summary>
        /// Filtra por departamento para análisis segmentado
        /// </summary>
        public List<V_Analisis_Antiguedad_Bienestar> PorDepartamento(string departamentoArea)
        {
            return this.Where<V_Analisis_Antiguedad_Bienestar>(
                FilterData.Equal("Departamento_Area", departamentoArea)
            );
        }
    }
}