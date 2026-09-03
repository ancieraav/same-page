/**
 * Same Page - Minimalist & Airy Interaction Scripts
 * Zero Emojis, Clean Vector Feedback, Eye-Level OTP, Live Preview & Role Builder
 */

// ==========================================
// 1. Toast Notification Manager (Zero Emojis, Pure SVG)
// ==========================================
// 1. Toast Notification Manager (Top Center: Green Success, Red Error)
// ==========================================
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const isError = (type === 'error' || type === 'fail' || type === 'danger');
  const toast = document.createElement('div');
  toast.className = `toast-message ${isError ? 'toast-error' : 'toast-success'}`;

  const iconSvg = isError ? `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ` : `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-12px) scale(0.95)';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 250);
  }, 2800);
}

// Global Markdown Renderer
function renderMarkdown(md) {
  if (!md || !md.trim()) {
    return '<div class="preview-empty-state">Nothing to preview yet. Switch to Write mode to draft your thoughts.</div>';
  }

  // Safe HTML escape
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Safe formatting tags
  html = html
    .replace(/&lt;u&gt;/gi, '<u class="rendered-underline">')
    .replace(/&lt;\/u&gt;/gi, '</u>')
    .replace(/&lt;b&gt;/gi, '<strong>')
    .replace(/&lt;\/b&gt;/gi, '</strong>')
    .replace(/&lt;i&gt;/gi, '<em>')
    .replace(/&lt;\/i&gt;/gi, '</em>')
    .replace(/&lt;s&gt;/gi, '<del>')
    .replace(/&lt;\/s&gt;/gi, '</del>');

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="rendered-code">$1</code>');

  // Bold: **text** or __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Strikethrough: ~~text~~
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Italic: *text* or _text_
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  html = html.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');

  // Line-by-line block processing (lists, quotes, paragraphs)
  const lines = html.split('\n');
  const out = [];
  let inList = false;
  let inQuote = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Blockquote: starts with &gt;
    if (/^&gt;\s*(.*)/.test(trimmed)) {
      const quoteText = trimmed.replace(/^&gt;\s*/, '');
      if (!inQuote) {
        out.push('<blockquote class="rendered-quote">');
        inQuote = true;
      }
      out.push('<p>' + quoteText + '</p>');
      continue;
    } else if (inQuote) {
      out.push('</blockquote>');
      inQuote = false;
    }

    // Bullet list: starts with - or *
    if (/^[-*]\s+(.*)/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      if (!inList) {
        out.push('<ul class="rendered-list">');
        inList = true;
      }
      out.push('<li>' + itemText + '</li>');
      continue;
    } else if (inList) {
      out.push('</ul>');
      inList = false;
    }

    if (trimmed === '') {
      out.push('<div class="rendered-spacer"></div>');
    } else {
      out.push('<p class="rendered-p">' + rawLine + '</p>');
    }
  }

  if (inList) out.push('</ul>');
  if (inQuote) out.push('</blockquote>');

  return out.join('');
}
window.renderMarkdown = renderMarkdown;

// ==========================================
// 2. Join Page Logic (Eye-Level OTP Code Inputs)
// ==========================================
function initJoinPage() {
  const codeInputs = document.querySelectorAll('.code-box');
  if (!codeInputs.length) return;

  // Handle keyboard inputs & navigation
  codeInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      e.target.value = val ? val.slice(-1) : '';

      if (e.target.value) {
        input.classList.add('filled');
        if (index < codeInputs.length - 1) {
          codeInputs[index + 1].focus();
        }
      } else {
        input.classList.remove('filled');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!input.value && index > 0) {
          codeInputs[index - 1].focus();
          codeInputs[index - 1].value = '';
          codeInputs[index - 1].classList.remove('filled');
        } else {
          input.value = '';
          input.classList.remove('filled');
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        codeInputs[index - 1].focus();
      } else if (e.key === 'ArrowRight' && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      } else if (e.key === 'Enter') {
        const btnJoin = document.getElementById('btn-join-room');
        if (btnJoin) btnJoin.click();
      }
    });

    // Paste handling across all 7 boxes
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteText = (e.clipboardData || window.clipboardData)
        .getData('text')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();

      if (!pasteText) return;

      for (let i = 0; i < codeInputs.length; i++) {
        if (pasteText[i]) {
          codeInputs[i].value = pasteText[i];
          codeInputs[i].classList.add('filled');
        }
      }

      const nextFocus = Math.min(pasteText.length, codeInputs.length - 1);
      codeInputs[nextFocus].focus();
      showToast('Room code pasted');
    });
  });

  // Paste Action Button
  const btnPaste = document.getElementById('btn-paste-code');
  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        const clean = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (clean) {
          clean.split('').slice(0, 7).forEach((char, i) => {
            if (codeInputs[i]) {
              codeInputs[i].value = char;
              codeInputs[i].classList.add('filled');
            }
          });
          codeInputs[Math.min(clean.length, 6)].focus();
          showToast('Code pasted from clipboard', 'success');
        } else {
          showToast('No valid code found in clipboard', 'error');
        }
      } catch (err) {
        showToast('Clipboard permission was not granted', 'error');
      }
    });
  }


  // Join Action
  const btnJoin = document.getElementById('btn-join-room');
  if (btnJoin) {
    btnJoin.addEventListener('click', () => {
      let code = '';
      codeInputs.forEach(input => code += input.value.trim());

      if (code.length < 7) {
        showToast('Please enter all 7 characters', 'error');
        const card = document.querySelector('.eye-level-card');
        card.style.animation = 'none';
        card.offsetHeight;
        card.style.animation = 'shakeCard 0.35s ease';
        return;
      }

      showToast(`Joining room ${code}...`, 'success');
      btnJoin.innerHTML = `<span>Connecting...</span>`;
      btnJoin.style.pointerEvents = 'none';

      setTimeout(() => {
        window.location.href = `join.html?code=${encodeURIComponent(code)}`;
      }, 500);
    });
  }
}

// ==========================================
// 3. Create Room Page Logic (Zero Emojis, Live Preview)
// ==========================================
function initCreatePage() {
  const form = document.getElementById('create-room-form');
  if (!form) return;

  const state = {
    name: 'Design Alignment Sync',
    topic: 'Product Strategy',
    attachments: [],
    participantMode: 'flexible',
    participantCount: 10,
    useGroups: true,
    groups: [
      {
        id: 1,
        name: 'Leadership',
        isSourceOfTruth: true,
        roles: ['Decision Maker', 'Facilitator']
      },
      {
        id: 2,
        name: 'Engineering & Product',
        isSourceOfTruth: false,
        roles: ['Lead Architect', 'Reviewer']
      }
    ]
  };

  // Preview elements
  const previewName = document.getElementById('preview-room-name');
  const previewTopic = document.getElementById('preview-topic');
  const previewCapacity = document.getElementById('preview-capacity');
  const previewMemes = document.getElementById('preview-memes');
  const previewRolesCount = document.getElementById('preview-roles-count');
  const previewRolesTags = document.getElementById('preview-roles-tags');
  const previewCodeVal = document.getElementById('preview-code-val');

  // Random room code generator for preview
  if (previewCodeVal) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SP-';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    previewCodeVal.innerText = code;
  }

  function updatePreview() {
    if (previewName) previewName.innerText = state.name || 'Untitled Session';
    if (previewTopic) previewTopic.innerText = state.topic || 'General';
    if (previewCapacity) {
      previewCapacity.innerText = state.participantMode === 'flexible'
        ? 'Flexible (Open)'
        : `Fixed (${state.participantCount} max)`;
    }
    if (previewMemes) {
      previewMemes.innerText = state.useMemes ? 'Enabled' : 'Disabled';
    }
    if (previewRolesCount) {
      previewRolesCount.innerText = state.useRoles ? `${state.roles.length} roles` : 'None';
    }
    if (previewRolesTags) {
      if (!state.useRoles || state.roles.length === 0) {
        previewRolesTags.innerHTML = '<span style="color:var(--text-muted);font-size:0.75rem;">Standard participant view</span>';
      } else {
        previewRolesTags.innerHTML = state.roles.map(r => `
          <span style="display:inline-block; font-size:0.75rem; font-weight:700; color:var(--primary); background:var(--primary-light); padding:2px 8px; border-radius:6px;">
            ${r.name}
          </span>
        `).join('');
      }
    }
  }

  // Room Name
  const inputRoomName = document.getElementById('room-name');
  if (inputRoomName) {
    inputRoomName.addEventListener('input', (e) => {
      state.name = e.target.value.trim() || 'Untitled Session';
      updatePreview();
    });
  }

  // Suggest Name
  const btnSuggest = document.getElementById('btn-random-name');
  if (btnSuggest) {
    btnSuggest.addEventListener('click', () => {
      const suggestions = [
        'Sprint 42 Retrospective',
        'Architecture Alignment Sync',
        'Product Strategy Review',
        'Design System Workshop',
        'Quarterly Priority Decision'
      ];
      const picked = suggestions[Math.floor(Math.random() * suggestions.length)];
      inputRoomName.value = picked;
      state.name = picked;
      updatePreview();
      showToast('Room name suggested');
    });
  }

  // Topic & Preset Chips
  const inputTopic = document.getElementById('room-topic');
  const presetChips = document.querySelectorAll('.preset-chip, .topic-chip, .clean-chip');
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const topic = chip.getAttribute('data-topic') || chip.innerText;
      if (inputTopic) inputTopic.value = topic;
      state.topic = topic;
      updatePreview();
    });
  });

  if (inputTopic) {
    inputTopic.addEventListener('input', (e) => {
      state.topic = e.target.value.trim() || 'General';
      updatePreview();
    });
  }

  // Multi-File Attachment Manager (up to 20 documents) & Interactive Lightbox
  const fileDropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('file-input');
  const attachmentCounter = document.getElementById('attachment-counter');
  const attachmentsListWrapper = document.getElementById('attachments-list-wrapper');
  const attachmentsItemsGrid = document.getElementById('attachments-items-grid');
  const btnAddMoreFiles = document.getElementById('btn-add-more-files');
  const attachmentAddMoreBar = document.getElementById('attachment-add-more-bar');

  // Lightbox Modal Elements
  const docLightboxOverlay = document.getElementById('doc-lightbox-overlay');
  const lightboxFileName = document.getElementById('lightbox-file-name');
  const lightboxFileSize = document.getElementById('lightbox-file-size');
  const lightboxFileExt = document.getElementById('lightbox-file-ext');
  const lightboxOpenExternal = document.getElementById('lightbox-open-external');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxBody = document.getElementById('lightbox-body');

  function addFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    const currentCount = state.attachments.length;
    const availableSlots = 20 - currentCount;

    if (availableSlots <= 0) {
      showToast('Maximum 20 documents reached', 'error');
      return;
    }

    const filesToAdd = Array.from(fileList).slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      showToast(`Added ${availableSlots} files (limit 20 reached)`, 'error');
    }

    filesToAdd.forEach(file => {
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|svg|webp|gif)$/i.test(file.name);
      const ext = (file.name.split('.').pop() || 'FILE').toUpperCase();

      let badgeClass = '';
      if (ext === 'PDF') badgeClass = 'badge-pdf';
      else if (['DOC', 'DOCX', 'TXT', 'MD', 'RTF'].includes(ext)) badgeClass = 'badge-doc';
      else if (['XLS', 'XLSX', 'CSV'].includes(ext)) badgeClass = 'badge-sheet';
      else if (['PPT', 'PPTX', 'KEY'].includes(ext)) badgeClass = 'badge-slide';

      const formattedSize = file.size < 1024 * 1024
        ? `${Math.max(1, Math.round(file.size / 1024))} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const item = {
        id: Date.now() + Math.random().toString(36).substr(2, 6),
        file,
        name: file.name,
        size: formattedSize,
        ext,
        isImage,
        badgeClass,
        url: URL.createObjectURL(file)
      };
      state.attachments.push(item);
    });

    renderAttachments();
    updatePreview();
    if (fileInput) fileInput.value = '';
    showToast(`${filesToAdd.length} document${filesToAdd.length > 1 ? 's' : ''} added`);
  }

  function renderAttachments() {
    const count = state.attachments.length;

    // Update Counter Pill
    if (attachmentCounter) {
      if (count > 0) {
        attachmentCounter.style.display = 'inline-block';
        attachmentCounter.innerText = `${count} of 20`;
      } else {
        attachmentCounter.style.display = 'none';
      }
    }

    if (count === 0) {
      if (fileDropzone) fileDropzone.style.display = 'flex';
      if (attachmentsListWrapper) attachmentsListWrapper.style.display = 'none';
      return;
    }

    if (fileDropzone) fileDropzone.style.display = 'none';
    if (attachmentsListWrapper) attachmentsListWrapper.style.display = 'flex';

    if (attachmentAddMoreBar) {
      attachmentAddMoreBar.style.display = count >= 20 ? 'none' : 'flex';
    }

    if (attachmentsItemsGrid) {
      attachmentsItemsGrid.innerHTML = state.attachments.map(item => `
        <div class="attachment-file-card" data-file-id="${item.id}" title="Click to preview ${item.name}">
          <div class="file-card-main-click" data-file-id="${item.id}">
            ${item.isImage ? `
              <div class="file-card-thumb">
                <img src="${item.url}" alt="${item.name}">
              </div>
            ` : `
              <div class="file-card-icon-badge ${item.badgeClass}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                <span>${item.ext}</span>
              </div>
            `}
            <div class="file-card-details">
              <div class="file-card-name">${item.name}</div>
              <div class="file-card-meta">
                <span>${item.size}</span>
                <span class="file-card-pill">${item.ext}</span>
                <span class="click-preview-hint">Click to preview</span>
              </div>
            </div>
          </div>

          <div class="file-card-actions">
            <button type="button" class="btn-file-pill btn-file-view" data-file-id="${item.id}" title="Preview document">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>View</span>
            </button>
            <button type="button" class="btn-file-pill btn-file-del" data-file-id="${item.id}" title="Remove file">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `).join('');

      // Click to view listeners
      attachmentsItemsGrid.querySelectorAll('.file-card-main-click, .btn-file-view').forEach(elem => {
        elem.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = elem.getAttribute('data-file-id');
          const target = state.attachments.find(a => a.id == id);
          if (target) openLightbox(target);
        });
      });

      // Remove listeners
      attachmentsItemsGrid.querySelectorAll('.btn-file-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-file-id');
          const removed = state.attachments.find(a => a.id == id);
          if (removed && removed.url) {
            try { URL.revokeObjectURL(removed.url); } catch (err) {}
          }
          state.attachments = state.attachments.filter(a => a.id != id);
          renderAttachments();
          updatePreview();
          showToast(`Removed "${removed ? removed.name : 'document'}"`);
        });
      });
    }
  }

  // Interactive Lightbox Modal Viewer
  function openLightbox(item) {
    if (!docLightboxOverlay || !lightboxBody) return;

    if (lightboxFileName) lightboxFileName.innerText = item.name;
    if (lightboxFileSize) lightboxFileSize.innerText = item.size;
    if (lightboxFileExt) lightboxFileExt.innerText = item.ext;
    if (lightboxOpenExternal) {
      lightboxOpenExternal.href = item.url;
    }

    if (item.isImage) {
      lightboxBody.innerHTML = `
        <img src="${item.url}" class="lightbox-image-preview" alt="${item.name}">
      `;
    } else if (item.ext === 'PDF') {
      lightboxBody.innerHTML = `
        <iframe src="${item.url}" class="lightbox-pdf-frame" title="${item.name}"></iframe>
      `;
    } else {
      lightboxBody.innerHTML = `
        <div class="lightbox-doc-card">
          <div class="lightbox-doc-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div class="lightbox-doc-name">${item.name}</div>
          <div class="lightbox-doc-sub">${item.ext} Document • ${item.size}</div>
          <a href="${item.url}" download="${item.name}" class="btn-file-pill" style="display:inline-flex; align-items:center; gap:8px; padding:10px 22px; font-size:0.9rem; text-decoration:none; color:var(--primary); background:var(--primary-light); border-color:var(--primary);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download Original File</span>
          </a>
        </div>
      `;
    }

    docLightboxOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (docLightboxOverlay) {
      docLightboxOverlay.style.display = 'none';
      document.body.style.overflow = '';
      if (lightboxBody) lightboxBody.innerHTML = '';
    }
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (docLightboxOverlay) {
    docLightboxOverlay.addEventListener('click', (e) => {
      if (e.target === docLightboxOverlay) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Dropzone Handlers
  if (fileDropzone) {
    fileDropzone.addEventListener('click', () => fileInput && fileInput.click());
    fileDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput && fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      fileDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileDropzone.classList.remove('drag-active');
      });
    });

    fileDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    });
  }

  if (btnAddMoreFiles) {
    btnAddMoreFiles.addEventListener('click', () => fileInput && fileInput.click());
  }

  // Allow drag & drop on attachments list as well
  if (attachmentsListWrapper) {
    attachmentsListWrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      attachmentsListWrapper.style.opacity = '0.7';
    });
    attachmentsListWrapper.addEventListener('dragleave', () => {
      attachmentsListWrapper.style.opacity = '1';
    });
    attachmentsListWrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      attachmentsListWrapper.style.opacity = '1';
      if (e.dataTransfer && e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
    });
  }

  // Capacity Mode
  const participantBoxes = document.querySelectorAll('.participant-mode-choice');
  const fixedStepper = document.getElementById('fixed-stepper-box');
  const stepperInput = document.getElementById('participant-count-input');
  const stepperMinus = document.getElementById('stepper-minus');
  const stepperPlus = document.getElementById('stepper-plus');

  participantBoxes.forEach(box => {
    box.addEventListener('click', () => {
      participantBoxes.forEach(b => b.classList.remove('active'));
      box.classList.add('active');
      const mode = box.getAttribute('data-mode');
      state.participantMode = mode;

      if (fixedStepper) {
        fixedStepper.style.display = mode === 'fixed' ? 'flex' : 'none';
      }
      updatePreview();
    });
  });

  if (stepperMinus && stepperPlus && stepperInput) {
    stepperMinus.addEventListener('click', () => {
      let val = parseInt(stepperInput.value, 10) || 10;
      if (val > 2) {
        val--;
        stepperInput.value = val;
        state.participantCount = val;
        updatePreview();
      }
    });

    stepperPlus.addEventListener('click', () => {
      let val = parseInt(stepperInput.value, 10) || 10;
      val++;
      stepperInput.value = val;
      state.participantCount = val;
      updatePreview();
    });

    stepperInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10) || 10;
      state.participantCount = Math.max(1, val);
      updatePreview();
    });
  }

  // Meme Mode
  const memeBoxes = document.querySelectorAll('.meme-mode-choice');
  memeBoxes.forEach(box => {
    box.addEventListener('click', () => {
      memeBoxes.forEach(b => b.classList.remove('active'));
      box.classList.add('active');
      state.useMemes = box.getAttribute('data-meme') === 'yes';
      updatePreview();
    });
  });

  // Autocomplete Data for Groups & Roles
  const groupHistory = [
    'Leadership',
    'Product Management',
    'Engineering',
    'Design & UX',
    'QA & Testing',
    'Marketing',
    'Operations',
    'Executive Committee'
  ];

  const roleHistory = [
    'Source of Truth',
    'Decision Maker',
    'Facilitator',
    'Lead Architect',
    'Reviewer',
    'Product Owner',
    'Tech Lead',
    'Scrum Master',
    'Design Lead',
    'Contributor',
    'Observer'
  ];

  // Groups & Roles Mode & Manager
  const groupBoxes = document.querySelectorAll('.group-mode-choice');
  const groupsManagerDrawer = document.getElementById('groups-manager-drawer');
  const groupsListContainer = document.getElementById('groups-list-container');
  const newGroupInput = document.getElementById('new-group-input');
  const groupDropdown = document.getElementById('group-suggestions-dropdown');
  const btnAddGroup = document.getElementById('btn-add-group');

  groupBoxes.forEach(box => {
    box.addEventListener('click', () => {
      groupBoxes.forEach(b => b.classList.remove('active'));
      box.classList.add('active');
      const isYes = box.getAttribute('data-groups') === 'yes';
      state.useGroups = isYes;

      if (groupsManagerDrawer) {
        groupsManagerDrawer.style.display = isYes ? 'block' : 'none';
      }
      updatePreview();
    });
  });

  // Group Suggestions Dropdown Handler
  function updateGroupSuggestions(query = '') {
    if (!groupDropdown) return;
    const cleanQ = query.trim().toLowerCase();
    const existingGroupNames = state.groups.map(g => g.name.toLowerCase());
    const matches = groupHistory.filter(name => 
      (!cleanQ || name.toLowerCase().includes(cleanQ)) && !existingGroupNames.includes(name.toLowerCase())
    );

    if (matches.length === 0) {
      groupDropdown.classList.remove('open');
      return;
    }

    groupDropdown.innerHTML = `
      <div class="dropdown-heading-tiny">Suggested Groups</div>
      ${matches.slice(0, 6).map(name => `
        <button type="button" class="dropdown-item-btn group-suggest-item" data-val="${name}">
          <span>${name}</span>
          <span class="dropdown-item-tag">+ Add</span>
        </button>
      `).join('')}
    `;
    groupDropdown.classList.add('open');

    groupDropdown.querySelectorAll('.group-suggest-item').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const val = btn.getAttribute('data-val');
        if (newGroupInput) {
          newGroupInput.value = val;
          addGroup(val);
        }
        groupDropdown.classList.remove('open');
      });
    });
  }

  if (newGroupInput) {
    newGroupInput.addEventListener('focus', () => updateGroupSuggestions(newGroupInput.value));
    newGroupInput.addEventListener('input', () => updateGroupSuggestions(newGroupInput.value));
    newGroupInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (groupDropdown) groupDropdown.classList.remove('open');
      }, 150);
    });
  }

  function addGroup(name) {
    const cleanName = name.trim();
    if (!cleanName) return;

    if (!groupHistory.includes(cleanName)) {
      groupHistory.push(cleanName);
    }

    const newG = {
      id: Date.now(),
      name: cleanName,
      isSourceOfTruth: state.groups.length === 0,
      roles: ['Contributor']
    };
    state.groups.push(newG);
    if (newGroupInput) newGroupInput.value = '';
    renderGroups();
    updatePreview();
    showToast(`Group "${cleanName}" added`);
  }

  function renderGroups() {
    if (!groupsListContainer) return;
    groupsListContainer.innerHTML = state.groups.map(g => `
      <div class="group-item-block ${g.isSourceOfTruth ? 'is-sot' : ''}" data-group-id="${g.id}">
        <div class="group-header-row">
          <div class="group-title-area">
            <span class="group-name-text">${g.name}</span>
            <button type="button" class="sot-badge-btn ${g.isSourceOfTruth ? 'active' : ''}" data-group-id="${g.id}" title="${g.isSourceOfTruth ? 'Benchmark Group' : 'Set as Source of Truth'}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${g.isSourceOfTruth ? 'Source of Truth' : 'Make Source of Truth'}</span>
            </button>
          </div>
          ${state.groups.length > 1 ? `
            <button type="button" class="btn-delete-group" data-group-id="${g.id}" title="Delete group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ` : ''}
        </div>

        <!-- Roles in this group -->
        <div class="group-roles-area">
          <span class="roles-caption-mini">Roles:</span>
          <div class="group-roles-pills">
            ${g.roles.map((roleName, rIdx) => `
              <span class="role-pill-item">
                <span>${roleName}</span>
                <button type="button" class="btn-remove-role-mini" data-group-id="${g.id}" data-role-idx="${rIdx}" title="Remove role">×</button>
              </span>
            `).join('')}
            <div class="mini-role-wrap">
              <input type="text" class="input-add-role-mini" data-group-id="${g.id}" placeholder="+ Add role" autocomplete="off">
              <div class="autocomplete-dropdown mini-role-dropdown" data-group-id="${g.id}"></div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // SOT Toggle Click
    groupsListContainer.querySelectorAll('.sot-badge-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gid = parseInt(btn.getAttribute('data-group-id'), 10);
        state.groups.forEach(g => {
          g.isSourceOfTruth = (g.id === gid);
        });
        const activeG = state.groups.find(g => g.id === gid);
        renderGroups();
        updatePreview();
        showToast(`"${activeG.name}" is now the Source of Truth`);
      });
    });

    // Delete Group Click
    groupsListContainer.querySelectorAll('.btn-delete-group').forEach(btn => {
      btn.addEventListener('click', () => {
        const gid = parseInt(btn.getAttribute('data-group-id'), 10);
        const target = state.groups.find(g => g.id === gid);
        state.groups = state.groups.filter(g => g.id !== gid);
        if (target && target.isSourceOfTruth && state.groups.length > 0) {
          state.groups[0].isSourceOfTruth = true;
        }
        renderGroups();
        updatePreview();
        showToast('Group removed');
      });
    });

    // Remove Role Click
    groupsListContainer.querySelectorAll('.btn-remove-role-mini').forEach(btn => {
      btn.addEventListener('click', () => {
        const gid = parseInt(btn.getAttribute('data-group-id'), 10);
        const rIdx = parseInt(btn.getAttribute('data-role-idx'), 10);
        const group = state.groups.find(g => g.id === gid);
        if (group && group.roles[rIdx]) {
          const removedName = group.roles[rIdx];
          group.roles.splice(rIdx, 1);
          renderGroups();
          updatePreview();
          showToast(`Role "${removedName}" removed`);
        }
      });
    });

    // Role Autocomplete & Enter Input
    groupsListContainer.querySelectorAll('.input-add-role-mini').forEach(input => {
      const gid = parseInt(input.getAttribute('data-group-id'), 10);
      const group = state.groups.find(g => g.id === gid);
      const dropdown = input.parentElement.querySelector('.mini-role-dropdown');

      function updateRoleDropdown(query = '') {
        if (!dropdown || !group) return;
        const cleanQ = query.trim().toLowerCase();
        const existingRoles = group.roles.map(r => r.toLowerCase());
        const matches = roleHistory.filter(r => 
          (!cleanQ || r.toLowerCase().includes(cleanQ)) && !existingRoles.includes(r.toLowerCase())
        );

        if (matches.length === 0) {
          dropdown.classList.remove('open');
          return;
        }

        dropdown.innerHTML = `
          <div class="dropdown-heading-tiny">Suggested Roles</div>
          ${matches.slice(0, 6).map(r => `
            <button type="button" class="dropdown-item-btn role-suggest-item" data-val="${r}">
              <span>${r}</span>
              <span class="dropdown-item-tag">+ Add</span>
            </button>
          `).join('')}
        `;
        dropdown.classList.add('open');

        dropdown.querySelectorAll('.role-suggest-item').forEach(btn => {
          btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const val = btn.getAttribute('data-val');
            addRoleToGroup(gid, val);
            dropdown.classList.remove('open');
          });
        });
      }

      input.addEventListener('focus', () => updateRoleDropdown(input.value));
      input.addEventListener('input', () => updateRoleDropdown(input.value));
      input.addEventListener('blur', () => {
        setTimeout(() => {
          if (dropdown) dropdown.classList.remove('open');
        }, 150);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = input.value.trim();
          if (!val) return;
          addRoleToGroup(gid, val);
          if (dropdown) dropdown.classList.remove('open');
        }
      });
    });
  }

  function addRoleToGroup(gid, roleName) {
    const cleanRole = roleName.trim();
    if (!cleanRole) return;
    const group = state.groups.find(g => g.id === gid);
    if (!group) return;

    if (!roleHistory.includes(cleanRole)) {
      roleHistory.push(cleanRole);
    }

    if (!group.roles.includes(cleanRole)) {
      group.roles.push(cleanRole);
      renderGroups();
      updatePreview();
      showToast(`Role "${cleanRole}" added to ${group.name}`, 'success');
    } else {
      showToast(`Role "${cleanRole}" already in ${group.name}`, 'error');
    }
  }

  // Add Group Button Click
  if (btnAddGroup && newGroupInput) {
    btnAddGroup.addEventListener('click', () => {
      const name = newGroupInput.value.trim();
      if (!name) {
        showToast('Please type a group name', 'error');
        return;
      }
      addGroup(name);
    });

    newGroupInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnAddGroup.click();
      }
    });
  }

  // View Responses Mode
  const viewBoxes = document.querySelectorAll('.view-mode-choice');
  const anonDrawer = document.getElementById('anonymous-sub-drawer');
  viewBoxes.forEach(box => {
    box.addEventListener('click', () => {
      viewBoxes.forEach(b => b.classList.remove('active'));
      box.classList.add('active');
      const isYes = box.getAttribute('data-view') === 'yes';
      if (anonDrawer) {
        anonDrawer.style.display = isYes ? 'block' : 'none';
      }
    });
  });

  // Copy Preview Link
  const btnCopyPreview = document.getElementById('btn-copy-preview-link');
  if (btnCopyPreview) {
    btnCopyPreview.addEventListener('click', () => {
      const code = previewCodeVal ? previewCodeVal.innerText : 'SP-ROOM';
      const fakeUrl = `https://samepage.app/join/${code}`;
      navigator.clipboard.writeText(fakeUrl).then(() => {
        showToast(`Copied invite link: ${fakeUrl}`);
      }).catch(() => {
        showToast(`Link: ${fakeUrl}`);
      });
    });
  }

  // Launch Action (Save all input data into localStorage for Waiting Room)
  const btnLaunch = document.getElementById('btn-launch-room');
  if (btnLaunch) {
    btnLaunch.addEventListener('click', () => {
      // Collect current input values
      const roomNameInput = document.getElementById('room-name');
      const roomTopicInput = document.getElementById('room-topic');
      const roomNotesInput = document.getElementById('room-notes');

      const finalCode = (previewCodeVal && previewCodeVal.innerText) ? previewCodeVal.innerText : 'SP-7942';
      const finalName = (roomNameInput && roomNameInput.value.trim()) ? roomNameInput.value.trim() : state.name;
      const finalTopic = (roomTopicInput && roomTopicInput.value.trim()) ? roomTopicInput.value.trim() : state.topic;
      const finalNotes = (roomNotesInput && roomNotesInput.value.trim()) ? roomNotesInput.value.trim() : '';

      const roomData = {
        code: finalCode,
        name: finalName,
        topic: finalTopic,
        notes: finalNotes,
        participantMode: state.participantMode,
        participantCount: state.participantCount,
        useMemes: state.useMemes,
        useGroups: state.useGroups,
        groups: JSON.parse(JSON.stringify(state.groups)),
        attachments: state.attachments.map(a => ({
          name: a.name,
          size: a.size,
          ext: a.ext,
          isImage: a.isImage,
          url: a.url
        }))
      };

      try {
        localStorage.setItem('samepage_active_room', JSON.stringify(roomData));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }

      showToast('Room created successfully');
      btnLaunch.innerHTML = `<span>Launching...</span>`;
      btnLaunch.style.pointerEvents = 'none';

      setTimeout(() => {
        window.location.href = 'waiting.html';
      }, 600);
    });
  }

  // Initial render
  renderAttachments();
  renderGroups();
  updatePreview();
}

// Shake animation style for validation
const shakeStyle = document.createElement('style');
shakeStyle.innerHTML = `
  @keyframes shakeCard {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
`;
document.head.appendChild(shakeStyle);

// Waiting Room Implementation (Live Bubbles, Reactions, Comments, Launch)
function initWaitingPage() {
  const bubbleStage = document.getElementById('bubble-stage');
  if (!bubbleStage) return;

  const bubblesContainer = document.getElementById('bubbles-container');
  const emojiFountain = document.getElementById('emoji-fountain');
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-input');
  const btnLaunchSession = document.getElementById('btn-launch-session');
  const btnCopyHeaderCode = document.getElementById('btn-copy-header-code');
  const headerCodeBox = document.getElementById('header-code-box');
  const headerRoomCode = document.getElementById('header-room-code');
  const roomDisplayName = document.getElementById('room-display-name');
  const participantsCountLabel = document.getElementById('participants-count-label');
  const roomTopicLabel = document.getElementById('room-topic-label');
  const btnCopyInviteLink = document.getElementById('btn-copy-invite-link');
  const btnOpenAttachments = document.getElementById('btn-open-attachments');

  // Modal elements
  const shareRolesOverlay = document.getElementById('share-roles-overlay');
  const shareRolesBody = document.getElementById('share-roles-body');
  const btnCloseShareModal = document.getElementById('btn-close-share-modal');

  // Lightbox Modal for Attachments
  const docLightboxOverlay = document.getElementById('doc-lightbox-overlay');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxBody = document.getElementById('lightbox-body');
  const lightboxFileName = document.getElementById('lightbox-file-name');
  const lightboxFileSize = document.getElementById('lightbox-file-size');
  const lightboxFileExt = document.getElementById('lightbox-file-ext');
  const lightboxOpenExternal = document.getElementById('lightbox-open-external');

  // Load created room data from localStorage (saved in create.html)
  let roomData = null;
  try {
    const stored = localStorage.getItem('samepage_active_room');
    if (stored) roomData = JSON.parse(stored);
  } catch (err) {
    console.warn('Could not read roomData from localStorage:', err);
  }

  // Fallback defaults if accessed directly
  if (!roomData) {
    roomData = {
      code: 'SP-7942',
      name: 'Design Alignment Sync',
      topic: 'Product Strategy',
      notes: 'Please review the attached strategy brief before voting on upcoming questions.',
      participantMode: 'flexible',
      participantCount: 10,
      useGroups: true,
      groups: [
        { id: 1, name: 'Leadership', isSourceOfTruth: true, roles: ['Decision Maker', 'Facilitator'] },
        { id: 2, name: 'Engineering', isSourceOfTruth: false, roles: ['Lead Architect', 'Reviewer'] },
        { id: 3, name: 'Product', isSourceOfTruth: false, roles: ['Product Owner'] },
        { id: 4, name: 'Design', isSourceOfTruth: false, roles: ['UI Designer'] }
      ],
      attachments: [
        { name: 'Q3_Product_Strategy_Deck.pdf', size: '2.4 MB', ext: 'PDF', isImage: false, url: '#' }
      ]
    };
  }

  // 1. Populate Header & Hero Information
  if (headerRoomCode) headerRoomCode.innerText = roomData.code || 'SP-7942';
  if (roomDisplayName) roomDisplayName.innerText = roomData.name || 'Untitled Session';
  if (roomTopicLabel) roomTopicLabel.innerText = roomData.topic || 'General';

  if (participantsCountLabel) {
    if (roomData.participantMode === 'fixed') {
      participantsCountLabel.innerText = `4 of ${roomData.participantCount || 10} joined`;
    } else {
      participantsCountLabel.innerText = `4 joined (Open capacity)`;
    }
  }

  // Attachments badge
  const attachmentsList = (roomData.attachments && roomData.attachments.length > 0)
    ? roomData.attachments
    : [{ name: 'Session_Brief.pdf', size: '1.2 MB', ext: 'PDF', isImage: false, url: '#' }];

  if (btnOpenAttachments) {
    const pillText = btnOpenAttachments.querySelector('span');
    if (pillText) pillText.innerText = `Attachments (${attachmentsList.length})`;
  }

  // 2. Generate Dynamic Participants from the exact Groups & Roles created!
  const groupsList = (roomData.groups && roomData.groups.length > 0) ? roomData.groups : [
    { id: 1, name: 'General', isSourceOfTruth: true, roles: ['Participant'] }
  ];

  const sotGroup = groupsList.find(g => g.isSourceOfTruth) || groupsList[0];
  const operatorRole = (sotGroup.roles && sotGroup.roles[0]) ? sotGroup.roles[0] : 'Host';
  const operatorGroupName = sotGroup.name;

  const mockProfiles = [
    { name: 'Elena Rostova', initials: 'ER', color: 'avatar-color-cyan' },
    { name: 'Marcus Vance', initials: 'MV', color: 'avatar-color-amber' },
    { name: 'Siti Sarah', initials: 'SS', color: 'avatar-color-rose' },
    { name: 'David Chen', initials: 'DC', color: 'avatar-color-purple' },
    { name: 'Amara Okafor', initials: 'AO', color: 'avatar-color-cyan' }
  ];

  const participants = [
    {
      id: 'p1',
      name: 'You (Operator)',
      initials: 'AR',
      isOperator: true,
      isSot: true,
      group: operatorGroupName,
      role: operatorRole,
      avatarColor: 'avatar-color-indigo',
      speech: 'Ready to launch whenever everyone is here!'
    }
  ];

  // Distribute other participants into the remaining groups / roles from create form
  const otherGroups = groupsList.filter(g => g !== sotGroup);
  let profileIdx = 0;

  if (otherGroups.length > 0) {
    otherGroups.forEach(grp => {
      const roles = (grp.roles && grp.roles.length > 0) ? grp.roles : ['Contributor'];
      roles.forEach(roleName => {
        if (participants.length < 5) {
          const profile = mockProfiles[profileIdx % mockProfiles.length];
          profileIdx++;
          participants.push({
            id: `p${participants.length + 1}`,
            name: profile.name,
            initials: profile.initials,
            isOperator: false,
            isSot: false,
            group: grp.name,
            role: roleName,
            avatarColor: profile.color,
            speech: ''
          });
        }
      });
    });
  } else if (sotGroup.roles && sotGroup.roles.length > 1) {
    sotGroup.roles.slice(1).forEach(roleName => {
      if (participants.length < 4) {
        const profile = mockProfiles[profileIdx % mockProfiles.length];
        profileIdx++;
        participants.push({
          id: `p${participants.length + 1}`,
          name: profile.name,
          initials: profile.initials,
          isOperator: false,
          isSot: true,
          group: sotGroup.name,
          role: roleName,
          avatarColor: profile.color,
          speech: ''
        });
      }
    });
  }

  // Fill up to 4 if needed
  while (participants.length < 4) {
    const profile = mockProfiles[profileIdx % mockProfiles.length];
    profileIdx++;
    participants.push({
      id: `p${participants.length + 1}`,
      name: profile.name,
      initials: profile.initials,
      isOperator: false,
      isSot: false,
      group: 'General',
      role: 'Participant',
      avatarColor: profile.color,
      speech: ''
    });
  }

  function renderBubbles() {
    if (!bubblesContainer) return;
    bubblesContainer.innerHTML = participants.map(p => `
      <div class="participant-bubble-card" id="card-${p.id}" data-id="${p.id}">
        <!-- Live Speech Balloon -->
        <div class="bubble-speech-balloon ${p.speech ? 'active' : ''}" id="speech-${p.id}">
          ${p.speech}
        </div>

        <!-- Avatar Circle with Role Ring -->
        <div class="bubble-avatar-frame ${p.isOperator ? 'is-operator' : ''} ${p.isSot ? 'is-sot' : ''}">
          <div class="bubble-avatar-inner ${p.avatarColor}">
            ${p.initials}
          </div>
          <span class="bubble-online-dot" title="Online now"></span>
          ${p.isSot ? `
            <div class="bubble-crown-badge" title="Source of Truth Benchmark Group">
              <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>SOT</span>
            </div>
          ` : ''}
        </div>

        <!-- Participant Info -->
        <div class="bubble-info-block">
          <div class="bubble-participant-name">${p.name}</div>
          <div class="bubble-tag-pill ${p.isSot ? 'sot-pill' : (p.isOperator ? 'operator-pill' : '')}">
            <span>${p.group} • ${p.role}</span>
          </div>
        </div>
      </div>
    `).join('') + `
      <!-- Invite Slot -->
      <div class="participant-bubble-card" id="slot-add-invite" title="Invite a teammate">
        <div class="bubble-avatar-frame is-add-slot">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div class="bubble-info-block">
          <div class="bubble-participant-name" style="color:var(--text-muted); font-weight:600;">Open Seat</div>
          <div class="bubble-tag-pill" style="border-style:dashed;">+ Share Link</div>
        </div>
      </div>
    `;

    // Click on invite slot opens Share by Role modal
    const inviteSlot = document.getElementById('slot-add-invite');
    if (inviteSlot) {
      inviteSlot.addEventListener('click', () => {
        openShareRolesModal();
      });
    }
  }

  // 3. Dynamically Render Role Access Cards in the Modal based on roomData.groups!
  function renderShareRolesModal() {
    if (!shareRolesBody) return;

    const modalTitle = document.querySelector('.share-modal-title');
    const modalSub = document.querySelector('.share-modal-sub');

    const isMultiRole = roomData.useGroups && roomData.groups && roomData.groups.length > 0;

    let rolesHtml = '';

    if (!isMultiRole) {
      // General Access ONLY exists if NOT multi-role!
      if (modalTitle) modalTitle.innerText = 'Invite Participants';
      if (modalSub) modalSub.innerText = 'Share the general room code or direct invite link with all participants.';

      rolesHtml += `
        <!-- General Room Access -->
        <div class="share-role-card general-card">
          <div class="share-role-info">
            <div class="share-role-top">
              <span class="share-role-badge general-badge">General Access</span>
              <span class="share-code-chip">Code: <strong>${roomData.code}</strong></span>
            </div>
            <div class="share-role-desc">Allows anyone to join this room as a participant.</div>
          </div>
          <div class="share-role-actions">
            <button type="button" class="btn-share-copy" data-copy="${roomData.code}" data-label="Room Code">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy Code</span>
            </button>
            <button type="button" class="btn-share-copy primary" data-copy="https://samepage.app/join/${roomData.code}" data-label="Invite Link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      `;
    } else {
      // Multi-Role Room: General Access DOES NOT EXIST! Everyone has an assigned role.
      if (modalTitle) modalTitle.innerText = 'Role Access Codes & Dedicated Links';
      if (modalSub) modalSub.innerText = 'This session enforces role-based access. Send each team or participant their dedicated code below to automatically assign their role.';

      groupsList.forEach(group => {
        const cleanName = group.name.replace(/[^A-Za-z]/g, '');
        const suffix = (cleanName.length >= 2 ? cleanName.substring(0, 2) : 'GP').toUpperCase();
        const roleCode = `${roomData.code}-${suffix}`;
        const rolesList = (group.roles && group.roles.length > 0) ? group.roles.join(', ') : 'Member';
        const roleLink = `https://samepage.app/join/${roomData.code}?role=${encodeURIComponent(group.roles && group.roles[0] ? group.roles[0] : group.name)}`;

        rolesHtml += `
          <div class="share-role-card ${group.isSourceOfTruth ? 'sot-card' : ''}">
            <div class="share-role-info">
              <div class="share-role-top">
                <span class="share-role-badge ${group.isSourceOfTruth ? 'sot-badge' : ''}">
                  ${group.isSourceOfTruth ? '★ ' : ''}${group.name}${group.isSourceOfTruth ? ' (Source of Truth)' : ''}
                </span>
                <span class="share-code-chip">Role Code: <strong>${roleCode}</strong></span>
              </div>
              <div class="share-role-roles">Auto-assigned: <strong>${rolesList}</strong></div>
            </div>
            <div class="share-role-actions">
              <button type="button" class="btn-share-copy" data-copy="${roleCode}" data-label="${group.name} Code">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy Code</span>
              </button>
              <button type="button" class="btn-share-copy primary" data-copy="${roleLink}" data-label="${group.name} Link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        `;
      });
    }

    shareRolesBody.innerHTML = rolesHtml;
    attachShareCopyListeners();
  }

  function attachShareCopyListeners() {
    document.querySelectorAll('.btn-share-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        const label = btn.getAttribute('data-label') || 'Code';
        if (textToCopy) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast(`Copied ${label} to clipboard!`);
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span>Copied!</span>`;
            setTimeout(() => {
              btn.innerHTML = originalText;
            }, 1400);
          }).catch(() => {
            showToast(`Copied: ${textToCopy}`);
          });
        }
      });
    });
  }

  // Live Waiting Room Duration Timer
  const headerDurationEl = document.getElementById('header-duration-time');
  if (headerDurationEl) {
    let waitSecs = 45;
    setInterval(() => {
      waitSecs++;
      const m = String(Math.floor(waitSecs / 60)).padStart(2, '0');
      const s = String(waitSecs % 60).padStart(2, '0');
      headerDurationEl.textContent = `${m}:${s}`;
    }, 1000);
  }

  // Floating Emoji Reaction Generator (High Viewport Fly-Through Past Header)
  function fireEmojiReaction(emoji, fromElement) {
    if (!emojiFountain) return;

    const rect = fromElement
      ? fromElement.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight * 0.65, width: 0, height: 0 };

    // Spawn 4 floating emojis per burst for an exuberant fountain effect
    for (let i = 0; i < 4; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-emoji-item';
      particle.innerText = emoji;

      // Start right at the bubble center in fixed viewport coordinates
      const startX = rect.left + (rect.width / 2) + (Math.random() * 44 - 22);
      const startY = rect.top + (Math.random() * 20 - 10);
      const swayPx = (Math.random() * 100 - 50) + 'px';

      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.setProperty('--sway', swayPx);
      particle.style.fontSize = `${1.8 + Math.random() * 1.0}rem`;
      particle.style.animationDelay = `${i * 0.08}s`;
      particle.style.animationDuration = `${2.6 + Math.random() * 0.5}s`;

      emojiFountain.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 3400);
    }
  }

  // Set Speech Balloon for a Participant
  function showSpeechBalloon(participantId, text, duration = 5000) {
    const balloon = document.getElementById(`speech-${participantId}`);
    if (!balloon) return;

    balloon.innerText = text;
    balloon.classList.add('active');

    if (balloon.timer) clearTimeout(balloon.timer);
    balloon.timer = setTimeout(() => {
      balloon.classList.remove('active');
    }, duration);
  }

  // Emoji buttons listener
  document.querySelectorAll('.btn-emoji-react').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      const userCard = document.getElementById('card-p1');
      fireEmojiReaction(emoji, userCard);

      setTimeout(() => {
        const others = ['p2', 'p3', 'p4'];
        const randomOther = others[Math.floor(Math.random() * others.length)];
        const otherCard = document.getElementById(`card-${randomOther}`);
        const responses = ['👏', '🔥', '🎉', '❤️', '🚀'];
        const randomEmoji = responses[Math.floor(Math.random() * responses.length)];
        fireEmojiReaction(randomEmoji, otherCard);
      }, 1200);
    });
  });

  // Comment submission listener
  if (commentForm && commentInput) {
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      showSpeechBalloon('p1', text);
      commentInput.value = '';

      setTimeout(() => {
        const replies = [
          { id: 'p2', msg: 'Reviewing the room attachments now 👍' },
          { id: 'p3', msg: 'Excited for this session!' },
          { id: 'p4', msg: 'All set on my side ☕' }
        ];
        const pick = replies[Math.floor(Math.random() * replies.length)];
        showSpeechBalloon(pick.id, pick.msg, 6000);
      }, 2500);
    });
  }

  // Modal Open/Close handlers
  function openShareRolesModal() {
    if (shareRolesOverlay) {
      renderShareRolesModal();
      shareRolesOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closeShareRolesModal() {
    if (shareRolesOverlay) {
      shareRolesOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  if (btnCloseShareModal) btnCloseShareModal.addEventListener('click', closeShareRolesModal);
  if (shareRolesOverlay) {
    shareRolesOverlay.addEventListener('click', (e) => {
      if (e.target === shareRolesOverlay) closeShareRolesModal();
    });
  }

  if (btnCopyInviteLink) btnCopyInviteLink.addEventListener('click', openShareRolesModal);
  if (btnCopyHeaderCode) btnCopyHeaderCode.addEventListener('click', openShareRolesModal);
  if (headerCodeBox) headerCodeBox.addEventListener('click', openShareRolesModal);

  // Review Attachments in Lightbox (Reading dynamic files and notes)
  function openAttachmentsLightbox() {
    if (!docLightboxOverlay || !lightboxBody) return;

    const primaryDoc = attachmentsList[0] || { name: 'Room_Notes.txt', size: '1 KB', ext: 'TXT' };
    if (lightboxFileName) lightboxFileName.innerText = primaryDoc.name;
    if (lightboxFileSize) lightboxFileSize.innerText = primaryDoc.size || '1.2 MB';
    if (lightboxFileExt) lightboxFileExt.innerText = primaryDoc.ext || 'DOC';
    if (lightboxOpenExternal) lightboxOpenExternal.href = primaryDoc.url || '#';

    let filesHtml = attachmentsList.map(doc => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#FFFFFF; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:0.75rem; font-weight:800; background:var(--primary-light); color:var(--primary); padding:3px 7px; border-radius:4px;">${doc.ext || 'FILE'}</span>
          <span style="font-size:0.88rem; font-weight:700; color:var(--text-main);">${doc.name}</span>
        </div>
        <span style="font-size:0.78rem; color:var(--text-muted);">${doc.size || '1 MB'}</span>
      </div>
    `).join('');

    lightboxBody.innerHTML = `
      <div class="lightbox-doc-card" style="max-width:540px; text-align:left;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <div class="lightbox-doc-icon" style="margin-bottom:0;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div>
            <div class="lightbox-doc-name" style="margin-bottom:2px;">Shared Session Documents</div>
            <div class="lightbox-doc-sub" style="margin-bottom:0;">Uploaded by Host for this room (${attachmentsList.length} files)</div>
          </div>
        </div>

        ${roomData.notes ? `
          <div style="padding:12px 14px; background:#F8FAFC; border-radius:var(--radius-sm); border-left:3px solid var(--primary); margin-bottom:16px;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Host Notes / Instructions</div>
            <div style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4;">${roomData.notes}</div>
          </div>
        ` : ''}

        <div style="margin-bottom:20px;">
          ${filesHtml}
        </div>

        <button type="button" class="btn-file-pill" style="display:inline-flex; align-items:center; gap:8px; padding:10px 22px; font-size:0.9rem; color:var(--primary); background:var(--primary-light); border-color:var(--primary); width:100%; justify-content:center;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download All Attachments</span>
        </button>
      </div>
    `;

    docLightboxOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (docLightboxOverlay) {
      docLightboxOverlay.style.display = 'none';
      document.body.style.overflow = '';
      if (lightboxBody) lightboxBody.innerHTML = '';
    }
  }

  if (btnOpenAttachments) btnOpenAttachments.addEventListener('click', openAttachmentsLightbox);
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (docLightboxOverlay) {
    docLightboxOverlay.addEventListener('click', (e) => {
      if (e.target === docLightboxOverlay) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Launch Session
  if (btnLaunchSession) {
    btnLaunchSession.addEventListener('click', () => {
      btnLaunchSession.disabled = true;
      btnLaunchSession.innerHTML = `<span>Starting session...</span>`;
      
      // Celebrate with emoji fountain
      ['🚀', '🎉', '🔥', '✨'].forEach((emoji, index) => {
        setTimeout(() => {
          const card = document.getElementById(`card-p${(index % 4) + 1}`);
          fireEmojiReaction(emoji, card);
        }, index * 150);
      });

      showToast('🚀 Launching session for all participants...');
      setTimeout(() => {
        window.location.href = 'session.html';
      }, 900);
    });
  }

  // Initial render of bubbles
  renderBubbles();
}

// ==========================================================================
// 4. SESSION PAGE (Launch Animation + Question 1 Interaction)
// ==========================================================================
function initSessionPage() {
  const sessionWrapper = document.getElementById('session-canvas-wrapper');
  if (!sessionWrapper) return;

  const launchOverlay = document.getElementById('launch-transition-overlay');
  const launchAiPhase = document.getElementById('launch-ai-phase');
  const launchCountdownPhase = document.getElementById('launch-countdown-phase');
  const aiStatusText = document.getElementById('ai-status-text');
  const aiProgressBar = document.getElementById('ai-progress-bar');
  const countdownNumberVal = document.getElementById('countdown-number-val');
  const countdownRing = document.getElementById('countdown-ring');
  const btnReplayIntro = document.getElementById('btn-replay-intro');

  const sessionRoomCode = document.getElementById('session-room-code');
  const sessionQuestionHeadline = document.getElementById('session-question-headline');
  const participantAnswerInput = document.getElementById('participant-answer-input');
  const btnSubmitAnswer = document.getElementById('btn-submit-answer');
  const sessionTimerCountdown = document.getElementById('session-timer-countdown');

  // Load created room data from localStorage
  let roomData = null;
  try {
    const raw = localStorage.getItem('samepage_active_room');
    if (raw) roomData = JSON.parse(raw);
  } catch (err) {}

  if (!roomData) {
    roomData = {
      code: 'SP-7942',
      name: 'Design Alignment Sync',
      topic: 'Product Strategy'
    };
  }

  // 1. Populate Header & Question Details
  if (sessionRoomCode) sessionRoomCode.innerText = roomData.code || 'SP-7942';

  const SESSION_QUESTIONS = [
    {
      id: 1,
      roundLabel: "Question 1 of 2",
      headline: "Based on our strategic goals in Design Alignment Sync, what is the single highest-leverage priority our team must commit to, and what are we explicitly deprioritizing?",
      subPrompt: "Write what you believe independently before the room unlocks and compares perspectives against the benchmark.",
      timerSeconds: 170
    },
    {
      id: 2,
      roundLabel: "Question 2 of 2 • Final Question",
      headline: "What is the single biggest architectural or operational bottleneck that could prevent our team from hitting our Q3 North Star metrics, and who owns the fix?",
      subPrompt: "Identify the critical cross-team dependency and specify the exact trade-off needed to unblock delivery.",
      timerSeconds: 180
    }
  ];

  const sessionUrlParams = new URLSearchParams(window.location.search);
  const currentQId = (sessionUrlParams.get('q') === '2' || sessionUrlParams.get('question') === '2') ? 2 : 1;
  const isReviewMode = sessionUrlParams.get('review') === '1' || sessionUrlParams.get('mode') === 'review';
  const currentQuestion = SESSION_QUESTIONS[currentQId - 1];

  const questionRoundIndicator = document.getElementById('question-round-indicator');
  if (questionRoundIndicator) {
    if (isReviewMode) {
      questionRoundIndicator.innerHTML = `
        <span class="round-indicator-dot" aria-hidden="true" style="background: #10B981;"></span>
        <span>${currentQuestion.roundLabel} &bull; Review Mode</span>
      `;
    } else {
      questionRoundIndicator.innerHTML = `
        <span class="round-indicator-dot" aria-hidden="true"></span>
        <span>${currentQuestion.roundLabel}</span>
      `;
    }
  }

  if (sessionQuestionHeadline) {
    sessionQuestionHeadline.innerText = currentQuestion.headline;
  }

  const sessionQuestionSub = document.getElementById('session-question-sub');
  if (sessionQuestionSub) {
    sessionQuestionSub.innerText = currentQuestion.subPrompt;
  }

  // Pre-fill user's previous answer if in review mode
  if (isReviewMode && participantAnswerInput) {
    const savedAnswer = localStorage.getItem(`samepage_user_answer_q${currentQId}`) || 
                        (currentQId === 1 ? localStorage.getItem('samepage_user_answer') : '');
    if (savedAnswer && savedAnswer.trim()) {
      participantAnswerInput.value = savedAnswer;
    }
  }

  // 2. Render Overlapping Avatar Stack & Status
  const mockTeammates = [
    { name: 'You', initials: 'AR', color: 'avatar-color-indigo', isDone: isReviewMode },
    { name: 'Elena', initials: 'ER', color: 'avatar-color-cyan', isDone: true },
    { name: 'Marcus', initials: 'MV', color: 'avatar-color-amber', isDone: true },
    { name: 'Siti', initials: 'SS', color: 'avatar-color-rose', isDone: isReviewMode },
    { name: 'David', initials: 'DC', color: 'avatar-color-purple', isDone: isReviewMode }
  ];

  function renderAvatarStack() {
    const avatarStackRow = document.getElementById('avatar-stack-row');
    const answeredCountText = document.getElementById('answered-count-text');
    if (!avatarStackRow) return;

    const answeredCount = mockTeammates.filter(m => m.isDone).length;
    const totalCount = mockTeammates.length;

    avatarStackRow.innerHTML = mockTeammates.map((m, idx) => `
      <div class="stacked-avatar-circle ${m.color || 'avatar-color-cyan'} ${m.isDone ? 'is-answered' : ''}" 
           style="z-index: ${mockTeammates.length - idx};" 
           title="${m.name} (${m.isDone ? 'Submitted response' : 'Writing response...'})">
        <span>${m.initials}</span>
        ${m.isDone ? `
          <div class="stacked-avatar-check" style="width:12px;height:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
            <svg style="width:7px;height:7px;max-width:7px;max-height:7px;display:block;stroke:#FFFFFF;" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        ` : ''}
      </div>
    `).join('');

    if (answeredCountText) {
      answeredCountText.innerText = `${answeredCount} of ${totalCount} participants`;
    }
  }
  renderAvatarStack();

  // Auto-resize textarea preserving manual drag height permanently
  let userManualHeight = 125;

  // 1. Capture manual resize from mouse interactions on textarea
  if (participantAnswerInput) {
    let startH = 0;
    participantAnswerInput.addEventListener('mousedown', () => {
      startH = participantAnswerInput.offsetHeight;
    });

    const updateManualHeightIfChanged = () => {
      if (!participantAnswerInput) return;
      const currentH = participantAnswerInput.offsetHeight;
      if (currentH > 60 && currentH !== startH) {
        userManualHeight = currentH;
      }
    };

    window.addEventListener('mouseup', updateManualHeightIfChanged);
    participantAnswerInput.addEventListener('mouseup', updateManualHeightIfChanged);
  }

  // 2. Interactive custom grab handle in bottom-right corner
  const editorGrabHandle = document.getElementById('editor-grab-handle');
  if (editorGrabHandle && participantAnswerInput) {
    let isHandleDragging = false;
    let dragStartY = 0;
    let dragStartH = 0;

    editorGrabHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isHandleDragging = true;
      dragStartY = e.clientY;
      dragStartH = participantAnswerInput.offsetHeight;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isHandleDragging) return;
      const delta = e.clientY - dragStartY;
      const maxAllowed = Math.min(360, Math.max(160, window.innerHeight - 380));
      const newH = Math.min(maxAllowed, Math.max(100, dragStartH + delta));
      participantAnswerInput.style.height = `${newH}px`;
      userManualHeight = newH;
    });

    window.addEventListener('mouseup', () => {
      if (isHandleDragging) {
        isHandleDragging = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        userManualHeight = participantAnswerInput.offsetHeight;
      }
    });
  }

  // 3. Auto-resize function that NEVER shrinks below userManualHeight
  function autoResizeTextarea() {
    if (!participantAnswerInput) return;

    // Check if inline style was modified by browser native drag
    const inlineH = parseFloat(participantAnswerInput.style.height);
    if (!isNaN(inlineH) && inlineH > userManualHeight) {
      userManualHeight = inlineH;
    }

    const maxAllowed = Math.min(360, Math.max(160, window.innerHeight - 380));
    const minH = Math.max(125, userManualHeight);

    // Baseline is strictly minH (never collapses below user's dragged height!)
    participantAnswerInput.style.height = `${minH}px`;
    const neededH = participantAnswerInput.scrollHeight;

    if (neededH <= minH) {
      participantAnswerInput.style.height = `${minH}px`;
      participantAnswerInput.style.overflowY = 'hidden';
    } else if (neededH > maxAllowed) {
      participantAnswerInput.style.height = `${maxAllowed}px`;
      participantAnswerInput.style.overflowY = 'auto';
    } else {
      participantAnswerInput.style.height = `${neededH}px`;
      participantAnswerInput.style.overflowY = 'hidden';
    }
  }

  if (participantAnswerInput) {
    participantAnswerInput.addEventListener('input', autoResizeTextarea);
    window.addEventListener('resize', autoResizeTextarea);
  }

  // Rich Formatting Toolset Handler
  const toolbarBtns = document.querySelectorAll('.toolbar-btn[data-action]');
  function applyFormatting(action) {
    if (!participantAnswerInput) return;
    const start = participantAnswerInput.selectionStart;
    const end = participantAnswerInput.selectionEnd;
    const val = participantAnswerInput.value;
    const selected = val.substring(start, end);

    let before = val.substring(0, start);
    let after = val.substring(end);
    let replacement = '';
    let newCursorPos = start;

    switch (action) {
      case 'bold':
        if (selected) {
          replacement = `**${selected}**`;
          newCursorPos = start + replacement.length;
        } else {
          replacement = `**bold text**`;
          newCursorPos = start + 2;
        }
        break;
      case 'italic':
        if (selected) {
          replacement = `*${selected}*`;
          newCursorPos = start + replacement.length;
        } else {
          replacement = `*italic text*`;
          newCursorPos = start + 1;
        }
        break;
      case 'underline':
        if (selected) {
          replacement = `<u>${selected}</u>`;
          newCursorPos = start + replacement.length;
        } else {
          replacement = `<u>underlined text</u>`;
          newCursorPos = start + 3;
        }
        break;
      case 'strike':
        if (selected) {
          replacement = `~~${selected}~~`;
          newCursorPos = start + replacement.length;
        } else {
          replacement = `~~strikethrough~~`;
          newCursorPos = start + 2;
        }
        break;
      case 'bullet-list':
        if (selected) {
          const lines = selected.split('\n').map(l => l.startsWith('- ') ? l : `- ${l}`).join('\n');
          replacement = lines;
          newCursorPos = start + replacement.length;
        } else {
          replacement = `\n- `;
          newCursorPos = start + replacement.length;
        }
        break;
      case 'quote':
        if (selected) {
          const lines = selected.split('\n').map(l => l.startsWith('> ') ? l : `> ${l}`).join('\n');
          replacement = lines;
          newCursorPos = start + replacement.length;
        } else {
          replacement = `\n> `;
          newCursorPos = start + replacement.length;
        }
        break;
      case 'code':
        if (selected) {
          replacement = `\`${selected}\``;
          newCursorPos = start + replacement.length;
        } else {
          replacement = `\`code\``;
          newCursorPos = start + 1;
        }
        break;
    }

    participantAnswerInput.value = before + replacement + after;
    participantAnswerInput.focus();
    participantAnswerInput.setSelectionRange(newCursorPos, newCursorPos);
    autoResizeTextarea();
  }

  toolbarBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.getAttribute('data-action');
      applyFormatting(action);
    });
  });

  // Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+P)
  if (participantAnswerInput) {
    participantAnswerInput.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          applyFormatting('bold');
        } else if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          applyFormatting('italic');
        } else if (e.key === 'u' || e.key === 'U') {
          e.preventDefault();
          applyFormatting('underline');
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          const isCurrentlyPreview = answerPreviewPane && answerPreviewPane.style.display !== 'none';
          setEditorMode(isCurrentlyPreview ? 'write' : 'preview');
        }
      }
    });
  }

  // 4. MARKDOWN RENDERING SYSTEM & PREVIEW CONTROLLER
  const btnModeWrite = document.getElementById('btn-mode-write');
  const btnModePreview = document.getElementById('btn-mode-preview');
  const answerPreviewPane = document.getElementById('answer-preview-pane');
  const toolbarLeftTools = document.getElementById('toolbar-left-tools');

  function renderMarkdown(md) {
    if (!md || !md.trim()) {
      return '<div class="preview-empty-state">Nothing to preview yet. Switch to Write mode to draft your thoughts.</div>';
    }

    // Safe HTML escape
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Safe formatting tags
    html = html
      .replace(/&lt;u&gt;/gi, '<u class="rendered-underline">')
      .replace(/&lt;\/u&gt;/gi, '</u>')
      .replace(/&lt;b&gt;/gi, '<strong>')
      .replace(/&lt;\/b&gt;/gi, '</strong>')
      .replace(/&lt;i&gt;/gi, '<em>')
      .replace(/&lt;\/i&gt;/gi, '</em>')
      .replace(/&lt;s&gt;/gi, '<del>')
      .replace(/&lt;\/s&gt;/gi, '</del>');

    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code class="rendered-code">$1</code>');

    // Bold: **text** or __text__
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Strikethrough: ~~text~~
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Italic: *text* or _text_
    html = html.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    html = html.replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');

    // Line-by-line block processing (lists, quotes, paragraphs)
    const lines = html.split('\n');
    const out = [];
    let inList = false;
    let inQuote = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Blockquote: starts with &gt;
      if (/^&gt;\s*(.*)/.test(trimmed)) {
        const quoteText = trimmed.replace(/^&gt;\s*/, '');
        if (!inQuote) {
          out.push('<blockquote class="rendered-quote">');
          inQuote = true;
        }
        out.push('<p>' + quoteText + '</p>');
        continue;
      } else if (inQuote) {
        out.push('</blockquote>');
        inQuote = false;
      }

      // Bullet list: starts with - or *
      if (/^[-*]\s+(.*)/.test(trimmed)) {
        const itemText = trimmed.replace(/^[-*]\s+/, '');
        if (!inList) {
          out.push('<ul class="rendered-list">');
          inList = true;
        }
        out.push('<li>' + itemText + '</li>');
        continue;
      } else if (inList) {
        out.push('</ul>');
        inList = false;
      }

      if (trimmed === '') {
        out.push('<div class="rendered-spacer"></div>');
      } else {
        out.push('<p class="rendered-p">' + rawLine + '</p>');
      }
    }

    if (inList) out.push('</ul>');
    if (inQuote) out.push('</blockquote>');

    return out.join('');
  }

  function setEditorMode(mode) {
    if (!participantAnswerInput || !answerPreviewPane) return;

    if (mode === 'preview') {
      if (btnModePreview) btnModePreview.classList.add('is-active');
      if (btnModeWrite) btnModeWrite.classList.remove('is-active');
      if (toolbarLeftTools) toolbarLeftTools.classList.add('is-disabled');

      const currentH = participantAnswerInput.offsetHeight || userManualHeight;
      answerPreviewPane.style.minHeight = `${currentH}px`;
      answerPreviewPane.innerHTML = renderMarkdown(participantAnswerInput.value);

      participantAnswerInput.style.display = 'none';
      answerPreviewPane.style.display = 'block';
    } else {
      if (btnModeWrite) btnModeWrite.classList.add('is-active');
      if (btnModePreview) btnModePreview.classList.remove('is-active');
      if (toolbarLeftTools) toolbarLeftTools.classList.remove('is-disabled');

      answerPreviewPane.style.display = 'none';
      participantAnswerInput.style.display = 'block';
      participantAnswerInput.focus();
    }
  }

  if (btnModeWrite) {
    btnModeWrite.addEventListener('click', () => setEditorMode('write'));
  }
  if (btnModePreview) {
    btnModePreview.addEventListener('click', () => setEditorMode('preview'));
  }

  // Submit Response
  if (btnSubmitAnswer && participantAnswerInput) {
    const btnReviewBack = document.getElementById('btn-session-review-back');
    const avatarContainer = document.getElementById('avatar-stack-container');

    if (isReviewMode) {
      if (avatarContainer) avatarContainer.style.display = 'none';

      if (currentQId === 2) {
        if (btnReviewBack) {
          btnReviewBack.style.display = 'inline-flex';
          btnReviewBack.href = 'comparison.html?q=1&review=1';
          const backText = document.getElementById('btn-session-review-back-text');
          if (backText) backText.textContent = 'Review Question 1 Comparison';
        }

        btnSubmitAnswer.innerHTML = `
          <span>Next: Question 2 Comparison</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      } else {
        // Question 1 in review mode
        if (btnReviewBack) btnReviewBack.style.display = 'none';

        btnSubmitAnswer.innerHTML = `
          <span>Next: Question 1 Comparison</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }
    }

    btnSubmitAnswer.addEventListener('click', () => {
      const text = participantAnswerInput.value.trim();

      // Review Mode: Return immediately
      if (isReviewMode) {
        if (text) {
          try {
            localStorage.setItem(`samepage_user_answer_q${currentQId}`, text);
            if (currentQId === 1) localStorage.setItem('samepage_user_answer', text);
          } catch (e) {}
        }
        showToast(`Opening Question ${currentQId} comparison...`, 'success');
        setTimeout(() => {
          window.location.href = `comparison.html?q=${currentQId}&review=1`;
        }, 400);
        return;
      }

      if (!text) {
        participantAnswerInput.focus();
        showToast('Please enter your perspective before submitting', 'error');
        return;
      }

      // Persist user's submitted response for comparison screen
      try {
        localStorage.setItem(`samepage_user_answer_q${currentQId}`, text);
        localStorage.setItem('samepage_user_answer', text);
      } catch (e) {}

      btnSubmitAnswer.classList.add('submitted');
      btnSubmitAnswer.disabled = true;
      btnSubmitAnswer.innerHTML = `
        <svg style="width:14px;height:14px;display:inline-block;stroke:#FFFFFF;" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>Response Submitted &bull; Opening Comparison...</span>
      `;
      participantAnswerInput.disabled = true;

      // Automatically render and display formatted submission
      setEditorMode('preview');
      if (btnModeWrite) {
        btnModeWrite.disabled = true;
        btnModeWrite.style.opacity = '0.4';
      }
      if (btnModePreview) {
        btnModePreview.disabled = true;
      }

      // Update avatar stack: You are now marked as done!
      mockTeammates[0].isDone = true;
      renderAvatarStack();
      showToast('Response submitted! Opening comparison...', 'success');

      // Redirect to comparison screen
      setTimeout(() => {
        window.location.href = `comparison.html?q=${currentQId}`;
      }, 1300);
    });
  }

  // Timer countdown / Review mode badge
  if (isReviewMode) {
    const timerBadge = document.getElementById('session-timer-badge');
    if (timerBadge) {
      timerBadge.innerHTML = `
        <span class="session-timer-dot" style="background: #10B981; animation: none;"></span>
        <span>Review Mode</span>
      `;
      timerBadge.title = 'Reviewing previously submitted response';
    }
  } else {
    let timeLeft = currentQuestion.timerSeconds || 170; // 2m 50s
    if (sessionTimerCountdown) {
      const countdownInterval = setInterval(() => {
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          return;
        }
        timeLeft--;
        const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const secs = String(timeLeft % 60).padStart(2, '0');
        sessionTimerCountdown.innerText = `${mins}:${secs}`;
      }, 1000);
    }
  }

  // 3. LAUNCH SEQUENCE ANIMATION ENGINE
  // Step 1: Human Handwriting AI Typewriter Paragraph
  // Step 2: Mysterious Giant Countdown 3... 2... 1...
  // Step 3: Question 1 Reveal
  function runLaunchSequence() {
    if (!launchOverlay) return;

    const typewriterEl = document.getElementById('ai-typewriter-text');
    const caretEl = document.getElementById('ai-typewriter-caret');

    // Reset overlay state and hide canvas wrapper while launching
    launchOverlay.classList.remove('is-hidden');
    launchOverlay.style.display = 'flex';
    if (sessionWrapper) sessionWrapper.classList.add('is-launching');
    document.body.style.overflow = 'hidden';

    if (launchAiPhase) launchAiPhase.style.display = 'flex';
    if (launchCountdownPhase) launchCountdownPhase.style.display = 'none';
    if (typewriterEl) typewriterEl.innerText = '';
    if (caretEl) caretEl.style.display = 'inline-block';

    const sentences = [
      "Hold on, I'm thinking...",
      "Hmmm, actually I'm writing now...",
      "Almost there, I'm evaluating...",
      "Get ready 😈"
    ];

    function typeSentence(text, speed = 36) {
      return new Promise((resolve) => {
        if (!typewriterEl) {
          resolve();
          return;
        }
        typewriterEl.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
          if (i < text.length) {
            typewriterEl.textContent += text.charAt(i);
            i++;
          } else {
            clearInterval(timer);
            resolve();
          }
        }, speed);
      });
    }

    function eraseSentence(speed = 16) {
      return new Promise((resolve) => {
        if (!typewriterEl) {
          resolve();
          return;
        }
        const text = typewriterEl.textContent;
        let i = text.length;
        const timer = setInterval(() => {
          if (i > 0) {
            typewriterEl.textContent = text.substring(0, i - 1);
            i--;
          } else {
            clearInterval(timer);
            resolve();
          }
        }, speed);
      });
    }

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function executeLaunchFlow() {
      // 1. "Hold on, I'm thinking..."
      await typeSentence(sentences[0], 36);
      await sleep(650);
      await eraseSentence(16);
      await sleep(150);

      // 2. "Hmmm, actually I'm writing now..."
      await typeSentence(sentences[1], 34);
      await sleep(650);
      await eraseSentence(16);
      await sleep(150);

      // 3. "Almost there, I'm evaluating..."
      await typeSentence(sentences[2], 34);
      await sleep(650);
      await eraseSentence(16);
      await sleep(150);

      // 4. "Get ready 😈"
      await typeSentence(sentences[3], 42);
      await sleep(850);

      // Step 2: Mysterious Giant Countdown 3... 2... 1...
      if (launchAiPhase) launchAiPhase.style.display = 'none';
      if (launchCountdownPhase) launchCountdownPhase.style.display = 'flex';

      function playNumber(num) {
        if (!countdownNumberVal) return;
        countdownNumberVal.innerText = num;
        countdownNumberVal.style.animation = 'none';
        void countdownNumberVal.offsetWidth;
        countdownNumberVal.style.animation = 'countdownPop 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      }

      playNumber('3');
      await sleep(1000);
      playNumber('2');
      await sleep(1000);
      playNumber('1');
      await sleep(1000);

      // Step 3: Question 1 Animated Reveal!
      launchOverlay.classList.add('is-hidden');
      if (sessionWrapper) sessionWrapper.classList.remove('is-launching');
      document.body.style.overflow = '';

      setTimeout(() => {
        launchOverlay.style.display = 'none';
        if (participantAnswerInput) participantAnswerInput.focus();
      }, 500);
    }

    executeLaunchFlow();
  }

  // Run automatically on load (Skip launch intro in Review Mode)
  if (isReviewMode) {
    if (launchOverlay) {
      launchOverlay.classList.add('is-hidden');
      launchOverlay.style.display = 'none';
    }
    if (sessionWrapper) {
      sessionWrapper.classList.remove('is-launching');
      sessionWrapper.style.opacity = '1';
      sessionWrapper.style.visibility = 'visible';
      sessionWrapper.style.transform = 'none';
    }
    document.body.style.overflow = '';
  } else {
    runLaunchSequence();
  }
}

// ==========================================
// 6. Comparison Page Logic (URL Param Controlled: 2-Person vs Multi-Person)
// ==========================================
function initComparisonPage() {
  const stageModeTwo = document.getElementById('stage-mode-two');
  const stageModeMulti = document.getElementById('stage-mode-multi');
  const btnNextQuestion = document.getElementById('btn-next-question');

  if (!stageModeTwo || !stageModeMulti) return;

  // Function to toggle views based on URL parameter or hash
  function applyViewFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = (urlParams.get('view') || urlParams.get('mode') || '').toLowerCase();
    const hashParam = (window.location.hash || '').toLowerCase();

    const isMulti = viewParam === 'multi' || viewParam === 'team' || viewParam === 'list' || 
                    hashParam === '#multi' || hashParam === '#team' || hashParam === '#list';

    const headerPartCount = document.getElementById('header-participants-count');
    if (headerPartCount) {
      headerPartCount.textContent = isMulti ? '5 Participants' : '2 Participants';
    }

    if (isMulti) {
      stageModeMulti.classList.remove('is-hidden');
      stageModeTwo.classList.add('is-hidden');
    } else {
      stageModeTwo.classList.remove('is-hidden');
      stageModeMulti.classList.add('is-hidden');
    }
  }

  // Initial check on load
  applyViewFromUrl();

  // Listen for hash changes if navigating within the page
  window.addEventListener('hashchange', applyViewFromUrl);

  // Collapsible Full Summary Drawer
  const btnToggleSummary = document.getElementById('btn-toggle-summary');
  const summaryExtendedDrawer = document.getElementById('summary-extended-drawer');
  const toggleSummaryLabel = document.getElementById('toggle-summary-label');

  if (btnToggleSummary && summaryExtendedDrawer) {
    btnToggleSummary.addEventListener('click', () => {
      const isOpen = summaryExtendedDrawer.classList.contains('is-open');
      if (isOpen) {
        summaryExtendedDrawer.classList.remove('is-open');
        btnToggleSummary.classList.remove('is-expanded');
        btnToggleSummary.setAttribute('aria-expanded', 'false');
        if (toggleSummaryLabel) toggleSummaryLabel.textContent = 'Read Full Summary';
      } else {
        summaryExtendedDrawer.classList.add('is-open');
        btnToggleSummary.classList.add('is-expanded');
        btnToggleSummary.setAttribute('aria-expanded', 'true');
        if (toggleSummaryLabel) toggleSummaryLabel.textContent = 'Show Less';
      }
    });
  }

  // Universal Read More / Show Less Handler for Individual Participant Statements
  const readMoreButtons = document.querySelectorAll('.btn-read-more-statement');
  readMoreButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = btn.closest('.statement-expandable-wrap');
      if (!wrap) return;
      const extended = wrap.querySelector('.statement-extended-text');
      if (!extended) return;

      const isExpanded = btn.classList.contains('is-expanded');
      const labelSpan = btn.querySelector('span');

      if (isExpanded) {
        extended.classList.remove('is-open');
        btn.classList.remove('is-expanded');
        btn.setAttribute('aria-expanded', 'false');
        if (labelSpan) labelSpan.textContent = 'Read more';
      } else {
        extended.classList.add('is-open');
        btn.classList.add('is-expanded');
        btn.setAttribute('aria-expanded', 'true');
        if (labelSpan) labelSpan.textContent = 'Show less';
      }
    });
  });

  // If user submitted an answer from session.html, dynamically render it!
  try {
    const savedAnswer = localStorage.getItem('samepage_user_answer');
    if (savedAnswer && savedAnswer.trim()) {
      const selfRoomPreview = document.querySelector('.perspective-room-card.is-self .statement-preview-text');
      if (selfRoomPreview) {
        selfRoomPreview.innerHTML = renderMarkdown(savedAnswer);
      }
      const selfListPreview = document.querySelector('.team-member-card.is-self .statement-preview-text');
      if (selfListPreview) {
        selfListPreview.innerHTML = renderMarkdown(savedAnswer);
      }
    }
  } catch (e) {}

  const compUrlParams = new URLSearchParams(window.location.search);
  const compQId = (compUrlParams.get('q') === '2' || compUrlParams.get('question') === '2') ? 2 : 1;
  const isReviewMode = compUrlParams.get('review') === '1' || compUrlParams.get('mode') === 'review';
  const compView = (compUrlParams.get('view') || compUrlParams.get('mode') || '').toLowerCase();
  const viewSuffix = (compView === 'multi' || compView === 'team' || compView === 'list') ? '&view=multi' : '';
  const compRoundIndicator = document.getElementById('comparison-round-indicator');
  const compQuestionTitle = document.getElementById('comparison-question-title');
  const btnBackQuestion = document.getElementById('btn-back-question');

  if (compQId === 2) {
    if (compRoundIndicator) {
      compRoundIndicator.innerHTML = `
        <span class="round-indicator-dot" aria-hidden="true"></span>
        <span>Question 2 of 2 &bull; Completed</span>
      `;
    }
    if (compQuestionTitle) {
      compQuestionTitle.innerText = "What is the single biggest architectural or operational bottleneck that could prevent our team from hitting our Q3 North Star metrics, and who owns the fix?";
    }

    // Update Metric 1 (Overall Alignment for Q2: 82%)
    const metricCard1 = document.querySelector('.alignment-metric-card:nth-child(1)');
    if (metricCard1) {
      const giantScore = metricCard1.querySelector('.metric-score-giant');
      if (giantScore) giantScore.innerHTML = `82<span class="metric-score-percent">%</span>`;
      const fillPath = metricCard1.querySelector('.curved-track-fill');
      if (fillPath) fillPath.setAttribute('stroke-dashoffset', '18');
      const subDetail = metricCard1.querySelector('.metric-sub-detail');
      if (subDetail) subDetail.textContent = '5 of 5 roles aligned on database contention & ownership';
    }

    // Update Metric 2 (Your Alignment Score for Q2: 89%)
    const metricCard2 = document.querySelector('.alignment-metric-card:nth-child(2)');
    if (metricCard2) {
      const giantScore = metricCard2.querySelector('.metric-score-giant');
      if (giantScore) giantScore.innerHTML = `89<span class="metric-score-percent">%</span>`;
      const fillPath = metricCard2.querySelector('.curved-track-fill');
      if (fillPath) fillPath.setAttribute('stroke-dashoffset', '11');
      const subDetail = metricCard2.querySelector('.metric-sub-detail');
      if (subDetail) subDetail.textContent = 'Ranked #1 closest match with engineering infrastructure pod';
    }

    // Update Summary for Q2
    const summaryPreviewParagraph = document.querySelector('.summary-preview-paragraph');
    if (summaryPreviewParagraph) {
      summaryPreviewParagraph.innerHTML = `The team achieved an impressive <strong>82% alignment</strong> identifying database connection pooling and Postgres write-lock contention as our decisive Q3 bottleneck. The room reached unanimous consensus that Raka Pratama's infra pod will own the Redis caching layer and connection multiplexer, completely resolving backend timeouts before Sarah scales customer acquisition spend.`;
    }
    const summaryExtendedInner = document.querySelector('.summary-extended-inner');
    if (summaryExtendedInner) {
      summaryExtendedInner.innerHTML = `
        <p><strong>Clear Pod Ownership:</strong> Engineering Lead (Raka) has officially accepted 100% ownership of database connection pooling and read-replica migration, targeting production readiness by Week 3.</p>
        <p><strong>Cross-Team Unblocking:</strong> Elena's design team will gain guaranteed 40ms API response SLAs to roll out optimistic UI states, while Sarah's marketing team received approval to scale 3x campaign spend once stress tests verify 5,000 req/sec stability.</p>
      `;
    }

    // Update Mode 1 (Side-by-Side Dual Rooms) for Q2
    const mutualFitBadge = document.querySelector('.spine-badge-val');
    if (mutualFitBadge) mutualFitBadge.textContent = '86%';

    const p1Card = document.querySelector('.perspective-room-card.is-self');
    if (p1Card) {
      const p1Preview = p1Card.querySelector('.statement-preview-text');
      const p1Extended = p1Card.querySelector('.statement-extended-text');
      const p1AlignPill = p1Card.querySelector('.room-alignment-pill span');
      if (p1AlignPill) p1AlignPill.textContent = '89% Aligned';
      if (p1Preview) {
        p1Preview.innerHTML = `<p>Our critical bottleneck is <strong>Postgres write-locks under high concurrent checkouts</strong>. Engineering infra pod must own the connection pooling fix before marketing ramps spend.</p>`;
      }
      if (p1Extended) {
        p1Extended.innerHTML = `
          <p>If checkout database latency exceeds 150ms during peak campaign pushes, user abandonment spikes exponentially.</p>
          <ul class="rendered-list">
            <li>Refactor connection multiplexer by Week 3</li>
            <li>Zero checkout latency regressions above 40ms SLA</li>
          </ul>
        `;
      }
    }

    const p2Card = document.querySelectorAll('.perspective-room-card')[1];
    if (p2Card) {
      const p2Preview = p2Card.querySelector('.statement-preview-text');
      const p2Extended = p2Card.querySelector('.statement-extended-text');
      const p2AlignPill = p2Card.querySelector('.room-alignment-pill span');
      if (p2AlignPill) p2AlignPill.textContent = '82% Aligned';
      if (p2Preview) {
        p2Preview.innerHTML = `<p>Infra pod accepts 100% ownership of <strong>deploying Redis caching and connection multiplexer routing</strong> by Week 3.</p>`;
      }
      if (p2Extended) {
        p2Extended.innerHTML = `
          <p>We will refactor transaction isolations on the payment checkout table and eliminate table lock contention before any 3x traffic scaling begins.</p>
          <ul class="rendered-list">
            <li>Implement PgBouncer connection pooling</li>
            <li>Add read-replicas for query offloading</li>
          </ul>
        `;
      }
    }

    // Update Mode 2 (Multi / Team List - 5 Participants) for Q2
    const q2TeamStatements = [
      {
        score: '89% Match',
        preview: `<p>Our single highest-risk bottleneck is <strong>Postgres write-locks under high concurrent checkouts</strong>. Engineering pod must own the connection pooling fix before marketing ramps spend.</p>`,
        extended: `<p>If checkout database latency exceeds 150ms during peak campaign pushes, user abandonment spikes exponentially. Raka's team must commit dedicated sprint capacity to unblock week 3.</p>`
      },
      {
        score: '82% Match',
        preview: `<p>Infra pod accepts 100% ownership of <strong>deploying Redis caching and read-replica routing</strong> by Week 3, keeping query latency strictly below 40ms.</p>`,
        extended: `<p>We are actively refactoring transaction isolations on the payment checkout table and eliminating table lock contention before any 3x traffic scaling begins.</p>`
      },
      {
        score: '85% Match',
        preview: `<p>Design relies on dependable API response times to implement <strong>seamless optimistic UI states</strong> and zero-flicker checkout transition animations.</p>`,
        extended: `<p>When backend latency spikes unpredictably, our skeleton loading states flash and erode trust. A sub-50ms database response is a strict UX prerequisite.</p>`
      },
      {
        score: '79% Match',
        preview: `<p>Marketing is scaling paid acquisition budget 3x next month. Any latency drop <strong>directly burns our CAC</strong>; 100% aligned that engineering fixes come first.</p>`,
        extended: `<p>We are pausing all aggressive influencer campaigns and referral invitations until Raka's infra pod verifies that checkout stress tests hold under 5,000 req/sec.</p>`
      },
      {
        score: '86% Match',
        preview: `<p>Payment gateway webhook timeouts create <strong>refund reconciliation discrepancies and customer support tickets</strong>. Database reliability has our highest operational ROI.</p>`,
        extended: `<p>Automated ledger reconciliation requires 99.99% webhook receipt without database write dropouts. Fully support prioritizing Raka's sprint commitment.</p>`
      }
    ];

    const teamCards = document.querySelectorAll('.team-member-card');
    teamCards.forEach((card, idx) => {
      const data = q2TeamStatements[idx];
      if (!data) return;
      const scorePill = card.querySelector('.team-card-score-pill span');
      if (scorePill) scorePill.textContent = data.score;
      const prev = card.querySelector('.statement-preview-text');
      if (prev) prev.innerHTML = data.preview;
      const ext = card.querySelector('.statement-extended-text');
      if (ext) ext.innerHTML = data.extended;
    });

    // If user submitted their own custom answer for Q2, inject it into Row 1
    try {
      const userQ2Answer = localStorage.getItem('samepage_user_answer_q2');
      if (userQ2Answer && userQ2Answer.trim()) {
        const selfRoomPrev = document.querySelector('.perspective-room-card.is-self .statement-preview-text');
        if (selfRoomPrev) selfRoomPrev.innerHTML = renderMarkdown(userQ2Answer);
        const selfListPrev = document.querySelector('.team-member-card.is-self .statement-preview-text');
        if (selfListPrev) selfListPrev.innerHTML = renderMarkdown(userQ2Answer);
      }
    } catch (e) {}

    if (btnBackQuestion) {
      btnBackQuestion.href = 'session.html?q=2&review=1';
      const backSpan = btnBackQuestion.querySelector('span');
      if (backSpan) backSpan.textContent = 'Review Question 2';
    }
    if (btnNextQuestion) {
      btnNextQuestion.innerHTML = `
        <span>Return to Analytics &rarr;</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
      btnNextQuestion.addEventListener('click', () => {
        showToast('Opening full session analytics report...', 'success');
        setTimeout(() => {
          window.location.href = 'analytics.html?combo=1' + viewSuffix;
        }, 450);
      });
    }
  } else {
    // Q1
    if (btnBackQuestion) {
      btnBackQuestion.href = 'session.html?q=1&review=1' + viewSuffix;
      const backSpan = btnBackQuestion.querySelector('span');
      if (backSpan) backSpan.textContent = 'Review Question 1';
    }

    if (btnNextQuestion) {
      if (isReviewMode) {
        // In review mode: SKIP MEME and go straight to Comparison 2!
        btnNextQuestion.innerHTML = `
          <span>Continue to Question 2 Comparison &rarr;</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
        btnNextQuestion.addEventListener('click', () => {
          showToast('Opening Question 2 comparison...', 'success');
          setTimeout(() => {
            window.location.href = 'comparison.html?q=2&review=1' + viewSuffix;
          }, 450);
        });
      } else {
        // Live session mode: take meme breather
        btnNextQuestion.addEventListener('click', () => {
          showToast('Take a quick meme breather...');
          setTimeout(() => {
            window.location.href = 'meme.html' + viewSuffix;
          }, 700);
        });
      }
    }
  }

  // Multi-Participant Toolbar: Search, Filter, Sort, Refresh, Count (Custom UI Dropdowns)
  function initMultiToolbar() {
    const searchInput = document.getElementById('multi-search-input');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    const refreshBtn = document.getElementById('btn-multi-refresh');
    const countText = document.getElementById('multi-count-text');
    const emptyState = document.getElementById('team-list-empty');
    const resetFiltersBtn = document.getElementById('btn-reset-filters');
    const teamStack = document.getElementById('team-list-stack');

    const filterWrap = document.getElementById('dropdown-filter-wrap');
    const filterTrigger = document.getElementById('btn-filter-trigger');
    const filterLabel = document.getElementById('filter-dropdown-label');
    const filterItems = filterWrap ? filterWrap.querySelectorAll('.custom-dropdown-item') : [];

    const sortWrap = document.getElementById('dropdown-sort-wrap');
    const sortTrigger = document.getElementById('btn-sort-trigger');
    const sortLabel = document.getElementById('sort-dropdown-label');
    const sortItems = sortWrap ? sortWrap.querySelectorAll('.custom-dropdown-item') : [];

    if (!teamStack) return;

    let currentFilterVal = 'all';
    let currentSortVal = 'match-desc';

    const cards = Array.from(teamStack.querySelectorAll('.team-member-card'));
    const totalCount = cards.length;

    // Helper to extract card data
    function getCardData(card) {
      const nameEl = card.querySelector('.team-member-name');
      const roleEl = card.querySelector('.team-member-role');
      const scoreEl = card.querySelector('.team-card-score-pill span');
      const prevEl = card.querySelector('.statement-preview-text');
      const extEl = card.querySelector('.statement-extended-text');

      const name = nameEl ? nameEl.textContent.trim() : '';
      const role = roleEl ? roleEl.textContent.trim() : '';
      const scoreStr = scoreEl ? scoreEl.textContent.trim() : '0';
      const score = parseInt(scoreStr, 10) || 0;
      const text = `${prevEl ? prevEl.textContent : ''} ${extEl ? extEl.textContent : ''}`;

      return { name, role, score, text };
    }

    function updateView() {
      const query = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
      const filterVal = currentFilterVal;
      const sortVal = currentSortVal;

      if (clearSearchBtn) {
        clearSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';
      }

      // Filter and score
      let visibleCount = 0;
      const matchedCards = [];

      cards.forEach(card => {
        const data = getCardData(card);

        // 1. Search Query Match
        let matchesQuery = true;
        if (query) {
          const haystack = `${data.name} ${data.role} ${data.text}`.toLowerCase();
          matchesQuery = haystack.includes(query);
        }

        // 2. Filter Match
        let matchesFilter = true;
        if (filterVal === 'high') {
          matchesFilter = data.score >= 80;
        } else if (filterVal === 'moderate') {
          matchesFilter = data.score >= 70 && data.score < 80;
        } else if (filterVal === 'low') {
          matchesFilter = data.score < 70;
        }

        if (matchesQuery && matchesFilter) {
          card.style.display = '';
          visibleCount++;
          matchedCards.push({ card, data });
        } else {
          card.style.display = 'none';
        }
      });

      // 3. Sort
      matchedCards.sort((a, b) => {
        if (sortVal === 'match-desc') {
          return b.data.score - a.data.score;
        } else if (sortVal === 'match-asc') {
          return a.data.score - b.data.score;
        } else if (sortVal === 'name-asc') {
          return a.data.name.localeCompare(b.data.name);
        } else if (sortVal === 'name-desc') {
          return b.data.name.localeCompare(a.data.name);
        }
        return 0;
      });

      // Reorder in DOM
      matchedCards.forEach(item => {
        teamStack.appendChild(item.card);
      });

      // Update Count
      if (countText) {
        countText.textContent = `${visibleCount} of ${totalCount}`;
      }

      // Empty State
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
      }
    }

    // Setup Custom Dropdown interactions
    function setupCustomDropdown(wrap, trigger, labelEl, items, onSelect) {
      if (!wrap || !trigger) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrap.classList.contains('is-open');

        // Close any other custom dropdown
        document.querySelectorAll('.custom-dropdown.is-open').forEach(d => {
          if (d !== wrap) {
            d.classList.remove('is-open');
            const btn = d.querySelector('.custom-dropdown-trigger');
            if (btn) {
              btn.classList.remove('is-active');
              btn.setAttribute('aria-expanded', 'false');
            }
          }
        });

        wrap.classList.toggle('is-open', !isOpen);
        trigger.classList.toggle('is-active', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });

      items.forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = item.getAttribute('data-value');
          const labelSpan = item.querySelector('.item-label');
          const text = labelSpan ? labelSpan.textContent.trim() : item.textContent.trim();

          items.forEach(it => {
            it.classList.remove('is-selected');
            it.setAttribute('aria-selected', 'false');
          });
          item.classList.add('is-selected');
          item.setAttribute('aria-selected', 'true');

          if (labelEl) labelEl.textContent = text;
          wrap.classList.remove('is-open');
          trigger.classList.remove('is-active');
          trigger.setAttribute('aria-expanded', 'false');

          onSelect(val);
        });
      });
    }

    // Close any open custom dropdown when clicking outside
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.custom-dropdown.is-open').forEach(d => {
        if (!d.contains(e.target)) {
          d.classList.remove('is-open');
          const btn = d.querySelector('.custom-dropdown-trigger');
          if (btn) {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.custom-dropdown.is-open').forEach(d => {
          d.classList.remove('is-open');
          const btn = d.querySelector('.custom-dropdown-trigger');
          if (btn) {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });

    setupCustomDropdown(filterWrap, filterTrigger, filterLabel, filterItems, (val) => {
      currentFilterVal = val;
      updateView();
    });

    setupCustomDropdown(sortWrap, sortTrigger, sortLabel, sortItems, (val) => {
      currentSortVal = val;
      updateView();
    });

    if (searchInput) {
      searchInput.addEventListener('input', updateView);
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        updateView();
        if (searchInput) searchInput.focus();
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentFilterVal = 'all';
        currentSortVal = 'match-desc';

        if (filterLabel) filterLabel.textContent = 'All Match Levels';
        filterItems.forEach(it => {
          const isDef = it.getAttribute('data-value') === 'all';
          it.classList.toggle('is-selected', isDef);
          it.setAttribute('aria-selected', isDef ? 'true' : 'false');
        });

        if (sortLabel) sortLabel.textContent = 'Highest Match';
        sortItems.forEach(it => {
          const isDef = it.getAttribute('data-value') === 'match-desc';
          it.classList.toggle('is-selected', isDef);
          it.setAttribute('aria-selected', isDef ? 'true' : 'false');
        });

        updateView();
        showToast('Filters reset', 'success');
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('is-spinning');
        updateView();
        showToast('Perspective list refreshed', 'success');
        setTimeout(() => {
          refreshBtn.classList.remove('is-spinning');
        }, 500);
      });
    }

    // Run initially
    updateView();
  }

  // Initialize toolbar
  initMultiToolbar();
}

// ==========================================
// 7. Meme Intermission Page Logic (7s Countdown)
// ==========================================
function initMemePage() {
  const btnForceNext = document.getElementById('btn-force-next');
  const btnCountdownTimer = document.getElementById('btn-countdown-timer');
  const autoSkipHint = document.getElementById('auto-skip-hint');

  if (!btnForceNext || !btnCountdownTimer) return;

  let secondsRemaining = 7;
  let hasAdvanced = false;

  function advanceToNextQuestion() {
    if (hasAdvanced) return;
    hasAdvanced = true;

    if (timerInterval) clearInterval(timerInterval);

    btnForceNext.disabled = true;
    btnForceNext.style.opacity = '0.75';
    if (btnCountdownTimer) btnCountdownTimer.textContent = '00s';
    if (autoSkipHint) autoSkipHint.textContent = 'Advancing to Question 2 of 2 (Final Question)...';

    showToast('Advancing to Question 2 of 2 (Final Question)...');
    setTimeout(() => {
      window.location.href = 'session.html?q=2';
    }, 750);
  }

  // Active 7-second countdown (Counts down to 00s and stays stuck without teleporting!)
  const timerInterval = setInterval(() => {
    if (secondsRemaining <= 1) {
      clearInterval(timerInterval);
      secondsRemaining = 0;
      if (btnCountdownTimer) btnCountdownTimer.textContent = '00s';
      return;
    }
    secondsRemaining--;
    if (btnCountdownTimer) btnCountdownTimer.textContent = `0${secondsRemaining}s`;
  }, 1000);

  // Manual force click button (Only navigate when user clicks!)
  btnForceNext.addEventListener('click', (e) => {
    e.preventDefault();
    advanceToNextQuestion();
  });
}

// ==========================================
// 8. Session Analytics & Breakdown (8 Room Combinations)
// ==========================================
const ANALYTICS_COMBOS = {
  1: {
    id: 1,
    summaryPreview: `Across all completed questions, the room established a decisive <strong>74% overall alignment</strong> on prioritizing platform reliability and shipping an MVP this month over secondary features. While you and Alex diverged on final design decision ownership (Product vs Design), both participants hold strong consensus on delivery timelines and technical prerequisites.`,
    summaryExtended: `<p><strong>Core Unanimous Commitments:</strong> Both participants strictly committed to an MVP delivery window within this month, agreeing that database connection pooling and checkout table locking are the non-negotiable operational blockers that must be resolved prior to scaling marketing spend.</p><p><strong>Primary Divergences &amp; Next Steps:</strong> The central friction lies in decision ownership for UX edge cases and sprint duration pacing (2 vs 3 weeks). The team is positioned to resolve these minor variances in a focused 5-minute sync without delaying the launch milestone.</p>`,
    title: "2 Participants · Pair Sync",
    overall: {
      score: 74,
      status: "Mostly aligned",
      statusClass: "tone-positive",
      dashoffset: 26,
      tags: [
        { label: "8 aligned", class: "tone-aligned" },
        { label: "3 mixed", class: "tone-mixed" },
        { label: "2 divided", class: "tone-divided" }
      ]
    },
    your: {
      score: 81,
      status: "+7% Above Room Avg",
      statusClass: "tone-indigo",
      dashoffset: 19,
      note: "You align <strong>81%</strong> with the room across all evaluated trade-offs"
    },
    renderCards: () => `
      <div class="combo-section-banner">
        <div class="combo-section-title-wrap">
          <h2 class="combo-section-title">Peer Alignment Breakdown</h2>
        </div>
        <a href="participants.html" class="combo-section-action-link" title="Explore individual participant perspectives">
          <span>View Participants</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Strongest Agreement -->
        <article class="analytics-card-base card-two-sided">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Strongest Agreement</span>
            </div>
            <span class="card-badge-pill tone-positive">96% Match</span>
          </div>
          <div class="dual-side-comparison">
            <div class="party-statement-box">
              <div class="party-header">
                <span class="party-avatar-mini avatar-color-indigo">A</span>
                <span class="party-label">You</span>
              </div>
              <p class="party-quote">&ldquo;The project should launch this month as an MVP.&rdquo;</p>
            </div>
            <div class="party-vs-spine">
              <span class="party-vs-badge tone-positive">96%</span>
            </div>
            <div class="party-statement-box">
              <div class="party-header">
                <span class="party-avatar-mini avatar-color-cyan">AL</span>
                <span class="party-label">Alex</span>
              </div>
              <p class="party-quote">&ldquo;Targeting final week of this month for initial release.&rdquo;</p>
            </div>
          </div>
        </article>

        <!-- Biggest Disagreement -->
        <article class="analytics-card-base card-two-sided">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Biggest Disagreement</span>
            </div>
            <span class="card-badge-pill tone-negative">31% Match</span>
          </div>
          <div class="dual-side-comparison">
            <div class="party-statement-box">
              <div class="party-header">
                <span class="party-avatar-mini avatar-color-indigo">A</span>
                <span class="party-label">You</span>
              </div>
              <p class="party-quote">&ldquo;Product Lead should own final design sign-off for market fit.&rdquo;</p>
            </div>
            <div class="party-vs-spine">
              <span class="party-vs-badge tone-divergent">VS</span>
            </div>
            <div class="party-statement-box">
              <div class="party-header">
                <span class="party-avatar-mini avatar-color-cyan">AL</span>
                <span class="party-label">Alex</span>
              </div>
              <p class="party-quote">&ldquo;Design Lead must retain full creative autonomy over UX flow.&rdquo;</p>
            </div>
          </div>
        </article>
      </div>

      <div class="analytics-grid-row-3">
        <!-- Shared Assumptions -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Shared Assumptions</span>
            </div>
            <span class="card-badge-pill tone-indigo">Unstated Consensus</span>
          </div>
          <div class="insight-contrast-card">
            <span class="insight-contrast-header">You Both Assumed</span>
            <p class="insight-contrast-body">
              &ldquo;The first release is strictly an MVP.&rdquo; Neither of you factored in enterprise multi-tenancy or invoice automation for v1.
            </p>
          </div>
        </article>

        <!-- Hidden Mismatch -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Hidden Mismatch</span>
            </div>
            <span class="card-badge-pill tone-amber">Nuance Divergence</span>
          </div>
          <div class="insight-contrast-card" style="background:#FFFBEB; border-color:#FDE68A; border-left-color:#F59E0B;">
            <span class="insight-contrast-header" style="color:#B45309;">Conflicting Definitions</span>
            <p class="insight-contrast-body" style="color:#78350F;">
              Both answered <strong>&ldquo;Yes&rdquo;</strong> to launching this month — but you meant <em>public general availability</em>, while Alex meant <em>closed private beta</em>.
            </p>
          </div>
        </article>

        <!-- Near Agreement -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Near Agreement</span>
            </div>
            <span class="card-badge-pill tone-positive">Easy to Resolve</span>
          </div>
          <div class="insight-contrast-card" style="background:#F0FDF4; border-color:#BBF7D0; border-left-color:#10B981;">
            <span class="insight-contrast-header" style="color:#047857;">Sprint Duration</span>
            <p class="insight-contrast-body" style="color:#064E3B;">
              You proposed <strong>2 weeks</strong>, Alex proposed <strong>3 weeks</strong>. A 5-minute alignment sync can easily establish compromise on a 2.5-week cadence.
            </p>
          </div>
        </article>
      </div>
    `
  },

  2: {
    id: 2,
    summaryPreview: `Across all completed questions, submissions achieved <strong>76% truth alignment</strong> against the authoritative reference specification. While participants formed strong internal consensus on shipping scope, the reference surfaced a critical blind spot regarding fixed cloud infrastructure caps and strict September 30th milestones.`,
    summaryExtended: `<p><strong>Authoritative Benchmarks:</strong> 9 of 12 responses directly adhered to the official SLA. However, the peer group's consensus to skip staging load tests directly contradicted the reference mandate of 5,000 req/sec benchmark verification.</p><p><strong>Resolution Target:</strong> Align the sprint buffer with the contractual September 30th deadline and cap staging cluster scaling at the fixed ,500/mo threshold.</p>`,
    title: "2 Participants · Reference Benchmark",
    overall: {
      score: 76,
      status: "Strong Alignment",
      statusClass: "tone-positive",
      dashoffset: 24,
      tags: [
        { label: "9 matched", class: "tone-aligned" },
        { label: "2 mixed", class: "tone-mixed" },
        { label: "1 differing", class: "tone-divided" }
      ]
    },
    your: {
      score: 84,
      status: "+8% Above Reference",
      statusClass: "tone-indigo",
      dashoffset: 16,
      note: "You matched the reference on <strong>8 of 10</strong> evaluated topics"
    },
    renderCards: () => `
      <div class="combo-section-banner">
        <div class="combo-section-title-wrap">
          <h2 class="combo-section-title">Truth Alignment &amp; Variance</h2>
        </div>
        <a href="participants.html" class="combo-section-action-link" title="Explore individual participant perspectives">
          <span>View Participants</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Truth Alignment -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Truth Alignment</span>
            </div>
            <span class="card-badge-pill tone-positive">Benchmark Match</span>
          </div>
          <div class="hero-metric-value-row">
            <div class="hero-score-giant-wrap">
              <span class="hero-score-giant">76</span>
              <span class="hero-score-percent">%</span>
            </div>
            <div class="hero-progress-group">
              <p class="party-quote"><strong>9 of 12 answers</strong> broadly matched the reference specification across core operational milestones.</p>
              <div class="h-bar-track" style="margin-top:6px;">
                <div class="h-bar-fill fill-indigo" style="width: 76%;"></div>
              </div>
            </div>
          </div>
        </article>

        <!-- Consensus vs Truth -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Consensus vs. Source of Truth</span>
            </div>
            <span class="card-badge-pill tone-amber">Gap Detected</span>
          </div>
          <div class="insight-contrast-card" style="background:#FFFBEB; border-color:#FDE68A; border-left-color:#F59E0B;">
            <span class="insight-contrast-header" style="color:#B45309;">You Agreed With Each Other... But Not The Reference!</span>
            <p class="insight-contrast-body" style="color:#78350F;">
              Peer Consensus: <strong>91%</strong> &bull; Truth Alignment: <strong>54%</strong>.<br>
              Both of you agreed to skip staging load-tests, but the Source of Truth mandates 5,000 req/sec benchmark tests before launch.
            </p>
          </div>
        </article>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Shared Blind Spot -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Shared Blind Spot</span>
            </div>
            <span class="card-badge-pill tone-negative">Overlooked Constraint</span>
          </div>
          <div class="insight-contrast-card" style="background:#FEF2F2; border-color:#FECACA; border-left-color:#EF4444;">
            <span class="insight-contrast-header" style="color:#DC2626;">Unchecked Assumptions</span>
            <p class="insight-contrast-body" style="color:#991B1B;">
              Both participants assumed <strong>the cloud budget was elastic and flexible</strong>.<br>
              The Source of Truth explicitly states that cloud expenditure is capped at <strong>$4,500/mo fixed</strong>.
            </p>
          </div>
        </article>

        <!-- Biggest Truth Gap -->
        <article class="analytics-card-base card-two-sided">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Biggest Truth Gap</span>
            </div>
            <span class="card-badge-pill tone-amber">15 Day Variance</span>
          </div>
          <div class="dual-side-comparison">
            <div class="party-statement-box">
              <div class="party-header">
                <span class="party-avatar-mini avatar-color-indigo">U</span>
                <span class="party-label">You &amp; Peer Expectation</span>
              </div>
              <p class="party-quote"><strong>October 15th</strong> (Post-Q3 sprint buffer)</p>
            </div>
            <div class="party-vs-spine">
              <span class="party-vs-badge tone-divergent">GAP</span>
            </div>
            <div class="party-statement-box">
              <div class="party-header">
                <span class="party-avatar-mini avatar-color-amber">SoT</span>
                <span class="party-label">Authoritative Reference</span>
              </div>
              <p class="party-quote"><strong>September 30th</strong> (Hard Contractual SLA)</p>
            </div>
          </div>
        </article>
      </div>
    `
  },

  3: {
    id: 3,
    summaryPreview: `Across all completed questions, Client and Freelancer established <strong>68% role alignment</strong>. Both parties share strong common ground on code quality and technical stack (Next.js + Postgres), but experience commercial tension around scope elasticity and revision cycles.`,
    summaryExtended: `<p><strong>Negotiation Window:</strong> Budget expectations reveal a high-feasibility compromise zone between 50 and ,000.</p><p><strong>Scope Clarification:</strong> Formally contract a maximum of 2 revision rounds per milestone to resolve the client's assumption of unlimited iterations.</p>`,
    title: "Client ↔ Freelancer Session",
    overall: {
      score: 68,
      status: "Moderate Alignment",
      statusClass: "tone-amber",
      dashoffset: 32,
      tags: [
        { label: "6 aligned", class: "tone-aligned" },
        { label: "4 negotiable", class: "tone-mixed" },
        { label: "2 gap", class: "tone-divided" }
      ]
    },
    your: {
      score: 73,
      status: "Client Position",
      statusClass: "tone-indigo",
      dashoffset: 27,
      note: "You align <strong>73%</strong> with the freelancer's working expectations"
    },
    renderCards: () => `
      <div class="combo-section-banner">
        <div class="combo-section-title-wrap">
          <h2 class="combo-section-title">Role Expectations &amp; Commercial Scope</h2>
        </div>
        <a href="participants.html" class="combo-section-action-link" title="Explore individual participant perspectives">
          <span>View Participants</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Role Alignment -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Role Alignment</span>
            </div>
            <span class="card-badge-pill tone-indigo">Client ↔ Freelancer</span>
          </div>
          <div class="hero-metric-value-row">
            <div class="hero-score-giant-wrap">
              <span class="hero-score-giant text-indigo">68</span>
              <span class="hero-score-percent text-indigo">%</span>
            </div>
            <div class="hero-progress-group">
              <p class="party-quote">Both sides hold high common ground on deliverables, but experience commercial tension around turnaround SLAs and revision cycles.</p>
            </div>
          </div>
        </article>

        <!-- Negotiation Zone (Overlapping Range Slider Visual) -->
        <article class="analytics-card-base card-negotiation-zone">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Negotiation Zone</span>
            </div>
            <span class="card-badge-pill tone-positive">Viable Compromise</span>
          </div>
          <div class="negotiation-canvas">
            <div class="range-track-row">
              <div class="range-label-row">
                <span>Client Budget: $800 &ndash; $1,000</span>
                <span style="color:var(--primary);">$1,000 Cap</span>
              </div>
              <div class="range-bar-track">
                <div class="range-bar-span span-client" style="left: 10%; width: 45%;"></div>
              </div>
            </div>

            <div class="range-track-row">
              <div class="range-label-row">
                <span>Freelancer Expectation: $950 &ndash; $1,200</span>
                <span style="color:#0284C7;">$950 Min</span>
              </div>
              <div class="range-bar-track">
                <div class="range-bar-span span-freelancer" style="left: 35%; width: 50%;"></div>
              </div>
            </div>

            <div class="negotiation-overlap-highlight">
              <span><strong>Mutual Compromise Window:</strong> High feasibility between $950 and $1,000</span>
              <span class="overlap-pill-badge">$950 &ndash; $1,000</span>
            </div>
          </div>
        </article>
      </div>

      <div class="analytics-grid-row-3">
        <!-- Cross-Role Common Ground -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Common Ground</span>
            </div>
            <span class="card-badge-pill tone-positive">Shared Values</span>
          </div>
          <ul class="rendered-list" style="margin:0; font-size:0.86rem; color:var(--text-secondary);">
            <li>Both prioritize clean architecture over rushed launch speed</li>
            <li>Universal agreement on Next.js + Postgres tech stack</li>
            <li>Asynchronous weekly video demos preferred over daily syncs</li>
          </ul>
        </article>

        <!-- Biggest Role Gap -->
        <article class="analytics-card-base card-two-sided">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Biggest Role Gap</span>
            </div>
            <span class="card-badge-pill tone-negative">Scope Flexibility</span>
          </div>
          <div class="dual-side-comparison">
            <div class="party-statement-box">
              <span class="party-label">Client</span>
              <p class="party-quote"><strong>High</strong> (Wants weekly feature pivot flexibility)</p>
            </div>
            <div class="party-vs-spine">
              <span class="party-vs-badge tone-divergent">GAP</span>
            </div>
            <div class="party-statement-box">
              <span class="party-label">Freelancer</span>
              <p class="party-quote"><strong>Low</strong> (Strict adherence to signed contract)</p>
            </div>
          </div>
        </article>

        <!-- Expectation Mismatch -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Expectation Mismatch</span>
            </div>
            <span class="card-badge-pill tone-amber">Unspoken Terms</span>
          </div>
          <div class="insight-contrast-card" style="background:#FFFBEB; border-color:#FDE68A; border-left-color:#F59E0B;">
            <p class="insight-contrast-body" style="color:#78350F; font-size:0.84rem;">
              <strong>Client expected:</strong> Unlimited minor revisions throughout the project milestone.<br>
              <strong>Freelancer expected:</strong> A maximum of 2 revision rounds per milestone before change-orders apply.
            </p>
          </div>
        </article>
      </div>
    `
  },

  4: {
    id: 4,
    summaryPreview: `Across all completed questions, the engagement achieved <strong>79% alignment</strong> governed by the Master Statement of Work. Freelancer scope estimation demonstrated 84% fidelity to contract terms, while Client requests reflected out-of-scope feature creep.`,
    summaryExtended: `<p><strong>Contractual Ground Truth:</strong> Multi-tenant billing is contractually deferred to Phase 2 addendum, protecting the Phase 1 October 1st launch deadline agreed upon by all parties.</p>`,
    title: "Client ↔ Freelancer · SOW Governed",
    overall: {
      score: 79,
      status: "Reference Anchored",
      statusClass: "tone-positive",
      dashoffset: 21,
      tags: [
        { label: "10 verified", class: "tone-aligned" },
        { label: "2 discrepancies", class: "tone-divided" }
      ]
    },
    your: {
      score: 84,
      status: "Strong SOW Compliance",
      statusClass: "tone-indigo",
      dashoffset: 16,
      note: "Freelancer position closely mirrors the signed Master Statement of Work"
    },
    renderCards: () => `
      <div class="combo-section-banner">
        <div class="combo-section-title-wrap">
          <h2 class="combo-section-title">Contractual Scope Adherence</h2>
        </div>
        <a href="participants.html" class="combo-section-action-link" title="Explore individual participant perspectives">
          <span>View Participants</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Closest Role to Truth -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Closer to Reference</span>
            </div>
            <span class="card-badge-pill tone-positive">SOW Adherence</span>
          </div>
          <div class="horizontal-bars-stack">
            <div class="h-bar-item">
              <div class="h-bar-header">
                <span>Freelancer (Scope Fidelity)</span>
                <span class="h-bar-pct">84%</span>
              </div>
              <div class="h-bar-track">
                <div class="h-bar-fill fill-indigo" style="width: 84%;"></div>
              </div>
            </div>
            <div class="h-bar-item">
              <div class="h-bar-header">
                <span>Client (Feature Requests)</span>
                <span class="h-bar-pct" style="color:#D97706;">61%</span>
              </div>
              <div class="h-bar-track">
                <div class="h-bar-fill fill-amber" style="width: 61%;"></div>
              </div>
            </div>
          </div>
          <p class="party-quote" style="margin-top:6px;">Freelancer's scope estimation reflects the master Statement of Work (SOW) more accurately than Client's scope-creep requests.</p>
        </article>

        <!-- Role Truth Gap -->
        <article class="analytics-card-base card-two-sided">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Client ↔ Reference Gap</span>
            </div>
            <span class="card-badge-pill tone-negative">42 Point Variance</span>
          </div>
          <div class="dual-side-comparison">
            <div class="party-statement-box">
              <span class="party-label">Client Request</span>
              <p class="party-quote">&ldquo;Multi-tenant billing and enterprise audit logs must be in Phase 1.&rdquo;</p>
            </div>
            <div class="party-vs-spine">
              <span class="party-vs-badge tone-divergent">GAP</span>
            </div>
            <div class="party-statement-box">
              <span class="party-label">Reference SOW Contract</span>
              <p class="party-quote">&ldquo;Multi-tenant billing is explicitly categorized under Phase 2 addendum.&rdquo;</p>
            </div>
          </div>
        </article>
      </div>

      <!-- Verified Common Ground -->
      <article class="analytics-card-base">
        <div class="analytics-card-header">
          <div class="card-title-group">
            <span class="card-title-sparkle">✦</span>
            <span class="card-title-text">Verified Common Ground</span>
          </div>
          <span class="card-badge-pill tone-positive">Contractually Confirmed</span>
        </div>
        <div class="verified-ground-card">
          <span class="verified-ground-header">✓ Mutual &amp; Verified Consensus</span>
          <p class="verified-ground-body">
            Both client and freelancer agreed that product launch must occur before <strong>October 1st</strong>, and the <strong>master reference contract confirms this is a mandatory release requirement</strong>.
          </p>
        </div>
      </article>
    `
  },

  5: {
    id: 5,
    summaryPreview: `The 5-person autonomous collective reached an impressive <strong>80% group alignment</strong> across all strategic questions. 4 of 5 teammates rallied behind an asynchronous remote execution model, while opinion clusters revealed a 3-person "Move Fast" core and valuable contrarian risk perspectives from David.`,
    summaryExtended: `<p><strong>Group Split Resolution:</strong> The 3-to-1 vote on immediate launch vs. security audit can be reconciled by running lightweight automated penetration scans concurrently with the final QA sprint.</p>`,
    summaryPreview: `The 5-person autonomous collective reached an impressive <strong>80% group alignment</strong> across all strategic questions. 4 of 5 teammates rallied behind an asynchronous remote execution model, while opinion clusters revealed a 3-person "Move Fast" core and valuable contrarian risk perspectives from David.`,
    summaryExtended: `<p><strong>Group Split Resolution:</strong> The 3-to-1 vote on immediate launch vs. security audit can be reconciled by running lightweight automated penetration scans concurrently with the final QA sprint.</p>`,
    title: "Team Session · Group Consensus",
    overall: {
      score: 80,
      status: "Strong Consensus",
      statusClass: "tone-positive",
      dashoffset: 20,
      tags: [
        { label: "9 strong", class: "tone-aligned" },
        { label: "2 split", class: "tone-mixed" },
        { label: "1 outlier", class: "tone-divided" }
      ]
    },
    your: {
      score: 86,
      status: "Top Contributor Match",
      statusClass: "tone-indigo",
      dashoffset: 14,
      note: "You align <strong>86%</strong> with the collective group average across all discussions"
    },
    renderCards: () => `
      <div class="combo-section-banner">
        <div class="combo-section-title-wrap">
          <h2 class="combo-section-title">Group Consensus Dynamics</h2>
        </div>
        <a href="participants.html" class="combo-section-action-link" title="Explore individual participant perspectives">
          <span>View All 5 Participants</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Strongest Consensus -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Strongest Consensus</span>
            </div>
            <span class="card-badge-pill tone-positive">4 of 5 Agreed</span>
          </div>
          <div class="insight-contrast-card" style="background:#F0FDF4; border-color:#BBF7D0; border-left-color:#10B981;">
            <span class="insight-contrast-header" style="color:#047857;">Universal Stance</span>
            <p class="insight-contrast-body" style="color:#064E3B; font-size:1.02rem; font-weight:600;">
              &ldquo;Remote-first asynchronous work cadence is preferred for engineering and design execution.&rdquo;
            </p>
          </div>
        </article>

        <!-- Biggest Split (Segmented Bar Visual) -->
        <article class="analytics-card-base card-segmented-bar">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Biggest Split</span>
            </div>
            <span class="card-badge-pill tone-amber">Divided Room</span>
          </div>
          <p class="party-quote" style="margin-bottom:8px;"><strong>Topic:</strong> Launch MVP immediately vs. delay 2 weeks for security audit?</p>
          <div class="segmented-track-bar">
            <div class="seg-part tone-launch" style="width: 60%;" title="3 Launch Now (60%)"></div>
            <div class="seg-part tone-delay" style="width: 20%;" title="1 Delay for Audit (20%)"></div>
            <div class="seg-part tone-unsure" style="width: 20%;" title="1 Unsure (20%)"></div>
          </div>
          <div class="segmented-legend-row">
            <span class="seg-legend-item"><span class="seg-legend-dot" style="background:var(--primary);"></span> 3 Launch Now (60%)</span>
            <span class="seg-legend-item"><span class="seg-legend-dot" style="background:#F59E0B;"></span> 1 Delay for Audit (20%)</span>
            <span class="seg-legend-item"><span class="seg-legend-dot" style="background:#94A3B8;"></span> 1 Unsure (20%)</span>
          </div>
        </article>
      </div>

      <div class="analytics-grid-row-3">
        <!-- Opinion Clusters -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Opinion Clusters</span>
            </div>
            <span class="card-badge-pill tone-indigo">3 Perspectives</span>
          </div>
          <div class="opinion-clusters-grid">
            <div class="cluster-bubble-card">
              <span class="cluster-tag-pill tone-fast">Move Fast</span>
              <span class="cluster-count-label">3 members</span>
              <div class="cluster-avatars-row">
                <span class="cluster-avatar-mini avatar-color-indigo">A</span>
                <span class="cluster-avatar-mini avatar-color-cyan">E</span>
                <span class="cluster-avatar-mini avatar-color-amber">M</span>
              </div>
            </div>
            <div class="cluster-bubble-card">
              <span class="cluster-tag-pill tone-safe">Play It Safe</span>
              <span class="cluster-count-label">1 member</span>
              <div class="cluster-avatars-row">
                <span class="cluster-avatar-mini avatar-color-rose">D</span>
              </div>
            </div>
            <div class="cluster-bubble-card">
              <span class="cluster-tag-pill tone-middle">Middle Ground</span>
              <span class="cluster-count-label">1 member</span>
              <div class="cluster-avatars-row">
                <span class="cluster-avatar-mini avatar-color-purple">S</span>
              </div>
            </div>
          </div>
        </article>

        <!-- Closest Match -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Your Closest Match</span>
            </div>
            <span class="card-badge-pill tone-positive">88% Aligned</span>
          </div>
          <div class="people-card-layout">
            <div class="people-avatar-large avatar-color-cyan">ER</div>
            <div class="people-info-box">
              <span class="people-name">Elena Rostova</span>
              <p class="people-bio-note">Elena's perspective mirrors yours closely, prioritizing core checkout conversion over non-essential styling features.</p>
            </div>
          </div>
        </article>

        <!-- Most Unique Perspective -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Unique Perspective</span>
            </div>
            <span class="card-badge-pill tone-amber">Contrarian Voice</span>
          </div>
          <div class="people-card-layout">
            <div class="people-avatar-large avatar-color-rose">DC</div>
            <div class="people-info-box">
              <span class="people-name">David Chen</span>
              <p class="people-bio-note">Brings valuable contrarian focus to payment webhook edge cases and refund reconciliation risks overlooked by the room.</p>
            </div>
          </div>
        </article>
      </div>
    `
  },

  6: {
    id: 6,
    summaryPreview: `The multi-member room achieved <strong>72% collective alignment</strong> evaluated against the reference architecture. While team consensus was strong internally, 4 of 5 participants shared an erroneous assumption regarding on-call maintenance inclusion.`,
    summaryExtended: `<p><strong>Reference Discrepancy:</strong> The authoritative SLA categorizes 24/7 on-call DevOps as a Tier 2 enterprise add-on, requiring contractual sign-off before production release.</p>`,
    summaryPreview: `The multi-member room achieved <strong>72% collective alignment</strong> evaluated against the reference architecture. While team consensus was strong internally, 4 of 5 participants shared an erroneous assumption regarding on-call maintenance inclusion.`,
    summaryExtended: `<p><strong>Reference Discrepancy:</strong> The authoritative SLA categorizes 24/7 on-call DevOps as a Tier 2 enterprise add-on, requiring contractual sign-off before production release.</p>`,
    title: "Architecture &amp; System Benchmark",
    overall: {
      score: 72,
      status: "Moderate Truth Fidelity",
      statusClass: "tone-amber",
      dashoffset: 28,
      tags: [
        { label: "8 matched", class: "tone-aligned" },
        { label: "3 differed", class: "tone-mixed" },
        { label: "1 blindspot", class: "tone-divided" }
      ]
    },
    your: {
      score: 79,
      status: "+7% Above Room Benchmark",
      statusClass: "tone-indigo",
      dashoffset: 21,
      note: "Your submissions matched <strong>8 of 11</strong> architectural requirements"
    },
    renderCards: () => `
      <div class="combo-section-banner">
        <div class="combo-section-title-wrap">
          <h2 class="combo-section-title">System Truth &amp; Group Compliance</h2>
        </div>
        <a href="participants.html" class="combo-section-action-link" title="Explore individual participant perspectives">
          <span>View All 5 Participants</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Group Truth Alignment -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Group ↔ Truth Alignment</span>
            </div>
            <span class="card-badge-pill tone-indigo">Room Aggregate</span>
          </div>
          <div class="hero-metric-value-row">
            <div class="hero-score-giant-wrap">
              <span class="hero-score-giant text-indigo">72</span>
              <span class="hero-score-percent text-indigo">%</span>
            </div>
            <div class="hero-progress-group">
              <p class="party-quote"><strong>8 topics matched</strong> authoritative guidelines &bull; <strong>3 differed</strong> across security boundaries and data retention policies.</p>
              <div class="h-bar-track" style="margin-top:6px;">
                <div class="h-bar-fill fill-indigo" style="width: 72%;"></div>
              </div>
            </div>
          </div>
        </article>

        <!-- Majority vs Truth -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Majority vs. Truth</span>
            </div>
            <span class="card-badge-pill tone-negative">Contradiction</span>
          </div>
          <div class="insight-contrast-card" style="background:#FEF2F2; border-color:#FECACA; border-left-color:#EF4444;">
            <span class="insight-contrast-header" style="color:#DC2626;">Everyone Agreed. The Reference Disagreed!</span>
            <p class="insight-contrast-body" style="color:#991B1B;">
              4 of 5 team members agreed to skip dedicated staging load tests to meet the launch date. The Source of Truth mandates automated load tests up to 5,000 req/sec before production promotion.
            </p>
          </div>
        </article>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Shared Misconception -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Shared Misconception</span>
            </div>
            <span class="card-badge-pill tone-amber">Group Assumption</span>
          </div>
          <div class="insight-contrast-card" style="background:#FFFBEB; border-color:#FDE68A; border-left-color:#F59E0B;">
            <p class="insight-contrast-body" style="color:#78350F;">
              4 of 5 team members assumed delivery automatically included 24/7 on-call DevOps coverage. The <strong>reference contract SLA specifies that on-call requires a dedicated Tier 2 enterprise agreement</strong>.
            </p>
          </div>
        </article>

        <!-- Furthest-from-Truth Cluster -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Furthest from Reference</span>
            </div>
            <span class="card-badge-pill tone-negative">48% Alignment</span>
          </div>
          <div class="people-card-layout">
            <div class="cluster-bubble-card" style="flex:1;">
              <span class="cluster-tag-pill tone-fast">&ldquo;Move Fast&rdquo; Cluster</span>
              <p class="people-bio-note" style="margin-top:6px;">
                The velocity-focused cluster bypassed core data governance checkpoints and audit logging requirements mandated in the reference specification.
              </p>
            </div>
          </div>
        </article>
      </div>
    `
  },

  7: {
    id: 7,
    summaryPreview: `Cross-functional evaluation across Developer, Designer, and Manager pods revealed <strong>71% inter-pod alignment</strong>. Developers and Designers showed high synergy (81%), while Managers exhibited internal division (48% cohesion) regarding revenue quotas vs. tech debt refactoring.`,
    summaryExtended: `<p><strong>Unified Objective:</strong> All three functional disciplines agree that checkout database latency is the #1 threat to customer retention, creating a clear shared priority for sprint execution.</p>`,
    summaryPreview: `Cross-functional evaluation across Developer, Designer, and Manager pods revealed <strong>71% inter-pod alignment</strong>. Developers and Designers showed high synergy (81%), while Managers exhibited internal division (48% cohesion) regarding revenue quotas vs. tech debt refactoring.`,
    summaryExtended: `<p><strong>Unified Objective:</strong> All three functional disciplines agree that checkout database latency is the #1 threat to customer retention, creating a clear shared priority for sprint execution.</p>`,
    title: "Cross-Disciplinary Teams · Inter-Role Sync",
    overall: {
      score: 71,
      status: "Cross-Functional Sync",
      statusClass: "tone-positive",
      dashoffset: 29,
      tags: [
        { label: "7 shared", class: "tone-aligned" },
        { label: "4 divergent", class: "tone-mixed" },
        { label: "1 silo", class: "tone-divided" }
      ]
    },
    your: {
      score: 83,
      status: "Cross-Pod Bridge",
      statusClass: "tone-indigo",
      dashoffset: 17,
      note: "You bridge alignment between engineering velocity and product management priorities"
    },
    renderCards: () => `
      <div class="combo-section-banner">
        <div class="combo-section-title-wrap">
          <h2 class="combo-section-title">Inter-Disciplinary Matrix &amp; Cohesion</h2>
        </div>
        <a href="participants.html" class="combo-section-action-link" title="Explore individual participant perspectives">
          <span>View All 5 Participants</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Inter-Role Alignment Matrix -->
        <article class="analytics-card-base card-inter-role-matrix">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Inter-Role Alignment Matrix</span>
            </div>
            <span class="card-badge-pill tone-indigo">Department Correlator</span>
          </div>
          <table class="role-matrix-table">
            <thead>
              <tr>
                <th>Pod</th>
                <th>Developer</th>
                <th>Designer</th>
                <th>Manager</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Developer</strong></td>
                <td class="matrix-cell self-cell">&mdash;</td>
                <td class="matrix-cell high-match" title="High Shared Agreement">81%</td>
                <td class="matrix-cell med-match" title="Moderate Disagreement on Scope">53%</td>
              </tr>
              <tr>
                <td><strong>Designer</strong></td>
                <td class="matrix-cell high-match" title="High Shared Agreement">81%</td>
                <td class="matrix-cell self-cell">&mdash;</td>
                <td class="matrix-cell med-match" title="Moderate Alignment">61%</td>
              </tr>
              <tr>
                <td><strong>Manager</strong></td>
                <td class="matrix-cell med-match" title="Moderate Disagreement">53%</td>
                <td class="matrix-cell med-match" title="Moderate Alignment">61%</td>
                <td class="matrix-cell self-cell">&mdash;</td>
              </tr>
            </tbody>
          </table>
        </article>

        <!-- Role Cohesion (Horizontal Bars) -->
        <article class="analytics-card-base card-horizontal-bars">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Internal Role Cohesion</span>
            </div>
            <span class="card-badge-pill tone-positive">Intra-Pod Unity</span>
          </div>
          <div class="horizontal-bars-stack">
            <div class="h-bar-item">
              <div class="h-bar-header">
                <span>Developers (4 members)</span>
                <span class="h-bar-pct">92% Cohesive</span>
              </div>
              <div class="h-bar-track">
                <div class="h-bar-fill fill-indigo" style="width: 92%;"></div>
              </div>
            </div>
            <div class="h-bar-item">
              <div class="h-bar-header">
                <span>Designers (3 members)</span>
                <span class="h-bar-pct">74% Cohesive</span>
              </div>
              <div class="h-bar-track">
                <div class="h-bar-fill fill-indigo" style="width: 74%;"></div>
              </div>
            </div>
            <div class="h-bar-item">
              <div class="h-bar-header">
                <span>Managers (2 members)</span>
                <span class="h-bar-pct" style="color:#DC2626;">48% Cohesive</span>
              </div>
              <div class="h-bar-track">
                <div class="h-bar-fill fill-rose" style="width: 48%;"></div>
              </div>
            </div>
          </div>
          <p class="party-quote" style="margin-top:6px; font-size:0.82rem; color:var(--text-muted);">
            High internal cohesion indicates pods speak with one voice; low cohesion highlights internal debate within that discipline.
          </p>
        </article>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Most Divided Role -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Most Divided Role: Managers</span>
            </div>
            <span class="card-badge-pill tone-negative">48% Internal Sync</span>
          </div>
          <div class="insight-contrast-card" style="background:#FEF2F2; border-color:#FECACA; border-left-color:#EF4444;">
            <span class="insight-contrast-header" style="color:#DC2626;">Primary Internal Dispute</span>
            <p class="insight-contrast-body" style="color:#991B1B;">
              Managers split 50/50 on whether to prioritize quarterly acquisition quotas vs. engineering debt refactoring before shipping the major release.
            </p>
          </div>
        </article>

        <!-- Cross-Role Common Ground & Biggest Gap -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Cross-Pod Synthesis</span>
            </div>
            <span class="card-badge-pill tone-indigo">Org Insights</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="font-size:0.86rem; color:var(--text-secondary);">
              <strong>Common Ground:</strong> All 3 pods universally agree that checkout latency is the single highest threat to Q3 user retention.
            </div>
            <div style="font-size:0.86rem; color:var(--text-secondary);">
              <strong>Biggest Role Gap:</strong> Developers and Managers disagree on sprint velocity points estimation by 38%.
            </div>
          </div>
        </article>
      </div>
    `
  },

  8: {
    id: 8,
    summaryPreview: `Organization-wide alignment against Master OKRs reached <strong>78% compliance</strong>. Developers led with 84% benchmark adherence, while all three disciplines shared a blind spot concerning continuous shift-left security testing.`,
    summaryExtended: `<p><strong>Cross-Disciplinary Action:</strong> Automated security penetration testing will be moved from post-freeze to continuous integration pipelines as mandated by the master specification.</p>`,
    summaryPreview: `Organization-wide alignment against Master OKRs reached <strong>78% compliance</strong>. Developers led with 84% benchmark adherence, while all three disciplines shared a blind spot concerning continuous shift-left security testing.`,
    summaryExtended: `<p><strong>Cross-Disciplinary Action:</strong> Automated security penetration testing will be moved from post-freeze to continuous integration pipelines as mandated by the master specification.</p>`,
    title: "Organization Sync · OKR Governed",
    overall: {
      score: 78,
      status: "OKR Anchored",
      statusClass: "tone-positive",
      dashoffset: 22,
      tags: [
        { label: "11 on-track", class: "tone-aligned" },
        { label: "2 misaligned", class: "tone-divided" }
      ]
    },
    your: {
      score: 87,
      status: "Top OKR Alignment",
      statusClass: "tone-indigo",
      dashoffset: 13,
      note: "Ranked #1 closest match with master engineering architecture and target metrics"
    },
    renderCards: () => `
      <div class="combo-section-banner">
        <div class="combo-section-title-wrap">
          <h2 class="combo-section-title">Strategic Goal &amp; Reference Alignment</h2>
        </div>
        <a href="participants.html" class="combo-section-action-link" title="Explore individual participant perspectives">
          <span>View All 5 Participants</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Role vs Truth (Horizontal Bar Chart) -->
        <article class="analytics-card-base card-horizontal-bars">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Alignment with Reference</span>
            </div>
            <span class="card-badge-pill tone-positive">Department Compliance</span>
          </div>
          <div class="horizontal-bars-stack">
            <div class="h-bar-item">
              <div class="h-bar-header">
                <span>Developers</span>
                <span class="h-bar-pct">84%</span>
              </div>
              <div class="h-bar-track">
                <div class="h-bar-fill fill-indigo" style="width: 84%;"></div>
              </div>
            </div>
            <div class="h-bar-item">
              <div class="h-bar-header">
                <span>Designers</span>
                <span class="h-bar-pct">77%</span>
              </div>
              <div class="h-bar-track">
                <div class="h-bar-fill fill-indigo" style="width: 77%;"></div>
              </div>
            </div>
            <div class="h-bar-item">
              <div class="h-bar-header">
                <span>Managers</span>
                <span class="h-bar-pct" style="color:#D97706;">52%</span>
              </div>
              <div class="h-bar-track">
                <div class="h-bar-fill fill-amber" style="width: 52%;"></div>
              </div>
            </div>
          </div>
          <p class="party-quote" style="margin-top:6px; font-size:0.82rem; color:var(--text-muted);">
            Managers show highest variance from the reference due to conflicting external sales commitments.
          </p>
        </article>

        <!-- Cross-Role Blind Spot -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Cross-Role Blind Spot</span>
            </div>
            <span class="card-badge-pill tone-negative">Company-Wide Flaw</span>
          </div>
          <div class="insight-contrast-card" style="background:#FEF2F2; border-color:#FECACA; border-left-color:#EF4444;">
            <span class="insight-contrast-header" style="color:#DC2626;">All 3 Roles Shared The Same Error</span>
            <p class="insight-contrast-body" style="color:#991B1B;">
              Developers, Designers, and Managers all assumed security testing begins only after feature freeze.<br>
              The Reference Specification mandates continuous shift-left automated penetration testing from day one.
            </p>
          </div>
        </article>
      </div>

      <div class="analytics-grid-row-2">
        <!-- Verified Common Ground -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Verified Common Ground</span>
            </div>
            <span class="card-badge-pill tone-positive">Verified Compliance</span>
          </div>
          <div class="verified-ground-card">
            <span class="verified-ground-header">✓ Reference Endorsed</span>
            <p class="verified-ground-body">
              All 3 roles committed to sub-100ms API responses, and the <strong>master architectural blueprint confirms</strong> this is mandatory for enterprise tier certification.
            </p>
          </div>
        </article>

        <!-- Truth Consistency Check -->
        <article class="analytics-card-base">
          <div class="analytics-card-header">
            <div class="card-title-group">
              <span class="card-title-sparkle">✦</span>
              <span class="card-title-text">Source Consistency Check</span>
            </div>
            <span class="card-badge-pill tone-positive">100% Consistent</span>
          </div>
          <div class="insight-contrast-card" style="background:#F0FDF4; border-color:#BBF7D0; border-left-color:#10B981;">
            <span class="insight-contrast-header" style="color:#047857;">Reference Integrity</span>
            <p class="insight-contrast-body" style="color:#064E3B;">
              The master OKR documentation, API SLAs, and architectural design files were cross-checked and verified 100% mutually consistent without contradictory specifications.
            </p>
          </div>
        </article>
      </div>
    `
  }
};
window.ANALYTICS_COMBOS = ANALYTICS_COMBOS;

function initAnalyticsPage() {
  const dynamicContainer = document.getElementById('dynamic-combo-container');
  if (!dynamicContainer) return;

  const modeIndicator = document.getElementById('analytics-mode-indicator');
  const overallScoreNum = document.getElementById('overall-score-num');
  const overallScurveFill = document.getElementById('overall-scurve-fill');
  const overallStatusPill = document.getElementById('overall-status-pill');
  const overallMiniBreakdown = document.getElementById('overall-mini-breakdown');

  const yourScoreNum = document.getElementById('your-score-num');
  const yourScurveFill = document.getElementById('your-scurve-fill');
  const yourStatusPill = document.getElementById('your-status-pill');
  const yourBenchNote = document.getElementById('your-bench-note');

  const comboPills = document.querySelectorAll('.combo-switch-pill');

  function renderCombo(comboId) {
    const data = ANALYTICS_COMBOS[comboId] || ANALYTICS_COMBOS[1];

    // Update Pill Buttons
    comboPills.forEach(pill => {
      const pId = parseInt(pill.getAttribute('data-combo'), 10);
      if (pId === data.id) {
        pill.classList.add('is-active');
      } else {
        pill.classList.remove('is-active');
      }
    });

    // Update Mode Title
    if (modeIndicator) {
      modeIndicator.textContent = "Complete";
    }

    // Update Header Session Stats
    const headerPartCount = document.getElementById('header-participants-count');
    if (headerPartCount) {
      headerPartCount.textContent = (data.mode && data.mode.includes('5')) ? '5 Participants' : '2 Participants';
    }
    const headerDuration = document.getElementById('header-duration-text');
    if (headerDuration) {
      headerDuration.textContent = (data.mode && data.mode.includes('5')) ? '08:42' : '05:24';
    }

    // Update AI Summary Content
    const summaryPreviewEl = document.getElementById("analytics-summary-preview");
    const summaryExtendedEl = document.getElementById("analytics-summary-extended");
    if (summaryPreviewEl && data.summaryPreview) {
      summaryPreviewEl.innerHTML = data.summaryPreview;
    }
    if (summaryExtendedEl && data.summaryExtended) {
      summaryExtendedEl.innerHTML = data.summaryExtended;
    }

    // Update Overall Alignment Hero Metric
    if (overallScoreNum) overallScoreNum.textContent = data.overall.score;
    if (overallScurveFill) overallScurveFill.setAttribute('stroke-dashoffset', data.overall.dashoffset);
    if (overallStatusPill) {
      overallStatusPill.textContent = data.overall.status;
      overallStatusPill.className = `hero-status-pill ${data.overall.statusClass || 'tone-positive'}`;
    }
    if (overallMiniBreakdown) {
      overallMiniBreakdown.innerHTML = data.overall.tags.map((tag, idx) => `
        <span class="breakdown-tag ${tag.class}">${tag.label}</span>
        ${idx < data.overall.tags.length - 1 ? '<span class="breakdown-dot">&bull;</span>' : ''}
      `).join('');
    }

    // Update Your Alignment Hero Metric
    if (yourScoreNum) yourScoreNum.textContent = data.your.score;
    if (yourScurveFill) yourScurveFill.setAttribute('stroke-dashoffset', data.your.dashoffset);
    if (yourStatusPill) {
      yourStatusPill.textContent = data.your.status;
      yourStatusPill.className = `hero-status-pill ${data.your.statusClass || 'tone-indigo'}`;
    }
    if (yourBenchNote) {
      yourBenchNote.innerHTML = `<span>${data.your.note}</span>`;
    }

    // Render Dynamic Cards
    dynamicContainer.innerHTML = data.renderCards();
  }

  // Determine initial combination from URL parameter or hash
  function getInitialCombo() {
    const params = new URLSearchParams(window.location.search);
    const comboParam = params.get('combo') || params.get('combination') || params.get('mode');
    if (comboParam && ANALYTICS_COMBOS[comboParam]) {
      return parseInt(comboParam, 10);
    }

    // Check query dimensions: ?people=2&role=0&sot=0
    const people = (params.get('people') || params.get('participants') || '').toLowerCase();
    const role = (params.get('role') || params.get('roles') || '').toLowerCase();
    const sot = (params.get('sot') || params.get('truth') || '').toLowerCase();

    const is2p = people === '2' || people === 'two';
    const isRole = role === '1' || role === 'true' || role === 'yes';
    const isSot = sot === '1' || sot === 'true' || sot === 'yes';

    if (is2p && !isRole && !isSot) return 1;
    if (is2p && !isRole && isSot) return 2;
    if (is2p && isRole && !isSot) return 3;
    if (is2p && isRole && isSot) return 4;
    if (!is2p && !isRole && !isSot && people) return 5;
    if (!is2p && !isRole && isSot && people) return 6;
    if (!is2p && isRole && !isSot && people) return 7;
    if (!is2p && isRole && isSot && people) return 8;

    // Check hash
    const hash = window.location.hash.toLowerCase();
    const match = hash.match(/combo-(\d+)/);
    if (match && ANALYTICS_COMBOS[match[1]]) {
      return parseInt(match[1], 10);
    }

    return 1;
  }

  // Collapsible Full Summary Drawer Toggle
  const btnToggleSummary = document.getElementById("btn-toggle-analytics-summary");
  const summaryDrawer = document.getElementById("analytics-summary-drawer");
  const toggleSummaryLabel = document.getElementById("toggle-analytics-summary-label");

  if (btnToggleSummary && summaryDrawer) {
    btnToggleSummary.addEventListener("click", () => {
      const isOpen = summaryDrawer.classList.contains("is-open");
      if (isOpen) {
        summaryDrawer.classList.remove("is-open");
        btnToggleSummary.classList.remove("is-expanded");
        btnToggleSummary.setAttribute("aria-expanded", "false");
        if (toggleSummaryLabel) toggleSummaryLabel.textContent = "Read Full Summary";
      } else {
        summaryDrawer.classList.add("is-open");
        btnToggleSummary.classList.add("is-expanded");
        btnToggleSummary.setAttribute("aria-expanded", "true");
        if (toggleSummaryLabel) toggleSummaryLabel.textContent = "Show Less";
      }
    });
  }

  const initialCombo = getInitialCombo();
  renderCombo(initialCombo);

  // Bind clicks to combo switcher pills
  comboPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const comboId = parseInt(pill.getAttribute('data-combo'), 10);
      renderCombo(comboId);

      // Update URL without reload
      const url = new URL(window.location);
      url.searchParams.set('combo', comboId);
      window.history.pushState({}, '', url);
    });
  });

  window.ANALYTICS_COMBOS = ANALYTICS_COMBOS;
}

// ==========================================
// 8b. Participants Page Logic & Analytics Popup Modal
// ==========================================
function initParticipantsPage() {
  const modalEl = document.getElementById('participant-analytics-modal');
  if (!modalEl) return;
  const teamStack = document.getElementById('team-list-stack') || document.getElementById('analytics-team-stack');

  const PARTICIPANTS_ANALYTICS_DATA = {
    elena: {
      id: 'elena',
      name: 'Elena Rostova',
      initials: 'ER',
      avatarColor: 'avatar-color-emerald',
      role: 'Design Lead',
      matchScore: 88,
      matchLabel: '88% Match · High',
      statusPillText: '+14% Above Room Avg',
      statusPillClass: 'tone-positive',
      dashoffset: 12,
      benchNote: 'Elena aligns <strong>88%</strong> with the room across all evaluated trade-offs',
      summaryPreview: 'Across all completed questions, Elena established a decisive <strong>88% overall alignment</strong> with the room, anchoring strongly on product velocity while advocating for eliminating form friction in checkout validation.',
      summaryExtended: `
        <p><strong>Core Unanimous Commitments:</strong> Elena agreed 100% to freezing marketing landing page redesigns and ancillary UI polish until core checkout latency stabilizes below 120ms.</p>
        <p><strong>Primary Nuances &amp; Divergence:</strong> She stressed that form validation micro-copy and error states directly impact conversion drop-off, asserting that design QA review must be mandatory before staging deployment.</p>
      `,
      strongestAgreement: {
        badge: '96% Match',
        youQuote: 'Priority is eliminating checkout friction and locking conversion retention loops before scaling paid ads.',
        peerQuote: 'Priority is eliminating micro-friction in checkout typography, input masking, and form error validation states.'
      },
      biggestDisagreement: {
        badge: '31% Match',
        youQuote: 'Engineering and Product should push hotfixes directly to staging to maintain release cadence.',
        peerQuote: 'Mandatory Design QA review is required before deploying visual validation hotfixes to production.'
      },
      sharedAssumptions: '&ldquo;The first release is strictly an MVP.&rdquo; Neither of you factored in enterprise multi-tenancy or ancillary marketing landing page revamps for v1.',
      hiddenMismatch: 'Both answered <strong>&ldquo;Yes&rdquo;</strong> to frictionless checkout — but you defined it as gateway latency (&lt;120ms), while Elena prioritized typography readability and input masking.',
      nearAgreement: 'A 5-minute pre-deploy visual checklist bridges the QA review gap without delaying the staging deployment cadence.',
      actionItems: [
        { title: 'Freeze Marketing Redesigns', desc: 'Hold off on promotional UI overhauls until checkout form conversion stabilizes above 3.5%.' },
        { title: 'Deploy Input Masking for Checkout', desc: 'Frontend team integrates automated card and phone formatting to reduce validation errors.' },
        { title: 'Establish 5-min Design QA Review', desc: 'Implement a rapid visual sign-off checkpoint for staging PRs touching checkout components.' }
      ]
    },
    raka: {
      id: 'raka',
      name: 'Raka Pratama',
      initials: 'RP',
      avatarColor: 'avatar-color-amber',
      role: 'Engineering Lead',
      matchScore: 78,
      matchLabel: '78% Match · Moderate',
      statusPillText: '+4% Above Room Avg',
      statusPillClass: 'tone-positive',
      dashoffset: 22,
      benchNote: 'Raka aligns <strong>78%</strong> with the room across all evaluated trade-offs',
      summaryPreview: 'Raka holds <strong>78% overall alignment</strong>, emphasizing database connection pooling, query indexing, and load testing as non-negotiable prerequisites before opening marketing traffic.',
      summaryExtended: `
        <p><strong>Core Unanimous Commitments:</strong> Aligned with locking checkout tables and resolving database thread contention before feature rollouts.</p>
        <p><strong>Primary Nuances &amp; Divergence:</strong> Strongly pushed back on adding new third-party analytics scripts until server CPU overhead drops below 40% under peak load.</p>
      `,
      strongestAgreement: {
        badge: '94% Match',
        youQuote: 'Platform reliability and database stability take 100% precedence before opening marketing traffic.',
        peerQuote: 'I agree that checkout reliability and database indexing take 100% precedence for upcoming release.'
      },
      biggestDisagreement: {
        badge: '28% Match',
        youQuote: 'Implement third-party client analytics scripts to measure user conversion drops in real-time.',
        peerQuote: 'Completely deprioritize third-party tracking scripts until backend stress tests pass under 5,000 req/sec.'
      },
      sharedAssumptions: '&ldquo;Postgres connection pool exhaustion is our primary risk.&rdquo; Both assumed database contention is the single highest bottleneck.',
      hiddenMismatch: 'Both agreed on <strong>&ldquo;Stress Testing&rdquo;</strong> — but you measured frontend render time, while Raka measured database read-replica failover under concurrent transactions.',
      nearAgreement: 'Offload telemetry event tracking to an asynchronous queue to preserve 120ms checkout response latency.',
      actionItems: [
        { title: 'Scale Postgres Connection Pooling', desc: 'Optimize PgBouncer pool limits and index slow query paths on transaction tables.' },
        { title: 'Execute 5,000 req/sec Load Test', desc: 'Validate read-replica failover performance prior to public traffic launch.' },
        { title: 'Offload Telemetry to Async Queue', desc: 'Process analytics scripts asynchronously to maintain server CPU below 40%.' }
      ]
    },
    david: {
      id: 'david',
      name: 'David Chen',
      initials: 'DC',
      avatarColor: 'avatar-color-rose',
      role: 'Ops & Finance',
      matchScore: 73,
      matchLabel: '73% Match · Moderate',
      statusPillText: '-1% Below Room Avg',
      statusPillClass: 'tone-neutral',
      dashoffset: 27,
      benchNote: 'David aligns <strong>73%</strong> with the room across all evaluated trade-offs',
      summaryPreview: 'David holds <strong>73% overall alignment</strong>, strictly prioritizing payment webhook automated reconciliation and refund pipelines to safeguard financial unit economics.',
      summaryExtended: `
        <p><strong>Core Unanimous Commitments:</strong> Endorses stabilizing the core payment funnel and delaying complex multi-currency ledger support.</p>
        <p><strong>Primary Nuances &amp; Divergence:</strong> Disagreed on manual edge-case refund handling, insisting that automated payment failure webhooks must be deployed in sprint 1.</p>
      `,
      strongestAgreement: {
        badge: '91% Match',
        youQuote: 'Core checkout payment retention takes precedence over complex enterprise billing features.',
        peerQuote: 'Protecting unit margin and refund reconciliation is top operational priority for financial health.'
      },
      biggestDisagreement: {
        badge: '34% Match',
        youQuote: 'Handle payment gateway edge-case exceptions manually during initial pilot weeks.',
        peerQuote: 'Automated payment failure webhooks must be deployed in sprint 1 to prevent financial leakage.'
      },
      sharedAssumptions: '&ldquo;Enterprise invoicing is deferred.&rdquo; Neither of you planned multi-currency ledgers or corporate billing workflows for v1.',
      hiddenMismatch: 'Both agreed on <strong>&ldquo;Payment Integration&rdquo;</strong> — but you measured form completion speed, while David measured automated ledger settlement accuracy.',
      nearAgreement: 'Deploy simple webhook auto-retries now, deferring complex multi-account reconciliation pipelines to sprint 2.',
      actionItems: [
        { title: 'Deploy Webhook Auto-Retry Queue', desc: 'Set up resilient queue workers for failed payment callback reconciliation.' },
        { title: 'Configure Slack Dispute Alerts', desc: 'Automate high-priority notifications for dropped transactions and chargeback edge-cases.' },
        { title: 'Verify Gateway Fee Reconciliation', desc: 'Conduct end-to-end ledger audit with finance lead before scaling transaction volume.' }
      ]
    },
    sarah: {
      id: 'sarah',
      name: 'Sarah Jenkins',
      initials: 'SJ',
      avatarColor: 'avatar-color-cyan',
      role: 'Growth & Marketing',
      matchScore: 69,
      matchLabel: '69% Match · Divergent',
      statusPillText: '-5% Below Room Avg',
      statusPillClass: 'tone-neutral',
      dashoffset: 31,
      benchNote: 'Sarah aligns <strong>69%</strong> with the room across all evaluated trade-offs',
      summaryPreview: 'Sarah holds <strong>69% overall alignment</strong>. While originally advocating for viral referral invite popups, she conceded to pause growth initiatives to prioritize core checkout stability.',
      summaryExtended: `
        <p><strong>Core Unanimous Commitments:</strong> Fully supports checkout stability, agreeing that paying users must not face checkout gateway timeouts.</p>
        <p><strong>Primary Nuances &amp; Divergence:</strong> Expressed concern regarding paid campaign budget waste if landing page asset payloads cause initial page load latencies above 2.5 seconds.</p>
      `,
      strongestAgreement: {
        badge: '89% Match',
        youQuote: 'Paying users encountering checkout timeouts will destroy paid campaign acquisition ROI.',
        peerQuote: 'We need frictionless conversion from paid campaigns to ensure our acquisition budget is not leaking users.'
      },
      biggestDisagreement: {
        badge: '24% Match',
        youQuote: 'Completely freeze all landing page asset optimization until backend database is refactored.',
        peerQuote: 'Landing page uncompressed payloads drop ad conversion by 14%; asset compression must not be frozen.'
      },
      sharedAssumptions: '&ldquo;Viral referral invite popups are paused.&rdquo; Both agreed that referral popups distract from core checkout conversion.',
      hiddenMismatch: 'Both agreed on <strong>&ldquo;Conversion Optimization&rdquo;</strong> — but you measured checkout steps, while Growth measured ad-click-to-signup activation rate.',
      nearAgreement: 'Automate asset bundle compression in the build pipeline without requiring engineering sprint time.',
      actionItems: [
        { title: 'Automate Bundle Asset Minification', desc: 'Add image/SVG asset compression plugin to production Vite build pipeline.' },
        { title: 'Pace Paid Ad Traffic Volume', desc: 'Align marketing acquisition expenditure with backend database capacity thresholds.' },
        { title: 'Schedule Referral Growth Milestone', desc: 'Revisit viral referral loops once checkout conversion rate stabilizes above 3.5%.' }
      ]
    },
    you: {
      id: 'you',
      name: 'Anugrah (You)',
      initials: 'A',
      avatarColor: 'avatar-color-indigo',
      role: 'Lead Product Strategist',
      matchScore: 84,
      matchLabel: '84% Match · High',
      statusPillText: '+10% Above Room Avg',
      statusPillClass: 'tone-indigo',
      dashoffset: 16,
      benchNote: 'You align <strong>84%</strong> with the room across all evaluated trade-offs',
      summaryPreview: 'Your strategy established the team baseline on locking checkout funnel reliability before scaling acquisition expenditure.',
      summaryExtended: `
        <p><strong>Core Commitments:</strong> Explicitly deprioritized ancillary redesigns, non-critical dashboard churn, and secondary payment integrations.</p>
        <p><strong>Key Focus:</strong> Maintaining ruthless product prioritization to hit Q3 North Star metrics on schedule.</p>
      `,
      strongestAgreement: {
        badge: '96% Match',
        youQuote: 'Our single highest-leverage priority must be locking the core checkout retention loop before scaling ad spend.',
        peerQuote: 'Platform reliability and database stability take 100% precedence before opening marketing traffic.'
      },
      biggestDisagreement: {
        badge: '31% Match',
        youQuote: 'Product Lead should retain final release decision authority to prevent shipping deadlocks.',
        peerQuote: 'Each discipline should maintain independent QA veto authority before deployments.'
      },
      sharedAssumptions: '&ldquo;The first release is strictly an MVP.&rdquo; The room universally agreed to reject speculative enterprise complexity.',
      hiddenMismatch: 'Product focused on time-to-market speed, while individual department heads prioritized domain-specific perfection.',
      nearAgreement: 'A 15-minute cross-functional release review checkpoint satisfies QA verification without delaying shipping cadence.',
      actionItems: [
        { title: 'Lock MVP Backlog Scope', desc: 'Formally freeze new feature intake until post-launch stability retrospective.' },
        { title: 'Publish Release Metrics Dashboard', desc: 'Establish clear North Star thresholds for latency (<120ms) and conversion (>3.5%).' },
        { title: 'Coordinate Post-Launch Sync', desc: 'Calibrate departmental velocity and prioritize sprint 2 architectural backlog.' }
      ]
    }
  };

  // 1. Modal Controller
  const btnCloseModal = document.getElementById('btn-close-participant-modal');
  const btnFooterCloseModal = document.getElementById('btn-footer-close-modal');

  // Wire up summary drawer toggle inside modal
  const btnToggleModalSummary = document.getElementById('btn-toggle-modal-summary');
  const modalSummaryDrawer = document.getElementById('modal-summary-drawer');
  const toggleModalSummaryLabel = document.getElementById('toggle-modal-summary-label');

  if (btnToggleModalSummary && modalSummaryDrawer) {
    btnToggleModalSummary.addEventListener('click', () => {
      const isOpen = modalSummaryDrawer.classList.contains('is-open');
      if (isOpen) {
        modalSummaryDrawer.classList.remove('is-open');
        btnToggleModalSummary.classList.remove('is-expanded');
        btnToggleModalSummary.setAttribute('aria-expanded', 'false');
        if (toggleModalSummaryLabel) toggleModalSummaryLabel.textContent = 'Read Full Summary';
      } else {
        modalSummaryDrawer.classList.add('is-open');
        btnToggleModalSummary.classList.add('is-expanded');
        btnToggleModalSummary.setAttribute('aria-expanded', 'true');
        if (toggleModalSummaryLabel) toggleModalSummaryLabel.textContent = 'Show Less';
      }
    });
  }

  function openParticipantModal(id) {
    const data = PARTICIPANTS_ANALYTICS_DATA[id] || PARTICIPANTS_ANALYTICS_DATA.elena;
    if (!modalEl) return;

    // 1. Modal Top Profile Banner
    const avatarEl = document.getElementById('modal-participant-avatar');
    const initialsEl = document.getElementById('modal-participant-initials');
    const nameEl = document.getElementById('modal-participant-name');
    const roleEl = document.getElementById('modal-participant-role');
    const badgeEl = document.getElementById('modal-participant-badge');

    if (avatarEl) avatarEl.className = `room-avatar-circle ${data.avatarColor}`;
    if (initialsEl) initialsEl.textContent = data.initials;
    if (nameEl) nameEl.textContent = data.name;
    if (roleEl) roleEl.textContent = data.role;
    if (badgeEl) {
      badgeEl.textContent = data.matchLabel;
      badgeEl.className = `hero-status-pill ${data.statusPillClass || 'tone-positive'}`;
    }

    // 2. Context Title
    const firstName = data.name.split(' ')[0];
    const mainTitleEl = document.getElementById('modal-analytics-main-title');
    if (mainTitleEl) mainTitleEl.textContent = `${firstName}'s Alignment & Perspective Analytics`;

    // 3. Shared Hero Metrics
    const metricLabelEl = document.getElementById('modal-participant-metric-label');
    const scoreNumEl = document.getElementById('modal-participant-score-num');
    const scurveFillEl = document.getElementById('modal-participant-scurve-fill');
    const statusPillEl = document.getElementById('modal-participant-status-pill');
    const benchNoteEl = document.getElementById('modal-participant-bench-note');

    if (metricLabelEl) metricLabelEl.textContent = `${firstName}'s Alignment`;
    if (scoreNumEl) scoreNumEl.textContent = data.matchScore;
    if (scurveFillEl) scurveFillEl.setAttribute('stroke-dashoffset', data.dashoffset);
    if (statusPillEl) {
      statusPillEl.textContent = data.statusPillText;
      statusPillEl.className = `hero-status-pill ${data.statusPillClass || 'tone-indigo'}`;
    }
    if (benchNoteEl) benchNoteEl.innerHTML = `<span>${data.benchNote}</span>`;

    // 4. Full AI Summary Card
    const summaryPrevEl = document.getElementById('modal-summary-preview');
    const summaryExtEl = document.getElementById('modal-summary-extended');

    if (summaryPrevEl) summaryPrevEl.innerHTML = data.summaryPreview;
    if (summaryExtEl) summaryExtEl.innerHTML = data.summaryExtended;
    if (modalSummaryDrawer) modalSummaryDrawer.classList.remove('is-open');
    if (btnToggleModalSummary) {
      btnToggleModalSummary.classList.remove('is-expanded');
      btnToggleModalSummary.setAttribute('aria-expanded', 'false');
    }
    if (toggleModalSummaryLabel) toggleModalSummaryLabel.textContent = 'Read Full Summary';

    // 5. Peer Alignment Breakdown Section (100% Identical to analytics.html)
    const dynamicContainer = document.getElementById('modal-dynamic-combo-container');
    if (dynamicContainer) {
      dynamicContainer.innerHTML = `
        <div class="combo-section-banner">
          <div class="combo-section-title-wrap">
            <h2 class="combo-section-title">Peer Alignment Breakdown</h2>
          </div>
        </div>

        <div class="analytics-grid-row-2">
          <!-- Strongest Agreement -->
          <article class="analytics-card-base card-two-sided">
            <div class="analytics-card-header">
              <div class="card-title-group">
                <span class="card-title-sparkle">✦</span>
                <span class="card-title-text">Strongest Agreement</span>
              </div>
              <span class="card-badge-pill tone-positive">${data.strongestAgreement.badge}</span>
            </div>
            <div class="dual-side-comparison">
              <div class="party-statement-box">
                <div class="party-header">
                  <span class="party-avatar-mini avatar-color-indigo">A</span>
                  <span class="party-label">You</span>
                </div>
                <p class="party-quote">&ldquo;${data.strongestAgreement.youQuote}&rdquo;</p>
              </div>
              <div class="party-vs-spine">
                <span class="party-vs-badge tone-positive">${data.strongestAgreement.badge.split(' ')[0]}</span>
              </div>
              <div class="party-statement-box">
                <div class="party-header">
                  <span class="party-avatar-mini ${data.avatarColor}">${data.initials}</span>
                  <span class="party-label">${firstName}</span>
                </div>
                <p class="party-quote">&ldquo;${data.strongestAgreement.peerQuote}&rdquo;</p>
              </div>
            </div>
          </article>

          <!-- Biggest Disagreement -->
          <article class="analytics-card-base card-two-sided">
            <div class="analytics-card-header">
              <div class="card-title-group">
                <span class="card-title-sparkle">✦</span>
                <span class="card-title-text">Biggest Disagreement</span>
              </div>
              <span class="card-badge-pill tone-negative">${data.biggestDisagreement.badge}</span>
            </div>
            <div class="dual-side-comparison">
              <div class="party-statement-box">
                <div class="party-header">
                  <span class="party-avatar-mini avatar-color-indigo">A</span>
                  <span class="party-label">You</span>
                </div>
                <p class="party-quote">&ldquo;${data.biggestDisagreement.youQuote}&rdquo;</p>
              </div>
              <div class="party-vs-spine">
                <span class="party-vs-badge tone-divergent">VS</span>
              </div>
              <div class="party-statement-box">
                <div class="party-header">
                  <span class="party-avatar-mini ${data.avatarColor}">${data.initials}</span>
                  <span class="party-label">${firstName}</span>
                </div>
                <p class="party-quote">&ldquo;${data.biggestDisagreement.peerQuote}&rdquo;</p>
              </div>
            </div>
          </article>
        </div>

        <div class="analytics-grid-row-3">
          <!-- Shared Assumptions -->
          <article class="analytics-card-base">
            <div class="analytics-card-header">
              <div class="card-title-group">
                <span class="card-title-sparkle">✦</span>
                <span class="card-title-text">Shared Assumptions</span>
              </div>
              <span class="card-badge-pill tone-indigo">Unstated Consensus</span>
            </div>
            <div class="insight-contrast-card">
              <span class="insight-contrast-header">You Both Assumed</span>
              <p class="insight-contrast-body">
                ${data.sharedAssumptions}
              </p>
            </div>
          </article>

          <!-- Hidden Mismatch -->
          <article class="analytics-card-base">
            <div class="analytics-card-header">
              <div class="card-title-group">
                <span class="card-title-sparkle">✦</span>
                <span class="card-title-text">Hidden Mismatch</span>
              </div>
              <span class="card-badge-pill tone-amber">Nuance Divergence</span>
            </div>
            <div class="insight-contrast-card" style="background:#FFFBEB; border-color:#FDE68A; border-left-color:#F59E0B;">
              <span class="insight-contrast-header" style="color:#B45309;">Conflicting Definitions</span>
              <p class="insight-contrast-body" style="color:#78350F;">
                ${data.hiddenMismatch}
              </p>
            </div>
          </article>

          <!-- Near Agreement -->
          <article class="analytics-card-base">
            <div class="analytics-card-header">
              <div class="card-title-group">
                <span class="card-title-sparkle">✦</span>
                <span class="card-title-text">Near Agreement</span>
              </div>
              <span class="card-badge-pill tone-positive">Actionable Compromise</span>
            </div>
            <div class="insight-contrast-card" style="background:#F0FDF4; border-color:#BBF7D0; border-left-color:#22C55E;">
              <span class="insight-contrast-header" style="color:#15803D;">Bridgeable Gap</span>
              <p class="insight-contrast-body" style="color:#166534;">
                ${data.nearAgreement}
              </p>
            </div>
          </article>
        </div>

      `;
    }

    // Open Modal
    modalEl.classList.add('is-active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeParticipantModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeParticipantModal);
  if (btnFooterCloseModal) btnFooterCloseModal.addEventListener('click', closeParticipantModal);
  if (modalEl) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeParticipantModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl && modalEl.classList.contains('is-active')) {
      closeParticipantModal();
    }
  });

  // 2. Attach click handlers to all clickable cards & read-more toggles
  const readMoreButtons = teamStack ? teamStack.querySelectorAll('.btn-read-more-statement') : [];
  readMoreButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents opening modal
      const wrap = btn.closest('.statement-expandable-wrap');
      if (!wrap) return;
      const extended = wrap.querySelector('.statement-extended-text');
      if (!extended) return;

      const isExpanded = btn.classList.contains('is-expanded');
      const labelSpan = btn.querySelector('span');

      if (isExpanded) {
        extended.classList.remove('is-open');
        btn.classList.remove('is-expanded');
        btn.setAttribute('aria-expanded', 'false');
        if (labelSpan) labelSpan.textContent = 'Read more';
      } else {
        extended.classList.add('is-open');
        btn.classList.add('is-expanded');
        btn.setAttribute('aria-expanded', 'true');
        if (labelSpan) labelSpan.textContent = 'Show less';
      }
    });
  });

  const teamCards = teamStack ? teamStack.querySelectorAll('.team-member-card.is-clickable') : [];
  teamCards.forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-participant-id');
      if (pid) openParticipantModal(pid);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const pid = card.getAttribute('data-participant-id');
        if (pid) openParticipantModal(pid);
      }
    });
  });

  // 3. Multi Toolbar for Participants Page (Search, Filter, Sort, Refresh, Count)
  const searchInput = document.getElementById('multi-search-input');
  const clearSearchBtn = document.getElementById('btn-clear-search');
  const refreshBtn = document.getElementById('btn-multi-refresh');
  const countText = document.getElementById('multi-count-text');
  const emptyState = document.getElementById('team-list-empty');
  const resetFiltersBtn = document.getElementById('btn-reset-filters');

  const filterWrap = document.getElementById('dropdown-filter-wrap');
  const sortWrap = document.getElementById('dropdown-sort-wrap');
  const filterTrigger = document.getElementById('btn-filter-trigger');
  const sortTrigger = document.getElementById('btn-sort-trigger');
  const filterLabel = document.getElementById('filter-dropdown-label');
  const sortLabel = document.getElementById('sort-dropdown-label');
  const filterItems = filterWrap ? filterWrap.querySelectorAll('.custom-dropdown-item') : [];
  const sortItems = sortWrap ? sortWrap.querySelectorAll('.custom-dropdown-item') : [];

  if (teamStack) {
    let currentFilterVal = 'all';
    let currentSortVal = 'match-desc';
    const cards = Array.from(teamStack.querySelectorAll('.team-member-card'));
    const totalCount = cards.length;

    function getCardData(card) {
      const nameEl = card.querySelector('.team-member-name');
      const roleEl = card.querySelector('.team-member-role');
      const scoreEl = card.querySelector('.team-card-score-pill span');
      const prevEl = card.querySelector('.statement-preview-text');
      const extEl = card.querySelector('.statement-extended-text');

      const name = (nameEl && nameEl.textContent) ? nameEl.textContent.trim() : '';
      const role = (roleEl && roleEl.textContent) ? roleEl.textContent.trim() : '';
      const scoreStr = (scoreEl && scoreEl.textContent) ? scoreEl.textContent.trim() : '0';
      const score = parseInt(scoreStr, 10) || 0;
      const text = `${prevEl ? prevEl.textContent : ''} ${extEl ? extEl.textContent : ''}`;

      return { name, role, score, text };
    }

    function updateView() {
      const query = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
      const filterVal = currentFilterVal;
      const sortVal = currentSortVal;

      if (clearSearchBtn) {
        clearSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';
      }

      let visibleCount = 0;
      const matchedCards = [];

      cards.forEach(card => {
        const data = getCardData(card);

        // 1. Search Query
        let matchesQuery = true;
        if (query) {
          const haystack = `${data.name} ${data.role} ${data.text}`.toLowerCase();
          matchesQuery = haystack.includes(query);
        }

        // 2. Filter Match
        let matchesFilter = true;
        if (filterVal === 'high') {
          matchesFilter = data.score >= 80;
        } else if (filterVal === 'moderate') {
          matchesFilter = data.score >= 70 && data.score < 80;
        } else if (filterVal === 'low' || filterVal === 'divergent') {
          matchesFilter = data.score < 70;
        }

        if (matchesQuery && matchesFilter) {
          card.style.display = '';
          visibleCount++;
          matchedCards.push({ card, data });
        } else {
          card.style.display = 'none';
        }
      });

      // 3. Sort
      matchedCards.sort((a, b) => {
        if (sortVal === 'match-desc') return b.data.score - a.data.score;
        if (sortVal === 'match-asc') return a.data.score - b.data.score;
        if (sortVal === 'name-asc') return a.data.name.localeCompare(b.data.name);
        if (sortVal === 'name-desc') return b.data.name.localeCompare(a.data.name);
        return 0;
      });

      matchedCards.forEach(item => {
        teamStack.appendChild(item.card);
      });

      // Update count & empty state
      if (countText) {
        countText.textContent = `${visibleCount} of ${totalCount}`;
      }
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
      }
    }

    if (searchInput) searchInput.addEventListener('input', updateView);
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        updateView();
      });
    }

    // Custom dropdown toggles
    function closeAllDropdowns() {
      if (filterWrap) filterWrap.classList.remove('is-open');
      if (sortWrap) sortWrap.classList.remove('is-open');
      if (filterTrigger) filterTrigger.setAttribute('aria-expanded', 'false');
      if (sortTrigger) sortTrigger.setAttribute('aria-expanded', 'false');
    }

    if (filterTrigger && filterWrap) {
      filterTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = filterWrap.classList.contains('is-open');
        closeAllDropdowns();
        if (!isOpen) {
          filterWrap.classList.add('is-open');
          filterTrigger.setAttribute('aria-expanded', 'true');
        }
      });
    }

    if (sortTrigger && sortWrap) {
      sortTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sortWrap.classList.contains('is-open');
        closeAllDropdowns();
        if (!isOpen) {
          sortWrap.classList.add('is-open');
          sortTrigger.setAttribute('aria-expanded', 'true');
        }
      });
    }

    filterItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        filterItems.forEach(i => {
          i.classList.remove('is-selected');
          i.setAttribute('aria-selected', 'false');
        });
        item.classList.add('is-selected');
        item.setAttribute('aria-selected', 'true');

        currentFilterVal = item.getAttribute('data-value') || 'all';
        const labelText = item.querySelector('.item-label')?.textContent || 'All Match Levels';
        if (filterLabel) filterLabel.textContent = labelText;

        closeAllDropdowns();
        updateView();
      });
    });

    sortItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        sortItems.forEach(i => {
          i.classList.remove('is-selected');
          i.setAttribute('aria-selected', 'false');
        });
        item.classList.add('is-selected');
        item.setAttribute('aria-selected', 'true');

        currentSortVal = item.getAttribute('data-value') || 'match-desc';
        const labelText = item.querySelector('.item-label')?.textContent || 'Highest Match';
        if (sortLabel) sortLabel.textContent = labelText;

        closeAllDropdowns();
        updateView();
      });
    });

    document.addEventListener('click', (e) => {
      if (filterWrap && !filterWrap.contains(e.target) && sortWrap && !sortWrap.contains(e.target)) {
        closeAllDropdowns();
      }
    });

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const svg = refreshBtn.querySelector('.refresh-icon-svg');
        if (svg) {
          svg.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          svg.style.transform = 'rotate(360deg)';
          setTimeout(() => {
            svg.style.transition = 'none';
            svg.style.transform = 'none';
          }, 500);
        }

        if (searchInput) searchInput.value = '';
        currentFilterVal = 'all';
        currentSortVal = 'match-desc';

        filterItems.forEach(i => {
          const isDef = i.getAttribute('data-value') === 'all';
          i.classList.toggle('is-selected', isDef);
          i.setAttribute('aria-selected', isDef ? 'true' : 'false');
        });
        if (filterLabel) filterLabel.textContent = 'All Match Levels';

        sortItems.forEach(i => {
          const isDef = i.getAttribute('data-value') === 'match-desc';
          i.classList.toggle('is-selected', isDef);
          i.setAttribute('aria-selected', isDef ? 'true' : 'false');
        });
        if (sortLabel) sortLabel.textContent = 'Highest Match';

        updateView();
        showToast('Participant perspectives refreshed', 'success');
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentFilterVal = 'all';
        currentSortVal = 'match-desc';
        if (filterLabel) filterLabel.textContent = 'All Match Levels';
        if (sortLabel) sortLabel.textContent = 'Highest Match';
        updateView();
        showToast('Filters cleared', 'success');
      });
    }

    updateView();
  }
}

// ==========================================
// 9. Universal User Profile & Avatar Dropdown
// ==========================================

const PROFILE_STORAGE_KEY = 'samepage_user_profile';

function getUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || 'Alex Morgan',
        age: parsed.age || 28,
        photo: parsed.photo || ''
      };
    }
  } catch (e) {}
  return {
    name: 'Alex Morgan',
    age: 28,
    photo: ''
  };
}

function saveUserProfile(data) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function deleteUserProfile() {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (e) {}
}

function initAvatarDropdown() {
  const profile = getUserProfile();
  const initial = (profile.name && profile.name.trim().length > 0) ? profile.name.trim()[0].toUpperCase() : 'A';

  // Find all avatar elements on the page
  const avatarEls = document.querySelectorAll('.nav-avatar-icon');
  if (!avatarEls.length) return;

  avatarEls.forEach(avatarEl => {
    // If it's already inside .nav-avatar-dropdown-wrap, attach listeners
    let wrap = avatarEl.closest('.nav-avatar-dropdown-wrap');
    if (!wrap) {
      // Dynamically wrap it and add the dropdown menu
      wrap = document.createElement('div');
      wrap.className = 'nav-avatar-dropdown-wrap';
      avatarEl.parentNode.insertBefore(wrap, avatarEl);
      wrap.appendChild(avatarEl);

      // Create dropdown menu markup
      const dropdown = document.createElement('div');
      dropdown.className = 'avatar-dropdown-menu';
      dropdown.setAttribute('role', 'menu');
      dropdown.innerHTML = `
        <div class="dropdown-user-header">
          <div class="dropdown-user-name">${profile.name}</div>
        </div>
        <div class="dropdown-divider"></div>
        <a href="profile.html" class="dropdown-item" role="menuitem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Profile</span>
        </a>
        <button type="button" class="dropdown-item dropdown-item-danger dropdown-btn-logout-action" role="menuitem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Log Out</span>
        </button>
      `;
      wrap.appendChild(dropdown);
    }

    // Set avatar content
    if (profile.photo) {
      avatarEl.innerHTML = `<img src="${profile.photo}" alt="${profile.name}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; display:block;">`;
    } else {
      avatarEl.innerHTML = `<span style="font-family:var(--font-sans); font-weight:700;">${initial}</span>`;
    }

    // Ensure dropdown reflects profile info
    const userNameEl = wrap.querySelector('.dropdown-user-name');
    if (userNameEl) userNameEl.textContent = profile.name;

    const dropdown = wrap.querySelector('.avatar-dropdown-menu');
    if (!dropdown) return;

    // Toggle dropdown on avatar click
    avatarEl.onclick = (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('is-open');
      // Close any other open dropdowns first
      document.querySelectorAll('.avatar-dropdown-menu.is-open').forEach(d => {
        if (d !== dropdown) d.classList.remove('is-open');
      });
      dropdown.classList.toggle('is-open', !isOpen);
    };

    // Logout action
    const logoutBtn = wrap.querySelector('#dropdown-btn-logout') || wrap.querySelector('.dropdown-btn-logout-action');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.remove('is-open');
        showToast('Logged out successfully.');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      };
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-avatar-dropdown-wrap')) {
      document.querySelectorAll('.avatar-dropdown-menu.is-open').forEach(d => {
        d.classList.remove('is-open');
      });
    }
  });
}

function initProfilePage() {
  const profileNameInput = document.getElementById('profile-input-name');
  const profileAgeInput = document.getElementById('profile-input-age');
  const btnSave = document.getElementById('btn-save-profile');
  const fileInput = document.getElementById('profile-photo-file-input');
  const btnUpload = document.getElementById('btn-upload-photo');
  const btnRemovePhoto = document.getElementById('btn-remove-photo');
  const giantAvatarText = document.getElementById('profile-avatar-giant-text');
  const giantAvatarImg = document.getElementById('profile-avatar-giant-img');
  const btnDeleteTrigger = document.getElementById('btn-delete-account-trigger');
  const deleteModal = document.getElementById('delete-modal-overlay');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');

  if (!profileNameInput && !btnSave) return;

  const profile = getUserProfile();
  let tempPhoto = profile.photo || '';

  // Populate inputs
  if (profileNameInput) profileNameInput.value = profile.name || '';
  if (profileAgeInput) profileAgeInput.value = profile.age || 28;

  function updatePreview(name, photo) {
    const initial = (name && name.trim().length > 0) ? name.trim()[0].toUpperCase() : 'A';
    if (photo) {
      if (giantAvatarImg) {
        giantAvatarImg.src = photo;
        giantAvatarImg.style.display = 'block';
      }
      if (giantAvatarText) giantAvatarText.style.display = 'none';
    } else {
      if (giantAvatarImg) {
        giantAvatarImg.src = '';
        giantAvatarImg.style.display = 'none';
      }
      if (giantAvatarText) {
        giantAvatarText.textContent = initial;
        giantAvatarText.style.display = 'block';
      }
    }
  }

  updatePreview(profile.name, tempPhoto);

  // Update initial on name typing
  if (profileNameInput) {
    profileNameInput.addEventListener('input', () => {
      if (!tempPhoto) {
        updatePreview(profileNameInput.value, '');
      }
    });
  }

  // Direct avatar circle click to pick photo
  const avatarCircleBtn = document.getElementById('btn-avatar-circle-trigger');
  if (avatarCircleBtn && fileInput) {
    avatarCircleBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast('Maximum file size is 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        tempPhoto = e.target.result;
        updatePreview(profileNameInput ? profileNameInput.value : '', tempPhoto);
        showToast('Profile photo updated.', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // Save profile
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = profileNameInput ? profileNameInput.value.trim() : 'Alex Morgan';
      const age = profileAgeInput ? parseInt(profileAgeInput.value, 10) || 28 : 28;

      if (!name) {
        showToast('Name cannot be empty', 'error');
        if (profileNameInput) profileNameInput.focus();
        return;
      }

      const updatedProfile = {
        name: name,
        age: age,
        photo: tempPhoto
      };

      saveUserProfile(updatedProfile);
      initAvatarDropdown();
      showToast('Profile saved successfully!');
    });
  }

  // Delete account modal
  if (btnDeleteTrigger && deleteModal) {
    btnDeleteTrigger.addEventListener('click', () => {
      deleteModal.classList.add('is-active');
    });

    if (btnCancelDelete) {
      btnCancelDelete.addEventListener('click', () => {
        deleteModal.classList.remove('is-active');
      });
    }

    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        deleteModal.classList.remove('is-active');
      }
    });

    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => {
        deleteUserProfile();
        deleteModal.classList.remove('is-active');
        showToast('Your account has been deleted.');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 700);
      });
    }
  }
}

function initJoinIdentityPage() {
  const nameInput = document.getElementById('join-input-name');
  const btnEnterRoom = document.getElementById('btn-enter-room');
  const avatarTrigger = document.getElementById('btn-join-avatar-trigger');
  const avatarFileInput = document.getElementById('join-avatar-file-input');
  const avatarGiantText = document.getElementById('join-avatar-giant-text');
  const avatarGiantImg = document.getElementById('join-avatar-giant-img');

  if (!nameInput || !btnEnterRoom) return;

  // 1. Read Room Code from URL query param (?code=...)
  const params = new URLSearchParams(window.location.search);
  const roomCode = (params.get('code') || 'SYNC-9021').toUpperCase();

  // 2. Load current profile or default
  const baseProfile = getUserProfile();
  let currentName = baseProfile.name || 'Alex Morgan';
  let currentPhoto = baseProfile.photo || '';

  nameInput.value = currentName;

  function updateAvatarDisplay(name, photo) {
    const initial = (name && name.trim().length > 0) ? name.trim()[0].toUpperCase() : 'A';
    if (photo) {
      if (avatarGiantImg) {
        avatarGiantImg.src = photo;
        avatarGiantImg.style.display = 'block';
      }
      if (avatarGiantText) avatarGiantText.style.display = 'none';
    } else {
      if (avatarGiantImg) {
        avatarGiantImg.src = '';
        avatarGiantImg.style.display = 'none';
      }
      if (avatarGiantText) {
        avatarGiantText.textContent = initial;
        avatarGiantText.style.display = 'block';
      }
    }
  }

  updateAvatarDisplay(currentName, currentPhoto);

  // Name input listener
  nameInput.addEventListener('input', () => {
    currentName = nameInput.value;
    if (!currentPhoto) {
      updateAvatarDisplay(currentName, '');
    }
  });

  // Avatar file picker
  if (avatarTrigger && avatarFileInput) {
    avatarTrigger.addEventListener('click', () => {
      avatarFileInput.click();
    });

    avatarFileInput.addEventListener('change', () => {
      const file = avatarFileInput.files && avatarFileInput.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast('Maximum file size is 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        currentPhoto = e.target.result;
        updateAvatarDisplay(currentName, currentPhoto);
        showToast('Room photo updated.', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // Enter waiting room
  btnEnterRoom.addEventListener('click', () => {
    const finalName = nameInput.value.trim() || 'Alex Morgan';
    const roomIdentity = {
      name: finalName,
      photo: currentPhoto,
      roomCode: roomCode
    };

    try {
      sessionStorage.setItem('samepage_room_identity', JSON.stringify(roomIdentity));
    } catch (e) {}

    btnEnterRoom.innerHTML = `<span>Entering Room...</span>`;
    btnEnterRoom.style.pointerEvents = 'none';

    showToast(`Welcome, ${finalName}!`);
    setTimeout(() => {
      window.location.href = `waiting.html?code=${encodeURIComponent(roomCode)}`;
    }, 450);
  });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initJoinPage();
  initCreatePage();
  initWaitingPage();
  initSessionPage();
  initComparisonPage();
  initMemePage();
  initAnalyticsPage();
  initParticipantsPage();
  initAvatarDropdown();
  initProfilePage();
  initJoinIdentityPage();
});



