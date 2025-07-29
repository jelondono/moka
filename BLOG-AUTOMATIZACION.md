# Automatización del Blog - Noticias de Belleza y Maquillaje Colombiano

## Descripción
Este sistema automatiza la creación de contenido para el blog, enfocándose en noticias de maquillaje colombiano y belleza en general. Utiliza feeds RSS para obtener contenido actualizado y lo procesa automáticamente.

## Características
- ✅ Obtención automática de contenido desde feeds RSS
- ✅ Filtrado de contenido relevante (belleza, maquillaje, Colombia)
- ✅ Generación automática de tags y categorías
- ✅ Interfaz de administración para gestionar borradores
- ✅ Traducción automática de contenido al español
- ✅ Notificaciones visuales de nuevos artículos
- ✅ Estadísticas de automatización

## Archivos Creados

### 1. Configuración
- `config/blog-automation.json` - Configuración principal del sistema

### 2. Scripts
- `assets/blog-automation.js` - Script principal de automatización

### 3. Plantillas
- `sections/blog-automation-admin.liquid` - Interfaz de administración
- Actualizado `templates/blog.json` - Incluye la nueva sección de administración
- Actualizado `snippets/footer-js.liquid` - Carga el script de automatización

## Cómo Usar

### Acceso a la Administración
1. Ve a tu página de blog: `/blogs/news` (o el handle de tu blog)
2. Agrega `?admin=true` al final de la URL
3. Ejemplo: `https://tu-tienda.myshopify.com/blogs/news?admin=true`

### Configuración Inicial
1. En la pestaña "Configuración", ajusta:
   - Intervalo de verificación (recomendado: 3600000 ms = 1 hora)
   - Límite de posts por verificación
   - Filtros de contenido
   - Configuración de traducción

### Gestión de Contenido
1. **Borradores**: Revisa y aprueba artículos automáticamente generados
2. **Feeds RSS**: Monitorea el estado de los feeds configurados
3. **Estadísticas**: Ve métricas de la automatización

## Feeds RSS Configurados

### Belleza General
- Allure Beauty News
- Byrdie Beauty
- Beauty Independent
- Glamour Beauty

### Contenido Colombiano
- El Tiempo - Vida y Estilo
- Semana - Vida Moderna
- RCN Radio - Estilo de Vida

## Funcionalidades Automáticas

### Procesamiento de Contenido
- **Filtrado**: Solo artículos relacionados con belleza, maquillaje, skincare
- **Traducción**: Contenido en inglés se traduce automáticamente al español
- **Tags**: Generación automática basada en el contenido
- **Contexto Colombiano**: Adaptación del contenido al mercado colombiano

### Notificaciones
- Notificación visual cuando se encuentran nuevos artículos
- Alertas de errores en feeds RSS
- Confirmaciones de acciones administrativas

## Personalización

### Agregar Nuevos Feeds
1. Edita `config/blog-automation.json`
2. Agrega nuevos feeds en la sección `rssFeeds`
3. Incluye nombre, URL, idioma y categoría

### Modificar Filtros
1. Edita la sección `automation.contentFilters` en la configuración
2. Agrega nuevas palabras clave relevantes
3. Ajusta palabras a excluir si es necesario

### Cambiar Configuración de Blog
1. Modifica `blogSettings` en la configuración
2. Cambia autor por defecto, tags, mapeo de categorías

## Solución de Problemas

### El sistema no encuentra nuevos artículos
- Verifica que los feeds RSS estén funcionando
- Revisa los filtros de contenido (pueden ser muy restrictivos)
- Comprueba la consola del navegador para errores

### Los artículos no se muestran
- Asegúrate de estar en modo administrador (`?admin=true`)
- Verifica que el script se esté cargando correctamente
- Revisa el almacenamiento local del navegador

### Problemas de traducción
- La traducción automática es básica y puede requerir edición manual
- Revisa los borradores antes de aprobarlos

## Seguridad
- El modo administrador requiere acceso a la URL específica
- Los borradores se almacenan localmente en el navegador
- No se publican artículos automáticamente sin aprobación

## Próximas Mejoras
- Integración con APIs de traducción más avanzadas
- Generación automática de imágenes
- Programación de publicaciones
- Integración con redes sociales
- Análisis de rendimiento de contenido

---

**Nota**: Este sistema está diseñado para asistir en la creación de contenido, pero siempre se recomienda revisar y editar manualmente los artículos antes de publicarlos para asegurar calidad y relevancia.