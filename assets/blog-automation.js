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
    async checkFeeds(forceCheck = false) {
        if (!this.config) {
            console.error('Configuration not loaded');
            return;
        }

        const now = new Date();
        const lastCheckTime = this.lastCheck ? new Date(this.lastCheck) : null;
        
        // Verificar si es tiempo de revisar feeds (solo si no es verificación forzada)
        if (!forceCheck && lastCheckTime) {
            const hoursSinceLastCheck = (now - lastCheckTime) / (1000 * 60 * 60);
            if (hoursSinceLastCheck < this.config.automation_settings.check_interval_hours) {
                console.log('Not time to check feeds yet');
                return;
            }
        }
        
        if (forceCheck) {
            console.log('Manual feed check initiated...');
            this.showCheckProgress('Verificación manual iniciada...');
        } else {
            this.showCheckProgress('Verificando feeds automáticamente...');
        }

        console.log('Checking RSS feeds for new content...');
        
        let totalProcessed = 0;
        let totalFeeds = 0;
        
        // Contar feeds activos
        const activeBeautyFeeds = this.config.rss_feeds.beauty_feeds.filter(feed => feed.active);
        const activeColombiannFeeds = this.config.rss_feeds.colombian_feeds.filter(feed => feed.active);
        totalFeeds = activeBeautyFeeds.length + activeColombiannFeeds.length;
        
        // Procesar feeds de belleza
        for (const feed of activeBeautyFeeds) {
            totalProcessed++;
            this.showCheckProgress(`Procesando feed ${totalProcessed}/${totalFeeds}: ${feed.name}`);
            await this.processFeed(feed);
        }
        
        // Procesar feeds colombianos
        for (const feed of activeColombiannFeeds) {
            totalProcessed++;
            this.showCheckProgress(`Procesando feed ${totalProcessed}/${totalFeeds}: ${feed.name}`);
            await this.processFeed(feed);
        }
        
        // Actualizar timestamp de última verificación
        this.lastCheck = now.toISOString();
        localStorage.setItem('blog_automation_last_check', this.lastCheck);
        
        // Mostrar resultado final
        const drafts = this.getDrafts();
        this.showCheckProgress(`Verificación completada. ${drafts.length} borradores disponibles.`);
        
        // Ocultar progreso después de 3 segundos
        setTimeout(() => {
            this.hideCheckProgress();
        }, 3000);
        
        console.log(`Feed check completed. Processed ${totalFeeds} feeds.`);
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
        console.log('New draft created:', post.title);
        
        // Crear notificación visual
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Agregar animación CSS
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 5px;">🤖 Nuevo Artículo Generado</div>
            <div style="opacity: 0.9;">${post.title}</div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">Revisa en la sección de borradores</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos con animación
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
        // Actualizar contador de borradores
        this.updateDraftsCount();
        
        // Actualizar la interfaz de administración si está visible
        if (typeof loadDrafts === 'function') {
            setTimeout(() => loadDrafts(), 1000);
        }
    }
    
    // Mostrar progreso de verificación
    showCheckProgress(message) {
        let progressNotification = document.getElementById('feed-check-progress');
        
        if (!progressNotification) {
            progressNotification = document.createElement('div');
            progressNotification.id = 'feed-check-progress';
            progressNotification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: #007bff;
                color: white;
                padding: 12px 16px;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                max-width: 250px;
            `;
            document.body.appendChild(progressNotification);
        }
        
        progressNotification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span>${message}</span>
            </div>
        `;
        
        // Agregar animación de spinner si no existe
        if (!document.getElementById('spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Ocultar progreso de verificación
    hideCheckProgress() {
        const progressNotification = document.getElementById('feed-check-progress');
        if (progressNotification) {
            progressNotification.remove();
        }
    }

    // Actualizar contador de borradores
    updateDraftsCount() {
        const drafts = JSON.parse(localStorage.getItem('blog_automation_drafts') || '[]');
        const countElement = document.getElementById('drafts-count');
        if (countElement) {
            countElement.textContent = drafts.length;
        }
    }

    // Obtener contenido RSS
    async fetchRSSFeed(url) {
        console.log(`Fetching RSS from: ${url}`);
        
        try {
            // Para demostración, generar contenido de prueba basado en el feed
            const sampleArticles = this.generateSampleContent(url);
            
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log(`Found ${sampleArticles.length} articles from ${url}`);
            return sampleArticles;
            
        } catch (error) {
            console.error(`Error fetching RSS from ${url}:`, error);
            return [];
        }
    }
    
    // Generar contenido de muestra para demostración
    generateSampleContent(feedUrl) {
        const beautyTopics = [
            'Nuevas tendencias en maquillaje colombiano para 2024',
            'Los mejores productos de skincare para el clima tropical',
            'Maquillaje natural: técnicas para un look fresco',
            'Colores de labiales que están de moda este año',
            'Rutina de cuidado facial para pieles grasas',
            'Maquillaje para ocasiones especiales: tips de expertos'
        ];
        
        const colombianTopics = [
            'Marcas colombianas de belleza que conquistan el mercado',
            'Influencers de maquillaje más populares en Colombia',
            'Productos de belleza hechos en Colombia que debes conocer',
            'Tendencias de maquillaje en las principales ciudades colombianas'
        ];
        
        // Determinar tipo de contenido basado en la URL
        let topics = beautyTopics;
        if (feedUrl.includes('colombia') || feedUrl.includes('eltiempo') || feedUrl.includes('semana')) {
            topics = [...beautyTopics, ...colombianTopics];
        }
        
        // Generar 2-4 artículos aleatorios
        const numArticles = Math.floor(Math.random() * 3) + 2;
        const articles = [];
        
        for (let i = 0; i < numArticles; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const article = {
                id: `article_${Date.now()}_${i}`,
                title: topic,
                description: `Descubre todo sobre ${topic.toLowerCase()}. Consejos de expertos, productos recomendados y las últimas tendencias en el mundo de la belleza y el maquillaje.`,
                link: `https://example.com/article/${Date.now()}_${i}`,
                pubDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                content: `<p>Artículo completo sobre ${topic.toLowerCase()}.</p><p>En este artículo exploramos las últimas tendencias y técnicas que están revolucionando el mundo de la belleza.</p>`,
                author: 'Equipo Editorial',
                category: feedUrl.includes('colombia') ? 'belleza-colombia' : 'belleza-general'
            };
            articles.push(article);
        }
        
        return articles;
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