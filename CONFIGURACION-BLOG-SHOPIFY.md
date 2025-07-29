# Configuración del Blog en Shopify Admin

## Problema Actual
La URL `/blogs/news` está devolviendo un error 404, lo que indica que el blog 'news' no está configurado correctamente en el admin de Shopify.

## Solución: Configurar el Blog en Shopify Admin

### Paso 1: Acceder al Admin de Shopify
1. Inicia sesión en tu admin de Shopify: `https://admin.shopify.com/`
2. Ve a **Content > Blog posts**

### Paso 2: Verificar/Crear el Blog 'News'
1. Haz clic en **"Manage blogs"** (esquina superior derecha)
2. Verifica si existe un blog llamado "News"
3. Si no existe, haz clic en **"Add blog"**

### Paso 3: Configurar el Blog
Si necesitas crear el blog:
1. **Title**: "News" o "Noticias"
2. **Handle**: Asegúrate de que sea "noticias" (esto creará la URL `/blogs/noticias`)
3. **Comments**: Configura según prefieras
4. **Template**: Selecciona el template por defecto o personalizado
5. Haz clic en **"Save"**

### Paso 4: Configurar SEO del Blog
1. En la sección "Search engine listing preview", haz clic en el ícono de lápiz
2. **Page title**: "Noticias de Belleza - Moka"
3. **Meta description**: "Descubre las últimas tendencias en belleza y maquillaje. Tips, tutoriales y noticias del mundo beauty."
4. **URL handle**: Confirma que sea "news"
5. Guarda los cambios

### Paso 5: Crear el Primer Post (Opcional)
Para probar que funciona:
1. Ve a **Content > Blog posts**
2. Haz clic en **"Create blog post"**
3. Crea un post de prueba
4. En "Organization" > "Blog", selecciona "News"
5. Publica el post

### Paso 6: Verificar la Configuración
1. Ve a tu tienda: `https://mokaoficial.com/blogs/news`
2. Verifica que la página carga correctamente
3. Confirma que el botón "Ver todas las noticias" en la página principal funciona

## Configuración Actual del Tema
El tema ya está configurado correctamente:
- ✅ Sección `blog-home` habilitada
- ✅ URL configurada como `/blogs/news`
- ✅ Botón "Ver todas las noticias" habilitado
- ✅ Límite de 6 artículos en la página principal
- ✅ Título: "NOTICIAS DE BELLEZA"
- ✅ Subtítulo: "En tendencia 💋"

## Notas Importantes
- En Shopify, la estructura de URLs de blogs es fija: `/blogs/[handle]/[artículo]`
- No se puede cambiar la parte `/blogs/` de la URL
- El handle del blog debe coincidir con la configuración del tema
- Cada tienda de Shopify viene con un blog "News" por defecto, pero debe estar activado

## Automatización del Blog
Una vez configurado el blog básico, el sistema de automatización que hemos implementado:
- ✅ Generará contenido automáticamente desde fuentes RSS españolas
- ✅ Creará borradores que pueden ser revisados en `/blogs/news?admin=true`
- ✅ Procesará contenido en español sin traducción
- ✅ Aplicará tags relevantes de belleza y maquillaje

## Verificación Final
Después de configurar el blog en Shopify Admin:
1. Visita `https://mokaoficial.com/blogs/news`
2. Verifica que no hay error 404
3. Confirma que el botón en la página principal funciona
4. Prueba el sistema de automatización si es necesario