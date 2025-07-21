/**
 * Script para corrigir problemas no widget NPS
 * 
 * Este script deve ser incluído após o nps-widget.js principal
 * e corrige os problemas de autoOpen no React e restaura
 * funcionalidades como botão de fechar e layout correto.
 */

(function() {
    console.log('Aplicando correções ao NPS Widget...');

    // Verificar se o widget já foi carregado
    if (typeof window.NPSWidget === 'undefined' || typeof window.reactInitNPSWidget === 'undefined') {
        console.error('NPS Widget não detectado. Carregue primeiro o nps-widget.js');
        return;
    }

    // 1. Corrigir a função de inicialização via React para respeitar autoOpen
    const originalReactInit = window.reactInitNPSWidget;
    window.reactInitNPSWidget = function(config) {
        console.log('Inicializando NPS Widget via React (versão corrigida)...');
        
        // Preservar configuração original
        const originalConfig = Object.assign({}, config);
        const autoOpenEnabled = !!originalConfig.autoOpen;
        
        // Desativar autoOpen para configuração manual posterior
        config.autoOpen = false;
        
        return originalReactInit(config).then(widget => {
            // Se autoOpen estiver habilitado, mostrar o widget após o atraso
            if (autoOpenEnabled && widget && !widget.state.shouldSkip) {
                console.log('AutoOpen habilitado, exibindo widget em 3 segundos...');
                setTimeout(() => {
                    if (widget && typeof widget.show === 'function') {
                        widget.show();
                    }
                }, 3000);
            }
            
            return widget;
        });
    };

    // 2. Melhorar o método hide para garantir registro de fechamento apenas quando apropriado
    const originalHide = window.NPSWidget.prototype.hide;
    window.NPSWidget.prototype.hide = function(userInitiated) {
        console.log(`Método hide chamado com userInitiated=${userInitiated}`);
        
        // Verificar se o widget estava visível antes de ocultá-lo
        const wasVisible = this.visible;
        
        // Chamar a função original
        originalHide.call(this, userInitiated);
        
        // Só registrar o fechamento se o widget estava realmente visível
        // e foi fechado pelo usuário ou após submissão
        if (wasVisible && (userInitiated || this.state.submitted)) {
            console.log('Registrando fechamento do widget pelo usuário ou após submissão');
            
            // Salvar no localStorage como fallback
            if (window.localStorage) {
                window.localStorage.setItem('ihelp_nps_closed', Date.now().toString());
            }
            
            // Registrar o fechamento no Supabase (se disponível)
            if (typeof this.registerWidgetClosed === 'function') {
                this.registerWidgetClosed();
            } else {
                // Implementação simples caso o método não exista
                this.registrarFechamentoWidget();
            }
        }
    };

    // 3. Implementar método seguro para registrar fechamento
    window.NPSWidget.prototype.registrarFechamentoWidget = function() {
        // Verificar se temos configuração para o Supabase
        if (!this.config.apiKey || !this.config.apiUrl) {
            return;
        }
        
        try {
            // Tabela para registrar fechamentos do widget
            const closedWidgetTableUrl = this.config.apiUrl.replace('nps_feedback', 'nps_widget_closed');
            
            // Preparar os dados para envio (apenas campos necessários)
            const data = {
                user_id: this.config.userId || 'anonymous',
                closed_at: new Date().toISOString(),
                business_id: this.config.businessId,
                email: this.config.email,
                url: window.location.href,
                session_id: this.config.sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            };
            
            // Enviar os dados para o Supabase
            fetch(closedWidgetTableUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.config.apiKey,
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data)
            }).catch(error => {
                console.error('Erro ao registrar fechamento do widget:', error);
            });
        } catch (error) {
            console.error('Erro ao registrar fechamento do widget:', error);
        }
    };

    // 4. Corrigir o evento de clique do botão de fechar (se existir)
    const fixCloseButtonEvent = function() {
        if (typeof window.NPSWidget.prototype.render === 'function') {
            const originalRender = window.NPSWidget.prototype.render;
            window.NPSWidget.prototype.render = function() {
                // Executar o método original
                originalRender.call(this);
                
                // Adicionar o evento correto ao botão de fechar
                const closeBtn = this.widgetElement ? this.widgetElement.querySelector('.ihelp-nps-close-btn') : null;
                if (closeBtn) {
                    // Remover eventos existentes para evitar duplicação
                    closeBtn.replaceWith(closeBtn.cloneNode(true));
                    
                    // Adicionar novo evento com o parâmetro userInitiated
                    const newCloseBtn = this.widgetElement.querySelector('.ihelp-nps-close-btn');
                    if (newCloseBtn) {
                        newCloseBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Passar true para indicar que foi fechado pelo usuário
                            this.hide(true);
                        });
                        
                        // Mostrar o botão depois de um atraso
                        setTimeout(() => {
                            newCloseBtn.classList.remove('ihelp-nps-hide');
                            newCloseBtn.classList.add('visible');
                        }, 5000);
                    }
                }
            };
        }
    };
    fixCloseButtonEvent();

    console.log('Correções ao NPS Widget aplicadas com sucesso.');
})();
