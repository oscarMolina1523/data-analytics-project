# Documentación de Endpoints Analíticos

## Estructura General del Request

Todos los endpoints reciben un cuerpo con la siguiente estructura:

```json
{
  "Desde": "2020-01-01T00:00:00",
  "Hasta": "2025-12-31T23:59:59",
  "GroupParams": [
    "CampoAgrupacion"
  ],
  "EvalParams": [
    "CampoEvaluacion"
  ]
}
```

### Parámetros

| Campo       | Tipo          | Descripción                                   |
| ----------- | ------------- | --------------------------------------------- |
| Desde       | DateTime      | Fecha inicial del análisis                    |
| Hasta       | DateTime      | Fecha final del análisis                      |
| GroupParams | Array<string> | Campos utilizados para agrupar la información |
| EvalParams  | Array<string> | Métricas o indicadores a evaluar              |

---

# H1 - FrecuenciaEvolucion

## GroupParams permitidos

| valores permitidos    |
| --------------------- |
| Tipo_Actividad        |
| Rango_Frecuencia      |
| Genero                |
| Nivel_Fitness_Inicial |
| Tipo_Suscripcion      |
| Anio                  |
| Mes                   |
| Nombre_Mes            |
| Trimestre             |
| Semana_Anio           |

## EvalParams permitidos

| valores permitidos       |
| ------------------------ |
| Frecuencia_Semanal_Real  |
| Mejora_Peso_Pct          |
| Mejora_IMC_Pct           |
| Mejora_Masa_Muscular_Pct |

## Ejemplo de Request

```json
{
  "Desde": "2020-01-01T00:00:00",
  "Hasta": "2025-12-31T23:59:59",
  "GroupParams": [
    "Tipo_Actividad"
  ],
  "EvalParams": [
    "Mejora_IMC_Pct"
  ]
}
```

---

# H2 - GamificacionRenovacion

## GroupParams permitidos

| valores permitidos |
| ------------------ |
| Tipo_Suscripcion   |
| Nivel_Gamificacion |
| Anio               |
| Mes                |
| Nombre_Mes         |
| Trimestre          |
| Semana_Anio        |

## EvalParams permitidos

| valores permitidos         |
| -------------------------- |
| Score_Gamificacion_Mensual |
| Retos_Completados          |
| Retos_Totales_Asignados    |
| Puntos_Ganados             |
| Pct_Cumplimiento_Retos     |

## Ejemplo de Request

```json
{
  "Desde": "2020-01-01T00:00:00",
  "Hasta": "2025-12-31T23:59:59",
  "GroupParams": [
    "Nivel_Gamificacion"
  ],
  "EvalParams": [
    "Pct_Cumplimiento_Retos"
  ]
}
```

---

# H3 - ChurnPredictor

## GroupParams permitidos

| valores permitidos|
| ----------------- |
| Tipo_Suscripcion  |
| Nivel_Riesgo      |
| Anio              |
| Mes               |
| Nombre_Mes        |
| Trimestre         |
| Semana_Anio       |

## EvalParams permitidos

| valores permitidos           |
| ---------------------------- |
| Dias_Inactividad_Consecutiva |
| Lag_Periodo                  |
| Probabilidad_Churn           |

## Ejemplo de Request

```json
{
  "Desde": "2020-01-01T00:00:00",
  "Hasta": "2025-12-31T23:59:59",
  "GroupParams": [
    "Nivel_Riesgo"
  ],
  "EvalParams": [
    "Dias_Inactividad_Consecutiva"
  ]
}
```

---

# H4 - ConsistenciaPremium

## GroupParams permitidos

| valores permitidos |
| ------------------ |
| Tipo_Suscripcion   |
| Objetivo_Salud     |
| Nivel_Consistencia |
| Anio               |
| Mes                |
| Nombre_Mes         |
| Trimestre          |
| Semana_Anio        |

## EvalParams permitidos

| valores permitidos        |
| ------------------------- |
| Sesiones_Programadas      |
| Sesiones_Completadas      |
| Cumplimiento_Pct          |
| Variacion_Metrica_Semanal |

## Ejemplo de Request

```json
{
  "Desde": "2020-01-01T00:00:00",
  "Hasta": "2025-12-31T23:59:59",
  "GroupParams": [
    "Tipo_Suscripcion"
  ],
  "EvalParams": [
    "Cumplimiento_Pct"
  ]
}
```

---

# H5 - SocialFactorProtector

## GroupParams permitidos

| valores permitidos|
| ----------------- |
| Genero            |
| Nivel_Interaccion |
| Anio              |
| Mes               |
| Nombre_Mes        |
| Trimestre         |
| Semana_Anio       |

## EvalParams permitidos

| valores permitidos             |
| ------------------------------ |
| Volumen_Carga_Semanal          |
| Densidad_Interaccion_Recibida  |
| Likes_Recibidos                |
| Comentarios_Recibidos          |
| Score_Percepcion_Esfuerzo_Borg |
| Total_Interacciones            |

## Ejemplo de Request

```json
{
  "Desde": "2020-01-01T00:00:00",
  "Hasta": "2025-12-31T23:59:59",
  "GroupParams": [
    "Nivel_Interaccion"
  ],
  "EvalParams": [
    "Score_Percepcion_Esfuerzo_Borg"
  ]
}
```

---

# Pruebas Mínimas Recomendadas

Para validar rápidamente que los cinco endpoints funcionan correctamente:

| Endpoint               | GroupParam         | EvalParam                      |
| ---------------------- | ------------------ | ------------------------------ |
| FrecuenciaEvolucion    | Tipo_Actividad     | Mejora_IMC_Pct                 |
| GamificacionRenovacion | Nivel_Gamificacion | Pct_Cumplimiento_Retos         |
| ChurnPredictor         | Nivel_Riesgo       | Dias_Inactividad_Consecutiva   |
| ConsistenciaPremium    | Tipo_Suscripcion   | Cumplimiento_Pct               |
| SocialFactorProtector  | Nivel_Interaccion  | Score_Percepcion_Esfuerzo_Borg |

## Validaciones Cubiertas

Con estas cinco pruebas se verifica que:

* La vista existe correctamente.
* El modelo coincide con la definición esperada.
* El filtrado por fechas funciona.
* El agrupamiento (`GroupParams`) funciona correctamente.
* Los campos de evaluación (`EvalParams`) están correctamente configurados.
* El endpoint retorna información sin errores de mapeo o serialización.
