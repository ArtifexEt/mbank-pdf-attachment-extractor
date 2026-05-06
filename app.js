import * as pdfjsLib from "./vendor/pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdfjs/pdf.worker.mjs";

const STORAGE_LANG_KEY = "mbankPdfAttachmentExtractor.lang";

const DOWNLOAD_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v12"></path>
    <path d="m7 10 5 5 5-5"></path>
    <path d="M5 21h14"></path>
  </svg>
`;

const I18N = {
  en: {
    metaTitle: "mBank PDF Attachment Extractor",
    metaDescription: "Extract embedded attachments from encrypted mBank PDF documents in the browser.",
    appSubtitle:
      "All files are analyzed locally; nothing, including the password, is stored on a server.",
    coffeeLink: "Buy me a coffee",
    githubLink: "Open GitHub repository",
    languageSelector: "Language selection",
    openEyebrow: "Local browser session",
    openTitle: "Open PDF",
    dropTitle: "Drop PDF here",
    dropSubtitle: "or choose a file",
    selectPdf: "Select PDF",
    fileLabel: "File",
    sizeLabel: "Size",
    noneSelected: "None selected",
    passwordLabel: "PDF password",
    passwordPlaceholder: "Paste password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    extractButton: "Unlock PDF",
    unlockingButton: "Unlocking...",
    previewEyebrow: "Document",
    previewTitle: "Preview",
    previewEmpty: "Preview appears after unlock.",
    pageControls: "PDF page controls",
    previousPage: "Previous page",
    nextPage: "Next page",
    pageIndicator: "Page {page} of {total}",
    maximizeButton: "Maximize",
    maximizePreview: "Maximize document",
    viewerEyebrow: "Unlocked document",
    viewerTitle: "PDF preview",
    closePreview: "Close",
    attachmentsEyebrow: "Embedded files",
    attachmentsTitle: "Attachments",
    downloadAll: "Download all",
    tableFileName: "File name",
    tableType: "Type",
    tableSize: "Size",
    tableAction: "Action",
    download: "Download",
    waitingForPdf: "Waiting for a PDF.",
    choosePdfFile: "Choose a PDF file.",
    pdfReady: "PDF ready. Paste the password to unlock it.",
    choosePdfFirst: "Choose a PDF first.",
    unlockingPdf: "Unlocking PDF...",
    unlockedNoAttachments: "PDF unlocked. No embedded attachments found.",
    unlockedAttachments: "PDF unlocked. {count} {attachmentWord} ready.",
    attachmentSingular: "attachment",
    attachmentPlural: "attachments",
    passwordIncorrect: "Incorrect password.",
    passwordRequired: "Password required.",
    readError: "Could not read this PDF.",
    noAttachmentsLoaded: "No attachments loaded yet.",
    noEmbeddedAttachments: "No embedded attachments found.",
  },
  pl: {
    metaTitle: "mBank PDF Attachment Extractor",
    metaDescription: "Wyodrębniaj załączniki z zaszyfrowanych PDF-ów mBanku lokalnie w przeglądarce.",
    appSubtitle:
      "Wszystkie pliki są analizowane lokalnie; nic, łącznie z hasłem, nie jest zapisywane na serwerze.",
    coffeeLink: "Postaw mi kawę",
    githubLink: "Otwórz repozytorium GitHub",
    languageSelector: "Wybór języka",
    openEyebrow: "Lokalna sesja przeglądarki",
    openTitle: "Otwórz PDF",
    dropTitle: "Upuść PDF tutaj",
    dropSubtitle: "albo wybierz plik",
    selectPdf: "Wybierz PDF",
    fileLabel: "Plik",
    sizeLabel: "Rozmiar",
    noneSelected: "Nie wybrano pliku",
    passwordLabel: "Hasło PDF",
    passwordPlaceholder: "Wklej hasło",
    showPassword: "Pokaż hasło",
    hidePassword: "Ukryj hasło",
    extractButton: "Odblokuj PDF-a",
    unlockingButton: "Odblokowywanie...",
    previewEyebrow: "Dokument",
    previewTitle: "Podgląd",
    previewEmpty: "Podgląd pojawi się po odblokowaniu.",
    pageControls: "Sterowanie stronami PDF-a",
    previousPage: "Poprzednia strona",
    nextPage: "Następna strona",
    pageIndicator: "Strona {page} z {total}",
    maximizeButton: "Powiększ",
    maximizePreview: "Powiększ dokument",
    viewerEyebrow: "Odblokowany dokument",
    viewerTitle: "Podgląd PDF",
    closePreview: "Zamknij",
    attachmentsEyebrow: "Pliki osadzone",
    attachmentsTitle: "Załączniki",
    downloadAll: "Pobierz wszystkie",
    tableFileName: "Nazwa pliku",
    tableType: "Typ",
    tableSize: "Rozmiar",
    tableAction: "Akcja",
    download: "Pobierz",
    waitingForPdf: "Czekam na PDF.",
    choosePdfFile: "Wybierz plik PDF.",
    pdfReady: "PDF gotowy. Wklej hasło, aby go odblokować.",
    choosePdfFirst: "Najpierw wybierz PDF.",
    unlockingPdf: "Otwieranie PDF-a...",
    unlockedNoAttachments: "PDF odblokowany. Nie znaleziono osadzonych załączników.",
    unlockedAttachments: "PDF odblokowany. Gotowe załączniki: {count}.",
    attachmentSingular: "załącznik",
    attachmentPlural: "załączniki",
    passwordIncorrect: "Niepoprawne hasło.",
    passwordRequired: "Hasło jest wymagane.",
    readError: "Nie udało się odczytać tego PDF-a.",
    noAttachmentsLoaded: "Nie wczytano jeszcze załączników.",
    noEmbeddedAttachments: "Nie znaleziono osadzonych załączników.",
  },
};

const elements = {
  dropZone: document.querySelector("#drop-zone"),
  fileInput: document.querySelector("#file-input"),
  selectFile: document.querySelector("#select-file"),
  fileName: document.querySelector("#file-name"),
  fileSize: document.querySelector("#file-size"),
  form: document.querySelector("#pdf-form"),
  password: document.querySelector("#password-input"),
  togglePassword: document.querySelector("#toggle-password"),
  extractButton: document.querySelector("#extract-button"),
  status: document.querySelector("#status-message"),
  pageIndicator: document.querySelector("#page-indicator"),
  prevPage: document.querySelector("#prev-page"),
  nextPage: document.querySelector("#next-page"),
  maximizePreview: document.querySelector("#maximize-preview"),
  previewFrame: document.querySelector("#preview-frame"),
  previewCanvas: document.querySelector("#pdf-preview"),
  previewEmpty: document.querySelector("#preview-empty"),
  viewerOverlay: document.querySelector("#document-viewer"),
  viewerFrame: document.querySelector("#viewer-frame"),
  viewerCanvas: document.querySelector("#pdf-viewer"),
  viewerPageIndicator: document.querySelector("#viewer-page-indicator"),
  viewerPrevPage: document.querySelector("#viewer-prev-page"),
  viewerNextPage: document.querySelector("#viewer-next-page"),
  closeViewer: document.querySelector("#close-viewer"),
  attachmentsBody: document.querySelector("#attachments-body"),
  downloadAll: document.querySelector("#download-all"),
  metaDescription: document.querySelector("#meta-description"),
  langButtons: Array.from(document.querySelectorAll(".lang-btn")),
  i18nNodes: Array.from(document.querySelectorAll("[data-i18n]")),
  i18nPlaceholderNodes: Array.from(document.querySelectorAll("[data-i18n-placeholder]")),
  i18nAriaNodes: Array.from(document.querySelectorAll("[data-i18n-aria-label]")),
};

const state = {
  file: null,
  fileBuffer: null,
  pdf: null,
  attachments: [],
  currentPage: 1,
  viewerOpen: false,
  renderToken: 0,
  busy: false,
  lang: "en",
  statusKey: "waitingForPdf",
  statusVariant: "neutral",
  statusVars: {},
  emptyAttachmentsKey: "noAttachmentsLoaded",
};

const mimeByExtension = new Map([
  ["csv", "text/csv"],
  ["doc", "application/msword"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["json", "application/json"],
  ["pdf", "application/pdf"],
  ["png", "image/png"],
  ["txt", "text/plain"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["xml", "application/xml"],
  ["zip", "application/zip"],
]);

function t(key, vars = {}) {
  const template = I18N[state.lang]?.[key] ?? I18N.en[key] ?? key;
  return Object.entries(vars).reduce(
    (value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)),
    template,
  );
}

function normalizeLang(value) {
  if (!value) {
    return "en";
  }

  return value.toLowerCase().startsWith("pl") ? "pl" : "en";
}

function detectBrowserLang() {
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    return navigator.languages[0];
  }

  return navigator.language || "en";
}

function readStoredLang() {
  try {
    return localStorage.getItem(STORAGE_LANG_KEY);
  } catch {
    return null;
  }
}

function persistLang(lang) {
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  } catch {
    // Keep language switching working even when storage is unavailable.
  }
}

function setupLanguage() {
  const storedLang = readStoredLang();
  setLanguage(storedLang || detectBrowserLang(), false);

  elements.langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang, true);
    });
  });
}

function setLanguage(lang, persist) {
  state.lang = normalizeLang(lang);

  if (persist) {
    persistLang(state.lang);
  }

  document.documentElement.lang = state.lang;
  document.title = t("metaTitle");
  if (elements.metaDescription) {
    elements.metaDescription.content = t("metaDescription");
  }

  for (const node of elements.i18nNodes) {
    node.textContent = t(node.dataset.i18n);
  }

  for (const node of elements.i18nPlaceholderNodes) {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  }

  for (const node of elements.i18nAriaNodes) {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  }

  updateLanguageButtons();
  updateTogglePasswordLabel();
  renderStatus();
  updatePreviewControls();
  renderExtractButton();

  elements.fileName.textContent = state.file ? state.file.name : t("noneSelected");

  if (state.attachments.length > 0) {
    renderAttachments();
  } else {
    renderEmptyAttachments(state.emptyAttachmentsKey);
  }
}

function updateLanguageButtons() {
  elements.langButtons.forEach((button) => {
    const isActive = button.dataset.lang === state.lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderStatus() {
  const vars = { ...state.statusVars };
  if (state.statusKey === "unlockedAttachments") {
    vars.attachmentWord =
      vars.count === 1 ? t("attachmentSingular") : t("attachmentPlural");
  }
  elements.status.textContent = t(state.statusKey, vars);
  elements.status.classList.toggle("is-error", state.statusVariant === "error");
  elements.status.classList.toggle("is-success", state.statusVariant === "success");
}

function setStatusByKey(key, variant = "neutral", vars = {}) {
  state.statusKey = key;
  state.statusVariant = variant;
  state.statusVars = vars;
  renderStatus();
}

function updatePreviewControls() {
  const totalPages = state.pdf?.numPages ?? 0;
  const hasPdf = totalPages > 0;
  const pageLabel = hasPdf
    ? t("pageIndicator", { page: state.currentPage, total: totalPages })
    : "-";

  elements.pageIndicator.textContent = pageLabel;
  elements.viewerPageIndicator.textContent = pageLabel;

  const canGoPrevious = hasPdf && state.currentPage > 1 && !state.busy;
  const canGoNext = hasPdf && state.currentPage < totalPages && !state.busy;

  elements.prevPage.disabled = !canGoPrevious;
  elements.viewerPrevPage.disabled = !canGoPrevious;
  elements.nextPage.disabled = !canGoNext;
  elements.viewerNextPage.disabled = !canGoNext;
  elements.maximizePreview.disabled = !hasPdf || state.busy;
}

function renderExtractButton() {
  elements.extractButton.innerHTML = `
    ${DOWNLOAD_ICON}
    <span>${t(state.busy ? "unlockingButton" : "extractButton")}</span>
  `;
}

function updateTogglePasswordLabel() {
  const key = elements.password.type === "password" ? "showPassword" : "hidePassword";
  elements.togglePassword.setAttribute("aria-label", t(key));
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function inferMimeType(filename, contentType) {
  if (contentType) {
    return contentType;
  }

  const extension = filename.includes(".") ? filename.split(".").pop().toLowerCase() : "";
  return mimeByExtension.get(extension) || "application/octet-stream";
}

function typeLabel(filename, contentType) {
  const mime = inferMimeType(filename, contentType);
  if (mime === "application/octet-stream") {
    const extension = filename.includes(".") ? filename.split(".").pop().toUpperCase() : "File";
    return extension;
  }
  return mime;
}

function setBusy(isBusy) {
  state.busy = isBusy;
  elements.extractButton.disabled = isBusy || !state.file;
  elements.fileInput.disabled = isBusy;
  elements.selectFile.disabled = isBusy;
  elements.password.disabled = isBusy || !state.file;
  elements.togglePassword.disabled = isBusy || !state.file;
  elements.downloadAll.disabled = isBusy || state.attachments.length === 0;
  renderExtractButton();
  updatePreviewControls();
}

function resetPreview() {
  clearCanvas(elements.previewCanvas);
  clearCanvas(elements.viewerCanvas);
  closeDocumentViewer();
  state.currentPage = 1;
  elements.previewCanvas.removeAttribute("style");
  elements.viewerCanvas.removeAttribute("style");
  elements.previewFrame.classList.remove("has-preview");
  elements.viewerFrame.classList.remove("has-preview");
  updatePreviewControls();
}

function renderEmptyAttachments(key = "noAttachmentsLoaded") {
  state.emptyAttachmentsKey = key;
  elements.attachmentsBody.innerHTML = `
    <tr>
      <td colspan="4" class="empty-row">${t(key)}</td>
    </tr>
  `;
  elements.downloadAll.disabled = true;
}

async function destroyCurrentPdf() {
  if (state.pdf) {
    await state.pdf.destroy();
    state.pdf = null;
  }
}

async function resetDocumentState() {
  state.attachments = [];
  state.renderToken += 1;
  await destroyCurrentPdf();
  resetPreview();
  renderEmptyAttachments();
}

function validatePdfFile(file) {
  const hasPdfName = file.name.toLowerCase().endsWith(".pdf");
  const hasPdfType = file.type === "application/pdf";
  return hasPdfName || hasPdfType || file.type === "";
}

async function handleFile(file) {
  if (!file) {
    return;
  }

  if (!validatePdfFile(file)) {
    setStatusByKey("choosePdfFile", "error");
    return;
  }

  await resetDocumentState();
  state.file = file;
  state.fileBuffer = await file.arrayBuffer();

  elements.fileName.textContent = file.name;
  elements.fileSize.textContent = formatBytes(file.size);
  elements.password.disabled = false;
  elements.togglePassword.disabled = false;
  elements.extractButton.disabled = false;
  elements.password.focus();
  elements.password.select();
  setStatusByKey("pdfReady");
}

function handleDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove("is-dragging");
  const [file] = event.dataTransfer?.files || [];
  handleFile(file);
}

function openFilePicker() {
  if (!elements.fileInput.disabled) {
    elements.fileInput.click();
  }
}

async function loadPdfDocument() {
  const bytes = new Uint8Array(state.fileBuffer.slice(0));
  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    password: elements.password.value,
  });
  return loadingTask.promise;
}

function normalizeAttachments(attachmentsMap) {
  return Object.entries(attachmentsMap || {})
    .map(([key, attachment]) => {
      const filename = attachment.filename || key;
      const content = attachment.content || new Uint8Array();
      const contentType = inferMimeType(filename, attachment.contentType);

      return {
        key,
        filename,
        description: attachment.description || "",
        content,
        contentType,
        size: content.byteLength ?? content.length ?? 0,
      };
    })
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

function attachmentIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"></path>
      <path d="M14 2v5h5"></path>
      <path d="M9 15h6"></path>
    </svg>
  `;
}

function renderAttachments() {
  if (state.attachments.length === 0) {
    renderEmptyAttachments("noEmbeddedAttachments");
    return;
  }

  elements.attachmentsBody.innerHTML = state.attachments
    .map((attachment, index) => {
      const description = attachment.description
        ? `<span>${escapeHtml(attachment.description)}</span>`
        : `<span>${escapeHtml(attachment.key)}</span>`;

      return `
        <tr>
          <td data-label="${escapeHtml(t("tableFileName"))}">
            <div class="file-cell">
              <span class="file-badge">${attachmentIcon()}</span>
              <span class="file-label">
                <strong>${escapeHtml(attachment.filename)}</strong>
                ${description}
              </span>
            </div>
          </td>
          <td data-label="${escapeHtml(t("tableType"))}">${escapeHtml(typeLabel(attachment.filename, attachment.contentType))}</td>
          <td data-label="${escapeHtml(t("tableSize"))}">${formatBytes(attachment.size)}</td>
          <td data-label="${escapeHtml(t("tableAction"))}">
            <button class="button button-light download-button" type="button" data-download-index="${index}">
              ${DOWNLOAD_ICON}
              <span>${escapeHtml(t("download"))}</span>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");

  elements.downloadAll.disabled = false;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clearCanvas(canvas) {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function clampPage(pageNumber) {
  if (!state.pdf) {
    return 1;
  }

  return Math.min(Math.max(pageNumber, 1), state.pdf.numPages);
}

async function renderPageToCanvas(pdf, pageNumber, canvas, frame, mode) {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const framePadding = mode === "viewer" ? 56 : 34;
  const availableWidth = Math.max(frame.clientWidth - framePadding, 240);
  const availableHeight = Math.max(frame.clientHeight - framePadding, 320);
  const fitToWidth = availableWidth / baseViewport.width;
  const fitToFrame = Math.min(fitToWidth, availableHeight / baseViewport.height);
  const scale =
    mode === "viewer"
      ? Math.min(2.5, Math.max(0.45, fitToFrame))
      : Math.min(1.75, Math.max(0.4, fitToWidth));
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;
  const context = canvas.getContext("2d", { alpha: false });

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;
  canvas.setAttribute("aria-label", t("pageIndicator", { page: pageNumber, total: pdf.numPages }));

  context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, viewport.width, viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
}

async function renderCurrentPage() {
  if (!state.pdf) {
    resetPreview();
    return;
  }

  const token = (state.renderToken += 1);
  const pageNumber = state.currentPage;
  updatePreviewControls();

  await renderPageToCanvas(
    state.pdf,
    pageNumber,
    elements.previewCanvas,
    elements.previewFrame,
    "preview",
  );

  if (token !== state.renderToken) {
    return;
  }

  elements.previewFrame.classList.add("has-preview");

  if (!state.viewerOpen) {
    return;
  }

  await renderPageToCanvas(
    state.pdf,
    pageNumber,
    elements.viewerCanvas,
    elements.viewerFrame,
    "viewer",
  );

  if (token !== state.renderToken) {
    return;
  }

  elements.viewerFrame.classList.add("has-preview");
}

function setCurrentPage(pageNumber) {
  if (!state.pdf) {
    return;
  }

  const nextPage = clampPage(pageNumber);
  if (nextPage === state.currentPage) {
    updatePreviewControls();
    return;
  }

  state.currentPage = nextPage;
  renderCurrentPage();
}

function openDocumentViewer() {
  if (!state.pdf) {
    return;
  }

  state.viewerOpen = true;
  elements.viewerOverlay.hidden = false;
  document.body.classList.add("viewer-open");
  updatePreviewControls();
  renderCurrentPage();
  elements.closeViewer.focus();
}

function closeDocumentViewer() {
  state.viewerOpen = false;
  elements.viewerOverlay.hidden = true;
  document.body.classList.remove("viewer-open");
}

async function extractAttachments() {
  if (!state.file || !state.fileBuffer) {
    setStatusByKey("choosePdfFirst", "error");
    return;
  }

  setBusy(true);
  setStatusByKey("unlockingPdf");

  try {
    await destroyCurrentPdf();
    const pdf = await loadPdfDocument();
    state.pdf = pdf;
    state.currentPage = 1;
    updatePreviewControls();

    const attachmentsMap = await pdf.getAttachments();
    state.attachments = normalizeAttachments(attachmentsMap);
    renderAttachments();
    await renderCurrentPage();

    const count = state.attachments.length;
    setStatusByKey(
      count === 0 ? "unlockedNoAttachments" : "unlockedAttachments",
      count === 0 ? "neutral" : "success",
      {
        count,
        attachmentWord: count === 1 ? t("attachmentSingular") : t("attachmentPlural"),
      },
    );
  } catch (error) {
    state.attachments = [];
    renderEmptyAttachments();
    resetPreview();

    if (error?.name === "PasswordException") {
      const isIncorrect = error.code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD;
      setStatusByKey(isIncorrect ? "passwordIncorrect" : "passwordRequired", "error");
      elements.password.focus();
      elements.password.select();
      return;
    }

    console.error(error);
    setStatusByKey("readError", "error");
  } finally {
    setBusy(false);
  }
}

function downloadAttachment(index) {
  const attachment = state.attachments[index];
  if (!attachment) {
    return;
  }

  const blob = new Blob([attachment.content], { type: attachment.contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function attachEvents() {
  elements.selectFile.addEventListener("click", (event) => {
    event.stopPropagation();
    openFilePicker();
  });

  elements.dropZone.addEventListener("click", openFilePicker);

  elements.fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    handleFile(file);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "dragend"].forEach((eventName) => {
    elements.dropZone.addEventListener(eventName, () => {
      elements.dropZone.classList.remove("is-dragging");
    });
  });

  elements.dropZone.addEventListener("drop", handleDrop);

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    extractAttachments();
  });

  elements.togglePassword.addEventListener("click", () => {
    const nextType = elements.password.type === "password" ? "text" : "password";
    elements.password.type = nextType;
    updateTogglePasswordLabel();
  });

  elements.prevPage.addEventListener("click", () => setCurrentPage(state.currentPage - 1));
  elements.nextPage.addEventListener("click", () => setCurrentPage(state.currentPage + 1));
  elements.viewerPrevPage.addEventListener("click", () => setCurrentPage(state.currentPage - 1));
  elements.viewerNextPage.addEventListener("click", () => setCurrentPage(state.currentPage + 1));
  elements.maximizePreview.addEventListener("click", openDocumentViewer);
  elements.closeViewer.addEventListener("click", closeDocumentViewer);

  elements.viewerOverlay.addEventListener("click", (event) => {
    if (event.target === elements.viewerOverlay) {
      closeDocumentViewer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!state.viewerOpen) {
      return;
    }

    if (event.key === "Escape") {
      closeDocumentViewer();
      elements.maximizePreview.focus();
    }

    if (event.key === "ArrowLeft") {
      setCurrentPage(state.currentPage - 1);
    }

    if (event.key === "ArrowRight") {
      setCurrentPage(state.currentPage + 1);
    }
  });

  elements.attachmentsBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-download-index]");
    if (!button) {
      return;
    }
    downloadAttachment(Number(button.dataset.downloadIndex));
  });

  elements.downloadAll.addEventListener("click", () => {
    state.attachments.forEach((_, index) => downloadAttachment(index));
  });

  let resizeTimer = 0;
  const resizeObserver = new ResizeObserver(() => {
    if (!state.pdf) {
      return;
    }
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(renderCurrentPage, 150);
  });
  resizeObserver.observe(elements.previewFrame);
  resizeObserver.observe(elements.viewerFrame);
}

setupLanguage();
attachEvents();
