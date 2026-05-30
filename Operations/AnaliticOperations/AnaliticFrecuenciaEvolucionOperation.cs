// Independiente:
// Frecuencia_Semanal_Real

// Dependiente:
// Mejora_IMC_Pct

// Control:
// Tipo_Actividad

//Prueba
//Pearson

public static async Task<HipotesisTestResult>
EjecutarH1FrecuenciaEvolucionAsync(
    List<V_Analisis_H1_Frecuencia_Evolucion> datos)
{
    var config =
        new HipotesisTestConfig<V_Analisis_H1_Frecuencia_Evolucion>()

        .ConVariableIndependiente(
            "Frecuencia_Semanal_Real")

        .ConVariableDependiente(
            "Mejora_IMC_Pct")

        .ConControl(
            "Tipo_Actividad")

        .AgruparPor(
            "Anio",
            "Mes")

        .ConSignificancia(0.05)

        .ConMinEfectoRelevante(0.10)

        .UsarPrueba("Pearson");

    return await HipotesisTestService
        .EjecutarPruebaAsync(datos, config);
}