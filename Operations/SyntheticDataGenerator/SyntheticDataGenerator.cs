using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Operations.DataGenerator.Entities.Dimensions;
using Operations.DataGenerator.Entities.Facts;
using APPCORE;
using Operations.SyntheticDataGenerator.Model;

namespace Operations.SyntheticDataGenerator
{
    // ========================================================================
    // CONFIGURACIÓN
    // ========================================================================
    public class GeneratorConfig
    {
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public int TotalEmpleados { get; set; } = 500;
        public int MinServiciosPorMes { get; set; } = 2;
        public int MaxServiciosPorMes { get; set; } = 4;
        public double PorcentajeSolicitudesPsicologo { get; set; } = 0.15;
        public double PorcentajeAbsentismo { get; set; } = 0.08;
        public int Seed { get; set; } = 42;
    }

    // ========================================================================
    // MODELO INTERNO DE EMPLEADO
    // ========================================================================
    public class EmpleadoModel
    {
        public int Id { get; set; }
        public string IdUsuarioOrigen { get; set; } = string.Empty;
        public int Edad { get; set; }
        public string EdadEtiqueta { get; set; } = string.Empty;
        public string Contrato { get; set; } = string.Empty;
        public decimal AntiguedadYears { get; set; }
        public string DepartamentoArea { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;

        // Tracking de estado para evolución mensual
        public int UltimoEstadoId { get; set; }
        public string UltimoEstadoColor { get; set; } = "Verde";
        public DateTime? UltimaFechaSeguimiento { get; set; }
    }

    // ========================================================================
    // GENERADOR PRINCIPAL
    // ========================================================================
    public class SyntheticDataGeneratorOperation
    {
        private readonly GeneratorConfig _config;
        private readonly Random _random;

        private List<Dim_Estado_Psicoemocional>? _estados;
        private List<Dim_Area_Psicoemocional>? _areas;
        private List<Dim_Servicio>? _servicios;
        private List<Dim_Tipo_Evolucion>? _evoluciones;
        private Dictionary<string, int>? _colorToEstadoId;

        private List<EmpleadoModel> _empleados = new();

        public SyntheticDataGeneratorOperation(GeneratorConfig config)
        {
            _config = config;
            _random = new Random(config.Seed);
        }

        public static async Task Start()
        {
            var startDate = new DateTime(2025, 1, 1);
            var endDate = new DateTime(2026, 12, 31);
            var config = new GeneratorConfig
            {
                FechaInicio = startDate,
                FechaFin = endDate,
                TotalEmpleados = 500,
                MinServiciosPorMes = 2,
                MaxServiciosPorMes = 4,
                PorcentajeSolicitudesPsicologo = 0.15,
                PorcentajeAbsentismo = 0.08,
                Seed = 42
            };

            var registroExistente = new Etl_Config().Find<Etl_Config>(
                FilterData.Equal("BeginDate", startDate),
                FilterData.Equal("EndDate", endDate)
            );

            if (registroExistente == null)
            {
                var generator = new SyntheticDataGeneratorOperation(config);
                await generator.EjecutarGeneracionAsync();
                new Etl_Config
                {
                    Update_At = DateTime.Now,
                    BeginDate = startDate,
                    EndDate = endDate
                }.Save();
            }
            else
            {
                Console.WriteLine($"⚠️ Rango [{startDate:yyyy-MM-dd} a {endDate:yyyy-MM-dd}] YA PROCESADO");
            }
        }

        public async Task EjecutarGeneracionAsync()
        {
            Log("=== INICIANDO GENERACIÓN CON ENTITYCLASS ===");

            await CargarDimensionesAsync();
            Log($"✓ Dimensiones: {_estados?.Count ?? 0} estados, {_areas?.Count ?? 0} áreas, {_servicios?.Count ?? 0} servicios");

            await GenerarYGuardarEmpleadosAsync();
            Log($"✓ Empleados generados: {_empleados.Count}");

            await GenerarHechosPorMesAsync();
            await ValidarConsistenciaAsync();

            Log("=== GENERACIÓN COMPLETADA ===");
        }

        // ====================================================================
        // CARGA DE DIMENSIONES - CORREGIDO
        // ====================================================================
        private async Task CargarDimensionesAsync()
        {
            // ✅ CORRECCIÓN: Usar SimpleGet para carga completa
            _estados = new Dim_Estado_Psicoemocional().SimpleGet<Dim_Estado_Psicoemocional>();
            _colorToEstadoId = _estados?.ToDictionary(e => e.Codigo_Color!, e => e.Id_Estado!.Value)
                ?? new Dictionary<string, int>();

            // ✅ CORRECCIÓN CRÍTICA: Usar SimpleGet + filtro Activo
            _areas = new Dim_Area_Psicoemocional()
                .SimpleGet<Dim_Area_Psicoemocional>()
                .Where(a => a.Activo == true)
                .ToList();

            _servicios = new Dim_Servicio()
                .SimpleGet<Dim_Servicio>()
                .Where(s => s.Activo == true)
                .ToList();

            _evoluciones = new Dim_Tipo_Evolucion().SimpleGet<Dim_Tipo_Evolucion>();

            // Validar carga
            if (_areas == null || _areas.Count == 0)
            {
                Log("⚠️ ADVERTENCIA: _areas está vacío. Verificar Dim_Area_Psicoemocional en BD");
            }
        }

        // ====================================================================
        // GENERACIÓN DE EMPLEADOS
        // ====================================================================
        private async Task GenerarYGuardarEmpleadosAsync()
        {
            var generos = new[] { (1, "Masculino"), (2, "Femenino"), (3, "Otro") };
            var contratos = new[] { "Indefinido", "Temporal", "Por Proyecto", "Medio Tiempo" };
            var turnos = new[] { "Matutino", "Vespertino", "Nocturno" };
            var departamentos = new[] { "Tecnología", "Recursos Humanos", "Finanzas", "Operaciones", "Ventas", "Marketing", "Atención al Cliente", "Logística" };
            var edadesEtiqueta = new[] { "18-25", "26-35", "36-45", "46-55", "56+" };

            for (int i = 1; i <= _config.TotalEmpleados; i++)
            {
                var edad = _random.Next(18, 65);
                var antiguedadYears = (decimal)(_random.NextDouble() * 20);

                var empleadoModel = new EmpleadoModel
                {
                    Id = i,
                    IdUsuarioOrigen = $"EMP-{i:D5}",
                    Edad = edad,
                    EdadEtiqueta = CalcularEtiquetaEdad(edad, edadesEtiqueta),
                    Contrato = contratos[_random.Next(contratos.Length)],
                    AntiguedadYears = antiguedadYears,
                    DepartamentoArea = departamentos[_random.Next(departamentos.Length)],
                    UltimoEstadoColor = "Verde",
                    UltimoEstadoId = _colorToEstadoId?.GetValueOrDefault("Verde", 1) ?? 1
                };
                _empleados.Add(empleadoModel);

                var usuarioEntity = new Dim_Usuario
                {
                    Id_Usuario_Origen = empleadoModel.IdUsuarioOrigen,
                    Edad = empleadoModel.Edad,
                    Edad_Etiqueta = empleadoModel.EdadEtiqueta,
                    Id_Genero = generos[_random.Next(generos.Length)].Item1,
                    Genero = generos[_random.Next(generos.Length)].Item2,
                    Cargo = $"Cargo {i}",
                    Contrato = empleadoModel.Contrato,
                    Antiguedad = antiguedadYears < 1 ? "0-1 años" : $"{(int)antiguedadYears}-{(int)antiguedadYears + 2} años",
                    Antiguedad_Years = antiguedadYears,
                    Turno = turnos[_random.Next(turnos.Length)],
                    Id_Empresa = 1,
                    Nombre_Empresa = "Empresa Principal",
                    Id_Sector = 1,
                    Sector = "Tecnología",
                    Id_Departamento = _random.Next(1, departamentos.Length + 1),
                    Departamento_Area = empleadoModel.DepartamentoArea,
                    Centro = $"Centro {_random.Next(1, 6)}",
                    Activo = true,
                    Fecha_Carga = DateTime.Now
                };

                if (new Dim_Usuario { Id_Usuario_Origen = usuarioEntity.Id_Usuario_Origen }.Find<Dim_Usuario>() == null)
                {
                    var result = usuarioEntity.Save();
                    if (result is int generatedId && generatedId > 0)
                    {
                        usuarioEntity.Id_Usuario = generatedId;
                        empleadoModel.Id = generatedId;
                    }
                }
            }
        }

        private string CalcularEtiquetaEdad(int edad, string[] etiquetas)
        {
            int indice = (edad / 10) - 1;
            return (indice >= 0 && indice < etiquetas.Length) ? etiquetas[indice] : "26-35";
        }

        // ====================================================================
        // GENERACIÓN DE HECHOS POR MES
        // ====================================================================
        private async Task GenerarHechosPorMesAsync()
        {
            var fechaActual = _config.FechaInicio;
            var mesCount = 0;

            while (fechaActual <= _config.FechaFin)
            {
                mesCount++;
                Log($"Procesando mes: {fechaActual:yyyy-MM}");

                await GenerarSeguimientoAsync(fechaActual);
                await GenerarInteraccionesAsync(fechaActual);
                await GenerarSolicitudesPsicologoAsync(fechaActual);
                await GenerarAbsentismoAsync(fechaActual);

                fechaActual = fechaActual.AddMonths(1);
            }

            Log($"Total meses procesados: {mesCount}");
        }

        // ====================================================================
        // GENERAR SEGUIMIENTO - CORREGIDO
        // ====================================================================
        private async Task GenerarSeguimientoAsync(DateTime fechaMes)
        {
            var idFecha = await ObtenerOCrearFechaAsync(fechaMes);

            foreach (var empleado in _empleados)
            {
                if (!empleado.Activo) continue;

                var estadoAnterior = empleado.UltimoEstadoColor;
                var estadoNuevo = CalcularNuevoEstado(estadoAnterior, empleado);
                var evolucion = DeterminarEvolucion(estadoAnterior, estadoNuevo);
                var areaPrincipal = _areas?.FirstOrDefault(a => a.Codigo_Area == "BG") ?? _areas?.First();

                var seguimiento = new Fact_Seguimiento_Usuario
                {
                    Id_Usuario = empleado.Id,
                    Id_Fecha_Seguimiento = idFecha,
                    Id_Estado_Inicial = _colorToEstadoId?[estadoAnterior] ?? 1,
                    Id_Estado_Final = _colorToEstadoId?[estadoNuevo] ?? 1,
                    Id_Area_Principal = areaPrincipal?.Id_Area ?? 1,
                    Id_Tipo_Evolucion = evolucion?.Id_Evolucion ?? 2,
                    Estado_Inicial_Valor = GetEstadoValor(estadoAnterior),
                    Estado_Final_Valor = GetEstadoValor(estadoNuevo),
                    Delta_Bienestar = GetEstadoValor(estadoNuevo) - GetEstadoValor(estadoAnterior),
                    Es_Primera_Evaluacion = empleado.UltimaFechaSeguimiento == null,
                    Es_Recuperacion = estadoAnterior == "Fresa" && estadoNuevo == "Verde",
                    Flag_Alerta = estadoNuevo == "Fresa",
                    Fecha_Carga = DateTime.Now
                };

                var saveResult = seguimiento.Save();
                // ✅ CORRECCIÓN: Obtener ID correctamente post-guardado
                var idSeguimiento = await ObtenerIdPostSaveAsync<Fact_Seguimiento_Usuario>(
                    seguimiento, "Id_Seguimiento", saveResult);

                // ✅ Generar detalle por cada área psicoemocional
                if (_areas != null && _areas.Count > 0 && idSeguimiento > 0)
                {
                    foreach (var area in _areas)
                    {
                        if (area.Id_Area == null) continue;

                        var estadoAreaNuevo = CalcularNuevoEstadoPorArea(estadoAnterior, estadoNuevo, area);
                        var evolucionArea = DeterminarEvolucion(estadoAnterior, estadoAreaNuevo);

                        int valorInicial = GetEstadoValor(estadoAnterior);
                        int valorFinal = GetEstadoValor(estadoAreaNuevo);

                        decimal puntajeInicial = Math.Round(valorInicial * 33.33m, 2, MidpointRounding.AwayFromZero);
                        decimal puntajeFinal = Math.Round(valorFinal * 33.33m, 2, MidpointRounding.AwayFromZero);
                        decimal variacion = Math.Round(puntajeFinal - puntajeInicial, 2, MidpointRounding.AwayFromZero);

                        // Validar rangos DECIMAL(5,2)
                        puntajeInicial = Math.Max(-99.99m, Math.Min(99.99m, puntajeInicial));
                        puntajeFinal = Math.Max(-99.99m, Math.Min(99.99m, puntajeFinal));
                        variacion = Math.Max(-99.99m, Math.Min(99.99m, variacion));

                        var detalle = new Fact_Detalle_Estado_Dimension
                        {
                            Id_Seguimiento = idSeguimiento,
                            Id_Usuario = empleado.Id,
                            Id_Fecha = idFecha,
                            Id_Area = area.Id_Area,
                            Id_Estado_Inicial = _colorToEstadoId?[estadoAnterior] ?? 1,
                            Id_Estado_Final = _colorToEstadoId?[estadoAreaNuevo] ?? 1,
                            Id_Tipo_Evolucion = evolucionArea?.Id_Evolucion ?? 2,
                            Puntaje_Inicial = puntajeInicial,
                            Puntaje_Final = puntajeFinal,
                            Variacion_Puntaje = variacion,
                            Es_Dimension_Critica = area.Es_Dimension_Secundaria == true && estadoAreaNuevo == "Fresa",
                            Requiere_Atencion = estadoAreaNuevo == "Fresa",
                            Fecha_Carga = DateTime.Now
                        };

                        detalle.Save();
                    }
                }

                empleado.UltimoEstadoColor = estadoNuevo;
                empleado.UltimoEstadoId = _colorToEstadoId?[estadoNuevo] ?? 1;
                empleado.UltimaFechaSeguimiento = fechaMes;
            }
        }

        // ====================================================================
        // MÉTODO AUXILIAR: Obtener ID post-Save - CORREGIDO
        // ====================================================================
        private async Task<long> ObtenerIdPostSaveAsync<T>(T entity, string idPropertyName, object? saveResult) where T : EntityClass
        {
            // Si Save() retornó un ID directo
            if (saveResult is int intId && intId > 0) return intId;
            if (saveResult is long longId && longId > 0) return longId;

            // Si no, buscar la entidad recién guardada por su clave natural
            // Para Fact_Seguimiento_Usuario, usamos combinación única
            if (entity is Fact_Seguimiento_Usuario seguimiento)
            {
                var encontrado = new Fact_Seguimiento_Usuario().Find<Fact_Seguimiento_Usuario>(
                    FilterData.Equal("Id_Usuario", seguimiento.Id_Usuario),
                    FilterData.Equal("Id_Fecha_Seguimiento", seguimiento.Id_Fecha_Seguimiento),
                    FilterData.Equal("Id_Area_Principal", seguimiento.Id_Area_Principal)
                );
                return encontrado?.Id_Seguimiento ?? 0;
            }

            return 0;
        }

        // ====================================================================
        // OBTENER/CREAR FECHA - CORREGIDO
        // ====================================================================
        private async Task<int> ObtenerOCrearFechaAsync(DateTime fecha)
        {
            var fechaExistente = new Dim_Tiempo().Find<Dim_Tiempo>(
                FilterData.Equal("Fecha", fecha.Date)
            );

            if (fechaExistente?.Id_Tiempo.HasValue == true)
            {
                return fechaExistente.Id_Tiempo.Value;
            }

            var nuevaFecha = new Dim_Tiempo
            {
                Fecha = fecha.Date,
                Dia_Mes = fecha.Day,
                Dia_Semana = (int)fecha.DayOfWeek,
                Nombre_Dia = fecha.ToString("dddd", new System.Globalization.CultureInfo("es-ES")),
                Mes = fecha.Month,
                Nombre_Mes = fecha.ToString("MMMM", new System.Globalization.CultureInfo("es-ES")),
                Trimestre = (fecha.Month - 1) / 3 + 1,
                Semestre = fecha.Month <= 6 ? 1 : 2,
                Anio = fecha.Year,
                Semana_Anio = GetWeekNumber(fecha),
                Es_Fin_Semana = fecha.DayOfWeek == DayOfWeek.Saturday || fecha.DayOfWeek == DayOfWeek.Sunday,
                Es_Festivo = false,
                Es_Inicio_Mes = fecha.Day == 1,
                Es_Fin_Mes = fecha.Day == DateTime.DaysInMonth(fecha.Year, fecha.Month),
                Fecha_Carga = DateTime.Now
            };

            nuevaFecha.Save();

            // ✅ CORRECCIÓN: Buscar el registro recién guardado
            var fechaGuardada = new Dim_Tiempo().Find<Dim_Tiempo>(
                FilterData.Equal("Fecha", fecha.Date)
            );

            return fechaGuardada?.Id_Tiempo ?? -1;
        }

        private int GetWeekNumber(DateTime date) =>
            System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                date, System.Globalization.CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);

        private string CalcularNuevoEstado(string estadoAnterior, EmpleadoModel empleado)
        {
            var probabilidades = new Dictionary<string, Dictionary<string, double>>
            {
                ["Verde"] = new() { ["Verde"] = 0.70, ["Naranja"] = 0.25, ["Fresa"] = 0.05 },
                ["Naranja"] = new() { ["Verde"] = 0.30, ["Naranja"] = 0.50, ["Fresa"] = 0.20 },
                ["Fresa"] = new() { ["Verde"] = 0.15, ["Naranja"] = 0.50, ["Fresa"] = 0.35 }
            };

            var probs = probabilidades[estadoAnterior].ToDictionary(k => k.Key, v => v.Value);

            if (empleado.AntiguedadYears > 5 && estadoAnterior == "Verde")
            {
                probs["Verde"] += 0.10;
                probs["Fresa"] -= 0.05;
            }
            if (empleado.Contrato == "Indefinido" && estadoAnterior == "Verde")
            {
                probs["Verde"] += 0.05;
                probs["Naranja"] -= 0.03;
            }

            var total = probs.Values.Sum();
            probs = probs.ToDictionary(k => k.Key, v => v.Value / total);

            var r = _random.NextDouble();
            var acum = 0.0;
            foreach (var kvp in probs)
            {
                acum += kvp.Value;
                if (r <= acum) return kvp.Key;
            }
            return estadoAnterior;
        }

        private string CalcularNuevoEstadoPorArea(string anterior, string nuevo, Dim_Area_Psicoemocional area)
        {
            if (_random.NextDouble() < 0.85)
                return nuevo;

            var esSecundaria = area.Es_Dimension_Secundaria ?? false;
            var tipoBienestar = area.Tipo_Bienestar ?? "General";

            var probabilidades = new Dictionary<string, double>();

            if (esSecundaria)
            {
                probabilidades = new Dictionary<string, double>
                {
                    ["Verde"] = 0.50, ["Naranja"] = 0.35, ["Fresa"] = 0.15
                };
            }
            else if (tipoBienestar == "Psicológico")
            {
                probabilidades = new Dictionary<string, double>
                {
                    ["Verde"] = 0.60, ["Naranja"] = 0.30, ["Fresa"] = 0.10
                };
            }
            else if (tipoBienestar == "Laboral")
            {
                probabilidades = new Dictionary<string, double>
                {
                    ["Verde"] = 0.65, ["Naranja"] = 0.28, ["Fresa"] = 0.07
                };
            }
            else
            {
                probabilidades = new Dictionary<string, double>
                {
                    ["Verde"] = 0.55, ["Naranja"] = 0.32, ["Fresa"] = 0.13
                };
            }

            var total = probabilidades.Values.Sum();
            probabilidades = probabilidades.ToDictionary(k => k.Key, v => v.Value / total);

            var r = _random.NextDouble();
            var acumulado = 0.0;
            foreach (var kvp in probabilidades)
            {
                acumulado += kvp.Value;
                if (r <= acumulado) return kvp.Key;
            }
            return anterior;
        }

        private Dim_Tipo_Evolucion? DeterminarEvolucion(string inicial, string final)
        {
            if (inicial == final)
                return _evoluciones?.FirstOrDefault(e => e.Tipo_Evolucion == "Neutra");

            var mejora = new[] { ("Fresa", "Naranja"), ("Fresa", "Verde"), ("Naranja", "Verde") };
            var empeora = new[] { ("Verde", "Naranja"), ("Verde", "Fresa"), ("Naranja", "Fresa") };

            if (mejora.Any(m => m.Item1 == inicial && m.Item2 == final))
                return _evoluciones?.FirstOrDefault(e => e.Tipo_Evolucion == "Positiva");

            if (empeora.Any(m => m.Item1 == inicial && m.Item2 == final))
                return _evoluciones?.FirstOrDefault(e => e.Tipo_Evolucion == "Negativa");

            return _evoluciones?.FirstOrDefault(e => e.Tipo_Evolucion == "Neutra");
        }

        private int GetEstadoValor(string color) => color switch
        {
            "Verde" => 3, "Naranja" => 2, "Fresa" => 1, _ => 2
        };

        // ====================================================================
        // GENERAR INTERACCIONES
        // ====================================================================
        private async Task GenerarInteraccionesAsync(DateTime fechaMes)
        {
            var idFecha = await ObtenerOCrearFechaAsync(fechaMes);
            var dispositivos = new[] { "Desktop", "Móvil", "Tablet" };
            var canales = new[] { "Web", "App", "Portal" };

            foreach (var empleado in _empleados.Where(e => e.Activo))
            {
                var numServicios = _random.Next(_config.MinServiciosPorMes, _config.MaxServiciosPorMes + 1);
                var serviciosSel = _servicios?.OrderBy(x => _random.Next()).Take(numServicios) ?? Enumerable.Empty<Dim_Servicio>();

                foreach (var servicio in serviciosSel)
                {
                    decimal calificacion = Math.Round((decimal)(_random.NextDouble() * 2.0 + 3.0), 2, MidpointRounding.AwayFromZero);
                    decimal completitud = Math.Round((decimal)(_random.NextDouble() * 20.0 + 80.0), 2, MidpointRounding.AwayFromZero);

                    calificacion = Math.Max(1.00m, Math.Min(5.00m, calificacion));
                    completitud = Math.Max(0.00m, Math.Min(100.00m, completitud));

                    var interaccion = new Fact_Interaccion_Servicio
                    {
                        Id_Usuario = empleado.Id,
                        Id_Fecha = idFecha,
                        Id_Servicio = servicio.Id_Servicio,
                        Duracion_Real_Min = servicio.Duracion_Estimada_Min ?? _random.Next(15, 120),
                        Frecuencia_Acceso = _random.Next(1, 5),
                        Calificacion_Usuario = calificacion,
                        Completitud = completitud,
                        Dispositivo = dispositivos[_random.Next(dispositivos.Length)],
                        Canal_Acceso = canales[_random.Next(canales.Length)],
                        Es_Recomendado = _random.NextDouble() < 0.3,
                        Fecha_Carga = DateTime.Now
                    };
                    interaccion.Save();
                }
            }
        }

        // ====================================================================
        // GENERAR SOLICITUDES DE PSICÓLOGO
        // ====================================================================
        private async Task GenerarSolicitudesPsicologoAsync(DateTime fechaMes)
        {
            var idFecha = await ObtenerOCrearFechaAsync(fechaMes);
            var elegibles = _empleados.Where(e => e.Activo && (e.UltimoEstadoColor == "Fresa" || e.UltimoEstadoColor == "Naranja")).ToList();
            var numSolicitudes = (int)(elegibles.Count * _config.PorcentajeSolicitudesPsicologo);
            var seleccionados = elegibles.OrderBy(x => _random.Next()).Take(numSolicitudes);

            foreach (var empleado in seleccionados)
            {
                var asiste = _random.NextDouble() < 0.8;
                var fechaPrevistaReal = fechaMes.AddDays(_random.Next(1, 15));
                var idFechaPrevista = await ObtenerOCrearFechaAsync(fechaPrevistaReal);

                var solicitud = new Fact_Solicitud_Psicologo
                {
                    Id_Usuario = empleado.Id,
                    Id_Fecha_Solicitud = idFecha,
                    Id_Fecha_Prevista = idFechaPrevista,
                    Id_Fecha_Atencion = asiste ? idFechaPrevista : null,
                    Solicita = "SI",
                    Tiene_Psicologo_Asignado = asiste ? "SI" : "NO",
                    Usuario_Asiste = asiste ? "SI" : "NO",
                    Solicitud_Empresa = _random.NextDouble() < 0.2 ? "SI" : "NO",
                    N_Solicitudes_Acumuladas = _random.Next(1, 4),
                    Sesiones_Consumidas = asiste ? _random.Next(1, 6) : 0,
                    Sesiones_Pendientes = asiste ? 0 : _random.Next(1, 5),
                    Tiempo_Espera_Dias = asiste ? _random.Next(0, 10) : null,
                    Tipo_Usuario = empleado.UltimoEstadoColor == "Fresa" ? "Tratamiento" : "Seguimiento",
                    Prioridad = empleado.UltimoEstadoColor == "Fresa" ? "Alta" : "Media",
                    Estado_Tratamiento = asiste ? "Activo" : "Pendiente",
                    Fecha_Carga = DateTime.Now
                };
                solicitud.Save();
            }
        }

        // ====================================================================
        // GENERAR ABSENTISMO - CORREGIDO FECHA FINAL
        // ====================================================================
        private async Task GenerarAbsentismoAsync(DateTime fechaMes)
        {
            var idFecha = await ObtenerOCrearFechaAsync(fechaMes);
            var elegibles = _empleados.Where(e => e.Activo).ToList();
            var numAbsentismos = (int)(elegibles.Count * _config.PorcentajeAbsentismo);
            var seleccionados = elegibles.OrderBy(x => _random.Next()).Take(numAbsentismos);

            foreach (var empleado in seleccionados)
            {
                var dias = _random.Next(1, 10);
                var relacionado = empleado.UltimoEstadoColor == "Fresa" || _random.NextDouble() < 0.4;

                // ✅ CORRECCIÓN: Calcular fecha real → obtener ID válido
                var fechaFinalReal = fechaMes.AddDays(dias);
                var idFechaFinal = await ObtenerOCrearFechaAsync(fechaFinalReal);

                var absentismo = new Fact_Absentismo
                {
                    Id_Usuario = empleado.Id,
                    Id_Fecha_Inicio = idFecha,
                    Id_Fecha_Final = idFechaFinal, // ✅ ID válido, no suma aritmética
                    Dias_Ausente = dias,
                    Justificado = _random.NextDouble() < 0.7,
                    Relacionado_Salud_Mental = relacionado,
                    Tipo_Absentismo = relacionado ? "Salud Mental" : "General",
                    Gravedad = dias > 5 ? "Moderado" : "Leve",
                    Comentario = relacionado ? "Relacionado con estrés/ansiedad" : "Motivos personales",
                    Fecha_Carga = DateTime.Now
                };
                absentismo.Save();
            }
        }

        // ====================================================================
        // VALIDACIÓN Y LOGGING - CORREGIDO
        // ====================================================================
        private async Task ValidarConsistenciaAsync()
        {
            Log("Validando consistencia...");

            var totalSeguimientos = new Fact_Seguimiento_Usuario().Count();
            var totalDetalles = new Fact_Detalle_Estado_Dimension().Count();
            var totalInteracciones = new Fact_Interaccion_Servicio().Count();

            Log($"✓ Seguimientos: {totalSeguimientos}");
            Log($"✓ Detalles por área: {totalDetalles}");
            Log($"✓ Interacciones: {totalInteracciones}");

            // Validar que hay detalles por área
            if (_areas != null && _areas.Count > 0 && totalSeguimientos > 0)
            {
                var detallesPorArea = new Fact_Detalle_Estado_Dimension()
                    .SimpleGet<Fact_Detalle_Estado_Dimension>()
                    .GroupBy(d => d.Id_Area)
                    .Select(g => new { AreaId = g.Key, Count = g.Count() })
                    .ToList();

                Log($"✓ Áreas con detalles: {detallesPorArea.Count}/{_areas.Count}");
                
                if (detallesPorArea.Count == 0)
                {
                    Log(" ADVERTENCIA: No se generaron detalles. Verificar:");
                    Log("  1. _areas no está vacío");
                    Log("  2. idSeguimiento > 0 después de Save()");
                    Log("  3. area.Id_Area no es null en el bucle");
                }
            }
        }

        // ✅ CORRECCIÓN: Console.WriteLine con salto de línea
        private void Log(string message) => Console.WriteLine(message);
        private void LogError(Exception ex, string message) => Console.WriteLine($"ERROR: {message} - {ex.Message}");
    }
}