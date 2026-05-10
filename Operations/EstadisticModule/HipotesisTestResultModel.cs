using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Operations.EstadisticModule
{
    public class HipotesisTestResult
    {
        // Metadatos de la ejecución
        public DateTime FechaEjecucion { get; set; }
        public string NombreHipotesis { get; set; } = string.Empty;
        public string DescripcionHipotesis { get; set; } = string.Empty;
        public int TotalRegistrosAnalizados { get; set; }
        public int TotalUnicosAgrupacion { get; set; }

        // Estadísticos principales de la prueba
        public double? Estadistico_Principal { get; set; }  // ρ para Spearman, F para ANOVA, etc.
        public double P_Value { get; set; }
        public double? IC_Inferior_95 { get; set; }
        public double? IC_Superior_95 { get; set; }

        // Decisión estadística
        public bool Rechazar_Hipotesis_Nula { get; set; }
        public string Tamanio_Efecto { get; set; } = string.Empty;
        public string Conclusion_Estadistica { get; set; } = string.Empty;

        // Estadísticos descriptivos de apoyo (dinámicos por propiedad)
        public Dictionary<string, DescriptiveStats> Estadisticos_Descriptivos { get; set; } = new();

        // Recomendaciones accionables
        public List<string> Recomendaciones { get; set; } = new();
        // Metadatos de configuración usada
        public TestConfigMetadata Config_Usada { get; set; } = new();
    }

    public class DescriptiveStats
    {
        public double? Media { get; set; }
        public double? Mediana { get; set; }
        public double? Desviacion_Estandar { get; set; }
        public double? Minimo { get; set; }
        public double? Maximo { get; set; }
        public int? Count_Validos { get; set; }
        public Dictionary<string, int>? Distribucion_Categorica { get; set; }
    }

    public class TestConfigMetadata
    {
        public string Variable_Independiente { get; set; } = string.Empty;
        public string Variable_Dependiente { get; set; } = string.Empty;
        public List<string> Variables_Control { get; set; } = new();
        public List<string> Campos_Agrupacion { get; set; } = new();
        public string Tipo_Prueba { get; set; } = string.Empty;  // "Spearman", "ANOVA", "ChiSquare", etc.
        public double Alpha { get; set; } = 0.05;
    }
}