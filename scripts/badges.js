// Badges page functionality

class BadgesPage {
  constructor() {
    this.currentUser = Storage.get('currentUser');
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return;
    }
    this.init();
  }
  
  init() {
    this.renderBadges();
    this.animateProgress();
    this.addBadgeHoverEffects();
  }
  
  renderBadges() {
    const userBadges = this.currentUser.badges || ['starter', 'trainer', 'post', 'catcher'];
    
    const badgeData = {
      starter: { title: 'STARTER BADGE', description: 'Register an account' },
      trainer: { title: 'TRAINER BADGE', description: 'Successfully login your account' },
      post: { title: 'POST BADGE', description: 'Post something to your feed' },
      catcher: { title: 'CATCHER BADGE', description: 'Catch up a trainer/Add you as their friend' },
      elite: { title: 'ELITE BADGE', description: 'Catch up to 250 trainers' },
      champion: { title: 'CHAMPION BADGE', description: 'Catch up to 500 trainers' },
      master: { title: 'MASTER BADGE', description: 'Catch up to 750 trainers' },
      legend: { title: 'LEGEND BADGE', description: 'Catch up to 1000 trainers' }
    };
    
    // Unlock badges with animations
    document.querySelectorAll('.earned-badge, .locked-badge').forEach((badge, index) => {
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(20px)';
      setTimeout(() => {
        badge.style.transition = 'all 0.5s ease-out';
        badge.style.opacity = '1';
        badge.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }
  
  addBadgeHoverEffects() {
    document.querySelectorAll('.earned-badge, .locked-badge').forEach(badge => {
      const icon = badge.querySelector('.badge-icon');
      
      badge.addEventListener('mouseenter', () => {
        badge.style.transform = 'scale(1.02) translateY(-2px)';
        badge.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4)';
        if (icon) {
          icon.style.transform = 'rotate(360deg)';
        }
      });
      
      badge.addEventListener('mouseleave', () => {
        badge.style.transform = 'scale(1) translateY(0)';
        badge.style.boxShadow = 'none';
        if (icon) {
          icon.style.transform = 'rotate(0deg)';
        }
      });
      
      badge.style.transition = 'all 0.3s ease-out';
      if (icon) {
        icon.style.transition = 'transform 0.5s ease-out';
      }
      
      // Click to show details
      badge.addEventListener('click', () => {
        const title = badge.querySelector('.badge-title, .locked-badge-title').textContent;
        const desc = badge.querySelector('.badge-description, .locked-badge-description').textContent;
        const isLocked = badge.classList.contains('locked-badge');
        
        modal.show({
          title: title,
          content: `
            <div style="text-align: center;">
              <div style="
                width: 100px;
                height: 100px;
                background: ${isLocked ? '#666' : '#f6cf57'};
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                ${isLocked ? 'opacity: 0.5;' : ''}
              ">
                ${isLocked ? '🔒' : '🏅'}
              </div>
              <p style="font-size: 16px; color: #e5e5e5; margin-bottom: 10px;">${desc}</p>
              ${isLocked ? '<p style="font-size: 14px; color: #999;">Complete the requirement to unlock this badge!</p>' : '<p style="font-size: 14px; color: #67ff6a;">✓ Badge Unlocked!</p>'}
            </div>
          `,
          showCancel: false,
          confirmText: 'Close'
        });
      });
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BadgesPage());
} else {
  new BadgesPage();
}
