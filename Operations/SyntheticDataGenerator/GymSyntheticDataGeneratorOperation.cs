using APPCORE;
using Operations.DataGenerator.Entities.Dimensions.Dimensions;
using Operations.DataGenerator.Entities.Facts;
using Operations.SyntheticDataGenerator.Model;

namespace Operations.SyntheticDataGenerator;

public class GymSyntheticDataGeneratorOperation
{
    private readonly Random _random = new(42);

    public static async Task Start()
    {
        Console.WriteLine("Inicio Generador de data sintetica");
        var startDate = new DateTime(2024, 1, 1);
        var endDate = new DateTime(2025, 12, 31);

        var existe = new Etl_Config().Find<Etl_Config>(
            FilterData.Equal("BeginDate", startDate),
            FilterData.Equal("EndDate", endDate)
        );

        if (existe != null)
        {
            Console.WriteLine("Datos ya generados.");
            return;
        }

        var generator = new GymSyntheticDataGeneratorOperation();

        Console.WriteLine("generando dimension tiempo");
        await generator.GenerarTiempo();
        Console.WriteLine("dimension tiempo ok");
        Console.WriteLine("generando dimension actividad");
        await generator.GenerarActividades();
        Console.WriteLine("dimension actividad ok");
        Console.WriteLine("generando usuarios");
        await generator.GenerarUsuarios(500);
        Console.WriteLine(" usuarios ok");
        Console.WriteLine("generando fact_metricas_fisicas");
        await generator.GenerarMetricasFisicas();
        Console.WriteLine("fact_metricas_fisicas ok");
        Console.WriteLine("generando fact_gamificacion");
        await generator.GenerarGamificacion();
        Console.WriteLine("fact_gamificacion ok");
        Console.WriteLine("generando fact_adherencia");
        await generator.GenerarAdherencia();
        Console.WriteLine("fact_adherencia ok");
        Console.WriteLine("generando fact_consistencia");
        await generator.GenerarConsistencia();
        Console.WriteLine("fact_consistencia ok");
        Console.WriteLine("generando fact_social");
        await generator.GenerarSocial();
        Console.WriteLine("fact_social ok");

        new Etl_Config
        {
            BeginDate = startDate,
            EndDate = endDate,
            Update_At = DateTime.Now
        }.Save();

        Console.WriteLine("GENERACION FINALIZADA");
    }

    // =========================================================
    // DIM TIEMPO
    // =========================================================

    private async Task GenerarTiempo()
    {
        Console.WriteLine("Verificando Dim_Tiempo...");

        var fecha = new DateTime(2024, 1, 1);

        int id = 1;

        int creados = 0;

        while (fecha <= new DateTime(2025, 12, 31))
        {
            var existe = new Dim_Tiempo
            {
                Id_Tiempo = id
            }.Find<Dim_Tiempo>();

            if (existe == null)
            {
                new Dim_Tiempo
                {
                    Id_Tiempo = id,
                    Fecha = fecha,
                    Dia = fecha.Day,
                    Mes = fecha.Month,
                    Nombre_Mes = fecha.ToString("MMMM"),
                    Trimestre = ((fecha.Month - 1) / 3) + 1,
                    Anio = fecha.Year,
                    Semana_Anio = System.Globalization.ISOWeek.GetWeekOfYear(fecha)
                }.Save();

                creados++;
            }

            id++;
            fecha = fecha.AddDays(1);
        }

        Console.WriteLine($"Dim_Tiempo finalizada. Registros creados: {creados}");
    }

    // =========================================================
    // DIM ACTIVIDADES
    // =========================================================
    private async Task GenerarActividades()
    {
        if (new Dim_Actividad().Count() >= 4)
        {
            Console.WriteLine("Dim_Actividad ya existe.");
            return;
        }

        new Dim_Actividad
        {
            Tipo_Actividad = "Cardio",
            Categoria = "Resistencia"
        }.Save();

        new Dim_Actividad
        {
            Tipo_Actividad = "Fuerza",
            Categoria = "Musculacion"
        }.Save();

        new Dim_Actividad
        {
            Tipo_Actividad = "Funcional",
            Categoria = "HIIT"
        }.Save();

        new Dim_Actividad
        {
            Tipo_Actividad = "Crossfit",
            Categoria = "Intensivo"
        }.Save();

        Console.WriteLine("Dim_Actividad creada.");
    }
    // =========================================================
    // USUARIOS
    // =========================================================

    private async Task GenerarUsuarios(int cantidad)
    {
        string[] generos =
        {
            "Masculino",
            "Femenino"
        };

        string[] fitness =
        {
            "Principiante",
            "Intermedio",
            "Avanzado"
        };

        string[] objetivos =
        {
            "Perder Peso",
            "Ganar Musculo",
            "Resistencia",
            "Salud General"
        };

        string[] planes =
        {
            "Basic",
            "Premium"
        };

        var usuariosExistentes = new Dim_Usuario().Count();

        if (usuariosExistentes >= cantidad)
        {
            Console.WriteLine($"Usuarios ya existen ({usuariosExistentes}).");
            return;
        }

        int creados = 0;

        for (int i = 1; i <= cantidad; i++)
        {
            string codigo = $"USR-{i:00000}";

            var existe = new Dim_Usuario().Find<Dim_Usuario>(
                FilterData.Equal("Codigo_Usuario", codigo)
            );

            if (existe != null)
            {
                continue;
            }

            new Dim_Usuario
            {
                Codigo_Usuario = $"USR-{i:00000}",
                Genero = generos[_random.Next(generos.Length)],
                Edad = _random.Next(18, 60),
                Nivel_Fitness_Inicial = fitness[_random.Next(fitness.Length)],
                Objetivo_Salud = objetivos[_random.Next(objetivos.Length)],
                Tipo_Suscripcion = planes[_random.NextDouble() < 0.35 ? 1 : 0],
                Antiguedad_Meses = _random.Next(1, 36),
                Fecha_Registro = DateTime.Now.AddMonths(-_random.Next(1, 36)),
                Activo = true
            }.Save();

            creados++;
        }

        Console.WriteLine($"Usuarios creados: {creados}");
    }

    // =========================================================
    // H1
    // =========================================================

    private async Task GenerarMetricasFisicas()
    {

        Console.WriteLine("Verificando Fact_Metricas_Fisicas...");

        if (new Fact_Metricas_Fisicas().Count() > 0)
        {
            Console.WriteLine("Fact_Metricas_Fisicas ya existe. Se omite.");
            return;
        }

        Console.WriteLine("Generando Fact_Metricas_Fisicas...");

        var usuarios = new Dim_Usuario().SimpleGet<Dim_Usuario>();

        var actividades = new Dim_Actividad().SimpleGet<Dim_Actividad>();

        if (!actividades.Any())
        {
            throw new Exception(
                "No existen actividades en Dim_Actividad"
            );
        }

        foreach (var usuario in usuarios)
        {
            foreach (var mes in Enumerable.Range(1, 24))
            {
                int frecuencia = _random.Next(1, 7);

                decimal pesoInicial = _random.Next(60, 110);

                decimal mejora = frecuencia * (decimal)_random.NextDouble();

                decimal pesoActual = pesoInicial - mejora;

                decimal imcInicial = _random.Next(22, 35);

                decimal imcActual = imcInicial - (mejora / 2);

                decimal masaInicial = _random.Next(20, 40);

                decimal masaActual = masaInicial + mejora;

                new Fact_Metricas_Fisicas
                {
                    Id_Usuario = usuario.Id_Usuario,
                    Id_Tiempo = mes,
                    Id_Actividad = actividades[_random.Next(actividades.Count)].Id_Actividad,

                    Frecuencia_Semanal_Real = frecuencia,

                    Peso_Inicial = pesoInicial,
                    Peso_Actual = pesoActual,

                    IMC_Inicial = imcInicial,
                    IMC_Actual = imcActual,

                    Masa_Muscular_Inicial = masaInicial,
                    Masa_Muscular_Actual = masaActual
                }.Save();
            }
        }

        Console.WriteLine("Fact_Metricas_Fisicas generada.");
    }

    // =========================================================
    // H2
    // =========================================================

    private async Task GenerarGamificacion()
    {
        Console.WriteLine("Verificando Fact_Gamificacion_Usuario...");

        if (new Fact_Gamificacion_Usuario().Count() > 0)
        {
            Console.WriteLine("Fact_Gamificacion_Usuario ya existe. Se omite.");
            return;
        }

        Console.WriteLine("Generando Fact_Gamificacion_Usuario...");

        var usuarios = new Dim_Usuario().SimpleGet<Dim_Usuario>();

        foreach (var usuario in usuarios)
        {
            for (int mes = 1; mes <= 24; mes++)
            {
                int retosAsignados = _random.Next(5, 15);

                int retosCompletados =
                    _random.Next(0, retosAsignados + 1);

                decimal cumplimiento =
                    (decimal)retosCompletados / retosAsignados;

                bool renueva =
                    cumplimiento >= 0.7m ||
                    _random.NextDouble() > 0.5;

                new Fact_Gamificacion_Usuario
                {
                    Id_Usuario = usuario.Id_Usuario,
                    Id_Tiempo = mes,

                    Score_Gamificacion_Mensual =
                        (int)(cumplimiento * 100),

                    Retos_Completados = retosCompletados,
                    Retos_Totales_Asignados = retosAsignados,

                    Puntos_Ganados =
                        retosCompletados * 100,

                    Flag_Renovacion_Suscripcion =
                        renueva
                }.Save();
            }
        }

        Console.WriteLine("Fact_Gamificacion_Usuario generada.");
    }

    // =========================================================
    // H3
    // =========================================================

    private async Task GenerarAdherencia()
    {

        Console.WriteLine("Verificando Fact_Adherencia_Usuario...");

        if (new Fact_Adherencia_Usuario().Count() > 0)
        {
            Console.WriteLine("Fact_Adherencia_Usuario ya existe. Se omite.");
            return;
        }

        Console.WriteLine("Generando Fact_Adherencia_Usuario...");

        var usuarios = new Dim_Usuario().SimpleGet<Dim_Usuario>();

        foreach (var usuario in usuarios)
        {
            for (int mes = 1; mes <= 24; mes++)
            {
                int diasInactivo = _random.Next(0, 30);

                bool abandono =
                    diasInactivo >= 15 &&
                    _random.NextDouble() > 0.2;

                new Fact_Adherencia_Usuario
                {
                    Id_Usuario = usuario.Id_Usuario,
                    Id_Tiempo = mes,

                    Dias_Inactividad_Consecutiva =
                        diasInactivo,

                    Flag_Abandono_Confirmado =
                        abandono,

                    Lag_Periodo = mes
                }.Save();
            }
        }

        Console.WriteLine("Fact_Adherencia_Usuario generada.");
    }

    // =========================================================
    // H4
    // =========================================================

    private async Task GenerarConsistencia()
    {
        Console.WriteLine("Verificando Fact_Consistencia_Rutina...");

        if (new Fact_Consistencia_Rutina().Count() > 0)
        {
            Console.WriteLine("Fact_Consistencia_Rutina ya existe. Se omite.");
            return;
        }

        Console.WriteLine("Generando Fact_Consistencia_Rutina...");

        var usuarios = new Dim_Usuario().SimpleGet<Dim_Usuario>();

        foreach (var usuario in usuarios)
        {
            for (int mes = 1; mes <= 24; mes++)
            {
                int programadas = _random.Next(12, 24);

                int completadas =
                    usuario.Tipo_Suscripcion == "Premium"
                    ? _random.Next(programadas - 3, programadas + 1)
                    : _random.Next(programadas / 2, programadas + 1);

                decimal cumplimiento =
                    ((decimal)completadas /
                    programadas) * 100;

                new Fact_Consistencia_Rutina
                {
                    Id_Usuario = usuario.Id_Usuario,
                    Id_Tiempo = mes,

                    Sesiones_Programadas = programadas,
                    Sesiones_Completadas = completadas,

                    Cumplimiento_Pct =
                        Math.Round(cumplimiento, 2),

                    Variacion_Metrica_Semanal =
                        (decimal)(_random.NextDouble() * 10)
                }.Save();
            }
        }

        Console.WriteLine("Fact_Consistencia_Rutina generada.");
    }

    // =========================================================
    // H5
    // =========================================================

    private async Task GenerarSocial()
    {
        Console.WriteLine("Verificando Fact_Moderacion_Social...");

        if (new Fact_Moderacion_Social().Count() > 0)
        {
            Console.WriteLine("Fact_Moderacion_Social ya existe. Se omite.");
            return;
        }

        Console.WriteLine("Generando Fact_Moderacion_Social...");

        var usuarios = new Dim_Usuario().SimpleGet<Dim_Usuario>();

        foreach (var usuario in usuarios)
        {
            for (int mes = 1; mes <= 24; mes++)
            {
                int likes = _random.Next(0, 100);

                int comentarios = _random.Next(0, 40);

                decimal densidad =
                    likes + comentarios;

                decimal carga =
                    _random.Next(50, 250);

                int esfuerzo =
                    Math.Max(
                        6,
                        20 - ((likes + comentarios) / 15)
                    );

                new Fact_Moderacion_Social
                {
                    Id_Usuario = usuario.Id_Usuario,
                    Id_Tiempo = mes,

                    Likes_Recibidos = likes,
                    Comentarios_Recibidos = comentarios,

                    Densidad_Interaccion_Recibida =
                        densidad,

                    Volumen_Carga_Semanal =
                        carga,

                    Score_Percepcion_Esfuerzo_Borg =
                        esfuerzo
                }.Save();
            }
        }

        Console.WriteLine("Fact_Moderacion_Social generada.");
    }
}