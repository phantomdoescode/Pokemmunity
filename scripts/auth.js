// Authentication functionality for login and register pages

class Auth {
  constructor() {
    this.init();
  }
  
  init() {
    // Check if we're on login or register page
    const isLoginPage = window.location.pathname.includes('login.html');
    const isRegisterPage = window.location.pathname.includes('register.html');
    
    if (isLoginPage) {
      this.initLoginPage();
    } else if (isRegisterPage) {
      this.initRegisterPage();
    }
    
    // Check if user is logged in
    this.checkAuth();
  }
  
  initLoginPage() {
    const form = document.querySelector('.auth-form');
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const loginBtn = form.querySelector('.btn-primary');
    
    // Add password toggle
    this.addPasswordToggle(passwordInput);
    
    // Form validation
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleLogin(emailInput.value, passwordInput.value);
    });
    
    // Enter key submit
    [emailInput, passwordInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleLogin(emailInput.value, passwordInput.value);
        }
      });
    });
    
    // Remember last email
    const savedEmail = Storage.get('lastEmail');
    if (savedEmail) {
      emailInput.value = savedEmail;
    }
  }
  
  initRegisterPage() {
    const form = document.querySelector('.auth-form');
    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelectorAll('input[type="password"]')[0];
    const confirmPasswordInput = form.querySelectorAll('input[type="password"]')[1];
    const registerBtn = form.querySelector('.btn-primary');
    
    // Add password toggles
    this.addPasswordToggle(passwordInput);
    this.addPasswordToggle(confirmPasswordInput);
    
    // Add password strength indicator
    this.addPasswordStrengthIndicator(passwordInput);
    
    // Form validation
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleRegister(
        emailInput.value,
        passwordInput.value,
        confirmPasswordInput.value
      );
    });
    
    // Enter key submit
    [emailInput, passwordInput, confirmPasswordInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleRegister(
            emailInput.value,
            passwordInput.value,
            confirmPasswordInput.value
          );
        }
      });
    });
  }
  
  addPasswordToggle(passwordInput) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);
    
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.innerHTML = 'Show';
    toggleBtn.style.cssText = `
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      padding: 5px;
      opacity: 0.6;
      transition: opacity 0.3s;
    `;
    
    toggleBtn.addEventListener('mouseenter', () => toggleBtn.style.opacity = '1');
    toggleBtn.addEventListener('mouseleave', () => toggleBtn.style.opacity = '0.6');
    
    toggleBtn.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = 'Hide';
      } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = 'Show';
      }
    });
    
    wrapper.appendChild(toggleBtn);
  }
  
  addPasswordStrengthIndicator(passwordInput) {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      margin-top: 8px;
      font-size: 14px;
      display: none;
    `;
    passwordInput.parentNode.appendChild(indicator);
    
    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      if (password.length === 0) {
        indicator.style.display = 'none';
        return;
      }
    });
  }
  
  handleLogin(email, password) {
    // Validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Check credentials (mock authentication)
    const users = Storage.get('users', []);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Save session
      Storage.set('currentUser', user);
      Storage.set('lastEmail', email);
      Storage.set('loginStreak', (Storage.get('loginStreak', 0) + 1));
      Storage.set('lastLoginDate', Date.now());
      
      toast.success('Login successful! Redirecting...');
      
      // Award login badge
      this.awardBadge('trainer');
      
      setTimeout(() => {
        SoundManager.playSuccess();
        window.location.href = 'home.html';
      }, 1000);
    } else {
      toast.error('Invalid email or password');
    }
  }
  
  handleRegister(email, password, confirmPassword) {
    // Validation
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Check if user already exists
    const users = Storage.get('users', []);
    if (users.find(u => u.email === email)) {
      toast.error('An account with this email already exists');
      return;
    }
    
    // Create new user
    const newUser = {
      id: generateId(),
      email,
      password, // In production, this should be hashed!
      username: email.split('@')[0],
      displayName: 'Phantom',
      bio: 'I like Pokémon! Hence, my website. ;D',
      avatar: 'images/avatar.png',
      badges: ['starter'],
      stats: {
        trainersCaught: 0,
        communitiesJoined: 0,
        posts: 0
      },
      createdAt: Date.now()
    };
    
    users.push(newUser);
    Storage.set('users', users);
    Storage.set('currentUser', newUser);
    
    toast.success('Registration successful! Redirecting...');
    
    // Award starter badge with sound
    setTimeout(() => {
      SoundManager.playBadgeUnlock();
    }, 300);
    this.awardBadge('starter');
    
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1000);
  }
  
  checkAuth() {
    // Pages that require authentication
    const protectedPages = ['home.html', 'contacts.html', 'badges.html', 'trainer-card.html', 'settings.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
      const user = Storage.get('currentUser');
      if (!user) {
        window.location.href = 'login.html';
      }
    }
  }
  
  logout() {
    Storage.remove('currentUser');
    toast.success('Logged out successfully');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
  }
  
  awardBadge(badgeId) {
    const user = Storage.get('currentUser');
    if (!user) return;
    
    if (!user.badges) user.badges = [];
    
    if (!user.badges.includes(badgeId)) {
      user.badges.push(badgeId);
      Storage.set('currentUser', user);
      
      // Update users list
      const users = Storage.get('users', []);
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = user;
        Storage.set('users', users);
      }
    }
  }
}

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Auth());
} else {
  new Auth();
}
