// Contacts page functionality

class ContactsPage {
  constructor() {
    this.currentUser = Storage.get('currentUser');
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return;
    }
    this.contacts = Storage.get('contacts', this.getDefaultContacts());
    this.currentTab = 'trainer-list';
    this.init();
  }
  
  init() {
    this.initTabs();
    this.initSearch();
    this.renderContacts();
  }
  
  initTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        // Update active state
        tabs.forEach(t => {
          t.classList.remove('btn-primary');
          t.classList.add('btn-neutral');
        });
        tab.classList.remove('btn-neutral');
        tab.classList.add('btn-primary');
        
        // Switch content
        if (index === 0) {
          this.currentTab = 'trainer-list';
          this.renderContacts();
        } else if (index === 1) {
          this.currentTab = 'chat-conversations';
          this.renderChatConversations();
        } else if (index === 2) {
          this.currentTab = 'create-community';
          this.showCreateCommunity();
        }
      });
    });
  }
  
  initSearch() {
    const searchInput = document.querySelector('.contacts-search');
    if (!searchInput) return;
    
    const debouncedSearch = debounce((query) => {
      this.filterContacts(query);
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value.trim());
    });
    
    // Add clear button
    searchInput.addEventListener('focus', () => {
      if (!document.querySelector('.search-clear-btn')) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'search-clear-btn';
        clearBtn.innerHTML = '×';
        clearBtn.style.cssText = `
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #e5e5e5;
          font-size: 24px;
          cursor: pointer;
          display: none;
        `;
        
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        searchInput.parentNode.insertBefore(wrapper, searchInput);
        wrapper.appendChild(searchInput);
        wrapper.appendChild(clearBtn);
        
        clearBtn.addEventListener('click', () => {
          searchInput.value = '';
          clearBtn.style.display = 'none';
          this.renderContacts();
        });
        
        searchInput.addEventListener('input', () => {
          clearBtn.style.display = searchInput.value ? 'block' : 'none';
        });
      }
    });
  }
  
  filterContacts(query) {
    if (!query) {
      this.renderContacts();
      return;
    }
    
    const filtered = this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.username.toLowerCase().includes(query.toLowerCase())
    );
    
    this.renderContacts(filtered);
  }
  
  renderContacts(contacts = this.contacts) {
    const container = document.querySelector('.contacts-container');
    if (!container) return;

    // Rebuild the structure for the Trainer List view
    container.innerHTML = `
      <h2 class="font-calps-black contacts-column-title">TRAINER LIST</h2>
      <div class="contacts-grid"></div>
    `;

    const grid = container.querySelector('.contacts-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (contacts.length === 0) {
      grid.innerHTML = `
        <div style="
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: #999;
        ">
          <p style="font-size: 18px; margin-bottom: 10px;">No trainers found</p>
          <p style="font-size: 14px;">Try a different search term</p>
        </div>
      `;
      return;
    }

    // Sort: online first
    const sorted = [...contacts].sort((a, b) => {
      if (a.online === b.online) return 0;
      return a.online ? -1 : 1;
    });

    sorted.forEach((contact, index) => {
      const item = document.createElement('div');
      item.className = 'contact-item';
      item.style.cssText = 'opacity: 0; transform: translateY(10px); transition: all 0.3s;';

      item.innerHTML = `
        <img src="images/avatar.png" alt="Avatar" class="avatar contact-avatar">
        <div class="contact-info">
          <p class="font-calps-black contact-name">${contact.name}</p>
          <p class="font-calps-extralight contact-username">@${contact.username}</p>
        </div>
        <span class="${contact.online ? 'online-badge' : 'offline-badge'}">
          ${contact.online ? 'ONLINE' : 'OFFLINE'}
        </span>
      `;

      // Click to view profile
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        this.showContactProfile(contact);
      });

      // Hover effect
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      });

      grid.appendChild(item);

      // Fade in animation
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 30);
    });
  }
  
  showContactProfile(contact) {
    modal.show({
      title: contact.name,
      content: `
        <div style="text-align: center;">
          <img src="images/avatar.png" alt="Avatar" style="
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 15px;
          ">
          <p style="font-size: 14px; color: #999; margin-bottom: 10px;">@${contact.username}</p>
          <p style="font-size: 13px; color: #e5e5e5; margin-bottom: 20px;">
            I like Pokémon! Hence, my website. ;D
          </p>
          <div style="
            display: flex;
            justify-content: space-around;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            margin-bottom: 15px;
          ">
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #f6cf57;">234</p>
              <p style="font-size: 12px; color: #999;">Trainers Caught</p>
            </div>
            <div>
              <p style="font-size: 24px; font-weight: bold; color: #f6cf57;">13</p>
              <p style="font-size: 12px; color: #999;">Communities</p>
            </div>
          </div>
        </div>
      `,
      confirmText: 'Send Message',
      cancelText: 'Close',
      onConfirm: () => {
        toast.success(`Chat with ${contact.name} opened!`);
      }
    });
  }
  
  renderChatConversations() {
    const container = document.querySelector('.contacts-container');
    if (!container) return;
    
    container.innerHTML = `
      <h2 class="font-calps-black contacts-column-title">CHAT CONVERSATIONS</h2>
      <div class="chat-list" style="display: flex; flex-direction: column; gap: 15px;">
        ${this.contacts.filter(c => c.online).slice(0, 6).map(contact => `
          <div class="chat-conversation-item" data-username="${contact.username}" style="
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
            transition: all 0.3s;
          ">
            <img src="images/avatar.png" alt="Avatar" class="avatar">
            <div style="flex: 1;">
              <p class="font-calps-black" style="font-size: 14px; margin-bottom: 3px;">${contact.name}</p>
              <p class="font-calps-extralight" style="font-size: 12px; color: #999;">
                ${this.getLastMessage()}
              </p>
            </div>
            <div style="text-align: right;">
              <span class="online-badge">ONLINE</span>
              <p style="font-size: 11px; color: #999; margin-top: 5px;">2m ago</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Add click handlers
    document.querySelectorAll('.chat-conversation-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      });
      item.addEventListener('click', () => {
        const username = item.dataset.username;
        this.openChat(username);
      });
    });
  }
  
  openChat(username) {
    const contact = this.contacts.find(c => c.username === username);
    if (!contact) return;
    
    modal.show({
      title: `Chat with ${contact.name}`,
      content: `
        <div style="
          height: 300px;
          overflow-y: auto;
          padding: 15px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          margin-bottom: 15px;
        ">
          <p style="text-align: center; color: #999; font-size: 13px; margin-bottom: 20px;">
            Chat simulation - This is a demo
          </p>
          <div style="margin-bottom: 15px;">
            <p style="font-size: 11px; color: #999; margin-bottom: 5px;">${contact.name}</p>
            <div style="
              background: #2e3a4d;
              padding: 10px 15px;
              border-radius: 12px;
              max-width: 70%;
            ">
              <p style="font-size: 13px;">Hey! How's your Pokémon training going?</p>
            </div>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <input type="text" placeholder="Type a message..." style="
            flex: 1;
            padding: 10px 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            color: #e5e5e5;
            font-size: 13px;
          ">
          <button style="
            background: #f6cf57;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
          ">Send</button>
        </div>
      `,
      showCancel: false,
      confirmText: 'Close'
    });
  }
  
  showCreateCommunity() {
    const container = document.querySelector('.contacts-container');
    if (!container) return;
    
    container.innerHTML = `
      <h2 class="font-calps-black contacts-column-title">CREATE COMMUNITY CHAT</h2>
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Community Name</label>
          <input type="text" class="community-name" placeholder="Enter community name..." style="
            width: 100%;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            color: #e5e5e5;
            font-size: 14px;
          ">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Description</label>
          <textarea class="community-desc" placeholder="Describe your community..." style="
            width: 100%;
            padding: 12px 18px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            color: #e5e5e5;
            font-size: 14px;
            min-height: 100px;
            font-family: inherit;
            resize: vertical;
          "></textarea>
        </div>
        
        <div style="margin-bottom: 25px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Privacy</label>
          <select class="community-privacy" style="
            width: 100%;
            padding: 12px 18px;
            background: #2e3a4d;
            border: 1px solid #e5e5e5;
            border-radius: 10px;
            color: #e5e5e5;
            font-size: 14px;
          ">
            <option value="public">Public - Anyone can join</option>
            <option value="private">Private - Invite only</option>
          </select>
        </div>
        
        <button class="create-community-btn" style="
          width: 100%;
          background: #f6cf57;
          color: #000;
          padding: 14px 20px;
          border: none;
          border-radius: 15px;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.3s;
        ">CREATE COMMUNITY</button>
      </div>
    `;
    
    const btn = container.querySelector('.create-community-btn');
    btn.addEventListener('mouseenter', () => btn.style.opacity = '0.8');
    btn.addEventListener('mouseleave', () => btn.style.opacity = '1');
    btn.addEventListener('click', () => this.createCommunity());
  }
  
  createCommunity() {
    const name = document.querySelector('.community-name').value.trim();
    const desc = document.querySelector('.community-desc').value.trim();
    const privacy = document.querySelector('.community-privacy').value;
    
    if (!name) {
      toast.error('Please enter a community name');
      return;
    }
    
    if (!desc) {
      toast.error('Please enter a description');
      return;
    }
    
    toast.success('Community created successfully!');
    
    // Reset form
    document.querySelector('.community-name').value = '';
    document.querySelector('.community-desc').value = '';
    
    // Update stats
    if (this.currentUser.stats) {
      this.currentUser.stats.communitiesJoined = (this.currentUser.stats.communitiesJoined || 0) + 1;
      Storage.set('currentUser', this.currentUser);
    }
  }
  
  getLastMessage() {
    const messages = [
      'That sounds awesome!',
      'Let\'s battle sometime',
      'I just caught a shiny!',
      'Thanks for the help!',
      'See you later!',
      'Great match today'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  getDefaultContacts() {
    const names = [
      { name: 'SOPH', username: 'skziah', online: true },
      { name: 'KingChamp', username: 'reigningsup', online: false },
      { name: 'PrincePami', username: 'ikinuhapkmn', online: true },
      { name: 'Sean ON', username: 'keifferfire', online: true },
      { name: 'emsss1', username: 'emmeor1', online: false },
      { name: 'Larry', username: 'normaltypegym', online: false },
      { name: 'Luminous', username: 'makuhitari', online: true },
      { name: 'PikachuFanOne', username: 'thunderstone', online: true },
      { name: 'Matthew', username: 'berdeisgreen', online: true },
      { name: 'AshKetchup', username: 'pokemonmstr10', online: false },
      { name: 'VaporeonLVR', username: 'lvl100copypasta', online: false },
      { name: 'Admin Poke Ball', username: 'someguynamedadmin', online: false }
    ];
    
    return names;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ContactsPage());
} else {
  new ContactsPage();
}
