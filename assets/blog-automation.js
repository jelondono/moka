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
            // Cargar configuración desde el objeto global
            if (window.blogAutomationConfig) {
                this.config = window.blogAutomationConfig;
                console.log('Blog automation initialized', this.config);
            } else {
                // Fallback: cargar desde script
                await this.loadConfigScript();
            }
        } catch (error) {
            console.error('Error loading blog automation config:', error);
        }
    }

    async loadConfigScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/assets/blog-automation-config.js';
            script.onload = () => {
                if (window.blogAutomationConfig) {
                    this.config = window.blogAutomationConfig;
                    console.log('Blog automation config loaded from script', this.config);
                    resolve();
                } else {
                    reject(new Error('Configuration not found in script'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load config script'));
            document.head.appendChild(script);
        });
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
        
        // Actualizar timestamp de última verificación
        this.lastCheck = now.toISOString();
        localStorage.setItem('blog_automation_last_check', this.lastCheck);
    }

    // Procesar un feed individual
    async processFeed(feed) {
        try {
            console.log(`Processing feed: ${feed.name}`);
            
            // Simular procesamiento de feed RSS
            // En un entorno real, aquí se haría la llamada al RSS
            const articles = await this.fetchRSSFeed(feed.url);
            
            for (const article of articles) {
                if (!this.processedPosts.includes(article.id)) {
                    await this.processArticle(article, feed);
                }
            }
            
        } catch (error) {
            console.error(`Error processing feed ${feed.name}:`, error);
        }
    }

    // Procesar un artículo individual
    async processArticle(article, feed) {
        try {
            // Verificar filtros de contenido
            if (!this.passesContentFilter(article)) {
                return;
            }

            // Procesar contenido
            const processedContent = await this.processContent(article, feed);
            
            // Guardar como borrador
            this.saveDraftPost(processedContent);
            
            // Marcar como procesado
            this.processedPosts.push(article.id);
            localStorage.setItem('blog_automation_processed', JSON.stringify(this.processedPosts));
            
            // Notificar nuevo borrador
            this.notifyNewDraft(processedContent);
            
        } catch (error) {
            console.error('Error processing article:', error);
        }
    }

    // Verificar filtros de contenido
    passesContentFilter(article) {
        const settings = this.config.automation_settings;
        const content = (article.title + ' ' + article.description).toLowerCase();
        
        // Verificar palabras clave incluidas
        const hasIncludedKeywords = settings.content_filters.keywords_include.some(keyword => 
            content.includes(keyword.toLowerCase())
        );
        
        // Verificar palabras clave excluidas
        const hasExcludedKeywords = settings.content_filters.keywords_exclude.some(keyword => 
            content.includes(keyword.toLowerCase())
        );
        
        return hasIncludedKeywords && !hasExcludedKeywords;
    }

    // Procesar contenido del artículo
    async processContent(article, feed) {
        const settings = this.config.automation_settings;
        
        let processedContent = {
            id: this.generateId(),
            title: article.title,
            content: article.description || article.content,
            excerpt: this.generateExcerpt(article.description || article.content),
            source_url: article.link,
            source_feed: feed.name,
            category: this.config.blog_settings.category_mapping[feed.category] || 'General',
            tags: this.generateTags(article.title + ' ' + (article.description || '')),
            author: this.config.blog_settings.default_author,
            created_at: new Date().toISOString(),
            status: 'draft'
        };

        // Procesar texto en español
        if (settings.content_processing.translate_to_spanish && feed.language !== 'es') {
            processedContent.title = this.processSpanishText(processedContent.title);
            processedContent.content = this.processSpanishText(processedContent.content);
        }

        // Agregar contexto colombiano
        if (settings.content_processing.add_colombian_context) {
            processedContent.content = this.addColombianContext(processedContent.content, feed);
        }

        return processedContent;
    }

    // Procesar texto en español (placeholder)
    processSpanishText(text) {
        // En un entorno real, aquí se usaría una API de traducción
        return text;
    }

    // Generar excerpt
    generateExcerpt(content) {
        const cleanContent = this.stripHtml(content);
        return cleanContent.length > 150 ? cleanContent.substring(0, 150) + '...' : cleanContent;
    }

    // Limpiar HTML
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // Agregar contexto colombiano
    addColombianContext(content, feed) {
        if (feed.category.includes('colombia')) {
            return content + '\n\nEste contenido está adaptado para el mercado colombiano de belleza y maquillaje.';
        }
        return content;
    }

    // Generar tags automáticamente
    generateTags(content) {
        const defaultTags = this.config.blog_settings.default_tags;
        const contentLower = content.toLowerCase();
        const additionalTags = [];
        
        // Agregar tags basados en contenido
        if (contentLower.includes('maquillaje') || contentLower.includes('makeup')) {
            additionalTags.push('maquillaje');
        }
        if (contentLower.includes('skincare') || contentLower.includes('cuidado')) {
            additionalTags.push('skincare');
        }
        if (contentLower.includes('colombia') || contentLower.includes('colombiano')) {
            additionalTags.push('colombia');
        }
        
        return [...defaultTags, ...additionalTags].slice(0, 5); // Máximo 5 tags
    }

    // Guardar borrador
    saveDraftPost(post) {
        let drafts = JSON.parse(localStorage.getItem('blog_automation_drafts') || '[]');
        drafts.push(post);
        localStorage.setItem('blog_automation_drafts', JSON.stringify(drafts));
        
        // Actualizar contador en la interfaz
        this.updateDraftsCount();
    }

    // Notificar nuevo borrador
    notifyNewDraft(post) {
        // Crear notificación visual
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 300px;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        
        notification.innerHTML = `
            <strong>🎉 Nuevo artículo encontrado!</strong><br>
            <small>${post.title.substring(0, 50)}...</small><br>
            <small>Fuente: ${post.source_feed}</small>
        `;
        
        document.body.appendChild(notification);
        
        // Remover notificación después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    // Actualizar contador de borradores
    updateDraftsCount() {
        const drafts = JSON.parse(localStorage.getItem('blog_automation_drafts') || '[]');
        const countElement = document.getElementById('drafts-count');
        if (countElement) {
            countElement.textContent = drafts.length;
        }
    }

    // Simular fetch de RSS (placeholder)
    async fetchRSSFeed(url) {
        // En un entorno real, aquí se haría la llamada al RSS feed
        // Por ahora retornamos un array vacío
        console.log(`Fetching RSS from: ${url}`);
        return [];
    }

    // Generar ID único
    generateId() {
        return 'draft_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Obtener borradores
    getDrafts() {
        return JSON.parse(localStorage.getItem('blog_automation_drafts') || '[]');
    }

    // Ver borradores (para la interfaz de administración)
    viewDrafts() {
        const drafts = this.getDrafts();
        console.log('Current drafts:', drafts);
        return drafts;
    }

    // Limpiar datos antiguos
    cleanup() {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let processed = JSON.parse(localStorage.getItem('blog_automation_processed') || '[]');
        
        // Mantener solo IDs de la última semana (simplificado)
        if (processed.length > 1000) {
            processed = processed.slice(-500);
            localStorage.setItem('blog_automation_processed', JSON.stringify(processed));
        }
    }

    // Iniciar verificación automática
    startAutoCheck() {
        // Verificar inmediatamente
        this.checkFeeds();
        
        // Configurar verificación periódica (cada hora)
        setInterval(() => {
            this.checkFeeds();
        }, 60 * 60 * 1000); // 1 hora
    }
}

// Inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
    window.blogAutomation = new BlogAutomation();
    
    // Auto-iniciar en páginas de blog
    if (window.location.pathname.includes('/admin') || window.location.pathname.includes('/blog')) {
        window.blogAutomation.startAutoCheck();
    }
}