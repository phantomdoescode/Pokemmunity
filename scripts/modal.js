// Modal/Dialog system for POKEMMUNITY

class Modal {
  constructor() {
    this.activeModal = null;
  }
  
  show(options) {
    const {
      title = '',
      content = '',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm = null,
      onCancel = null,
      type = 'default', // 'default', 'danger', 'success'
      showCancel = true
    } = options;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
      padding: 20px;
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
      background-color: #2e3a4d;
      border-radius: 20px;
      padding: 30px;
      max-width: 500px;
      width: 100%;
      border: 1px solid #e5e5e5;
      animation: slideUp 0.3s ease-out;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    
    // Modal content
    let modalHTML = '';
    
    if (title) {
      modalHTML += `
        <h2 style="
          font-family: 'Impact', 'Arial Black', sans-serif;
          font-size: 24px;
          color: #e5e5e5;
          margin-bottom: 20px;
          letter-spacing: 0.05em;
        ">${title}</h2>
      `;
    }
    
    modalHTML += `
      <div style="
        color: #e5e5e5;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 25px;
      ">${content}</div>
    `;
    
    // Buttons
    const buttonColors = {
      default: '#f6cf57',
      danger: '#ff3f3f',
      success: '#67ff6a'
    };
    
    modalHTML += `<div style="display: flex; gap: 10px; justify-content: flex-end;">`;
    
    if (showCancel) {
      modalHTML += `
        <button class="modal-cancel" style="
          background-color: #e5e5e5;
          color: #000;
          padding: 10px 24px;
          border: none;
          border-radius: 15px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.3s;
        ">${cancelText}</button>
      `;
    }
    
    modalHTML += `
      <button class="modal-confirm" style="
        background-color: ${buttonColors[type] || buttonColors.default};
        color: #000;
        padding: 10px 24px;
        border: none;
        border-radius: 15px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: opacity 0.3s;
      ">${confirmText}</button>
    `;
    
    modalHTML += `</div>`;
    
    modal.innerHTML = modalHTML;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Event handlers
    const confirmBtn = modal.querySelector('.modal-confirm');
    const cancelBtn = modal.querySelector('.modal-cancel');
    
    // Play notification sound when modal opens
    SoundManager.playNotification();
    
    const close = (confirmed = false) => {
      overlay.style.opacity = '0';
      modal.style.transform = 'translateY(20px)';
      setTimeout(() => {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
        this.activeModal = null;
      }, 200);
      
      if (confirmed && onConfirm) {
        onConfirm();
      } else if (!confirmed && onCancel) {
        onCancel();
      }
    };
    
    confirmBtn.addEventListener('click', () => {
      if (type === 'danger') {
        SoundManager.playError();
      } else {
        SoundManager.playSuccess();
      }
      close(true);
    });
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        SoundManager.playClick();
        close(false);
      });
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        close(false);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Hover effects
    [confirmBtn, cancelBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('mouseenter', () => btn.style.opacity = '0.8');
        btn.addEventListener('mouseleave', () => btn.style.opacity = '1');
      }
    });
    
    this.activeModal = overlay;
    return overlay;
  }
  
  confirm(options) {
    return new Promise((resolve) => {
      this.show({
        ...options,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }
  
  alert(title, content) {
    return this.show({
      title,
      content,
      confirmText: 'OK',
      showCancel: false
    });
  }
}

// Add animation styles
if (!document.getElementById('modal-styles')) {
  const style = document.createElement('style');
  style.id = 'modal-styles';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @media (max-width: 480px) {
      .modal {
        max-width: 100% !important;
        padding: 20px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Create global modal instance
const modal = new Modal();

// Export
if (typeof window !== 'undefined') {
  window.modal = modal;
}
