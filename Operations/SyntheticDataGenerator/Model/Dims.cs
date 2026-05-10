using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using APPCORE;

namespace Operations.DataGenerator.Entities.Dimensions
{
    // ========================================================================
    // DIMENSIÓN: ESTADO PSICOEMOCIONAL
    // ========================================================================
    public class Dim_Estado_Psicoemocional : EntityClass
    {

        [PrimaryKey(Identity = true)]
        public int? Id_Estado { get; set; }
        public string? Codigo_Color { get; set; }
        public string? Etiqueta { get; set; }
        public int? Valor_Numerico { get; set; }
        public string? Descripcion { get; set; }
        public int? Nivel_Bienestar { get; set; }
        public bool? Es_Optimo { get; set; }
        public bool? Requiere_Intervencion { get; set; }
        public int? Orden_Visualizacion { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: ÁREA PSICOEMOCIONAL
    // ========================================================================
    public class Dim_Area_Psicoemocional : EntityClass
    {

        [PrimaryKey(Identity = true)]
        public int? Id_Area { get; set; }
        public string? Codigo_Area { get; set; }
        public string? Nombre_Area { get; set; }
        public string? Descripcion { get; set; }
        public string? Tipo_Bienestar { get; set; }
        public string? Grupo_Principal { get; set; }
        public int? Orden_Visualizacion { get; set; }
        public bool? Es_Dimension_Secundaria { get; set; }
        public string? Escala_Evaluacion { get; set; }
        public string? Valores_Posibles { get; set; }
        public bool? Activo { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: SERVICIO
    // ========================================================================
    public class Dim_Servicio : EntityClass
    {

        [PrimaryKey(Identity = true)]
        public int? Id_Servicio { get; set; }
        public string? Tipo_Servicio { get; set; }
        public string? Categoria { get; set; }
        public string? Subcategoria { get; set; }
        public string? Nombre_Servicio { get; set; }
        public string? Descripcion { get; set; }
        public int? Duracion_Estimada_Min { get; set; }
        public string? Modalidad { get; set; }
        public string? Nivel_Interaccion { get; set; }
        public bool? Requiere_Psicologo { get; set; }
        public bool? Es_Evaluativo { get; set; }
        public decimal? Costo_Asociado { get; set; }
        public bool? Activo { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: TIPO EVOLUCIÓN
    // ========================================================================
    public class Dim_Tipo_Evolucion : EntityClass
    {

        [PrimaryKey(Identity = true)]
        public int? Id_Evolucion { get; set; }
        public string? Tipo_Evolucion { get; set; }
        public string? Descripcion { get; set; }
        public decimal? Valor_Impacto { get; set; }
        public string? Color_Asociado { get; set; }
        public int? Orden_Visualizacion { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: TIEMPO
    // ========================================================================
    public class Dim_Tiempo : EntityClass
    {

        [PrimaryKey(Identity = true)]
        public int? Id_Tiempo { get; set; }
        public DateTime? Fecha { get; set; }
        public int? Dia_Mes { get; set; }
        public int? Dia_Semana { get; set; }
        public string? Nombre_Dia { get; set; }
        public int? Mes { get; set; }
        public string? Nombre_Mes { get; set; }
        public int? Trimestre { get; set; }
        public int? Semestre { get; set; }
        public int? Anio { get; set; }
        public int? Semana_Anio { get; set; }
        public bool? Es_Fin_Semana { get; set; }
        public bool? Es_Festivo { get; set; }
        public bool? Es_Inicio_Mes { get; set; }
        public bool? Es_Fin_Mes { get; set; }
        public string? Nombre_Trimestre { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // DIMENSIÓN: USUARIO
    // ========================================================================
    public class Dim_Usuario : EntityClass
    {
        

        [PrimaryKey(Identity = true)]
        public int? Id_Usuario { get; set; }
        public string? Id_Usuario_Origen { get; set; }
        public int? Edad { get; set; }
        public string? Edad_Etiqueta { get; set; }
        public int? Id_Genero { get; set; }
        public string? Genero { get; set; }
        public string? Cargo { get; set; }
        public string? Contrato { get; set; }
        public string? Antiguedad { get; set; }
        public decimal? Antiguedad_Years { get; set; }
        public string? Turno { get; set; }
        public int? Id_Empresa { get; set; }
        public string? Nombre_Empresa { get; set; }
        public int? Id_Sector { get; set; }
        public string? Sector { get; set; }
        public int? Id_Departamento { get; set; }
        public string? Departamento_Area { get; set; }
        public string? Centro { get; set; }
        public int? Id_Comunidad { get; set; }
        public int? Id_Provincia { get; set; }
        public int? Id_Empresa_Padre { get; set; }
        public string? Empresa_Padre { get; set; }
        public bool? Activo { get; set; }
        public DateTime? Fecha_Carga { get; set; }
        public DateTime? Fecha_Actualizacion { get; set; }
    }
}