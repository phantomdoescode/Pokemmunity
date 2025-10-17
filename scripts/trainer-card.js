// Trainer card page functionality

class TrainerCardPage {
  constructor() {
    this.currentUser = Storage.get('currentUser');
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return;
    }
    this.originalData = { ...this.currentUser };
    this.init();
  }
  
  init() {
    this.loadUserData();
    this.initAvatarUpload();
    this.initPhotoUpload();
    this.initLivePreview();
    this.initSaveButton();
    this.initCharacterCounters();
  }
  
  loadUserData() {
    const displayNameInput = document.querySelector('input[type="text"]');
    const bioTextarea = document.querySelector('.bio-textarea');
    const profileName = document.querySelector('.trainer-profile-name');
    const profileBio = document.querySelector('.trainer-profile-bio');
    
    if (displayNameInput) displayNameInput.value = this.currentUser.displayName || 'Phantom';
    if (bioTextarea) bioTextarea.value = this.currentUser.bio || 'I like Pokémon! Hence, my website. ;D';
    if (profileName) profileName.textContent = this.currentUser.displayName || 'Phantom';
    if (profileBio) profileBio.textContent = this.currentUser.bio || 'I like Pokémon! Hence, my website. ;D';
    
    // Load stats
    const stats = this.currentUser.stats || { trainersCaught: 234, communitiesJoined: 13 };
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers[0]) animateCounter(statNumbers[0], 0, stats.trainersCaught, 1500);
    if (statNumbers[1]) animateCounter(statNumbers[1], 0, stats.communitiesJoined, 1500);
  }
  
  initAvatarUpload() {
    const changeAvatarBtn = document.querySelector('.change-avatar-button');
    if (!changeAvatarBtn) return;
    
    changeAvatarBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (event) => {
            const avatars = document.querySelectorAll('.avatar-lg, .trainer-avatar');
            avatars.forEach(avatar => {
              avatar.src = event.target.result;
            });
            this.currentUser.avatar = event.target.result;
            toast.success('Avatar updated! Don\'t forget to save changes.');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  }
  
  initPhotoUpload() {
    const photoUpload = document.querySelector('.photo-upload');
    if (!photoUpload) return;
    
    photoUpload.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (event) => {
            photoUpload.style.backgroundImage = `url(${event.target.result})`;
            photoUpload.style.backgroundSize = 'cover';
            photoUpload.querySelector('.upload-text').style.display = 'none';
            this.currentUser.photoCard = event.target.result;
            toast.success('Photo card uploaded! Don\'t forget to save changes.');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
  }
  
  initLivePreview() {
    const displayNameInput = document.querySelector('input[type="text"]');
    const bioTextarea = document.querySelector('.bio-textarea');
    const profileName = document.querySelector('.trainer-profile-name');
    const profileBio = document.querySelector('.trainer-profile-bio');
    
    if (displayNameInput) {
      displayNameInput.addEventListener('input', () => {
        profileName.textContent = displayNameInput.value || 'Phantom';
        profileName.style.transform = 'scale(1.05)';
        setTimeout(() => profileName.style.transform = 'scale(1)', 200);
      });
    }
    
    if (bioTextarea) {
      bioTextarea.addEventListener('input', () => {
        profileBio.textContent = bioTextarea.value || 'I like Pokémon! Hence, my website. ;D';
        profileBio.style.transform = 'scale(1.05)';
        setTimeout(() => profileBio.style.transform = 'scale(1)', 200);
      });
    }
    
    // Add transition
    if (profileName) profileName.style.transition = 'transform 0.2s';
    if (profileBio) profileBio.style.transition = 'transform 0.2s';
  }
  
  initCharacterCounters() {
    const bioTextarea = document.querySelector('.bio-textarea');
    if (!bioTextarea) return;
    
    const maxChars = 200;
    const counter = document.createElement('div');
    counter.style.cssText = `
      font-size: 12px;
      color: #999;
      text-align: right;
      margin-top: 5px;
    `;
    bioTextarea.parentNode.appendChild(counter);
    
    const updateCounter = () => {
      const length = bioTextarea.value.length;
      counter.textContent = `${length}/${maxChars}`;
      counter.style.color = length > maxChars ? '#ff3f3f' : '#999';
    };
    
    bioTextarea.addEventListener('input', updateCounter);
    updateCounter();
  }
  
  initSaveButton() {
    const saveBtn = document.querySelector('.save-button');
    if (!saveBtn) return;
    
    saveBtn.addEventListener('click', () => {
      const displayNameInput = document.querySelector('input[type="text"]');
      const bioTextarea = document.querySelector('.bio-textarea');
      
      const displayName = displayNameInput.value.trim();
      const bio = bioTextarea.value.trim();
      
      if (!displayName) {
        toast.error('Display name cannot be empty');
        return;
      }
      
      if (bio.length > 200) {
        toast.error('Bio is too long! Maximum 200 characters.');
        return;
      }
      
      // Save changes
      this.currentUser.displayName = displayName;
      this.currentUser.bio = bio;
      Storage.set('currentUser', this.currentUser);
      
      // Update users list
      const users = Storage.get('users', []);
      const userIndex = users.findIndex(u => u.id === this.currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = this.currentUser;
        Storage.set('users', users);
      }
      
      this.originalData = { ...this.currentUser };
      
      // Show success animation
      saveBtn.textContent = '✓ SAVED!';
      saveBtn.style.backgroundColor = '#67ff6a';
      setTimeout(() => {
        saveBtn.textContent = 'SAVE CHANGES';
        saveBtn.style.backgroundColor = '#f6cf57';
      }, 2000);
      
      toast.success('Profile updated successfully!');
    });
    
    // Detect unsaved changes
    const inputs = [
      document.querySelector('input[type="text"]'),
      document.querySelector('.bio-textarea')
    ];
    
    inputs.forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          saveBtn.style.animation = 'pulse 1s infinite';
        });
      }
    });
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
    `;
    document.head.appendChild(style);
    
    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
      const displayName = document.querySelector('input[type="text"]').value;
      const bio = document.querySelector('.bio-textarea').value;
      
      if (displayName !== this.originalData.displayName || bio !== this.originalData.bio) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new TrainerCardPage());
} else {
  new TrainerCardPage();
}
