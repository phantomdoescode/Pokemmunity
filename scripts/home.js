// Home page functionality

class HomePage {
  constructor() {
    this.currentUser = Storage.get('currentUser');
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return;
    }

    // Always reset posts on refresh
    Storage.remove('posts'); // clears any previously saved posts
    this.posts = this.getDefaultPosts(); // load original default feed
    this.useStaticFeed = false;

    this.init();
  }
  
  init() {
    this.initCreatePost();
    this.initSearch();
    this.renderPosts();
    this.initTrainerSuggestions();
    this.initInfiniteScroll();
    this.updateRelativeTimes();
  }
  
  initCreatePost() {
    const createPostInput = document.querySelector('.create-post-input');
    const postButton = document.querySelector('.post-button');
    const photoButton = document.querySelector('.post-action-item:nth-child(2)');

    if (!createPostInput || !postButton) return;

    // Store globally inside the instance
    this.selectedImage = null;
    this.imagePreview = null;

    // Photo upload
    if (photoButton) {
      photoButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              this.selectedImage = event.target.result;
              this.showImagePreview(this.selectedImage);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      });
    }

    // Character counter
    const maxChars = 500;
    const counter = document.createElement('div');
    counter.style.cssText = `
      font-size: 12px;
      color: #999;
      text-align: right;
      margin-top: 5px;
      display: none;
    `;
    createPostInput.parentNode.appendChild(counter);

    createPostInput.addEventListener('input', () => {
      const length = createPostInput.value.length;
      if (length > 0) {
        counter.style.display = 'block';
        counter.textContent = `${length}/${maxChars}`;
        counter.style.color = length > maxChars ? '#ff3f3f' : '#999';
      } else {
        counter.style.display = 'none';
      }
    });

    // Post button
    postButton.addEventListener('click', () => {
      const content = createPostInput.value.trim();

      if (!content && !this.selectedImage) {
        toast.warning('Please write something or add an image');
        return;
      }

      if (content.length > maxChars) {
        toast.error(`Post is too long! Maximum ${maxChars} characters.`);
        return;
      }

      // Create the post
      this.createPost(content, this.selectedImage);

      // Reset fields
      createPostInput.value = '';
      this.selectedImage = null;
      counter.style.display = 'none';

      // Remove preview if exists
      if (this.imagePreview) {
        this.imagePreview.remove();
        this.imagePreview = null;
      }
    });
  }
  
  showImagePreview(imageSrc) {
    const createPost = document.querySelector('.create-post');

    if (this.imagePreview) {
      this.imagePreview.remove();
      this.imagePreview = null;
    }

    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.style.cssText = `
      position: relative;
      margin-top: 15px;
      border-radius: 12px;
      overflow: hidden;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    // Make image responsive & view full height automatically
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Preview';
    img.style.cssText = `
      width: 100%;
      height: auto;
      display: block;
      border-radius: 12px;
      object-fit: contain;
      background-color: #000;
    `;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image';
    removeBtn.innerHTML = '×';
    removeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
      width: 32px;
      height: 32px;
      font-size: 20px;
      font-weight: bold;
      color: white;
      background: rgba(0,0,0,0.6);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      box-sizing: border-box;
      transition: background 0.2s, transform 0.15s;
    `;

    removeBtn.addEventListener('mouseenter', () => {
      removeBtn.style.background = 'rgba(255, 0, 0, 0.8)';
      removeBtn.style.transform = 'scale(1.1)';
    });
    removeBtn.addEventListener('mouseleave', () => {
      removeBtn.style.background = 'rgba(0,0,0,0.6)';
      removeBtn.style.transform = 'scale(1)';
    });

    // Remove image event
    removeBtn.addEventListener('click', () => {
      preview.remove();
      this.selectedImage = null;
      this.imagePreview = null;
    });

    preview.appendChild(img);
    preview.appendChild(removeBtn);
    createPost.appendChild(preview);

    // Save reference
    this.imagePreview = preview;
  }

  
  createPost(content, image = null) {
    if (!Array.isArray(this.posts)) {
      this.posts = this.getDefaultPosts();
      this.useStaticFeed = false;
    }
    
    const newPost = {
      id: generateId(),
      author: this.currentUser.displayName || this.currentUser.username,
      content,
      image,
      timestamp: Date.now(),
      likes: 0,
      comments: 0,
      liked: false,
      likedBy: []
    };
    
    this.posts.unshift(newPost);
    Storage.set('posts', this.posts);
    
    // Award post badge
    if (!this.currentUser.badges.includes('post')) {
      this.currentUser.badges.push('post');
      Storage.set('currentUser', this.currentUser);
      setTimeout(() => {
        SoundManager.playBadgeUnlock();
        toast.success('🏅 Badge Unlocked: POST BADGE!', 5000);
      }, 500);
    }
    
    this.renderPosts();
    toast.success('Post created successfully!');
    
    // Scroll to new post
    setTimeout(() => {
      const firstPost = document.querySelector('.post-card');
      if (firstPost) {
        smoothScrollTo(firstPost, 500);
      }
    }, 100);
  }
  
  renderPosts() {
    const feed = document.querySelector('.home-feed');
    if (!feed) return;

    if (this.useStaticFeed) {
      return;
    }
    
    // Get existing posts
    const existingPosts = Array.from(feed.querySelectorAll('.post-card'));
    
    // Clear posts (keep header and create post)
    existingPosts.forEach(post => post.remove());
    
    // Render all posts
    this.posts.forEach((post, index) => {
      const postElement = this.createPostElement(post);
      feed.appendChild(postElement);
      
      // Fade in animation
      setTimeout(() => {
        postElement.style.opacity = '1';
        postElement.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }
  
  createPostElement(post) {
    const article = document.createElement('div');
    article.className = 'post-card card';
    article.dataset.postId = post.id;
    article.style.cssText = 'opacity: 0; transform: translateY(20px); transition: all 0.3s;';
    
    article.innerHTML = `
      <div class="post-header">
        <img src="images/avatar.png" alt="${post.author} Avatar" class="avatar trainer-avatar">
        <div>
          <p class="font-calps-black post-author-name">${post.author}</p>
          <p class="font-calps-extralight post-time" data-timestamp="${post.timestamp}">${getRelativeTime(post.timestamp)}</p>
        </div>
        ${post.author === this.currentUser.displayName ? `
          <button class="delete-post" style="
            margin-left: auto;
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 20px;
            padding: 5px;
          ">🗑️</button>
        ` : ''}
      </div>
      
      ${post.content ? `<p class="font-calps-regular post-content">${post.content}</p>` : ''}
      
      ${post.image ? `
        <div class="post-image-container">
          <img src="${post.image}" alt="Post image" class="post-image">
        </div>
      ` : ''}
      
      <div class="post-divider"></div>
      
      <div class="post-actions">
        <div class="post-action-button like-button" data-post-id="${post.id}">
          <div class="post-action-icon-circle" style="background-color: ${post.liked ? '#ff1493' : '#666'}">
            <img src="images/liked_false.png" alt="Like" class="post-action-emoji">
          </div>
          <span class="font-calps-regular post-action-count">${post.likes}</span>
        </div>
        <div class="post-action-button comment-button">
          <div class="post-action-icon-square">
            <img src="images/comments.png" alt="Comment" class="post-action-emoji">
          </div>
          <span class="font-calps-regular post-action-count">${post.comments}</span>
        </div>
        <div class="post-share-button" data-post-id="${post.id}">
          <img src="images/share.png" alt="Share" class="post-share-icon">
        </div>
      </div>
    `;
    
    // Like button
    const likeBtn = article.querySelector('.like-button');
    likeBtn.addEventListener('click', () => this.toggleLike(post.id));
    
    // Double click to like
    const content = article.querySelector('.post-content, .post-image-container');
    if (content) {
      content.addEventListener('dblclick', () => this.toggleLike(post.id));
    }
    
    // Delete button
    const deleteBtn = article.querySelector('.delete-post');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deletePost(post.id));
    }
    
    // Share button
    const shareBtn = article.querySelector('.post-share-button');
    shareBtn.addEventListener('click', () => this.sharePost(post));
    
    return article;
  }
  
  toggleLike(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
    
    // Play sound
    if (post.liked) {
      SoundManager.playSuccess();
    } else {
      SoundManager.playClick();
    }
    
    Storage.set('posts', this.posts);
    this.updatePostLike(postId, post.liked, post.likes);
  }
  
  updatePostLike(postId, liked, count) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    const likeBtn = postElement.querySelector('.like-button');
    const iconCircle = likeBtn.querySelector('.post-action-icon-circle');
    const countSpan = likeBtn.querySelector('.post-action-count');
    const icon = iconCircle.querySelector('img');
    
    // Animate
    iconCircle.style.transform = 'scale(1.3)';
    setTimeout(() => {
      iconCircle.style.backgroundColor = liked ? '#ff1493' : '#666';
      icon.src = liked ? 'images/liked_true.png' : 'images/liked_false.png';
      countSpan.textContent = count;
      iconCircle.style.transform = 'scale(1)';
    }, 150);
    
    iconCircle.style.transition = 'transform 0.3s, background-color 0.3s';
  }
  
  async deletePost(postId) {
    const confirmed = await modal.confirm({
      title: 'Delete Post',
      content: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });
    
    if (confirmed) {
      this.posts = this.posts.filter(p => p.id !== postId);
      Storage.set('posts', this.posts);
      
      const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`);
      if (postElement) {
        postElement.style.opacity = '0';
        postElement.style.transform = 'translateX(-100%)';
        setTimeout(() => postElement.remove(), 300);
      }
      
      toast.success('Post deleted');
    }
  }
  
  sharePost(post) {
    const shareText = `Check out this post on POKEMMUNITY: "${post.content.substring(0, 100)}..."`;
    
    if (navigator.share) {
      navigator.share({
        title: 'POKEMMUNITY Post',
        text: shareText
      }).catch(() => {});
    } else {
      copyToClipboard(shareText);
      toast.success('Post link copied to clipboard!');
    }
  }
  
  initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    const debouncedSearch = debounce((query) => {
      console.log('Searching for:', query);
      // In a real app, this would filter trainer suggestions
      toast.info(`Searching for: ${query}`);
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        debouncedSearch(query);
      }
    });
  }
  
  initTrainerSuggestions() {
    const catchButtons = document.querySelectorAll('.catch-button');
    
    catchButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundManager.playCatch();
        btn.textContent = 'REQUESTED';
        btn.className = 'requested-button';
        btn.disabled = true;
        toast.success('Trainer request sent!');
        
        // Award catcher badge on first catch
        if (!this.currentUser.badges.includes('catcher')) {
          this.currentUser.badges.push('catcher');
          Storage.set('currentUser', this.currentUser);
          setTimeout(() => {
            SoundManager.playBadgeUnlock();
            toast.success('🏅 Badge Unlocked: CATCHER BADGE!', 5000);
          }, 500);
        }
      });
    });
  }
  
  initInfiniteScroll() {
    let loading = false;
    
    const handleScroll = throttle(() => {
      if (loading) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        // Load more posts (mock)
        console.log('Load more posts...');
      }
    }, 200);
    
    window.addEventListener('scroll', handleScroll);
  }
  
  updateRelativeTimes() {
    setInterval(() => {
      document.querySelectorAll('.post-time[data-timestamp]').forEach(el => {
        const timestamp = parseInt(el.dataset.timestamp);
        el.textContent = getRelativeTime(timestamp);
      });
    }, 60000); // Update every minute
  }
  
  getDefaultPosts() {
    const now = Date.now();
    return [
      {
        id: 'post1',
        author: 'Phantom',
        content: 'Who do you prefer from these three cuties? Need suggestions!',
        image: 'images/post.png',
        timestamp: now - 3600000,
        likes: 132,
        comments: 221,
        liked: false,
        likedBy: []
      },
      {
        id: 'post2',
        author: 'Luminous',
        content: 'Well. I am on my way for greatness! Lets do this!',
        image: 'images/post2.jpg',
        timestamp: now - 10800000,
        likes: 326,
        comments: 16,
        liked: false,
        likedBy: []
      },
      {
        id: 'post3',
        author: 'DragomancerGirl',
        content: 'Greetings! Welcome to the world of POKÉMON! My name is OAK! People call me the POKÉMON prof! This world is inhabited by creatures called POKÉMON! For some people, POKÉMON are pets. Others use them for fights. Myself...I study POKÉMON as a profession. First, what is your name? Right! So your name is RED! This is my grand-son. He\'s been your rival since you were a baby. ...Erm, what is his name again? That\'s right! I remember now! His name is BLUE! RED! Your very own POKÉMON legend is about to unfold! A world of dreams and adventures with POKÉMON awaits! Let\'s go!~ I like this quote so much because it\'s forever memorable',
        timestamp: now - 18000000,
        likes: 369,
        comments: 14,
        liked: false,
        likedBy: []
      },
      {
        id: 'post4',
        author: 'DragonairsMasterGamer',
        content: 'Gen 1 - Aerodactyl\nGen 2 - Kingdra\nGen 3 - Blaziken\nMy GOATS WAHAHAHAHAH',
        timestamp: now - 25200000,
        likes: 256,
        comments: 16,
        liked: false,
        likedBy: []
      }
    ];
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new HomePage());
} else {
  new HomePage();
}