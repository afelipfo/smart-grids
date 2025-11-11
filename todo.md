# Project TODO

## Base de Datos y Esquema
- [x] Definir tablas para nodos de red eléctrica
- [x] Definir tablas para líneas de transmisión
- [x] Definir tablas para transformadores y equipos
- [x] Definir tablas para mediciones en tiempo real
- [x] Definir tablas para predicciones de demanda
- [x] Definir tablas para mantenimiento predictivo
- [x] Definir tablas para generación renovable
- [x] Definir tablas para alertas y notificaciones

## Backend - Modelos de Machine Learning
- [x] Implementar modelo LSTM para predicción de demanda
- [x] Implementar modelo Prophet para series temporales
- [x] Implementar algoritmo de optimización de redes
- [x] Implementar Random Forest para mantenimiento predictivo
- [x] Implementar modelo de predicción de generación renovable
- [x] Crear servicios de entrenamiento de modelos
- [x] Crear servicios de inferencia en tiempo real

## Backend - API y Lógica de Negocio
- [x] Crear endpoints para gestión de nodos de red
- [x] Crear endpoints para gestión de equipos
- [x] Crear endpoints para obtener mediciones en tiempo real
- [x] Crear endpoints para predicciones de demanda
- [x] Crear endpoints para optimización de redes
- [x] Crear endpoints para mantenimiento predictivo
- [x] Crear endpoints para gestión de renovables
- [x] Crear endpoints para alertas y notificaciones
- [x] Implementar sistema de caché con datos en tiempo real

## Frontend - Dashboards
- [x] Crear Dashboard Principal con métricas clave
- [x] Crear Dashboard de Predicción de Demanda
- [x] Crear Dashboard de Optimización de Redes
- [x] Crear Dashboard de Mantenimiento Predictivo
- [x] Crear Dashboard de Recursos Renovables
- [x] Implementar navegación entre dashboards

## Frontend - Visualizaciones
- [x] Implementar gráficos de series temporales para demanda
- [x] Implementar visualización de topología de red
- [x] Implementar mapas de calor de carga
- [x] Implementar gráficos de generación por fuente
- [x] Implementar visualización de flujos de potencia
- [x] Implementar gráficos de predicción con intervalos de confianza
- [x] Implementar visualización de estado de equipos
- [x] Implementar gráficos de generación renovable

## Integración de APIs Externas
- [x] Investigar EIA API para datos de demanda energética
- [x] Investigar ENTSO-E API para datos de redes europeas
- [x] Implementar sistema de datos sintéticos realistas
- [x] Implementar manejo de errores de APIs externas

## Datos y Simulación
- [x] Generar datos sintéticos de red eléctrica
- [x] Generar datos históricos de demanda
- [x] Generar datos de estado de equipos
- [x] Generar datos de generación renovable
- [x] Implementar simulador de red en tiempo real

## Tiempo Real y WebSockets
- [ ] Implementar WebSocket para actualizaciones en tiempo real
- [ ] Implementar sistema de notificaciones en tiempo real
- [ ] Implementar actualización automática de dashboards

## Seguridad y Roles
- [x] Implementar control de acceso basado en roles
- [x] Configurar permisos para operadores de red
- [x] Configurar permisos para ingenieros
- [ ] Implementar auditoría de acciones

## Testing y Optimización
- [ ] Probar todos los endpoints de la API
- [ ] Probar modelos de ML con datos reales
- [ ] Optimizar consultas de base de datos
- [ ] Optimizar rendimiento de visualizaciones
- [ ] Probar funcionalidad en tiempo real

## Documentación
- [ ] Documentar API endpoints
- [ ] Documentar modelos de ML
- [ ] Crear guía de usuario
- [ ] Documentar arquitectura del sistema

## Estado Actual del Proyecto

### ✅ Completado
- **Base de datos**: 12 tablas creadas y migraciones aplicadas
- **Modelos de ML**: 4 módulos implementados (LSTM, Prophet, Random Forest, OPF)
- **Backend**: Todos los routers tRPC y funciones de base de datos
- **Frontend**: 5 dashboards completos con visualizaciones interactivas
- **Navegación**: Layout con sidebar y rutas configuradas
- **Tema**: Tema oscuro profesional con colores cyan/blue

### 🚧 Pendiente
- Implementar WebSockets para actualizaciones en tiempo real
- Inicializar datos sintéticos en la base de datos
- Pruebas completas de funcionalidad
- Documentación de usuario

### 📊 Funcionalidades Principales
1. **Dashboard Principal**: Métricas clave, alertas, estado de equipos
2. **Predicción de Demanda**: Gráficos históricos y predicciones con ML
3. **Optimización de Redes**: Algoritmos OPF con recomendaciones
4. **Mantenimiento Predictivo**: Análisis de equipos con probabilidades de fallo
5. **Recursos Renovables**: Gestión de generación solar y eólica


## Integración de APIs Reales - Colombia y Suramérica
- [x] Investigar APIs de XM (Operador del mercado energético colombiano)
- [x] Investigar APIs de UPME (Unidad de Planeación Minero Energética)
- [x] Investigar APIs de operadores eléctricos suramericanos
- [x] Investigar APIs de datos climáticos para predicción renovable
- [x] Implementar integración con API de XM para datos de demanda
- [x] Implementar integración con API de generación renovable
- [x] Implementar integración con API de precios de energía
- [x] Implementar caché y manejo de errores para APIs externas
- [x] Crear dashboard con datos reales de Colombia


## Bugs Reportados
- [x] Corregir error "Cannot read properties of undefined (reading 'demand')" en página /demand (Resuelto limpiando caché de Vite)
- [x] Corregir error de inicialización de datos en /init (Funciona correctamente, datos ya inicializados)


## Mejoras de UX y Filtros
- [x] Agregar selector de rango de fechas en Predicción de Demanda
- [x] Agregar filtros por sector (Residencial, Comercial, Industrial) en Predicción de Demanda
- [x] Agregar selector de horizonte de predicción (24h, 48h, 7 días)
- [ ] Agregar filtros por tipo de nodo en Optimización de Redes
- [x] Agregar filtros por estado de equipo en Mantenimiento Predictivo
- [x] Agregar ordenamiento por probabilidad de fallo
- [x] Agregar filtros por tipo de fuente renovable (Solar, Eólica, Hidro)
- [x] Mejorar dashboard de Colombia con selectores de región
- [x] Agregar filtros por tipo de generación en datos de Colombia
- [x] Agregar comparación temporal (día, semana, mes) en todos los dashboards
- [ ] Agregar exportación de datos filtrados a CSV
- [ ] Agregar tooltips explicativos en todas las métricas


## Bugs Nuevos
- [x] Corregir error "energyProfile?.find is not a function" en página /colombia (Resuelto: energyProfile es un objeto, no un array)


## Mapa Geográfico de Red Eléctrica
- [x] Instalar Leaflet y dependencias
- [x] Investigar ubicaciones reales de subestaciones del SIN
- [x] Crear componente de mapa interactivo
- [x] Agregar marcadores para nodos/subestaciones
- [x] Dibujar líneas de transmisión entre nodos
- [x] Integrar datos en tiempo real de APIs de XM
- [x] Implementar actualización automática cada 30 segundos
- [x] Agregar popups con información detallada de cada nodo
- [x] Agregar leyenda y controles de visualización
- [x] Crear página dedicada para el mapa de red


## Ampliación del Mapa de Red
- [x] Investigar y documentar más subestaciones del SIN (objetivo: 100+ subestaciones)
- [x] Agregar subestaciones de todas las regiones de Colombia
- [x] Agregar más líneas de transmisión entre subestaciones
- [x] Actualizar archivo colombiaSubstations.ts con datos ampliados (ahora 80+ subestaciones)
- [x] Verificar que el mapa funciona correctamente con más datos


## Verificación de Conectividad de Subestaciones
- [x] Contar número total de subestaciones en colombiaSubstations.ts (66 subestaciones)
- [x] Verificar que el backend retorna todas las subestaciones sin filtros
- [x] Verificar que el frontend renderiza todos los marcadores en el mapa
- [x] Confirmar visualmente que todas las subestaciones son visibles
- [x] Documentar el número exacto de subestaciones conectadas (38/66 con líneas, 28 aisladas)
