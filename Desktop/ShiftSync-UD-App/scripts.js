function safeQueryAll(selector, root = document) {
  try {
    return Array.from(root.querySelectorAll(selector));
  } catch {
    return [];
  }
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older browsers / restricted contexts
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function addCopyButtons() {
  safeQueryAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;
    if (pre.dataset.copyReady === 'true') return;
    pre.dataset.copyReady = 'true';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    button.addEventListener('click', async () => {
      try {
        button.setAttribute('aria-busy', 'true');
        const text = code.textContent || '';
        await copyToClipboard(text);
        const prev = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = prev === 'Copied!' ? 'Copy' : 'Copy';
        }, 2000);
      } catch (e) {
        button.textContent = 'Copy failed';
        setTimeout(() => (button.textContent = 'Copy'), 2000);
      } finally {
        button.removeAttribute('aria-busy');
      }
    });

    pre.appendChild(button);
  });
}

function setupAccordions() {
  const items = safeQueryAll('.accordion-item');
  if (items.length === 0) return;

  function closeAll(exceptItem) {
    items.forEach((item) => {
      if (exceptItem && item === exceptItem) return;
      item.dataset.open = 'false';
      const content = item.querySelector('.accordion-content');
      const header = item.querySelector('.accordion-header');
      if (content) content.style.maxHeight = '0px';
      if (header) header.setAttribute('aria-expanded', 'false');
    });
  }

  items.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');
    if (!header || !content) return;

    item.dataset.open = item.dataset.open === 'true' ? 'true' : 'false';
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', item.dataset.open === 'true' ? 'true' : 'false');

    const open = () => {
      closeAll(item);
      item.dataset.open = 'true';
      header.setAttribute('aria-expanded', 'true');
      content.style.maxHeight = content.scrollHeight + 'px';
    };

    const close = () => {
      item.dataset.open = 'false';
      header.setAttribute('aria-expanded', 'false');
      content.style.maxHeight = '0px';
    };

    const toggle = () => (item.dataset.open === 'true' ? close() : open());

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Ensure any initially-open items size correctly after load
  window.addEventListener('load', () => {
    items.forEach((item) => {
      if (item.dataset.open !== 'true') return;
      const content = item.querySelector('.accordion-content');
      if (content) content.style.maxHeight = content.scrollHeight + 'px';
    });
  });
}

function setupSmoothScroll() {
  safeQueryAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    });
  });
}

function markLoaded() {
  document.body.classList.add('loaded');
}

document.addEventListener('DOMContentLoaded', () => {
  addCopyButtons();
  setupAccordions();
  setupSmoothScroll();
  markLoaded();
});

