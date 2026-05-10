using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Operations.EstadisticModule.EstadisticConfig;

namespace Operations.EstadisticModule
{

    public static class HipotesisTestService
    {
        /// <summary>
        /// Ejecuta una prueba de hipótesis genérica sobre una lista de datos
        /// </summary>
        public static async Task<HipotesisTestResult> EjecutarPruebaAsync<T>(
            IEnumerable<T> datos,
            HipotesisTestConfig<T> config) where T : class
        {
            // Validar configuración
            if (!config.EsValida(out var errorConfig))
            {
                return new HipotesisTestResult
                {
                    Conclusion_Estadistica = $"Configuración inválida: {errorConfig}",
                    Config_Usada = MapearConfigMetadata(config)
                };
            }

            // Materializar datos y filtrar valores nulos en variables clave
            var datosValidos = datos
                .Where(d =>
                    GetPropertyValue(d, config.VariableIndependiente) != null &&
                    GetPropertyValue(d, config.VariableDependiente) != null)
                .ToList();

            if (datosValidos.Count < 10) // Mínimo para prueba estadística
            {
                return new HipotesisTestResult
                {
                    Conclusion_Estadistica = $"Muestra insuficiente (n={datosValidos.Count} < 10)",
                    TotalRegistrosAnalizados = datosValidos.Count,
                    Config_Usada = MapearConfigMetadata(config)
                };
            }

            // Pre-agrupar si se especificaron campos de agrupación + Id_Usuario implícito
            var datosParaAnalisis = config.CamposAgrupacion.Any()
                ? PreAgruparConEstadoValido(datosValidos, config.CamposAgrupacion)
                : datosValidos;

            // Extraer vectores numéricos para la prueba
            var x = datosParaAnalisis
                .Select(d => ConvertToDouble(GetPropertyValue(d, config.VariableIndependiente)))
                .ToArray();

            var y = datosParaAnalisis
                .Select(d => ConvertToDouble(GetPropertyValue(d, config.VariableDependiente)))
                .ToArray();

            // Ejecutar prueba estadística según tipo configurado
            var resultadoPrueba = config.TipoPrueba.ToLower() switch
            {
                "spearman" => EjecutarSpearman(x, y, config.Alpha, config.MinEfectoRelevante),
                "anova" => EjecutarANOVA(x, y, config.Alpha),  // Si x es categórica agrupada
                "chisquare" => EjecutarChiSquare(datosParaAnalisis, config.VariableIndependiente, config.VariableDependiente, config.Alpha),
                _ => EjecutarSpearman(x, y, config.Alpha, config.MinEfectoRelevante) // Default
            };

            // Calcular estadísticos descriptivos de apoyo
            var descriptivos = CalcularEstadisticosDescriptivos(datosParaAnalisis,
                new[] { config.VariableIndependiente, config.VariableDependiente }.Concat(config.VariablesControl));

            // Generar recomendaciones basadas en resultados
            var recomendaciones = GenerarRecomendacionesGenericas(resultadoPrueba, config);

            // Construir y retornar resultado
            return new HipotesisTestResult
            {
                FechaEjecucion = DateTime.Now,
                NombreHipotesis = $"Prueba {config.TipoPrueba} - {config.VariableIndependiente} → {config.VariableDependiente}",
                DescripcionHipotesis = $"Correlación entre {config.VariableIndependiente} y {config.VariableDependiente}",
                TotalRegistrosAnalizados = datosParaAnalisis.Count,
                TotalUnicosAgrupacion = config.CamposAgrupacion.Any()
                    ? datosParaAnalisis.Select(d => string.Join("|", config.CamposAgrupacion.Select(c => GetPropertyValue(d, c)))).Distinct().Count()
                    : datosParaAnalisis.Select(d => GetPropertyValue(d, "Id_Usuario")).Distinct().Count(),

                Estadistico_Principal = resultadoPrueba.Estadistico,
                P_Value = resultadoPrueba.PValue,
                IC_Inferior_95 = resultadoPrueba.ICInferior,
                IC_Superior_95 = resultadoPrueba.ICSuperior,

                Rechazar_Hipotesis_Nula = resultadoPrueba.RechazarH0,
                Tamanio_Efecto = resultadoPrueba.TamanioEfecto,
                Conclusion_Estadistica = resultadoPrueba.Conclusion,

                Estadisticos_Descriptivos = descriptivos,
                Recomendaciones = recomendaciones,
                Config_Usada = MapearConfigMetadata(config)
            };
        }

        /// <summary>
        /// Ejecuta correlación de Spearman con p-value e IC 95%
        /// </summary>
        private static (double Estadistico, double PValue, double? ICInferior, double? ICSuperior,
                       bool RechazarH0, string TamanioEfecto, string Conclusion)
            EjecutarSpearman(double?[] x, double?[] y, double alpha, double minEfectoRelevante)
        {
            if (x.Length != y.Length || x.Length < 3)
                return (0, 1, null, null, false, "N/A", "Datos insuficientes para prueba");

            // Calcular rangos y correlación de Spearman
            var rangosX = ConvertirARangos(x);
            var rangosY = ConvertirARangos(y);
            var rho = CalcularCorrelacionPearson(rangosX, rangosY);

            // Calcular p-value aproximado (distribución t)
            var n = x.Length;
            var tStat = rho * Math.Sqrt((n - 2) / (1 - rho * rho + 1e-10));
            var pValue = 2 * (1 - DistribucionTStudentCDF(Math.Abs(tStat), n - 2));

            // Intervalo de confianza 95% (transformación z de Fisher)
            var z = 0.5 * Math.Log((1 + rho) / (1 - rho + 1e-10));
            var se = 1.0 / Math.Sqrt(n - 3);
            var icInf = (Math.Exp(2 * (z - 1.96 * se)) - 1) / (Math.Exp(2 * (z - 1.96 * se)) + 1);
            var icSup = (Math.Exp(2 * (z + 1.96 * se)) - 1) / (Math.Exp(2 * (z + 1.96 * se)) + 1);

            // Decisión estadística
            var rechazarH0 = pValue < alpha && Math.Abs(rho) >= minEfectoRelevante;
            var tamanioEfecto = InterpretarTamanioEfectoSpearman(Math.Abs(rho));
            var direccion = rho > 0 ? "positiva" : "negativa";
            var conclusion = rechazarH0
                ? $"Correlación {direccion} estadísticamente significativa (ρ={rho:F3}, p={pValue:F4})"
                : $"Sin evidencia suficiente de correlación (ρ={rho:F3}, p={pValue:F4})";

            return (rho, pValue, icInf, icSup, rechazarH0, tamanioEfecto, conclusion);
        }

        /// <summary>
        /// Pre-agrupa datos seleccionando registro con fecha máxima por grupo
        /// </summary>
        private static List<T> PreAgruparConEstadoValido<T>(IEnumerable<T> datos, List<string> camposAgrupacion) where T : class
        {
            return datos
                .GroupBy(d => string.Join("|",
                    camposAgrupacion.Append("Id_Usuario")
                        .Select(c => GetPropertyValue(d, c)?.ToString() ?? "NULL")))
                .Select(grupo => grupo
                    .OrderByDescending(d => GetPropertyValue(d, "Fecha") as DateTime? ?? DateTime.MinValue)
                    .First())
                .ToList();
        }

        /// <summary>
        /// Calcula estadísticos descriptivos para propiedades especificadas
        /// </summary>
        private static Dictionary<string, DescriptiveStats> CalcularEstadisticosDescriptivos<T>(
            IEnumerable<T> datos, IEnumerable<string> propiedades) where T : class
        {
            var resultado = new Dictionary<string, DescriptiveStats>();

            foreach (var prop in propiedades)
            {
                var valoresNumericos = datos
                    .Select(d => ConvertToDouble(GetPropertyValue(d, prop)))
                    .Where(v => v.HasValue)
                    .Select(v => v.Value)
                    .ToArray();

                if (valoresNumericos.Any())
                {
                    resultado[prop] = new DescriptiveStats
                    {
                        Media = Math.Round(valoresNumericos.Average(), 2),
                        Mediana = CalcularMediana(valoresNumericos),
                        Desviacion_Estandar = valoresNumericos.Length > 1
                            ? Math.Round(Math.Sqrt(valoresNumericos.Average(v => Math.Pow(v - valoresNumericos.Average(), 2))), 2)
                            : null,
                        Minimo = Math.Round(valoresNumericos.Min(), 2),
                        Maximo = Math.Round(valoresNumericos.Max(), 2),
                        Count_Validos = valoresNumericos.Length
                    };
                }
                else
                {
                    // Intentar como variable categórica
                    var valoresCategoricos = datos
                        .Select(d => GetPropertyValue(d, prop)?.ToString())
                        .Where(v => !string.IsNullOrEmpty(v))
                        .ToList();

                    if (valoresCategoricos.Any())
                    {
                        resultado[prop] = new DescriptiveStats
                        {
                            Count_Validos = valoresCategoricos.Count,
                            Distribucion_Categorica = valoresCategoricos
                                .GroupBy(v => v)
                                .ToDictionary(g => g.Key ?? "NULL", g => g.Count())
                        };
                    }
                }
            }

            return resultado;
        }

        // =========================
        // HELPERS ESTADÍSTICOS
        // =========================

        private static double[] ConvertirARangos(double?[] valores)
        {
            var n = valores.Length;
            var rangos = new double[n];
            var ordenados = valores.Select((v, i) => (v, i)).OrderBy(t => t.v).ToList();

            int i = 0;
            while (i < n)
            {
                var valorActual = ordenados[i].v;
                var inicio = i;
                while (i < n && ordenados[i].v == valorActual) i++;
                var rangoPromedio = (inicio + 1 + i) / 2.0;
                for (int j = inicio; j < i; j++)
                    rangos[ordenados[j].i] = rangoPromedio;
            }
            return rangos;
        }

        private static double CalcularCorrelacionPearson(double[] x, double[] y)
        {
            var n = x.Length;
            var mx = x.Average();
            var my = y.Average();
            var num = Enumerable.Range(0, n).Sum(i => (x[i] - mx) * (y[i] - my));
            var denX = Math.Sqrt(Enumerable.Range(0, n).Sum(i => Math.Pow(x[i] - mx, 2)));
            var denY = Math.Sqrt(Enumerable.Range(0, n).Sum(i => Math.Pow(y[i] - my, 2)));
            return denX * denY < 1e-10 ? 0 : num / (denX * denY);
        }

        private static double DistribucionTStudentCDF(double t, double df)
        {
            // Aproximación simplificada para fines educativos del componente CPAD010
            var x = df / (df + t * t);
            return t >= 0 ? 1 - 0.5 * AproximarBetaIncompleta(x, df / 2, 0.5) : 0.5 * AproximarBetaIncompleta(x, df / 2, 0.5);
        }

        private static double AproximarBetaIncompleta(double x, double a, double b)
        {
            if (x <= 0) return 0; if (x >= 1) return 1;
            var res = 0.0; var term = 1.0;
            for (int k = 0; k < 20; k++) { res += term; term *= x * (a + k) / (a + b + k); }
            return Math.Min(1, Math.Max(0, res * Math.Pow(x, a) * Math.Pow(1 - x, b) / a));
        }

        private static double? ConvertToDouble(object? valor)
        {
            if (valor == null) return null;
            if (valor is double d) return d;
            if (valor is int i) return (double)i;
            if (valor is decimal m) return (double)m;
            if (double.TryParse(valor.ToString(), out var result)) return result;
            return null;
        }

        private static double CalcularMediana(double[] valores)
        {
            var ord = valores.OrderBy(v => v).ToArray();
            var n = ord.Length;
            return n % 2 == 0 ? (ord[n / 2 - 1] + ord[n / 2]) / 2 : ord[n / 2];
        }

        private static string InterpretarTamanioEfectoSpearman(double absRho) => absRho switch
        {
            < 0.10 => "Despreciable",
            < 0.30 => "Pequeño",
            < 0.50 => "Mediano",
            _ => "Grande"
        };

        private static List<string> GenerarRecomendacionesGenericas<T>(
            (double, double, double?, double?, bool, string, string) resultado,
            HipotesisTestConfig<T> config) where T : class
        {
            var (_, _, _, _, rechazarH0, tamanioEfecto, conclusion) = resultado;
            var rho = resultado.Item1; // Estadístico principal
            var recomendaciones = new List<string>();

            if (rechazarH0)
            {
                var direccion = rho > 0 ? "positiva" : "negativa";
                recomendaciones.Add($"✓ Existe relación {direccion} significativa entre {config.VariableIndependiente} y {config.VariableDependiente}.");

                if (tamanioEfecto == "Grande" || tamanioEfecto == "Mediano")
                    recomendaciones.Add($"✓ El efecto es {tamanioEfecto.ToLower()}: considerar intervenciones específicas.");

                recomendaciones.Add("✓ Validar hallazgos con análisis segmentado por variables de control.");
            }
            else
            {
                recomendaciones.Add($"ℹ️ Sin evidencia suficiente de relación (p={resultado.Item2:F4}).");
                recomendaciones.Add("ℹ️ Explorar variables moderadoras o análisis estratificado.");
                recomendaciones.Add("ℹ️ Considerar aumentar tamaño muestral para mayor potencia estadística.");
            }

            recomendaciones.Add("🔒 Ética: Usar resultados para apoyar decisiones, no para discriminar.");
            return recomendaciones;
        }
        private static TestConfigMetadata MapearConfigMetadata<T>(HipotesisTestConfig<T> config) where T : class
        {
            return new TestConfigMetadata
            {
                Variable_Independiente = config.VariableIndependiente,
                Variable_Dependiente = config.VariableDependiente,
                Variables_Control = config.VariablesControl,
                Campos_Agrupacion = config.CamposAgrupacion,
                Tipo_Prueba = config.TipoPrueba,
                Alpha = config.Alpha
            };
        }

        // Helper de reflexión compatible con arquitectura existente
        private static object? GetPropertyValue(object obj, string propName)
        {
            if (obj == null || string.IsNullOrEmpty(propName)) return null;
            if (obj is Dictionary<string, object> dict && dict.ContainsKey(propName))
                return dict[propName];
            return obj.GetType().GetProperty(propName)?.GetValue(obj);
        }


        //ANOVAAAAAAAAAAA
        /// <summary>
        /// Ejecuta ANOVA de una vía: compara medias de grupos definidos por variable categórica
        /// </summary>
        private static (double Estadistico, double PValue, double? ICInferior, double? ICSuperior,
                       bool RechazarH0, string TamanioEfecto, string Conclusion)
            EjecutarANOVA(double?[] valoresDependientes, double?[] valoresIndependientes, double alpha)
        {
            // Agrupar valores dependientes por categoría de variable independiente
            var grupos = valoresIndependientes
                .Zip(valoresDependientes, (ind, dep) => (Ind: ind, Dep: dep))
                .GroupBy(t => t.Ind)
                .Select(g => g.Select(t => t.Dep).ToArray())
                .Where(arr => arr.Length >= 2) // Mínimo 2 observaciones por grupo
                .ToList();

            if (grupos.Count < 2)
                return (0, 1, null, null, false, "N/A", "Insuficientes grupos para ANOVA (se requieren ≥2)");

            var k = grupos.Count; // Número de grupos
            var nTotal = grupos.Sum(g => g.Length); // Total de observaciones

            // Media global
            var mediaGlobal = grupos.SelectMany(g => g).Average();

            // Suma de cuadrados entre grupos (SSB)
            var ssb = grupos.Sum(g =>
                g.Length * Math.Pow(g.Average() - mediaGlobal ?? 0, 2));

            // Suma de cuadrados dentro de grupos (SSW)
            var ssw = grupos.Sum(g =>
                g.Sum(v => Math.Pow(v - g.Average() ?? 0, 2)));

            // Grados de libertad
            var dfb = k - 1;
            var dfw = nTotal - k;

            // Cuadrados medios
            var msb = ssb / dfb;
            var msw = ssw / dfw;

            // Estadístico F
            var fStat = msw < 1e-10 ? 0 : msb / msw;

            // P-value aproximado usando distribución F (simplificado)
            var pValue = AproximarPValueF(fStat, dfb, dfw);

            // Tamaño del efecto: Eta-cuadrado (η²)
            var etaSquared = ssb / (ssb + ssw);
            var tamanioEfecto = InterpretarTamanioEfectoANOVA(etaSquared);

            // Decisión
            var rechazarH0 = pValue < alpha;
            var conclusion = rechazarH0
                ? $"Diferencias significativas entre grupos (F({dfb},{dfw})={fStat:F3}, p={pValue:F4}, η²={etaSquared:F3})"
                : $"Sin diferencias significativas entre grupos (F({dfb},{dfw})={fStat:F3}, p={pValue:F4})";

            return (fStat, pValue, null, null, rechazarH0, tamanioEfecto, conclusion);
        }

        /// <summary>
        /// Aproximación de p-value para distribución F (simplificada para fines educativos)
        /// </summary>
        private static double AproximarPValueF(double f, double df1, double df2)
        {
            // Aproximación usando relación con distribución Beta
            // Implementación simplificada: para valores típicos en CPAD010
            if (f <= 0) return 1;

            // Para F > 10, p-value muy pequeño
            if (f > 10) return 0.0001;

            // Aproximación lineal inversa para rango común (0 < f ≤ 10)
            // Nota: En producción, usar librería estadística especializada
            var x = df1 * f / (df1 * f + df2);
            var p = 1 - AproximarBetaIncompleta(x, df1 / 2, df2 / 2);

            return Math.Max(0, Math.Min(1, p));
        }

        /// <summary>
        /// Interpreta tamaño del efecto para ANOVA (Eta-cuadrado)
        /// </summary>
        private static string InterpretarTamanioEfectoANOVA(double etaSquared)
        {
            return etaSquared switch
            {
                < 0.01 => "Despreciable",
                < 0.06 => "Pequeño",
                < 0.14 => "Mediano",
                _ => "Grande"
            };
        }


        //chi 2
        /// <summary>
        /// Ejecuta prueba Chi-Cuadrado de independencia entre dos variables categóricas
        /// </summary>
        private static (double Estadistico, double PValue, double? ICInferior, double? ICSuperior,
                       bool RechazarH0, string TamanioEfecto, string Conclusion)
            EjecutarChiSquare<T>(IEnumerable<T> datos, string var1Prop, string var2Prop, double alpha) where T : class
        {
            // Construir tabla de contingencia
            var contingencia = datos
                .Where(d => GetPropertyValue(d, var1Prop) != null && GetPropertyValue(d, var2Prop) != null)
                .GroupBy(d => new
                {
                    V1 = GetPropertyValue(d, var1Prop)?.ToString(),
                    V2 = GetPropertyValue(d, var2Prop)?.ToString()
                })
                .Select(g => new { g.Key.V1, g.Key.V2, Count = g.Count() })
                .ToList();

            if (contingencia.Count == 0)
                return (0, 1, null, null, false, "N/A", "Datos insuficientes para Chi-Cuadrado");

            // Obtener categorías únicas
            var categorias1 = contingencia.Select(c => c.V1).Distinct().ToList();
            var categorias2 = contingencia.Select(c => c.V2).Distinct().ToList();

            if (categorias1.Count < 2 || categorias2.Count < 2)
                return (0, 1, null, null, false, "N/A", "Se requieren ≥2 categorías por variable");

            // Calcular totales marginales
            var totalGeneral = contingencia.Sum(c => c.Count);
            var totalesFila = categorias1.ToDictionary(
                cat => cat,
                cat => contingencia.Where(c => c.V1 == cat).Sum(c => c.Count));
            var totalesColumna = categorias2.ToDictionary(
                cat => cat,
                cat => contingencia.Where(c => c.V2 == cat).Sum(c => c.Count));

            // Calcular Chi-Cuadrado
            var chiSquare = 0.0;
            foreach (var cat1 in categorias1)
            {
                foreach (var cat2 in categorias2)
                {
                    var observado = contingencia.FirstOrDefault(c => c.V1 == cat1 && c.V2 == cat2)?.Count ?? 0;
                    var esperado = (double)totalesFila[cat1] * totalesColumna[cat2] / totalGeneral;

                    if (esperado > 0)
                        chiSquare += Math.Pow(observado - esperado, 2) / esperado;
                }
            }

            // Grados de libertad
            var df = (categorias1.Count - 1) * (categorias2.Count - 1);

            // P-value aproximado para Chi-Cuadrado
            var pValue = AproximarPValueChiSquare(chiSquare, df);

            // Tamaño del efecto: Cramer's V
            var minDim = Math.Min(categorias1.Count - 1, categorias2.Count - 1);
            var cramersV = minDim > 0 ? Math.Sqrt(chiSquare / (totalGeneral * minDim)) : 0;
            var tamanioEfecto = InterpretarTamanioEfectoCramersV(cramersV);

            // Decisión
            var rechazarH0 = pValue < alpha;
            var conclusion = rechazarH0
                ? $"Asociación significativa entre variables (χ²={chiSquare:F3}, df={df}, p={pValue:F4}, V={cramersV:F3})"
                : $"Sin evidencia de asociación (χ²={chiSquare:F3}, df={df}, p={pValue:F4})";

            return (chiSquare, pValue, null, null, rechazarH0, tamanioEfecto, conclusion);
        }

        /// <summary>
        /// Aproximación de p-value para Chi-Cuadrado (simplificada)
        /// </summary>
        private static double AproximarPValueChiSquare(double chiSq, double df)
        {
            // Aproximación usando relación con distribución Gamma
            if (chiSq <= 0) return 1;

            // Para valores grandes, p-value muy pequeño
            if (chiSq > 30) return 0.0001;

            // Aproximación simplificada para fines educativos
            var x = chiSq / 2;
            var a = df / 2;
            var p = 1 - AproximarBetaIncompleta(1 - Math.Exp(-x / (a + 1)), a, 1);

            return Math.Max(0, Math.Min(1, p));
        }

        /// <summary>
        /// Interpreta tamaño del efecto para Cramer's V
        /// </summary>
        private static string InterpretarTamanioEfectoCramersV(double v)
        {
            return v switch
            {
                < 0.10 => "Despreciable",
                < 0.30 => "Pequeño",
                < 0.50 => "Mediano",
                _ => "Grande"
            };
        }


    }

}