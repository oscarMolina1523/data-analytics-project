using APPCORE;

namespace Operations.DataGenerator.Entities.Facts
{
    // ========================================================================
    // HECHO: SEGUIMIENTO DE USUARIO
    // ========================================================================
    public class Fact_Seguimiento_Usuario : EntityClass
    {
       

        [PrimaryKey(Identity = true)]
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        public int? Id_Fecha_Seguimiento { get; set; }
        public int? Id_Estado_Inicial { get; set; }
        public int? Id_Estado_Final { get; set; }
        public int? Id_Area_Principal { get; set; }
        public int? Id_Tipo_Evolucion { get; set; }
        public int? Estado_Inicial_Valor { get; set; }
        public int? Estado_Final_Valor { get; set; }
        public int? Delta_Bienestar { get; set; }
        public int? Dias_Desde_Ultimo_Seguimiento { get; set; }
        public bool? Es_Primera_Evaluacion { get; set; }
        public bool? Es_Recuperacion { get; set; }
        public bool? Flag_Alerta { get; set; }
        public DateTime? Fecha_Carga { get; set; }
        public int? Version_Registro { get; set; }
    }

    // ========================================================================
    // HECHO: DETALLE DE ESTADO POR DIMENSIÓN
    // ========================================================================
    public class Fact_Detalle_Estado_Dimension : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public long? Id_Detalle { get; set; }
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        public int? Id_Fecha { get; set; }
        public int? Id_Area { get; set; }
        public int? Id_Estado_Inicial { get; set; }
        public int? Id_Estado_Final { get; set; }
        public int? Id_Tipo_Evolucion { get; set; }
        public decimal? Puntaje_Inicial { get; set; }
        public decimal? Puntaje_Final { get; set; }
        public decimal? Variacion_Puntaje { get; set; }
        public decimal? Peso_Relativo { get; set; }
        public bool? Es_Dimension_Critica { get; set; }
        public bool? Requiere_Atencion { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // HECHO: INTERACCIÓN CON SERVICIOS
    // ========================================================================
    public class Fact_Interaccion_Servicio : EntityClass
    {
        [PrimaryKey(Identity = true)]
        public long? Id_Interaccion { get; set; }
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        public int? Id_Fecha { get; set; }
        public int? Id_Servicio { get; set; }
        public int? Duracion_Real_Min { get; set; }
        public int? Frecuencia_Acceso { get; set; }
        public decimal? Calificacion_Usuario { get; set; }
        public decimal? Completitud { get; set; }
        public string? Dispositivo { get; set; }
        public string? Canal_Acceso { get; set; }
        public bool? Es_Recomendado { get; set; }
        public int? Id_Psicologo_Asignado { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // HECHO: ABSENTISMO
    // ========================================================================
    public class Fact_Absentismo : EntityClass
    {

        [PrimaryKey(Identity = true)]
        public long? Id_Registro_Absentismo { get; set; }
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        public int? Id_Fecha_Inicio { get; set; }
        public int? Id_Fecha_Final { get; set; }
        public int? Dias_Ausente { get; set; }
        public bool? Justificado { get; set; }
        public bool? Relacionado_Salud_Mental { get; set; }
        public string? Tipo_Absentismo { get; set; }
        public string? Gravedad { get; set; }
        public string? Comentario { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }

    // ========================================================================
    // HECHO: SOLICITUD DE PSICÓLOGO
    // ========================================================================
    public class Fact_Solicitud_Psicologo : EntityClass
    {
       
        [PrimaryKey(Identity = true)]
        public long? Id_Solicitud { get; set; }
        public long? Id_Seguimiento { get; set; }
        public int? Id_Usuario { get; set; }
        public int? Id_Fecha_Solicitud { get; set; }
        public int? Id_Fecha_Prevista { get; set; }
        public int? Id_Fecha_Atencion { get; set; }
        public string? Solicita { get; set; }
        public string? Tiene_Psicologo_Asignado { get; set; }
        public string? Usuario_Asiste { get; set; }
        public string? Solicitud_Empresa { get; set; }
        public int? N_Solicitudes_Acumuladas { get; set; }
        public int? Sesiones_Consumidas { get; set; }
        public int? Sesiones_Pendientes { get; set; }
        public int? Tiempo_Espera_Dias { get; set; }
        public string? Tipo_Usuario { get; set; }
        public string? Prioridad { get; set; }
        public string? Estado_Tratamiento { get; set; }
        public DateTime? Fecha_Carga { get; set; }
    }
}