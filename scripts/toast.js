// Toast notification system for POKEMMUNITY

class Toast {
  constructor() {
    this.container = null;
    this.init();
  }
  
  init() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }
  
  show(message, type = 'info', duration = 3000) {
    // Play appropriate sound
    if (type === 'success') {
      SoundManager.playSuccess();
    } else if (type === 'error') {
      SoundManager.playError();
    } else if (type === 'warning' || type === 'info') {
      SoundManager.playNotification();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const colors = {
      success: '#67ff6a',
      error: '#ff3f3f',
      warning: '#f6cf57',
      info: '#2e3a4d'
    };
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.style.cssText = `
      background-color: ${colors[type] || colors.info};
      color: ${type === 'warning' || type === 'info' ? '#000' : '#fff'};
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
      transition: opacity 0.3s;
    `;
    
    toast.innerHTML = `
      <span style="font-size: 18px; font-weight: bold;">${icons[type] || icons.info}</span>
      <span style="flex: 1;">${message}</span>
    `;
    
    // Add click to dismiss
    toast.addEventListener('click', () => {
      this.dismiss(toast);
    });
    
    this.container.appendChild(toast);
    
    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }
    
    return toast;
  }
  
  dismiss(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
  
  success(message, duration) {
    return this.show(message, 'success', duration);
  }
  
  error(message, duration) {
    return this.show(message, 'error', duration);
  }
  
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }
  
  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Add animation styles
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @media (max-width: 480px) {
      #toast-container {
        top: auto !important;
        bottom: 90px !important;
        left: 15px !important;
        right: 15px !important;
        max-width: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Create global toast instance
const toast = new Toast();

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.toast = toast;
}
