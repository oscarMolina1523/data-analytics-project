# Hipótesis Analíticas - Proyecto de Analítica de Datos (CPAD010)

**Componente Curricular:** Proyecto de Analítica de Datos  
**Código:** CPAD010  
**Carrera:** Ingeniería en Sistemas de Información  
**Semestre:** Noveno | **Año:** Quinto  
**Caso de Estudio:** Aplicación para el análisis basado en datos Fitness y Salud

---

## Tabla Resumen de Hipótesis

| IDENTIFICACIÓN | Hipótesis | Clave de variables | Enfoque Analítico | Tema CPAD010 |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | Mayor frecuencia de entrenamiento correlaciona con mejor condición física final. | `frecuencia_semanal`, `metrica_fisica_evol`, `tipo_actividad` | Correlación de Pearson / ANOVA | Tema 4: Modelado de datos |
| **H2** | El cumplimiento de metas en "Retos Gamificados" predice la probabilidad de renovación de suscripción. | `score_gamificacion`, `puntos_reto`, `renewal_flag` | Regresión Logística / Scoring | Tema 4: Modelado predictivo |
| **H3** | La inactividad prolongada en el periodo N predice el abandono en el periodo N+1. | `dias_inactividad`, `churn_flag`, `lag_temporal` | Análisis de Supervivencia / Regresión | Tema 2: Estrategias analíticas |
| **H4** | El tipo de suscripción Premium reduce la probabilidad de inconsistencia en rutinas. | `tipo_suscripcion`, `cumplimiento_pct`, `variacion_metrica` | Prueba de proporciones / Odds Ratio | Tema 4: Modelado de datos |
| **H5** | La densidad de interacción social (Likes/Comentarios) actúa como factor protector ante la fatiga del entrenamiento. | `densidad_interaccion`, `volumen_carga`, `percepcion_esfuerzo` | Análisis de Covarianza (ANCOVA) | Tema 5: Visualización |

---

## Explicación detallada de hipótesis

### H1: Frecuencia de Entrenamiento → Mejora de Condición Física

**Enunciado de la Hipótesis:** Los usuarios que registran una frecuencia de entrenamiento constante (≥3 sesiones/semana) presentan estadísticamente mejores resultados en su evolución física final, medida a través de métricas corporales (Peso/IMC/Masa Muscular).

**Variables Involucradas**
| Tipo de Variable | Nombre | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- |
| **Independiente** | `frecuencia_semanal` | `INT` | Cantidad de sesiones completadas por semana (continua). |
| **Dependiente** | `evolucion_fisica_valor` | `DECIMAL(5,2)` | Diferencia porcentual entre métrica inicial y final. |
| **Control** | `tipo_actividad` | `ENUM` | Filtrar por 'Fuerza' o 'Cardio' para aislar el efecto. |

---

### H2: Gamificación (Retos) → Renovación de Suscripción

**Enunciado de la Hipótesis:** Existe una relación predictiva entre el nivel de éxito en retos de la comunidad y la intención de renovación; los usuarios que completan al menos el 70% de los retos mensuales tienen un 50% más de probabilidad de renovar su suscripción.

**Variables Involucradas**
| Tipo de Variable | Nombre | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- |
| **Predictora** | `pct_cumplimiento_retos` | `DECIMAL` | Porcentaje de objetivos de retos alcanzados en el mes. |
| **Dependiente** | `renewal_flag` | `BOOLEAN` | 1 = Renueva suscripción, 0 = No renueva. |
| **Control** | `antiguedad_user` | `INT` | Meses desde el registro inicial en la plataforma. |

---

### H3: Inactividad como Predictor de Abandono (Churn)

**Enunciado de la Hipótesis:** La acumulación de días de inactividad en el período *t* funciona como una señal temprana que predice un estado de abandono definitivo (Churn) en el período *t+1*, con un desfase temporal de 15 días.

**Variables Involucradas**
| Tipo de Variable | Nombre | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- |
| **Predictora** | `dias_inactividad` | `INT` | Días consecutivos sin registros de entrenamiento. |
| **Respuesta** | `churn_flag` | `BOOLEAN` | 1 = Usuario inactivo/baja, 0 = Activo. |
| **Temporal** | `lag_periodo` | `INT` | Desfase de diseño para la predicción de 15 días. |

---

### H4: Suscripción Premium → Reducción de Inconsistencia

**Enunciado de la Hipótesis:** Los usuarios con suscripción de pago (Premium) presentan un índice de variación en sus rutinas significativamente menor que los usuarios gratuitos, validando que el costo de oportunidad del servicio fomenta el cumplimiento.

**Variables Involucradas**
| Tipo de Variable | Nombre | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- |
| **Explicativa** | `tipo_suscripcion` | `ENUM` | Categoría de cuenta (Free / Premium). |
| **Resultado** | `cumplimiento_pct` | `DECIMAL` | Porcentaje de sesiones programadas vs. completadas. |
| **Control** | `objetivo_salud` | `ENUM` | Objetivo del usuario (Bajar peso, ganar músculo, etc.). |

---

### H5: Interacción Social como Factor Protector de Continuidad

**Enunciado de la Hipótesis:** La densidad de interacción social recibida (feedback de la comunidad) modera el impacto negativo de la carga física intensa en la percepción del esfuerzo, actuando como un amortiguador ante la fatiga.

**Variables Involucradas**
| Tipo de Variable | Nombre | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- |
| **Independiente** | `volumen_carga_semanal` | `INT` | Total de Kg levantados o Km recorridos en la semana. |
| **Moderadora** | `densidad_interaccion` | `FLOAT` | Promedio de interacciones sociales recibidas por post. |
| **Dependiente** | `score_percepcion_esfuerzo` | `INT (1-10)` | Escala de Borg (esfuerzo percibido reportado). |

---

## Estrategia de Validación (Conceptual)
1. **Análisis Descriptivo:** Frecuencias de entrenamiento y cumplimiento de retos.
2. **Análisis Inferencial:** Regresión Logística (H2, H3), ANOVA (H1) y ANCOVA (H5).
3. **Criterios de Aceptación:** p-valor < 0.05.

## Alineación con Valores CPAD010
* **Ética Profesional:** Rigor metodológico y privacidad de datos.
* **Responsabilidad Social:** Fomento de estilos de vida saludables.

---

## Referencias Bibliográficas
* **Bandura, A. (1997).** *Self-Efficacy: The Exercise of Control*. (H5).
* **Baati, M., et al. (2022).** *Predicting User Churn*. (H3).
* **Ryan, R. M., & Deci, E. L. (2017).** *Self-Determination Theory*. (H2, H4).