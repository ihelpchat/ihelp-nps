/**
 * iHelp NPS Widget
 * 
 * A lightweight, embeddable NPS (Net Promoter Score) widget
 * that can be added to any website with a simple script tag.
 * 
 * Exemplo de uso:
 * <script src="nps-widget.js"></script>
 * <script>
 *   initNPSWidget({
 *     apiUrl: 'https://sua-url-supabase.supabase.co/rest/v1/nps_feedback',
 *     apiKey: 'sua-chave-api',
 *     primaryColor: '#ea5f3d'
 *   });
 * </script>
 */

// Definir variáveis globais para garantir que as funções estejam disponíveis
var NPSWidget;
var initNPSWidget;

(function (window) {
  'use strict';

  // Main widget class
  class NPSWidget {
    // Constantes para categorias NPS
    static NPS_DETRACTOR_MAX = 6;
    static NPS_PASSIVE_MAX = 8;
    static NPS_PROMOTER_MIN = 9;
    constructor(options = {}) {
      // Inicializar configurações primeiro para que possamos usar no shouldSkipWidget
      this.config = {
        targetElementId: options.targetElementId || 'ihelp-nps-widget',
        userId: options.userId || 'anonymous',
        apiUrl: options.apiUrl || 'https://your-supabase-url.supabase.co/rest/v1/nps_feedback',
        apiKey: options.apiKey || '',
        title: options.title || 'De 0 a 10 o quanto você recomendaria o ihelp para a empresa de um amigo?',
        feedbackLabel: options.feedbackLabel || 'Para nos ajudar ainda mais, conte-nos o motivo da sua resposta.',
        submitButtonText: options.submitButtonText || 'Enviar',
        thankYouMessage: options.thankYouMessage || 'Obrigado pelo feedback!',
        primaryColor: options.primaryColor || '#ea5f3d',
        maxRating: options.maxRating || 10,
        onSubmit: options.onSubmit || null,
        darkMode: options.darkMode || false,
        autoOpen: options.autoOpen || false,
        // Adicionar suporte para os novos parâmetros
        businessId: options.businessId || null,
        profile: options.profile || null,
        email: options.email || null,
        tags: options.tags || []
      };
      
      // Inicializar o widget com estado vazio
      this.state = {
        currentRating: null,
        feedback: '',
        submitted: false,
        loading: false,
        error: null,
        shouldSkip: false // Flag para controlar se o widget deve ser pulado
      };

      // Criar o container do widget mas mantê-lo oculto até verificarmos se deve ser exibido
      this.widgetElement = null;
      this.visible = false;
      this.init();
      
      // Verificar se o widget já foi respondido recentemente
      // NÃO mostrar o widget até que esta verificação seja concluída
      this.shouldSkipWidget().then(shouldSkip => {
        this.state.shouldSkip = shouldSkip;
        
        if (shouldSkip) {
          console.log('Widget NPS será pulado com base em critérios definidos.');
          return;
        }
        
        // Se autoOpen estiver habilitado, mostrar o widget após 3 segundos
        if (this.config.autoOpen) {
          setTimeout(() => {
            // Verificar novamente antes de mostrar
            if (!this.state.shouldSkip) {
              this.show();
            }
          }, 3000);
        }
      });
    }
    
    // Método para inicializar o widget após verificações (não usado mais, mantido para compatibilidade)
    initializeWidget() {
      // Abrir automaticamente com delay de 3 segundos se configurado
      if (this.config.autoOpen) {
        setTimeout(() => {
          this.show();
        }, 3000);
      }
    }

    // Verifica se o widget deve ser pulado com base no Supabase ou localStorage
    async shouldSkipWidget() {
      // Verificar no Supabase se o usuário já avaliou ou fechou o widget recentemente
      if (this.config.apiKey && this.config.apiUrl && (this.config.email || this.config.userId !== 'anonymous' || this.config.businessId)) {
        try {
          // Tabela para registrar fechamentos do widget
          const closedWidgetTableUrl = this.config.apiUrl.replace('nps_feedback', 'nps_widget_closed');
          
          // Construir a URL com os parâmetros de consulta para verificar fechamentos recentes
          let queryUrl = `${closedWidgetTableUrl}?select=id,closed_at`;
          
          // Adicionar filtros baseados nos dados disponíveis
          const filters = [];
          
          // if (this.config.email) {
          //   filters.push(`email.eq.${encodeURIComponent(this.config.email)}`);
          // }
          
          if (this.config.userId !== 'anonymous') {
            filters.push(`user_id=eq.${encodeURIComponent(this.config.userId)}`);
          }
          
          // if (this.config.businessId) {
          //   filters.push(`business_id.eq.${encodeURIComponent(this.config.businessId)}`);
          // }
          
          // Adicionar os filtros à URL
          if (filters.length > 0) {
            queryUrl += `&${filters.join('&')}`;
          }
          
          // Fazer a requisição para o Supabase
          const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.config.apiKey,
              'Authorization': `Bearer ${this.config.apiKey}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              // Verificar se o fechamento foi nas últimas 24 horas
              const lastClosed = new Date(data[0].closed_at);
              const now = new Date();
              const hoursSinceLastClosed = (now - lastClosed) / (1000 * 60 * 60);
              
              if (hoursSinceLastClosed < 24) {
                console.log('Widget NPS foi fechado recentemente (dados do Supabase). Pulando inicialização.');
                return true;
              }
            }
          }
          
          // Verificar também no localStorage como fallback
          const lastClosed = window.localStorage.getItem('ihelp_nps_closed');
          if (lastClosed) {
            const lastClosedTime = parseInt(lastClosed, 10);
            const now = Date.now();
            const hoursSinceLastClosed = (now - lastClosedTime) / (1000 * 60 * 60);
            
            // Não mostrar o widget por 24 horas após o fechamento
            if (hoursSinceLastClosed < 24) {
              console.log('Widget NPS foi fechado recentemente (localStorage). Pulando inicialização.');
              return true;
            }
          }
          
          // Verificar se o usuário já enviou feedback recentemente (localStorage como fallback)
          const lastSubmission = window.localStorage.getItem('ihelp_nps_submitted');
          if (lastSubmission) {
            const lastSubmissionTime = parseInt(lastSubmission, 10);
            const now = Date.now();
            const daysSinceLastSubmission = (now - lastSubmissionTime) / (1000 * 60 * 60 * 24);
            
            // Não mostrar o widget por 30 dias após a última submissão
            if (daysSinceLastSubmission < 30) {
              console.log('Widget NPS já foi respondido recentemente (localStorage). Pulando inicialização.');
              return true;
            }
          }
        } catch (error) {
          console.error('Erro ao verificar fechamentos recentes do widget:', error);
          // Em caso de erro na consulta ao Supabase, verificar no localStorage como fallback
          return this.checkLocalStorageForSkip();
        }
      } else {
        // Se não temos configuração para o Supabase, usar apenas o localStorage
        return this.checkLocalStorageForSkip();
      }
      
      return false;
    }
    
    // Método auxiliar para verificar no localStorage se deve pular o widget
    checkLocalStorageForSkip() {
      // Verificar se o usuário fechou o widget recentemente
      const lastClosed = window.localStorage.getItem('ihelp_nps_closed');
      if (lastClosed) {
        const lastClosedTime = parseInt(lastClosed, 10);
        const now = Date.now();
        const hoursSinceLastClosed = (now - lastClosedTime) / (1000 * 60 * 60);
        
        // Não mostrar o widget por 24 horas após o fechamento
        if (hoursSinceLastClosed < 24) {
          console.log('Widget NPS foi fechado recentemente (localStorage). Pulando inicialização.');
          return true;
        }
      }
      
      // Verificar se o usuário já enviou feedback recentemente
      const lastSubmission = window.localStorage.getItem('ihelp_nps_submitted');
      if (lastSubmission) {
        const lastSubmissionTime = parseInt(lastSubmission, 10);
        const now = Date.now();
        const daysSinceLastSubmission = (now - lastSubmissionTime) / (1000 * 60 * 60 * 24);
        
        // Não mostrar o widget por 30 dias após a última submissão
        if (daysSinceLastSubmission < 30) {
          console.log('Widget NPS já foi respondido recentemente (localStorage). Pulando inicialização.');
          return true;
        }
      }
      
      return false;
    }
    
    // Método para verificar no Supabase se o usuário já avaliou
    async checkSupabaseForFeedback() {
      if (this.config.apiKey && this.config.apiUrl && (this.config.email || this.config.userId !== 'anonymous')) {
        try {
          // Construir a URL com os parâmetros de consulta
          let queryUrl = `${this.config.apiUrl}?select=id`;
          
          // Adicionar filtros baseados nos dados disponíveis
          const filters = [];
          
          if (this.config.email) {
            filters.push(`email.eq.${encodeURIComponent(this.config.email)}`);
          }
          
          if (this.config.userId !== 'anonymous') {
            filters.push(`user_id.eq.${encodeURIComponent(this.config.userId)}`);
          }
          
          if (this.config.businessId) {
            filters.push(`business_id.eq.${encodeURIComponent(this.config.businessId)}`);
          }
          
          // Adicionar os filtros à URL
          if (filters.length > 0) {
            queryUrl += `&${filters.join('&')}`;
          }
          
          // Fazer a requisição para o Supabase
          const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.config.apiKey,
              'Authorization': `Bearer ${this.config.apiKey}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              console.log('Usuário já avaliou anteriormente. Pulando inicialização do widget.');
              return true;
            }
          }
        } catch (error) {
          console.error('Erro ao verificar avaliações anteriores:', error);
          // Em caso de erro, continuar com a inicialização do widget
        }
      }
      
      return false;
    }
    
    // Retorna a categoria NPS com base na pontuação
    getNPSCategory(score) {
      if (score <= NPSWidget.NPS_DETRACTOR_MAX) return 'detractor';
      if (score <= NPSWidget.NPS_PASSIVE_MAX) return 'passive';
      return 'promoter';
    }
    
    init() {
      // Find target element
      const targetElement = document.getElementById(this.config.targetElementId);
      
      // If target element not found, create it
      if (!targetElement) {
        const newTarget = document.createElement('div');
        newTarget.id = this.config.targetElementId;
        document.body.appendChild(newTarget);
        this.targetElement = newTarget;
      } else {
        this.targetElement = targetElement;
      }

      // Render the initial widget
      this.render();
      
      // Add the styles to the document
      this.addStyles();
      
      // Inicialmente oculto, a menos que autoOpen seja true
      if (!this.config.autoOpen) {
        this.hide();
      }
    }

    // Add CSS styles to the document
    addStyles() {
      const styleId = 'ihelp-nps-widget-styles';
      
      // Don't add styles if they already exist
      if (document.getElementById(styleId)) return;
      
      const style = document.createElement('style');
      style.id = styleId;
      
      // Define widget styles - using primary color from config
      const primaryColor = this.config.primaryColor;
      const primaryLightColor = this.adjustColor(primaryColor, 40);
      const primaryDarkColor = this.adjustColor(primaryColor, -40);
      
      style.textContent = `
        .ihelp-nps-widget-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
        }
        
        .ihelp-nps-card {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 1.5rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .ihelp-nps-progress {
          height: 0.5rem;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
          background-color: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
        }
        
        .ihelp-nps-progress-bar {
          height: 100%;
          background-color: ${primaryColor};
          width: 30%;
          transition: width 0.3s ease;
        }
        
        .ihelp-nps-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1.5rem;
        }
        
        .ihelp-nps-rating-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          width: 100%;
        }
        
        .ihelp-nps-rating-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.375rem;
          background-color: white;
          border: 1px solid #d1d5db;
          color: #374151;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 0.15rem;
        }
        
        .ihelp-nps-rating-btn:hover {
          border-color: ${primaryColor};
          color: ${primaryColor};
        }
        
        .ihelp-nps-rating-btn.selected {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
          color: white;
          transform: scale(1.1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .ihelp-nps-detractor:hover {
          background-color: rgba(239, 68, 68, 0.1);
          border-color: rgb(239, 68, 68);
        }
        
        .ihelp-nps-passive:hover {
          background-color: rgba(245, 158, 11, 0.1);
          border-color: rgb(245, 158, 11);
        }
        
        .ihelp-nps-promoter:hover {
          background-color: rgba(16, 185, 129, 0.1);
          border-color: rgb(16, 185, 129);
        }
        
        .ihelp-nps-detractor.selected {
          background-color: rgb(239, 68, 68);
          border-color: rgb(239, 68, 68);
        }
        
        .ihelp-nps-passive.selected {
          background-color: rgb(245, 158, 11);
          border-color: rgb(245, 158, 11);
        }
        
        .ihelp-nps-promoter.selected {
          background-color: rgb(16, 185, 129);
          border-color: rgb(16, 185, 129);
        }
        
        /* Elemento removido conforme solicitado */
        
        .ihelp-nps-categories {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .ihelp-nps-category-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .ihelp-nps-category-label {
          margin-bottom: 0.25rem;
        }
        
        .ihelp-nps-category-range {
          font-weight: 600;
          font-size: 0.75rem;
        }
        
        .ihelp-nps-feedback-label {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
          display: block;
        }
        
        .ihelp-nps-feedback-textarea {
          width: 100%;
          min-height: 6rem;
          padding: 0.75rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          font-size: 1rem;
          color: #374151;
          margin-bottom: 1.5rem;
          resize: vertical;
          box-sizing: border-box;
          font-family: inherit;
        }
        
        .ihelp-nps-feedback-textarea:focus {
          outline: none;
          border-color: ${primaryColor};
          box-shadow: 0 0 0 2px ${primaryLightColor};
        }
        
        .ihelp-nps-submit-btn {
          background-color: ${primaryColor};
          color: white;
          font-weight: 500;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .ihelp-nps-submit-btn:hover {
          background-color: ${primaryDarkColor};
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .ihelp-nps-submit-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }
        
        .ihelp-nps-submit-btn.loading {
          opacity: 0.7;
          cursor: wait;
        }
        
        .ihelp-nps-thank-you {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #111827;
          font-weight: 500;
          font-size: 1.125rem;
        }
        
        .ihelp-nps-thank-you-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 9999px;
          background-color: #10b981;
          color: white;
        }
        
        .ihelp-nps-hide {
          display: none;
        }
        
        .ihelp-nps-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 28px;
          height: 28px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
          padding: 0;
        }
        
        .ihelp-nps-close-btn:hover {
          background: none;
        }
        
        .ihelp-nps-close-btn.visible {
          opacity: 1;
        }
        
        .ihelp-nps-close-btn img {
          width: 16px;
          height: 16px;
          opacity: 0.7;
        }
        
        .ihelp-nps-close-btn:hover img {
          opacity: 1;
        }
        
        @media (max-width: 640px) {
          .ihelp-nps-rating-container {
            justify-content: center;
            padding-bottom: 0.5rem;
            gap: 0.15rem;
          }
          
          .ihelp-nps-rating-btn {
            width: 2rem;
            height: 2rem;
            font-size: 0.85rem;
            margin: 0.1rem;
          }
          
          .ihelp-nps-card {
            padding: 1rem;
          }
          
          .ihelp-nps-title {
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }
        }
        
        /* Dark mode styles */
        .ihelp-nps-widget-dark .ihelp-nps-card {
          background-color: #1f2937;
          border-color: #374151;
        }
        
        .ihelp-nps-widget-dark .ihelp-nps-title,
        .ihelp-nps-widget-dark .ihelp-nps-feedback-label {
          color: #f3f4f6;
        }
        
        .ihelp-nps-widget-dark .ihelp-nps-rating-btn {
          background-color: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }
        
        .ihelp-nps-widget-dark .ihelp-nps-rating-legend,
        .ihelp-nps-widget-dark .ihelp-nps-thank-you {
          color: #e5e7eb;
        }
        
        .ihelp-nps-widget-dark .ihelp-nps-feedback-textarea {
          background-color: #374151;
          border-color: #4b5563;
          color: #f3f4f6;
        }
      `;
      
      document.head.appendChild(style);
    }
    
    // Helper to adjust color brightness
    adjustColor(hex, percent) {
      // Convert hex to RGB
      let r = parseInt(hex.substring(1, 3), 16);
      let g = parseInt(hex.substring(3, 5), 16);
      let b = parseInt(hex.substring(5, 7), 16);
      
      // Adjust brightness
      r = Math.max(0, Math.min(255, r + percent));
      g = Math.max(0, Math.min(255, g + percent));
      b = Math.max(0, Math.min(255, b + percent));
      
      // Convert back to hex
      return '#' + 
        ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1);
    }

    // Render the widget HTML
    render() {
      // Clear the target element
      this.targetElement.innerHTML = '';
      
      // Create wrapper with optional dark mode
      const wrapper = document.createElement('div');
      wrapper.className = `ihelp-nps-widget-container ${this.config.darkMode ? 'ihelp-nps-widget-dark' : ''}`;
      
      if (this.state.submitted) {
        // Render thank you state
        wrapper.innerHTML = `
          <div class="ihelp-nps-card">
            <button class="ihelp-nps-close-btn ihelp-nps-hide" aria-label="Fechar">
              <img src="https://img.icons8.com/ios-glyphs/30/delete-sign.png" alt="Fechar" width="16" height="16">
            </button>
            <div class="ihelp-nps-thank-you">
              <div class="ihelp-nps-thank-you-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>${this.config.thankYouMessage}</span>
            </div>
          </div>
        `;
      } else {
        // Determine which step to show
        const showRating = this.state.currentRating === null;
        const showFeedback = this.state.currentRating !== null;
        
        // Render rating or feedback step
        wrapper.innerHTML = `
          <div class="ihelp-nps-card">
            <button class="ihelp-nps-close-btn ihelp-nps-hide" aria-label="Fechar">
              <img src="https://img.icons8.com/ios-glyphs/30/delete-sign.png" alt="Fechar" width="16" height="16">
            </button>
            <div class="ihelp-nps-progress">
              <div class="ihelp-nps-progress-bar" style="width: ${showFeedback ? '100' : '50'}%"></div>
            </div>
            
            <div class="${showRating ? '' : 'ihelp-nps-hide'}">
              <h3 class="ihelp-nps-title">${this.config.title}</h3>
              
              <div class="ihelp-nps-rating-container">
                ${this.renderRatingButtons()}
              </div>
              
              <div class="ihelp-nps-categories">
                <div class="ihelp-nps-category-item">
                  <span class="ihelp-nps-category-label">Não recomendaria</span>
                </div>
                
                <div class="ihelp-nps-category-item">
                  <span class="ihelp-nps-category-label">Recomendaria</span>
                </div>
              </div>
            </div>
            
            <div class="${showFeedback ? '' : 'ihelp-nps-hide'}">
              
              <label class="ihelp-nps-feedback-label">${this.config.feedbackLabel}</label>
              <textarea 
                class="ihelp-nps-feedback-textarea" 
                placeholder="Descreva aqui..."
                id="ihelp-nps-feedback"
                rows="4"
              ></textarea>
              
              <button class="ihelp-nps-submit-btn" id="ihelp-nps-submit">
                ${this.config.submitButtonText}
              </button>
            </div>
          </div>
        `;
      }
      
      this.targetElement.appendChild(wrapper);
      this.widgetElement = wrapper;
      
      // Add event listeners after rendering
      this.addEventListeners();
      
      // Adicionar evento de clique para o botão de fechar
      const closeBtn = wrapper.querySelector('.ihelp-nps-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Passar true para indicar que foi fechado pelo usuário
          this.hide(true);
        });
      }
    }
    
    // Render the rating buttons based on maxRating
    renderRatingButtons() {
      let buttons = '';
      const rowStyle = this.config.maxRating > 7 ? 'style="min-width: 2.5rem; height: 2.5rem;"' : '';
      
      for (let i = 0; i <= this.config.maxRating; i++) {
        // Determinar a categoria da nota (detrator, neutro, promotor)
        let categoryClass = '';
        if (i <= 6) categoryClass = 'detractor';
        else if (i <= 8) categoryClass = 'passive';
        else categoryClass = 'promoter';
        
        buttons += `
          <button 
            class="ihelp-nps-rating-btn ihelp-nps-${categoryClass} ${this.state.currentRating === i ? 'selected' : ''}" 
            data-rating="${i}"
            ${rowStyle}
            title="${i}"
          >
            ${i}
          </button>
        `;
      }
      return buttons;
    }
    
    // Add event listeners to widget elements
    addEventListeners() {
      if (this.state.submitted) return;
      
      // Add listeners for rating buttons
      if (this.state.currentRating === null) {
        const ratingButtons = this.widgetElement.querySelectorAll('.ihelp-nps-rating-btn');
        ratingButtons.forEach(button => {
          button.addEventListener('click', this.handleRatingSelect.bind(this));
        });
      }
      
      // Add listener for submit button
      if (this.state.currentRating !== null) {
        const submitButton = document.getElementById('ihelp-nps-submit');
        if (submitButton) {
          submitButton.addEventListener('click', this.handleSubmit.bind(this));
        }
        
        // Get reference to the textarea for later use
        this.feedbackTextarea = document.getElementById('ihelp-nps-feedback');
        
        // Add keyboard event listener to submit on Enter when Ctrl is pressed
        if (this.feedbackTextarea) {
          this.feedbackTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              this.handleSubmit();
            }
          });
        }
      }
    }
    
    // Handle rating button click
    handleRatingSelect(event) {
      const rating = parseInt(event.currentTarget.dataset.rating);
      this.state.currentRating = rating;
      this.render();
    }
    
    // Handle form submission
    handleSubmit() {
      // Get feedback value
      const feedback = this.feedbackTextarea ? this.feedbackTextarea.value : '';
      this.state.feedback = feedback;
      
      // Set loading state
      this.state.loading = true;
      
      // Update submit button to show loading state
      const submitButton = document.getElementById('ihelp-nps-submit');
      if (submitButton) {
        submitButton.classList.add('loading');
        submitButton.innerHTML = 'Enviando...';
        submitButton.disabled = true;
      }
      
      // Submit data to API
      this.submitFeedback()
        .then(() => {
          this.state.submitted = true;
          this.state.loading = false;
          this.render();
          
          // Fechar o widget automaticamente após 4 segundos
          setTimeout(() => {
            this.hide();
          }, 4000);
          
          // Salvar no localStorage para não mostrar novamente por um tempo
          if (window.localStorage) {
            window.localStorage.setItem('ihelp_nps_submitted', Date.now().toString());
          }
        })
        .catch(error => {
          console.error('Erro ao enviar feedback NPS:', error);
          this.state.error = 'Falha ao enviar feedback. Por favor, tente novamente.';
          this.state.loading = false;
          
          if (submitButton) {
            submitButton.classList.remove('loading');
            submitButton.innerHTML = this.config.submitButtonText;
            submitButton.disabled = false;
          }
          
          this.render();
        });
    }
    
    // Submit feedback to the API
    async submitFeedback() {
      // Gerar um ID de sessão se não existir
      if (!this._sessionId) {
        this._sessionId = 'nps_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      }
      
      const data = {
        user_id: this.config.userId,
        score: this.state.currentRating,
        feedback: this.state.feedback,
        created_at: new Date().toISOString(),
        website: window.location.hostname || 'unknown',
        category: this.getNPSCategory(this.state.currentRating),
        session_id: this._sessionId,
        business_id: this.config.businessId,
        profile: this.config.profile,
        email: this.config.email,
        url: window.location.href,
        tags: this.config.tags && Array.isArray(this.config.tags) ? this.config.tags : []
      };
      
      // Log data for debugging
      console.log('Enviando feedback NPS:', data);
      
      // If a custom onSubmit function is provided, use it
      if (typeof this.config.onSubmit === 'function') {
        return this.config.onSubmit(data);
      }
      
      // Otherwise use the default API submission
      if (!this.config.apiKey) {
        console.warn('Chave de API não fornecida para o widget NPS. Os dados não serão enviados para o backend.');
        return Promise.resolve();
      }
      
      try {
        // Submit to the provided API endpoint
        const response = await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.config.apiKey,
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao enviar feedback: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        console.error('Erro ao enviar feedback NPS:', error);
        throw error;
      }
    }
  }
  
  // Expose the widget to the global scope
  window.iHelpNPS = {
    init: function(options) {
      return new NPSWidget(options);
    },
    show: function() {
      const widget = document.getElementById('ihelp-nps-widget');
      if (widget) widget.style.display = 'block';
    },
    hide: function() {
      const widget = document.getElementById('ihelp-nps-widget');
      if (widget) widget.style.display = 'none';
    }
  };
  
  // Adicionar métodos de mostrar/ocultar ao protótipo do NPSWidget
  NPSWidget.prototype.show = function() {
    // Verificar se o widget deve ser pulado
    if (this.state.shouldSkip) {
      console.log('Widget NPS não será exibido porque foi marcado para ser pulado.');
      return;
    }
    
    // Verificar se o elemento existe antes de tentar acessá-lo
    if (!this.targetElement) {
      console.error('Erro ao mostrar widget: O elemento alvo não existe.');
      return;
    }
    
    // Verificar novamente no Supabase antes de exibir
    this.shouldSkipWidget().then(shouldSkip => {
      if (shouldSkip) {
        this.state.shouldSkip = true;
        console.log('Widget NPS não será exibido após verificação adicional.');
        return;
      }
      
      // Agora sim podemos exibir o widget
      this.visible = true;
      this.targetElement.style.display = 'block';
      
      // Mostrar o botão de fechar após 5 segundos
      setTimeout(() => {
        if (this.widgetElement) {
          const closeBtn = this.widgetElement.querySelector('.ihelp-nps-close-btn');
          if (closeBtn) {
            closeBtn.classList.remove('ihelp-nps-hide');
            closeBtn.classList.add('visible');
          }
        }
      }, 5000);
    });
  };
  
  NPSWidget.prototype.hide = function(userInitiated = false) {
    // Verificar se o elemento existe antes de tentar acessá-lo
    if (!this.targetElement) {
      console.error('Erro ao ocultar widget: O elemento alvo não existe.');
      return;
    }
    
    // Verificar se o widget estava realmente visível antes
    const wasVisible = this.visible;
    
    // Agora ocultamos o widget
    this.visible = false;
    this.targetElement.style.display = 'none';
    
    // Esconder o botão de fechar também
    if (this.widgetElement) {
      const closeBtn = this.widgetElement.querySelector('.ihelp-nps-close-btn');
      if (closeBtn) {
        closeBtn.classList.remove('visible');
        closeBtn.classList.add('ihelp-nps-hide');
      }
    }
    
    // Só registrar o fechamento se:
    // 1. O widget estava realmente visível antes
    // 2. Foi fechado pelo usuário OU após o envio do feedback
    if (wasVisible && (userInitiated || this.state.submitted)) {
      console.log('Registrando fechamento do widget' + (userInitiated ? ' (iniciado pelo usuário)' : ''));
      
      // Salvar no localStorage como fallback
      if (window.localStorage) {
        window.localStorage.setItem('ihelp_nps_closed', Date.now().toString());
      }
      
      // Registrar o fechamento no Supabase
      this.registerWidgetClosed();
    }
  };
  
  // Método para registrar o fechamento do widget no Supabase
  NPSWidget.prototype.registerWidgetClosed = function() {
    // Verificar se temos configuração para o Supabase
    if (!this.config.apiKey || !this.config.apiUrl) {
      return;
    }
    
    try {
      // Tabela para registrar fechamentos do widget
      const closedWidgetTableUrl = this.config.apiUrl.replace('nps_feedback', 'nps_widget_closed');
      
      // Preparar os dados para envio - apenas com os campos que existem na tabela
      const data = {
        user_id: this.config.userId,
        closed_at: new Date().toISOString(),
        business_id: this.config.businessId,
        email: this.config.email,
        url: window.location.href
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
  
  // ========== CÓDIGO DE INSTALAÇÃO ==========
  // Configuração padrão para instalação
  const defaultConfig = {
    userId: 'anonymous',
    apiUrl: 'https://cxbvqfhdblmlvrgzuqpd.supabase.co/rest/v1/nps_feedback',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4YnZxZmhkYmxtbHZyZ3p1cXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMTY2MjAsImV4cCI6MjA1Nzc5MjYyMH0.7Jrl8_qtkjExzC98QWn1Fl2fVcXNL_E0y-_NTxhSLrc',
    primaryColor: '#ea5f3d',
    autoOpen: true,
    businessId: null,
    profile: null,
    email: null,
    tags: []
  };

  // Função para criar o container do widget
  function createWidgetContainer() {
    // Verificar se document.body existe
    if (!document.body) {
      console.warn('NPS Widget: document.body não está disponível ainda. Aguardando o DOM carregar...');
      
      // Retornar um ID temporário e agendar a criação do container quando o DOM estiver pronto
      const tempId = 'ihelp-nps-widget';
      
      // Usar setTimeout para tentar novamente após o DOM estar carregado
      setTimeout(function() {
        if (document.body) {
          const container = document.createElement('div');
          container.id = tempId;
          container.style.position = 'fixed';
          container.style.bottom = '20px';
          container.style.left = '50%';
          container.style.transform = 'translateX(-50%)';
          container.style.zIndex = '9999';
          document.body.appendChild(container);
          console.log('NPS Widget: Container criado com sucesso após aguardar o DOM.');
        } else {
          console.error('NPS Widget: document.body ainda não está disponível após aguardar.');
        }
      }, 100);
      
      return tempId;
    }
    
    // Caso document.body exista, criar o container normalmente
    const container = document.createElement('div');
    container.id = 'ihelp-nps-widget';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container.id;
  }

  // Função principal de inicialização
  initNPSWidget = window.initNPSWidget = function(config = {}) {
    // Mesclar configuração padrão com a configuração do usuário
    const finalConfig = {...defaultConfig, ...config};
    
    // Verificar se o DOM está pronto para manipulação
    const initWidget = function() {
      // Verificar se o widget já foi marcado para ser pulado
      if (config.shouldSkip === true) {
        console.log('initNPSWidget: Widget já foi marcado para ser pulado.');
        // Criar uma instância que não será exibida
        const hiddenWidget = new NPSWidget(finalConfig);
        hiddenWidget.state.shouldSkip = true;
        return hiddenWidget;
      }
      // Criar container se não for especificado
      if (!finalConfig.targetElementId) {
        finalConfig.targetElementId = createWidgetContainer();
      }
      
      // Inicializar o widget diretamente
      if (window.iHelpNPS) {
        return window.iHelpNPS.init(finalConfig);
      } else {
        console.error('Erro ao inicializar o widget NPS: iHelpNPS não está definido.');
        return null;
      }
    };
    
    // Se o documento já estiver carregado, inicializar imediatamente
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      return initWidget();
    } else {
      // Caso contrário, aguardar o carregamento do DOM
      console.log('NPS Widget: Aguardando o DOM carregar completamente...');
      
      // Criar um objeto temporário com métodos show/hide que serão chamados quando o widget for inicializado
      const tempWidget = {
        _pendingShow: false,
        _pendingHide: false,
        _realWidget: null,
        
        show: function() {
          this._pendingShow = true;
          if (this._realWidget && typeof this._realWidget.show === 'function') {
            try {
              this._realWidget.show();
            } catch (e) {
              console.error('Erro ao mostrar widget temporário:', e);
            }
          }
        },
        
        hide: function() {
          this._pendingHide = true;
          if (this._realWidget && typeof this._realWidget.hide === 'function') {
            try {
              this._realWidget.hide();
            } catch (e) {
              console.error('Erro ao ocultar widget temporário:', e);
            }
          }
        }
      };
      
      // Inicializar o widget quando o DOM estiver pronto
      document.addEventListener('DOMContentLoaded', function() {
        tempWidget._realWidget = initWidget();
        
        // Aplicar ações pendentes
        if (tempWidget._pendingShow) {
          tempWidget._realWidget.show();
        } else if (tempWidget._pendingHide) {
          tempWidget._realWidget.hide();
        }
      });
      
      return tempWidget;
    }
  };
  
  // Função para inicialização segura em ambientes React
  function safeInitForReact() {
    // Auto-inicializar se o atributo data-auto-init estiver presente no script
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    
    if (currentScript && currentScript.getAttribute('data-auto-init') === 'true') {
      // Extrair configuração do atributo data-config
      let config = {};
      const configAttr = currentScript.getAttribute('data-config');
      
      if (configAttr) {
        try {
          config = JSON.parse(configAttr);
        } catch (e) {
          console.error('Erro ao analisar configuração do widget NPS:', e);
        }
      }
      
      // Inicializar widget automaticamente com segurança
      window.initNPSWidget(config);
    }
  }
  
  // Tentar inicializar com segurança
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    safeInitForReact();
  } else {
    // Aguardar o DOM estar pronto para inicializar
    document.addEventListener('DOMContentLoaded', safeInitForReact);
  }
  
  // Garantir que o script esteja totalmente carregado antes de disponibilizar as funções
  document.addEventListener('DOMContentLoaded', function() {
    console.log('NPS Widget carregado e pronto para uso.');
  });
  
  // Adicionar um evento para quando a janela estiver totalmente carregada (para React)
  window.addEventListener('load', function() {
    console.log('NPS Widget: Janela totalmente carregada, garantindo compatibilidade com React.');
  });
  // ========== FIM DO CÓDIGO DE INSTALAÇÃO ==========
  
})(window);

// Verificar se as funções estão disponíveis globalmente
console.log('NPS Widget: Funções globais disponíveis:', {
  initNPSWidget: typeof initNPSWidget !== 'undefined',
  iHelpNPS: typeof window.iHelpNPS !== 'undefined'
});

// Adicionar uma função auxiliar para uso em React
window.reactInitNPSWidget = function(config) {
  // Garantir que o DOM esteja pronto antes de inicializar
  if (document.body) {
    // Salvar a configuração original de autoOpen para uso posterior
    const originalAutoOpen = !!config.autoOpen;
    
    // Usar initNPSWidget para criar uma instância temporária para verificar
    // se o widget deve ser pulado, já que NPSWidget pode não estar acessível diretamente
    const tempConfig = Object.assign({}, config);
    
    // Inicializar o widget com autoOpen: false para não exibir imediatamente
    tempConfig.autoOpen = false;
    
    // Usar a função global para criar o widget
    const tempWidget = window.initNPSWidget(tempConfig);
    
    // Retornar uma Promise que só inicializa o widget se não deve ser pulado
    return new Promise((resolve) => {
      tempWidget.shouldSkipWidget().then(shouldSkip => {
        if (shouldSkip) {
          console.log('React NPS Widget: Widget será pulado com base em critérios definidos.');
          // Retornar uma instância do widget que não será exibida
          // Passar a flag shouldSkip para a configuração
          const skipConfig = Object.assign({}, config, { shouldSkip: true, autoOpen: false });
          // Usar a função global para criar o widget
          const hiddenWidget = window.initNPSWidget(skipConfig);
          hiddenWidget.state.shouldSkip = true;
          resolve(hiddenWidget);
        } else {
          // Se não deve ser pulado, inicializar normalmente com autoOpen: false
          // para controlar manualmente a exibição
          const widgetConfig = Object.assign({}, config, { autoOpen: false });
          const widget = window.initNPSWidget(widgetConfig);
          
          // Se autoOpen estava habilitado na configuração original, mostrar o widget após 3 segundos
          if (originalAutoOpen) {
            console.log('React NPS Widget: autoOpen habilitado, exibindo widget em 3 segundos...');
            setTimeout(() => {
              if (widget && typeof widget.show === 'function') {
                console.log('React NPS Widget: Chamando show() explicitamente');
                widget.show();
              } else {
                console.error('React NPS Widget: Não foi possível chamar o método show() do widget');
              }
            }, 3000);
          }
          
          resolve(widget);
        }
      }).catch(error => {
        console.error('Erro ao verificar se o widget deve ser pulado:', error);
        // Em caso de erro, inicializar normalmente com autoOpen: false
        const widgetConfig = Object.assign({}, config, { autoOpen: false });
        const widget = window.initNPSWidget(widgetConfig);
        
        // Se autoOpen estava habilitado na configuração original, mostrar o widget após 3 segundos
        if (originalAutoOpen) {
          console.log('React NPS Widget: autoOpen habilitado (após erro), exibindo widget em 3 segundos...');
          setTimeout(() => {
            if (widget && typeof widget.show === 'function') {
              console.log('React NPS Widget: Chamando show() explicitamente após erro');
              widget.show();
            } else {
              console.error('React NPS Widget: Não foi possível chamar o método show() do widget após erro');
            }
          }, 3000);
        }
        
        resolve(widget);
      });
    });
  } else {
    console.log('React NPS Widget: Aguardando o DOM estar pronto...');
    return new Promise((resolve) => {
      const checkAndInit = setInterval(() => {
        if (document.body) {
          clearInterval(checkAndInit);
          // Chamar a própria função quando o DOM estiver pronto
          resolve(window.reactInitNPSWidget(config));
        }
      }, 50);
    });
  }
};