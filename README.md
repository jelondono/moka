# 🛍️ Shopify Product Uploader

Sistema automatizado para subir productos desde un archivo Excel a tu tienda Shopify, evitando la creación manual de productos uno por uno.

## 🚀 Características

- ✅ **Subida masiva** de productos desde Excel
- 🔄 **Reintentos automáticos** en caso de errores
- 📊 **Validación de datos** antes de la subida
- 📝 **Logging detallado** de todo el proceso
- 🏷️ **Tags automáticas** configurables
- 📦 **Procesamiento por lotes** para mejor rendimiento
- 🛡️ **Manejo de rate limits** de Shopify
- 📋 **Reportes de errores** detallados

## 📋 Requisitos Previos

### 1. Python
Asegúrate de tener Python 3.7 o superior instalado.

### 2. Token de Acceso de Shopify
Necesitas crear una aplicación privada en tu tienda Shopify:

1. Ve a tu panel de administración de Shopify
2. Navega a **Configuración** → **Aplicaciones y canales de venta**
3. Haz clic en **Desarrollar aplicaciones**
4. Crea una nueva aplicación privada
5. Configura los permisos necesarios:
   - `write_products` (obligatorio)
   - `read_products` (recomendado)
6. Instala la aplicación y copia el **Access Token**

## 🛠️ Instalación

### 1. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 2. Configurar credenciales
Edita el archivo `config.py` y actualiza:

```python
# Configuración de Shopify
SHOP_URL = "tu-tienda.myshopify.com"  # Reemplaza con tu URL
ACCESS_TOKEN = "tu-token-de-acceso"   # Reemplaza con tu token
```

## 📊 Formato del Excel

### Columnas Obligatorias
- **title**: Nombre del producto
- **price**: Precio del producto

### Columnas Opcionales
- **body_html**: Descripción del producto (puede incluir HTML)
- **vendor**: Marca o proveedor
- **product_type**: Tipo de producto
- **tags**: Etiquetas separadas por comas
- **compare_at_price**: Precio de comparación (precio tachado)
- **sku**: Código SKU del producto
- **inventory_quantity**: Cantidad en inventario
- **weight**: Peso en gramos
- **image_url**: URL de la imagen principal

### Crear Excel de Ejemplo
Puedes generar un archivo Excel de ejemplo ejecutando:

```bash
python crear_excel_ejemplo.py
```

Esto creará `productos_ejemplo.xlsx` con datos de muestra.

## 🚀 Uso

### 1. Preparar tu archivo Excel
- Crea un archivo Excel con tus productos
- Asegúrate de que tenga las columnas necesarias
- Guárdalo como `productos.xlsx` (o cambia el nombre en `config.py`)

### 2. Ejecutar el uploader
```bash
python shopify_uploader.py
```

### 3. Monitorear el progreso
El script mostrará:
- Progreso en tiempo real
- Productos procesados exitosamente
- Errores encontrados
- Resumen final con estadísticas

## 📁 Estructura de Archivos

```
├── shopify_uploader.py      # Script principal
├── config.py                # Configuración
├── crear_excel_ejemplo.py   # Generador de Excel de ejemplo
├── requirements.txt         # Dependencias
├── README.md               # Este archivo
├── productos.xlsx          # Tu archivo de productos (crear)
├── logs/                   # Logs del proceso
└── errores_subida_*.json   # Reportes de errores
```

## ⚙️ Configuración Avanzada

Puedes personalizar el comportamiento editando `config.py`:

### Rendimiento
```python
REQUEST_DELAY = 0.5        # Pausa entre requests (segundos)
BATCH_SIZE = 10            # Productos por lote
MAX_RETRIES = 3            # Reintentos por producto
```

### Tags Automáticas
```python
AUTO_TAGS = ['importado', 'nuevo']  # Se agregan a todos los productos
```

### Mapeo de Columnas
```python
COLUMN_MAPPING = {
    'nombre': 'title',         # Si tu Excel usa 'nombre' en lugar de 'title'
    'precio': 'price',         # Si tu Excel usa 'precio' en lugar de 'price'
    'descripcion': 'body_html' # Si tu Excel usa 'descripcion' en lugar de 'body_html'
}
```

## 📝 Logs y Reportes

### Logs
- Se guardan en la carpeta `logs/`
- Incluyen timestamp, nivel y mensaje
- Útiles para debugging

### Reportes de Errores
- Se generan automáticamente si hay errores
- Formato JSON con detalles completos
- Incluyen fila del Excel y descripción del error

## 🔧 Solución de Problemas

### Error: "Invalid access token"
- Verifica que el token sea correcto
- Asegúrate de que la aplicación esté instalada
- Confirma que los permisos incluyan `write_products`

### Error: "Rate limit exceeded"
- El script maneja esto automáticamente
- Puedes aumentar `REQUEST_DELAY` en config.py

### Error: "Required field missing"
- Verifica que tu Excel tenga las columnas obligatorias
- Revisa que no haya celdas vacías en campos requeridos

### Productos no aparecen en la tienda
- Verifica que `published: true` en la configuración
- Algunos productos pueden estar en "Borrador"

## 🛡️ Seguridad

- **NUNCA** compartas tu Access Token
- Mantén `config.py` privado
- Usa tokens con permisos mínimos necesarios
- Revisa regularmente los logs de acceso en Shopify

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en la carpeta `logs/`
2. Consulta los reportes de errores generados
3. Verifica la configuración en `config.py`
4. Asegúrate de que tu Excel tenga el formato correcto

## 🔄 Actualizaciones

Para actualizar productos existentes en lugar de crear nuevos, necesitarías modificar el script para usar la API de actualización de Shopify. El script actual está diseñado para crear productos nuevos.

---

¡Disfruta de la subida automatizada de productos! 🎉