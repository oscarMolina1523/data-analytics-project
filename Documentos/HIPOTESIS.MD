# Hipótesis Analíticas - Proyecto de Analítica de Datos (CPAD010)

**Componente Curricular:** Proyecto de Analítica de Datos  
**Código:** CPAD010  
**Carrera:** Ingeniería en Sistemas de Información  
**Semestre:** Noveno | **Año:** Quinto  
**Caso de Estudio:** Aplicación de Fitness y Salud

## Tabla Resumen de Hipótesis

| IDENTIFICACIÓN | Hipótesis | Clave de variables | Enfoque Analítico | Tema CPAD010 |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | Mayor frecuencia de entrenamiento correlaciona con mejor condición física final. | `frecuencia_semanal`, `metrica_fisica_evol`, `tipo_actividad` | Correlación de Pearson / ANOVA | Tema 4: Modelado de datos |
| **H2** | La participación en retos se asocia con un incremento en la adherencia al programa. | `participacion_retos`, `dias_actividad_mes`, `status_adherencia` | Regresión logística / Chi-cuadrado | Tema 4: Modelado predictivo |
| **H3** | La inactividad prolongada en el periodo N predice el abandono en el periodo N+1. | `dias_inactividad`, `churn_flag`, `lag_temporal` | Análisis de Supervivencia / Regresión | Tema 2: Estrategias analíticas |
| **H4** | El tipo de suscripción Premium reduce la probabilidad de inconsistencia en rutinas. | `tipo_suscripcion`, `cumplimiento_pct`, `variacion_metrica` | Prueba de proporciones / Odds Ratio | Tema 4: Modelado de datos |
| **H5** | La interacción social modera positivamente la relación entre motivación y continuidad. | `interaccion_social`, `motivacion_inicial`, `retencion_user` | Análisis de moderación / Interacción | Tema 5: Visualización |

---

## Explicación detallada de hipótesis

### H1: Frecuencia de Entrenamiento → Mejora de Condición Física

**Enunciado de la Hipótesis** Los usuarios que registran una frecuencia de entrenamiento constante (≥3 sesiones/semana) presentan estadísticamente mejores resultados en su evolución física final, medida a través de métricas corporales (Peso/IMC/Masa Muscular).

**Variables Involucradas** | Tipo de Variable | Nombre | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- |
| **Independiente** | `frecuencia_semanal` | `INT` | Cantidad de sesiones completadas por semana (continua). |
| **Dependiente** | `evolucion_fisica_valor` | `DECIMAL(5,2)` | Diferencia porcentual entre métrica inicial y final. |
| **Control** | `tipo_actividad` | `ENUM` | Filtrar por 'Fuerza' o 'Cardio' para aislar el efecto. |
| **Estratificación** | `rango_edad` | `Categórica` | Grupos: 18-30, 31-45, 46+ años. |

**Razonamiento Analítico para la Fórmula H1** * **Fundamento Teórico:** La teoría del entrenamiento deportivo establece que la supercompensación fisiológica depende directamente de la regularidad del estímulo. Sin una frecuencia mínima, el cuerpo no consolida adaptaciones físicas duraderas.  
* **Observación Empírica Preliminar:** En la exploración de datos, usuarios con >12 sesiones mensuales mostraron un 75% de cumplimiento de metas físicas vs. 30% en usuarios esporádicos.  
* **Relevancia Empresarial (Tema 1 CPAD010):** Validar H1 permite a la organización ajustar los algoritmos de recomendación para incentivar la frecuencia mínima necesaria, mejorando la satisfacción del cliente y su percepción de éxito.

---

### H3: Inactividad como Predictor de Abandono (Churn)

**Enunciado de la Hipótesis** La acumulación de días de inactividad en el período *t* funciona como una señal temprana que predice un estado de abandono definitivo (Churn) en el período *t+1*, con un desfase temporal de 15 días.

**Variables Involucradas** | Tipo de Variable | Nombre | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- |
| **Predictora** | `dias_inactividad` | `INT` | Días consecutivos sin registros de entrenamiento en la plataforma. |
| **Respuesta** | `churn_flag` | `BOOLEAN` | 1 = Usuario inactivo/baja, 0 = Activo. |
| **Temporal** | `lag_periodo` | `INT` | Desfase de diseño para la predicción temporal de 15 días. |
| **Control** | `tipo_suscripcion` | `ENUM` | Controlar si el pago anual mitiga el efecto de la inactividad. |

**Razonamiento Analítico para la Fórmula H3** * **Fundamento Teórico:** Los modelos de comportamiento en salud indican que el abandono de una rutina es precedido por un aumento en la resistencia al esfuerzo, manifestado inicialmente como ausentismo o inactividad digital.  
* **Observación Empírica Preliminar:** El 80% de los usuarios que se dieron de baja tuvieron un periodo de inactividad previa de al menos 14 días continuos sin interacción.  
* **Relevancia Empresarial (Tema 2 CPAD010):** Permite implementar estrategias analíticas predictivas (Alertas Tempranas) para intervenir con notificaciones o incentivos antes de que el usuario abandone la suscripción.

---

### H5: Interacción Social como Moderador de Continuidad

**Enunciado de la Hipótesis** La interacción social en la comunidad modera positivamente la relación entre la motivación inicial y la continuidad del programa; de modo que usuarios con baja motivación inicial que interactúan socialmente tienen mayor probabilidad de evolución positiva que los usuarios solitarios.

**Variables Involucradas** | Tipo de Variable | Nombre | Tipo de Dato | Descripción |
| :--- | :--- | :--- | :--- |
| **Independiente** | `motivacion_score` | `INT (1-5)` | Nivel de motivación declarado al inicio del periodo. |
| **Moderadora** | `interaccion_social` | `BOOLEAN` | 1 si el usuario participó en foros o retos grupales en el periodo. |
| **Dependiente** | `retencion_user` | `BOOLEAN` | Permanencia activa al finalizar el periodo de estudio. |
| **Interacción** | `motivacion * social` | `Producto` | Variable creada para probar el efecto moderador (Interaction term). |

---

## Estrategia de Validación (Conceptual)

1.  **Análisis Descriptivo:** Tablas de frecuencia de entrenamiento y distribución de tipos de suscripción.  
2.  **Análisis Inferencial:** * **Regresión Logística:** Para estimar la probabilidad de Churn (H3) y Adherencia (H2).  
    * **Prueba t de Student:** Para comparar medias de consistencia entre usuarios Premium y Básicos (H4).  
3.  **Criterios de Aceptación:** * **p-valor < 0.05** para significancia estadística en todos los modelos.  
    * **AUC-ROC > 0.70** para el modelo predictivo de abandono.

## Alineación con Valores CPAD010

* **Ética Profesional:** Interpretación de datos con rigor metodológico, asegurando la privacidad de las métricas de salud del usuario.  
* **Responsabilidad Social e Institucional:** Utilizar la analítica para fomentar estilos de vida saludables y combatir el sedentarismo.  
* **Equidad:** Analizar los patrones de adherencia sin sesgos por condición física inicial o nivel socioeconómico.

##  Referencias Bibliográficas (Fundamento de Hipótesis)

* **Bandura, A. (1997).** *Self-Efficacy: The Exercise of Control*. W.H. Freeman. (Sustento para **H5**: La influencia social y la motivación en el comportamiento humano).
* **Baati, M., et al. (2022).** *Predicting User Churn in Fitness Applications using Machine Learning*. Journal of Sports Analytics. (Sustento para **H3**: Modelado predictivo de abandono en entornos digitales).
* **Caspersen, C. J., Powell, K. E., & Christenson, G. M. (1985).** *Physical activity, exercise, and physical fitness: definitions and distinctions for health-related research*. Public Health Reports. (Sustento para **H1**: Relación entre frecuencia de ejercicio y mejora de condición física).
* **Ryan, R. M., & Deci, E. L. (2017).** *Self-Determination Theory: Basic Psychological Needs in Motivation, Development, and Wellness*. Guilford Publications. (Sustento para **H2** y **H4**: Adherencia basada en incentivos y tipos de usuario).