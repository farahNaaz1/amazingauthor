/**
 * Author Bidisha (Bidisha Bhattacharyya) - Main Website Core Engine
 * Manages Reading progress, sticky navigation, mobile menu, dynamic catalogue filtering,
 * Book detail modals, Distraction-free reader, Author's Desk interactivity,
 * Contact form persistence, Newsletter subscribers, and Deep Hash Routing.
 */

let siteContent = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadSiteContent();
  initReadingProgressBar();
  initHeaderScroll();
  initMobileMenu();
  initBooksFilter();
  initWritingTabs();
  initModals();
  initAuthorsDesk();
  initContactForm();
  initNewsletterForm();
  initMediaKitModal();
  initHashRouting();
});

/* --------------------------------------------------------------------------
   Load Content JSON (localStorage overrides default content.json)
   -------------------------------------------------------------------------- */
async function loadSiteContent() {
  const CMS_STORAGE_KEY = 'bidisha_author_website_content_v1';
  const saved = localStorage.getItem(CMS_STORAGE_KEY);
  if (saved) {
    try {
      siteContent = JSON.parse(saved);
      return;
    } catch (e) {
      console.warn('Error reading saved content, loading default', e);
    }
  }

  try {
    const res = await fetch('data/content.json');
    siteContent = await res.json();
  } catch (err) {
    console.error('Failed to load data/content.json', err);
  }
}

/* --------------------------------------------------------------------------
   Reading Progress Bar
   -------------------------------------------------------------------------- */
function initReadingProgressBar() {
  const progressBar = document.getElementById('readingProgressBar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   Header Sticky & Active Link Highlight
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    let currentId = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   Mobile Navigation Toggle
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* --------------------------------------------------------------------------
   Books Filter by Genre
   -------------------------------------------------------------------------- */
function initBooksFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const bookCards = document.querySelectorAll('.book-card');

  if (!filterBtns.length || !bookCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter') || 'all';

      bookCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || category.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Writing & Poetry Tabs
   -------------------------------------------------------------------------- */
function initWritingTabs() {
  const tabBtns = document.querySelectorAll('.writing-tab-btn');
  const writingCards = document.querySelectorAll('.writing-card');

  if (!tabBtns.length || !writingCards.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-tab') || 'all';

      writingCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Modals: Reading Modal & Book Detail Modal
   -------------------------------------------------------------------------- */
function initModals() {
  // Reading Modal
  const readingModal = document.getElementById('readingModal');
  const modalClose = document.getElementById('modalClose');

  window.openReadingModal = function(title, tag, readingTime, fullText) {
    if (!readingModal) return;
    const modalTitle = document.getElementById('modalTitle');
    const modalTag = document.getElementById('modalTag');
    const modalTime = document.getElementById('modalReadingTime');
    const modalBody = document.getElementById('modalBody');

    if (modalTitle) modalTitle.textContent = title;
    if (modalTag) modalTag.textContent = tag;
    if (modalTime) modalTime.textContent = readingTime || '2 min read';
    if (modalBody) {
      modalBody.textContent = fullText;
    }
    readingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeReadingModal = function() {
    if (!readingModal) return;
    readingModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  modalClose?.addEventListener('click', window.closeReadingModal);
  readingModal?.addEventListener('click', (e) => {
    if (e.target === readingModal) window.closeReadingModal();
  });

  // Book Detail Modal
  const bookModal = document.getElementById('bookDetailModal');
  const bookModalClose = document.getElementById('bookModalClose');

  window.openBookDetailModal = function(bookId) {
    if (!bookModal || !siteContent || !siteContent.books) return;
    const book = siteContent.books.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('bookModalCover').src = book.cover;
    document.getElementById('bookModalCover').alt = `Cover of ${book.title}`;
    document.getElementById('bookModalTitle').textContent = book.title;
    document.getElementById('bookModalSubtitle').textContent = book.subtitle || '';
    document.getElementById('bookModalGenre').textContent = book.genre;
    document.getElementById('bookModalDesc').textContent = book.description;
    document.getElementById('bookModalSynopsis').textContent = book.synopsis || book.description;
    
    document.getElementById('bookModalPublisher').textContent = book.publisher || 'Independent / KDP';
    document.getElementById('bookModalYear').textContent = book.publishedYear || 'Catalogued';
    document.getElementById('bookModalISBN').textContent = book.isbn || 'Pending Confirmation';
    document.getElementById('bookModalFormat').textContent = book.formats || 'Paperback & eBook';

    // Purchase links
    const buyAmazonIn = document.getElementById('bookModalAmazonIn');
    const buyAmazonGlobal = document.getElementById('bookModalAmazonGlobal');
    const buyGoodreads = document.getElementById('bookModalGoodreads');
    const buyAbeBooks = document.getElementById('bookModalAbeBooks');

    if (buyAmazonIn) buyAmazonIn.href = book.amazonIn || 'https://www.amazon.in/stores/Bidisha-Bhattacharyya/author/B09RJ2937Z';
    if (buyAmazonGlobal) buyAmazonGlobal.href = book.amazonGlobal || 'https://www.amazon.com/stores/Bidisha-Bhattacharyya/author/B09RJ2937Z';
    if (buyGoodreads) buyGoodreads.href = book.goodreads || 'https://www.goodreads.com/author/show/20521078.Bidisha_Bhattacharyya';
    if (buyAbeBooks) buyAbeBooks.href = book.abebooks || 'https://www.abebooks.co.uk/author/b09rj2937z/bidisha-bhattacharyya';

    bookModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeBookDetailModal = function() {
    if (!bookModal) return;
    bookModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  bookModalClose?.addEventListener('click', window.closeBookDetailModal);
  bookModal?.addEventListener('click', (e) => {
    if (e.target === bookModal) window.closeBookDetailModal();
  });

  // Global ESC Key Handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeReadingModal();
      window.closeBookDetailModal();
      window.closeMediaKitModal?.();
    }
  });
}

/* --------------------------------------------------------------------------
   Feature A: The Author's Desk Interactivity
   -------------------------------------------------------------------------- */
function initAuthorsDesk() {
  const pills = document.querySelectorAll('.desk-item-pill');
  const detailBox = document.getElementById('deskActiveDetail');
  const deskSvg = document.getElementById('deskSvgIllustration');

  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const name = pill.getAttribute('data-name');
      const detail = pill.getAttribute('data-detail');

      if (detailBox) {
        detailBox.innerHTML = `<strong>${name}:</strong> ${detail}`;
        detailBox.style.animation = 'none';
        detailBox.offsetHeight; // trigger reflow
        detailBox.style.animation = 'fadeIn 0.3s ease';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Feature F: Author Media Kit Modal & Printable Press Kit
   -------------------------------------------------------------------------- */
function initMediaKitModal() {
  const modal = document.getElementById('mediaKitModal');
  const closeBtn = document.getElementById('closeMediaKitBtn');
  const printBtn = document.getElementById('printMediaKitBtn');

  window.openMediaKitModal = function() {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeMediaKitModal = function() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', window.closeMediaKitModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) window.closeMediaKitModal();
  });

  printBtn?.addEventListener('click', () => {
    window.print();
  });
}

/* --------------------------------------------------------------------------
   Contact Form Handler with LocalStorage Persistence
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('authorContactForm');
  const statusMsg = document.getElementById('contactFormStatus');

  if (!form) return;

  // Discuss Project pre-selection trigger
  window.triggerProjectInquiry = function() {
    const subjectSelect = document.getElementById('contactSubject');
    if (subjectSelect) {
      subjectSelect.value = 'Professional Project';
    }
    const connectSection = document.getElementById('connect');
    connectSection?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('contactName')?.focus();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const subject = document.getElementById('contactSubject')?.value;
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !message) {
      alert('Please complete all required fields.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending Dispatch...';
    }

    // Persist to localStorage inbox
    const newSubmission = {
      id: 'sub_' + Date.now(),
      name,
      email,
      subject,
      message,
      submittedAt: new Date().toISOString()
    };

    try {
      const stored = JSON.parse(localStorage.getItem('bidisha_contact_submissions') || '[]');
      stored.unshift(newSubmission);
      localStorage.setItem('bidisha_contact_submissions', JSON.stringify(stored));
    } catch (err) {
      console.warn('Storage save failed', err);
    }

    setTimeout(() => {
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Dispatch to Bidisha</span>';
      }
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.classList.add('success');
        statusMsg.innerHTML = `<strong>Dispatch Received!</strong> Thank you, <em>${name}</em>. Your message regarding "<em>${subject}</em>" has been logged in our system. Author Bidisha or her literary representation will respond to <em>${email}</em> promptly.`;
        setTimeout(() => {
          statusMsg.style.display = 'none';
          statusMsg.classList.remove('success');
        }, 9000);
      }
    }, 800);
  });
}

/* --------------------------------------------------------------------------
   Newsletter Form with LocalStorage Persistence
   -------------------------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    const consent = form.querySelector('.newsletter-consent');

    if (!input || !input.value) return;
    if (consent && !consent.checked) {
      alert('Please check the consent box to receive literary dispatches.');
      return;
    }

    const email = input.value.trim();
    const button = form.querySelector('.newsletter-btn');
    if (button) {
      button.textContent = 'Subscribed!';
      button.style.backgroundColor = '#6F2338';
      button.style.color = '#FFFFFF';
    }

    // Persist subscriber
    try {
      const subscribers = JSON.parse(localStorage.getItem('bidisha_newsletter_subscribers') || '[]');
      if (!subscribers.find(s => s.email === email)) {
        subscribers.unshift({ email, subscribedAt: new Date().toISOString() });
        localStorage.setItem('bidisha_newsletter_subscribers', JSON.stringify(subscribers));
      }
    } catch (err) {
      console.warn('Subscriber save failed', err);
    }

    setTimeout(() => {
      alert(`Welcome to Letters From Bidisha! A confirmation dispatch has been prepared for ${email}.`);
      input.value = '';
      if (consent) consent.checked = false;
      if (button) {
        button.textContent = 'Subscribe';
        button.style.backgroundColor = '';
        button.style.color = '';
      }
    }, 600);
  });
}

/* --------------------------------------------------------------------------
   Deep Hash Routing
   Supports: #book/<id> and #read/<sample-id>
   -------------------------------------------------------------------------- */
function initHashRouting() {
  function handleHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#book/')) {
      const bookId = hash.replace('#book/', '');
      window.openBookDetailModal(bookId);
    } else if (hash.startsWith('#read/')) {
      const sampleId = hash.replace('#read/', '');
      if (siteContent && siteContent.writingSamples) {
        const sample = siteContent.writingSamples.find(s => s.id === sampleId);
        if (sample) {
          window.openReadingModal(sample.title, sample.categoryName, sample.readingTime, sample.fullText);
        }
      }
    }
  }

  window.addEventListener('hashchange', handleHash);
  // Check on initial load
  setTimeout(handleHash, 200);
}
