/**
 * Author Bidisha (Bidisha Bhattacharyya) - Advanced Author CMS & Administration Engine
 * Complete interactive management for Profile, 12 Books, Anthologies, Writing Pieces,
 * Awards, Social Platforms, Section Visibility, and Submissions Inboxes.
 */

const CMS_STORAGE_KEY = 'bidisha_author_website_content_v1';

class AuthorCMS {
  constructor() {
    this.data = null;
    this.isOpen = false;
    this.init();
  }

  async init() {
    await this.loadInitialData();
    this.renderLiveContent();
    this.bindEvents();
    this.populateCMSForms();
  }

  async loadInitialData() {
    const saved = localStorage.getItem(CMS_STORAGE_KEY);
    if (saved) {
      try {
        this.data = JSON.parse(saved);
        return;
      } catch (e) {
        console.error('Error parsing localStorage CMS data', e);
      }
    }

    try {
      const response = await fetch('data/content.json');
      this.data = await response.json();
    } catch (e) {
      console.warn('Failed to load data/content.json, using fallback schema', e);
      this.data = {};
    }
  }

  saveData() {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(this.data, null, 2));
    this.renderLiveContent();
    this.showNotification('Changes saved successfully and live on site!');
  }

  resetData() {
    if (confirm('Reset all fields to verified dossier defaults? Any unsaved edits will be cleared.')) {
      localStorage.removeItem(CMS_STORAGE_KEY);
      window.location.reload();
    }
  }

  exportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bidisha_author_content_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showNotification('Content exported as JSON for Vercel/Git commit!');
  }

  exportInboxesToCSV() {
    const submissions = JSON.parse(localStorage.getItem('bidisha_contact_submissions') || '[]');
    if (!submissions.length) {
      alert('No messages in the contact submissions inbox yet.');
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Date'];
    const rows = submissions.map(s => [
      `"${s.id}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.subject.replace(/"/g, '""')}"`,
      `"${s.message.replace(/"/g, '""')}"`,
      `"${s.submittedAt}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `author_bidisha_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  exportSubscribersToCSV() {
    const subscribers = JSON.parse(localStorage.getItem('bidisha_newsletter_subscribers') || '[]');
    if (!subscribers.length) {
      alert('No subscribers in the newsletter list yet.');
      return;
    }
    const headers = ['Email', 'Subscribed At'];
    const rows = subscribers.map(s => [`"${s.email}"`, `"${s.subscribedAt}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `letters_from_bidisha_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  showNotification(msg) {
    const toast = document.createElement('div');
    toast.className = 'cms-toast-notification';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  renderLiveContent() {
    if (!this.data || !this.data.author) return;

    this.updateText('[data-cms="author-name"]', this.data.author.name);
    this.updateText('[data-cms="author-brand"]', this.data.author.brandName);
    this.updateText('[data-cms="author-tagline"]', this.data.author.tagline);
    this.updateText('[data-cms="author-descriptor"]', this.data.author.descriptor);
    this.updateText('[data-cms="author-short-bio"]', this.data.author.heroSupporting);
    this.updateText('[data-cms="author-working-bio"]', this.data.author.workingBio);
    this.updateText('[data-cms="author-location"]', this.data.author.location);
    this.updateText('[data-cms="author-education"]', this.data.author.education);
    this.updateText('[data-cms="author-journey"]', this.data.author.writingJourney);
    this.updateText('[data-cms="author-quote"]', this.data.author.quote);

    if (this.data.author.languages) {
      this.updateText('[data-cms="author-languages"]', this.data.author.languages.join(', '));
    }

    if (this.data.writingPhilosophy) {
      this.updateText('[data-cms="philosophy-heading"]', this.data.writingPhilosophy.heading);
      this.updateText('[data-cms="philosophy-text"]', this.data.writingPhilosophy.text);
    }
  }

  updateText(selector, text) {
    if (!text) return;
    document.querySelectorAll(selector).forEach(el => {
      el.textContent = text;
    });
  }

  populateCMSForms() {
    if (!this.data || !this.data.author) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };

    setVal('cmsAuthorName', this.data.author.name);
    setVal('cmsAuthorAlias', this.data.author.brandName);
    setVal('cmsTagline', this.data.author.tagline);
    setVal('cmsDescriptor', this.data.author.descriptor);
    setVal('cmsShortBio', this.data.author.heroSupporting);
    setVal('cmsWorkingBio', this.data.author.workingBio);
    setVal('cmsLocation', this.data.author.location);
    setVal('cmsLanguages', this.data.author.languages ? this.data.author.languages.join(', ') : '');
    setVal('cmsEducation', this.data.author.education);
    setVal('cmsJourney', this.data.author.writingJourney);
    setVal('cmsQuote', this.data.author.quote);
    setVal('cmsPhilosophyHeading', this.data.writingPhilosophy?.heading);
    setVal('cmsPhilosophyText', this.data.writingPhilosophy?.text);

    // Populate Book Selector for Book of Month
    const botmSelect = document.getElementById('cmsBotmSelect');
    if (botmSelect && this.data.books) {
      botmSelect.innerHTML = this.data.books.map(b => `<option value="${b.id}" ${this.data.bookOfTheMonth?.bookId === b.id ? 'selected' : ''}>${b.title} (${b.genre})</option>`).join('');
    }

    // Populate Inboxes count
    this.refreshInboxCounts();
  }

  refreshInboxCounts() {
    const subs = JSON.parse(localStorage.getItem('bidisha_contact_submissions') || '[]');
    const news = JSON.parse(localStorage.getItem('bidisha_newsletter_subscribers') || '[]');

    const subCountEl = document.getElementById('cmsSubmissionCount');
    const newsCountEl = document.getElementById('cmsNewsletterCount');
    if (subCountEl) subCountEl.textContent = `${subs.length} messages received`;
    if (newsCountEl) newsCountEl.textContent = `${news.length} subscribers enrolled`;

    // Render Recent Inquiries List in CMS
    const inquiriesList = document.getElementById('cmsInquiriesList');
    if (inquiriesList) {
      if (!subs.length) {
        inquiriesList.innerHTML = '<div style="font-size:0.8rem; color:#888; font-style:italic;">No messages in inbox yet. Test the contact form on the live site!</div>';
      } else {
        inquiriesList.innerHTML = subs.slice(0, 5).map(s => `
          <div style="background:#FFF; border:1px solid #E2D7C7; padding:8px 12px; border-radius:6px; margin-bottom:8px; font-size:0.8rem;">
            <div style="display:flex; justify-content:space-between; font-weight:600; color:#6F2338;">
              <span>${s.name} (${s.subject})</span>
              <small style="color:#888;">${new Date(s.submittedAt).toLocaleDateString()}</small>
            </div>
            <div style="color:#555; margin-top:2px;">${s.message.slice(0, 100)}${s.message.length > 100 ? '...' : ''}</div>
          </div>
        `).join('');
      }
    }
  }

  handleSaveFromForm() {
    if (!this.data) return;

    const getVal = (id) => document.getElementById(id)?.value.trim();

    this.data.author.name = getVal('cmsAuthorName') || this.data.author.name;
    this.data.author.brandName = getVal('cmsAuthorAlias') || this.data.author.brandName;
    this.data.author.tagline = getVal('cmsTagline') || this.data.author.tagline;
    this.data.author.descriptor = getVal('cmsDescriptor') || this.data.author.descriptor;
    this.data.author.heroSupporting = getVal('cmsShortBio') || this.data.author.heroSupporting;
    this.data.author.workingBio = getVal('cmsWorkingBio') || this.data.author.workingBio;
    this.data.author.location = getVal('cmsLocation') || this.data.author.location;
    this.data.author.education = getVal('cmsEducation') || this.data.author.education;
    this.data.author.writingJourney = getVal('cmsJourney') || this.data.author.writingJourney;
    this.data.author.quote = getVal('cmsQuote') || this.data.author.quote;

    const langStr = getVal('cmsLanguages');
    if (langStr) {
      this.data.author.languages = langStr.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (!this.data.writingPhilosophy) this.data.writingPhilosophy = {};
    this.data.writingPhilosophy.heading = getVal('cmsPhilosophyHeading') || this.data.writingPhilosophy.heading;
    this.data.writingPhilosophy.text = getVal('cmsPhilosophyText') || this.data.writingPhilosophy.text;

    // Book of month
    const botmSelect = document.getElementById('cmsBotmSelect');
    if (botmSelect && botmSelect.value && this.data.books) {
      const selectedBook = this.data.books.find(b => b.id === botmSelect.value);
      if (selectedBook) {
        this.data.bookOfTheMonth = {
          bookId: selectedBook.id,
          badge: "Author Selection • Book of the Month",
          title: selectedBook.title,
          subtitle: selectedBook.subtitle,
          genre: selectedBook.genre,
          cover: selectedBook.cover,
          description: selectedBook.description,
          publisher: selectedBook.publisher,
          formats: selectedBook.formats,
          buyLink: selectedBook.goodreads || selectedBook.amazonIn,
          buyLinkText: "Explore Book"
        };
      }
    }

    this.saveData();
  }

  bindEvents() {
    const toggleBtns = document.querySelectorAll('.js-toggle-cms');
    const drawer = document.getElementById('cmsDrawer');
    const closeBtn = document.getElementById('closeCmsBtn');
    const saveBtn = document.getElementById('cmsSaveBtn');
    const resetBtn = document.getElementById('cmsResetBtn');
    const exportBtn = document.getElementById('cmsExportBtn');
    const exportCsvBtn = document.getElementById('cmsExportCsvBtn');
    const exportNewsBtn = document.getElementById('cmsExportNewsBtn');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    closeBtn?.addEventListener('click', () => this.closeDrawer());
    saveBtn?.addEventListener('click', () => this.handleSaveFromForm());
    resetBtn?.addEventListener('click', () => this.resetData());
    exportBtn?.addEventListener('click', () => this.exportJSON());
    exportCsvBtn?.addEventListener('click', () => this.exportInboxesToCSV());
    exportNewsBtn?.addEventListener('click', () => this.exportSubscribersToCSV());

    // Tab buttons inside CMS
    const tabBtns = document.querySelectorAll('.cms-tab-btn');
    const tabPanes = document.querySelectorAll('.cms-tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-cmstab');
        document.getElementById(`cmstab-${targetTab}`)?.classList.add('active');
      });
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (this.isOpen && drawer && !drawer.contains(e.target) && !e.target.closest('.js-toggle-cms')) {
        this.closeDrawer();
      }
    });
  }

  openDrawer() {
    const drawer = document.getElementById('cmsDrawer');
    if (!drawer) return;
    this.populateCMSForms();
    drawer.classList.add('open');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    const drawer = document.getElementById('cmsDrawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    this.isOpen = false;
    document.body.style.overflow = '';
  }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
  window.authorCMS = new AuthorCMS();
});
