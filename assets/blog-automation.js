/**
 * Blog Automation Script for Shopify
 * Automatiza la obtención de contenido de RSS feeds de belleza y maquillaje
 */

class BlogAutomation {
    constructor() {
        this.config = null;
        this.lastCheck = localStorage.getItem('blog_automation_last_check') || null;
        this.processedPosts = JSON.parse(localStorage.getItem('blog_automation_processed') || '[]');
        this.init();
    }

    async init() {
        try {
            // Cargar configuración
            const response = await fetch('/config/blog-automation.json');
            this.config = await response.json();
            console.log('Blog automation initialized', this.config);
        } catch (error) {
            console.error('Error loading blog automation config:', error);
        }
    }

    // Función principal para verificar feeds
    async checkFeeds() {
        if (!this.config) {
            console.error('Configuration not loaded');
            return;
        }

        const now = new Date();
        const lastCheckTime = this.lastCheck ? new Date(this.lastCheck) : null;
        
        // Verificar si es tiempo de revisar feeds
        if (lastCheckTime) {
            const hoursSinceLastCheck = (now - lastCheckTime) / (1000 * 60 * 60);
            if (hoursSinceLastCheck < this.config.automation_settings.check_interval_hours) {
                console.log('Not time to check feeds yet');
                return;
            }
        }

        console.log('Checking RSS feeds for new content...');
        
        // Procesar feeds de belleza
        for (const feed of this.config.rss_feeds.beauty_feeds) {
            if (feed.active) {
                await this.processFeed(feed);
            }
        }

        // Procesar feeds colombianos
        for (const feed of this.config.rss_feeds.colombian_feeds) {
            if (feed.active) {
                await this.processFeed(feed);
            }
        }

        // Actualizar última verificación
        this.lastCheck = now.toISOString();
        localStorage.setItem('blog_automation_last_check', this.lastCheck);
    }

    // Procesar un feed individual
    async processFeed(feed) {
        try {
            console.log(`Processing feed: ${feed.name}`);
            
            // Usar un proxy CORS para obtener el RSS feed
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.status !== 'ok') {
                console.error(`Error fetching feed ${feed.name}:`, data.message);
                return;
            }

            // Procesar artículos
            for (const item of data.items.slice(0, 5)) { // Limitar a 5 artículos más recientes
                await this.processArticle(item, feed);
            }

        } catch (error) {
            console.error(`Error processing feed ${feed.name}:`, error);
        }
    }

    // Procesar un artículo individual
    async processArticle(article, feed) {
        // Verificar si ya fue procesado
        if (this.processedPosts.includes(article.guid || article.link)) {
            return;
        }

        // Filtrar contenido
        if (!this.passesContentFilter(article)) {
            console.log(`Article filtered out: ${article.title}`);
            return;
        }

        console.log(`Processing article: ${article.title}`);

        // Procesar contenido
        const processedContent = await this.processContent(article, feed);
        
        // Crear borrador del post
        const blogPost = {
            title: processedContent.title,
            content: processedContent.content,
            excerpt: processedContent.excerpt,
            author: this.config.blog_settings.default_author,
            tags: [...this.config.blog_settings.default_tags, ...processedContent.tags],
            category: this.config.blog_settings.category_mapping[feed.category],
            source_url: article.link,
            source_feed: feed.name,
            published_date: article.pubDate,
            status: this.config.automation_settings.auto_publish ? 'published' : 'draft'
        };

        // Guardar en localStorage para revisión manual
        this.saveDraftPost(blogPost);
        
        // Marcar como procesado
        this.processedPosts.push(article.guid || article.link);
        localStorage.setItem('blog_automation_processed', JSON.stringify(this.processedPosts));
    }

    // Filtrar contenido basado en palabras clave
    passesContentFilter(article) {
        const content = (article.title + ' ' + article.description).toLowerCase();
        const filters = this.config.automation_settings.content_filters;

        // Verificar palabras clave incluidas
        const hasIncludedKeywords = filters.keywords_include.some(keyword => 
            content.includes(keyword.toLowerCase())
        );

        // Verificar palabras clave excluidas
        const hasExcludedKeywords = filters.keywords_exclude.some(keyword => 
            content.includes(keyword.toLowerCase())
        );

        return hasIncludedKeywords && !hasExcludedKeywords;
    }

    // Procesar contenido del artículo
    async processContent(article, feed) {
        let title = article.title;
        let content = article.description || article.content;
        let excerpt = content.substring(0, 200) + '...';
        
        // Limpiar HTML
        content = this.stripHtml(content);
        excerpt = this.stripHtml(excerpt);

        // Agregar contexto colombiano si está habilitado
        if (this.config.automation_settings.content_processing.add_colombian_context) {
            content = this.addColombianContext(content, feed);
        }

        // Generar tags basados en el contenido
        const tags = this.generateTags(title + ' ' + content);

        return {
            title,
            content,
            excerpt,
            tags
        };
    }

    // Limpiar HTML del contenido
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // Agregar contexto colombiano
    addColombianContext(content, feed) {
        const colombianContext = `\n\n---\n\n*Este artículo forma parte de las últimas tendencias en ${feed.category.replace('-', ' ')} que están llegando a Colombia. En Moka, nos mantenemos al día con las mejores novedades internacionales para traerte lo más actual del mundo de la belleza.*`;
        return content + colombianContext;
    }

    // Generar tags automáticamente
    generateTags(content) {
        const keywords = [
            'maquillaje', 'belleza', 'skincare', 'cosmética', 'tendencias',
            'makeup', 'beauty', 'colombia', 'labial', 'base', 'sombras',
            'cremas', 'serum', 'mascarilla', 'rutina'
        ];
        
        const foundTags = keywords.filter(keyword => 
            content.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return foundTags.slice(0, 5); // Máximo 5 tags
    }

    // Guardar borrador del post
    saveDraftPost(post) {
        const drafts = JSON.parse(localStorage.getItem('blog_automation_drafts') || '[]');
        drafts.push({
            ...post,
            created_at: new Date().toISOString(),
            id: Date.now().toString()
        });
        localStorage.setItem('blog_automation_drafts', JSON.stringify(drafts));
        
        console.log('Draft post saved:', post.title);
        this.notifyNewDraft(post);
    }

    // Notificar nuevo borrador
    notifyNewDraft(post) {
        // Crear notificación visual
        const notification = document.createElement('div');
        notification.className = 'blog-automation-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>Nuevo artículo de blog disponible</h4>
                <p><strong>${post.title}</strong></p>
                <p>Fuente: ${post.source_feed}</p>
                <button onclick="blogAutomation.viewDrafts()">Ver borradores</button>
                <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
            </div>
        `;
        
        // Agregar estilos
        if (!document.getElementById('blog-automation-styles')) {
            const styles = document.createElement('style');
            styles.id = 'blog-automation-styles';
            styles.textContent = `
                .blog-automation-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    z-index: 10000;
                    max-width: 300px;
                }
                .notification-content h4 {
                    margin: 0 0 10px 0;
                    color: #333;
                }
                .notification-content p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                .notification-content button {
                    margin: 5px 5px 0 0;
                    padding: 5px 10px;
                    border: 1px solid #ddd;
                    background: #f8f9fa;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .notification-content button:hover {
                    background: #e9ecef;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    // Ver borradores guardados
    viewDrafts() {
        const drafts = JSON.parse(localStorage.getItem('blog_automation_drafts') || '[]');
        console.log('Blog drafts:', drafts);
        
        // Aquí podrías abrir un modal o redirigir a una página de administración
        alert(`Tienes ${drafts.length} borradores de blog pendientes. Revisa la consola para más detalles.`);
    }

    // Limpiar datos antiguos
    cleanup() {
        const maxProcessedPosts = 1000;
        if (this.processedPosts.length > maxProcessedPosts) {
            this.processedPosts = this.processedPosts.slice(-maxProcessedPosts);
            localStorage.setItem('blog_automation_processed', JSON.stringify(this.processedPosts));
        }
    }

    // Iniciar verificación automática
    startAutoCheck() {
        // Verificar cada hora
        setInterval(() => {
            this.checkFeeds();
        }, 60 * 60 * 1000);
        
        // Verificación inicial
        setTimeout(() => {
            this.checkFeeds();
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
    window.blogAutomation = new BlogAutomation();
    
    // Iniciar verificación automática si estamos en el admin o en una página específica
    if (window.location.pathname.includes('/admin') || window.location.pathname.includes('/blog')) {
        window.blogAutomation.startAutoCheck();
    }
}