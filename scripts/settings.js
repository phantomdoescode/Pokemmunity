// Settings page functionality

class SettingsPage {
  constructor() {
    this.currentUser = Storage.get('currentUser');
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return;
    }
    this.settings = Storage.get('settings', this.getDefaultSettings());
    this.init();
  }
  
  init() {
    this.loadSettings();
    this.initSettingsControls();
    this.initAccountSettings();
    this.initLogout();
    this.initThemeToggle();
  }
  
  getDefaultSettings() {
    return {
      lightMode: false,
      autoTheme: false,
      pushNotifications: false,
      emailNotifications: false,
      trainerRequests: true,
      newMessages: true,
      profileVisibility: 'anyone',
      activeStatus: true
    };
  }
  
  loadSettings() {
    // Load all select dropdowns
    const selects = {
      'Light Mode Pokégear': this.settings.lightMode ? 'on' : 'off',
      'Auto Theme': this.settings.autoTheme ? 'on' : 'off',
      'Push Notifications': this.settings.pushNotifications ? 'on' : 'off',
      'Email Notifications': this.settings.emailNotifications ? 'on' : 'off',
      'Trainer Requests': this.settings.trainerRequests ? 'on' : 'off',
      'New Messages': this.settings.newMessages ? 'on' : 'off',
      'Profile Visibility': this.settings.profileVisibility,
      'Active/Online Status': this.settings.activeStatus ? 'on' : 'off'
    };
    
    document.querySelectorAll('.settings-row, .settings-row-last, .settings-row-final').forEach(row => {
      const label = row.querySelector('.settings-label');
      const select = row.querySelector('.settings-select');
      
      if (label && select) {
        const settingName = label.textContent.trim();
        if (selects[settingName]) {
          select.value = selects[settingName];
        }
      }
    });
    
    // Load account info
    const usernameInput = document.querySelector('.settings-input[value*="PhanDoesGame"]');
    const emailInput = document.querySelector('.settings-input[value*="phantommaster"]');
    
    if (usernameInput) usernameInput.value = this.currentUser.username || 'PhanDoesGame';
    if (emailInput) emailInput.value = this.currentUser.email || 'phantommaster81@gmail.com';
  }
  
  initSettingsControls() {
    document.querySelectorAll('.settings-select').forEach(select => {
      select.addEventListener('change', () => {
        const row = select.closest('.settings-row, .settings-row-last, .settings-row-final');
        const label = row.querySelector('.settings-label').textContent.trim();
        
        // Update settings
        this.updateSetting(label, select.value);
        
        // Visual feedback
        select.style.transform = 'scale(1.05)';
        setTimeout(() => select.style.transform = 'scale(1)', 200);
        select.style.transition = 'transform 0.2s';
        
        toast.success(`${label} updated`);
      });
    });
  }
  
  updateSetting(settingName, value) {
    const settingMap = {
      'Light Mode Pokégear': 'lightMode',
      'Auto Theme': 'autoTheme',
      'Push Notifications': 'pushNotifications',
      'Email Notifications': 'emailNotifications',
      'Trainer Requests': 'trainerRequests',
      'New Messages': 'newMessages',
      'Profile Visibility': 'profileVisibility',
      'Active/Online Status': 'activeStatus'
    };
    
    const key = settingMap[settingName];
    if (key) {
      if (key === 'profileVisibility') {
        this.settings[key] = value;
      } else {
        this.settings[key] = value === 'on';
      }
      
      Storage.set('settings', this.settings);
      
      // Apply theme change immediately
      if (key === 'lightMode') {
        this.applyTheme(value === 'on');
      }
    }
  }
  
  initAccountSettings() {
    const usernameInput = document.querySelector('.settings-input[value*="PhanDoesGame"]');
    const emailInput = document.querySelector('.settings-input[value*="phantommaster"]');
    const changePasswordBtn = document.querySelector('.save-button');
    
    // Save account changes on blur
    if (usernameInput) {
      usernameInput.addEventListener('blur', () => {
        const newUsername = usernameInput.value.trim();
        if (newUsername && newUsername !== this.currentUser.username) {
          this.currentUser.username = newUsername;
          Storage.set('currentUser', this.currentUser);
          toast.success('Username updated');
        }
      });
    }
    
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const newEmail = emailInput.value.trim();
        if (newEmail && newEmail !== this.currentUser.email) {
          if (!isValidEmail(newEmail)) {
            toast.error('Invalid email address');
            emailInput.value = this.currentUser.email;
            return;
          }
          this.currentUser.email = newEmail;
          Storage.set('currentUser', this.currentUser);
          toast.success('Email updated');
        }
      });
    }
    
    // Change password
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => {
        this.showChangePasswordModal();
      });
    }
  }
  
  showChangePasswordModal() {
    modal.show({
      title: 'Change Password',
      content: `
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 13px;">Current Password</label>
            <input type="password" id="current-password" style="
              width: 100%;
              padding: 10px 15px;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              color: #e5e5e5;
              font-size: 14px;
            ">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 13px;">New Password</label>
            <input type="password" id="new-password" style="
              width: 100%;
              padding: 10px 15px;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              color: #e5e5e5;
              font-size: 14px;
            ">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 13px;">Confirm New Password</label>
            <input type="password" id="confirm-password" style="
              width: 100%;
              padding: 10px 15px;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              color: #e5e5e5;
              font-size: 14px;
            ">
          </div>
        </div>
      `,
      confirmText: 'Change Password',
      cancelText: 'Cancel',
      onConfirm: () => {
        const current = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;
        
        if (current !== this.currentUser.password) {
          toast.error('Current password is incorrect');
          return;
        }
        
        if (newPass.length < 8) {
          toast.error('Password must be at least 8 characters');
          return;
        }
        
        if (newPass !== confirm) {
          toast.error('Passwords do not match');
          return;
        }
        
        this.currentUser.password = newPass;
        Storage.set('currentUser', this.currentUser);
        
        // Update users list
        const users = Storage.get('users', []);
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
          users[userIndex] = this.currentUser;
          Storage.set('users', users);
        }
        
        toast.success('Password changed successfully');
      }
    });
  }
  
  initLogout() {
    const logoutLink = document.querySelector('.logout-link');
    if (!logoutLink) return;
    
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const confirmed = await modal.confirm({
        title: 'Log Out',
        content: 'Are you sure you want to log out?',
        confirmText: 'Log Out',
        cancelText: 'Cancel',
        type: 'danger'
      });
    });
  }
  
  initThemeToggle() {
    // Apply saved theme
    this.applyTheme(this.settings.lightMode);
  }
  
  applyTheme(isLight) {
    if (isLight) {
      document.body.style.backgroundColor = '#e5e5e5';
      document.body.style.color = '#000';
      // In a full implementation, you'd change all colors
      toast.info('Light mode is coming soon!');
    } else {
      document.body.style.backgroundColor = '#1b2735';
      document.body.style.color = '#e5e5e5';
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SettingsPage());
} else {
  new SettingsPage();
}