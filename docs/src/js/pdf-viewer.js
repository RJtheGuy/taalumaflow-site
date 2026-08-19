/**
 * Generates an inline PDF Viewer card for chat stream rendering
 * @param {string} pdfUrl - Path to target PDF asset
 * @param {string} title - File name or display title
 * @returns {HTMLElement}
 */
export function createPdfCard(pdfUrl, title = "Document.pdf") {
  const container = document.createElement('div');
  container.className = 'pdf-card-container';

  container.innerHTML = `
    <div class="pdf-card">
      <div class="pdf-info">
        <svg class="pdf-icon" viewBox="0 0 24 24" width="28" height="28">
          <path fill="#E53E3E" d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
        </svg>
        <div class="pdf-details">
          <span class="pdf-title">${title}</span>
          <span class="pdf-subtitle">PDF Document</span>
        </div>
      </div>
      <div class="pdf-actions">
        <button class="pdf-btn view-btn" type="button">View</button>
        <a class="pdf-btn download-btn" href="${pdfUrl}" download="${title}">Download</a>
      </div>
    </div>
  `;

  // Attach tab viewer action
  container.querySelector('.view-btn').addEventListener('click', () => {
    window.open(pdfUrl, '_blank');
  });

  return container;
}