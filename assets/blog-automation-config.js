/**
 * Blog Automation Configuration
 * Configuración para la automatización del blog de belleza y maquillaje
 */

window.blogAutomationConfig = {
  "rss_feeds": {
    "beauty_feeds": [
      {
        "name": "Beauty Blog ES",
        "url": "https://beautyblog.es/feed",
        "category": "belleza-general",
        "language": "es",
        "active": true
      },
      {
        "name": "Maquibella",
        "url": "https://maquibella.com/feed",
        "category": "maquillaje",
        "language": "es",
        "active": true
      },
      {
        "name": "Revista Fucsia - Belleza",
        "url": "https://www.fucsia.co/rss/belleza.xml",
        "category": "belleza-colombia",
        "language": "es",
        "active": true
      },
      {
        "name": "Allure Beauty",
        "url": "https://www.allure.com/feed/beauty",
        "category": "belleza-internacional",
        "language": "en",
        "active": false
      }
    ],
    "colombian_feeds": [
      {
        "name": "El Tiempo - Vida",
        "url": "https://www.eltiempo.com/rss/vida.xml",
        "category": "noticias-colombia",
        "language": "es",
        "active": true
      },
      {
        "name": "Semana - Vida Moderna",
        "url": "https://www.semana.com/rss/vida-moderna.xml",
        "category": "estilo-vida-colombia",
        "language": "es",
        "active": true
      },
      {
        "name": "Cromos - Belleza",
        "url": "https://cromos.elespectador.com/rss/belleza.xml",
        "category": "belleza-colombia",
        "language": "es",
        "active": true
      }
    ]
  },
  "automation_settings": {
    "check_interval_hours": 6,
    "max_posts_per_day": 3,
    "auto_publish": false,
    "require_approval": true,
    "content_filters": {
      "keywords_include": [
        "maquillaje",
        "belleza",
        "skincare",
        "cosmético",
        "makeup",
        "beauty",
        "colombia",
        "colombiano",
        "labial",
        "base",
        "corrector",
        "sombra",
        "máscara",
        "delineador",
        "rubor",
        "polvo",
        "primer",
        "contorno",
        "iluminador"
      ],
      "keywords_exclude": [
        "política",
        "deportes",
        "economía",
        "tecnología",
        "automóvil",
        "inmobiliario"
      ]
    },
    "content_processing": {
      "translate_to_spanish": true,
      "add_colombian_context": true,
      "generate_seo_tags": true,
      "optimize_images": true
    }
  },
  "blog_settings": {
    "default_author": "Equipo Moka",
    "default_tags": [
      "belleza",
      "maquillaje",
      "colombia"
    ],
    "category_mapping": {
      "belleza-general": "Belleza",
      "maquillaje": "Maquillaje",
      "belleza-colombia": "Belleza Colombiana",
      "belleza-internacional": "Tendencias Internacionales",
      "noticias-colombia": "Noticias",
      "estilo-vida-colombia": "Estilo de Vida"
    }
  }
};

// Hacer la configuración disponible globalmente
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.blogAutomationConfig;
}