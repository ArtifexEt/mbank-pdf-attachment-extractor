import * as pdfjsLib from "./vendor/pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "./vendor/pdfjs/pdf.worker.mjs";

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
  pageCount: document.querySelector("#page-count"),
  previewFrame: document.querySelector("#preview-frame"),
  previewCanvas: document.querySelector("#pdf-preview"),
  previewEmpty: document.querySelector("#preview-empty"),
  attachmentsBody: document.querySelector("#attachments-body"),
  downloadAll: document.querySelector("#download-all"),
};

const state = {
  file: null,
  fileBuffer: null,
  pdf: null,
  attachments: [],
  renderToken: 0,
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

function setStatus(message, variant = "neutral") {
  elements.status.textContent = message;
  elements.status.classList.toggle("is-error", variant === "error");
  elements.status.classList.toggle("is-success", variant === "success");
}

function setBusy(isBusy) {
  elements.extractButton.disabled = isBusy || !state.file;
  elements.fileInput.disabled = isBusy;
  elements.selectFile.disabled = isBusy;
  elements.password.disabled = isBusy || !state.file;
  elements.togglePassword.disabled = isBusy || !state.file;
  elements.downloadAll.disabled = isBusy || state.attachments.length === 0;
  elements.extractButton.textContent = isBusy ? "Unlocking..." : "";

  if (!isBusy) {
    elements.extractButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v12"></path>
        <path d="m7 10 5 5 5-5"></path>
        <path d="M5 21h14"></path>
      </svg>
      Extract attachments
    `;
  }
}

function resetPreview() {
  const context = elements.previewCanvas.getContext("2d");
  context.clearRect(0, 0, elements.previewCanvas.width, elements.previewCanvas.height);
  elements.previewCanvas.removeAttribute("style");
  elements.previewFrame.classList.remove("has-preview");
  elements.pageCount.textContent = "-";
}

function renderEmptyAttachments(message = "No attachments loaded yet.") {
  elements.attachmentsBody.innerHTML = `
    <tr>
      <td colspan="4" class="empty-row">${message}</td>
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
    setStatus("Choose a PDF file.", "error");
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
  setStatus("PDF ready. Paste the password to unlock it.");
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
    renderEmptyAttachments("No embedded attachments found.");
    return;
  }

  elements.attachmentsBody.innerHTML = state.attachments
    .map((attachment, index) => {
      const description = attachment.description
        ? `<span>${escapeHtml(attachment.description)}</span>`
        : `<span>${escapeHtml(attachment.key)}</span>`;

      return `
        <tr>
          <td data-label="File name">
            <div class="file-cell">
              <span class="file-badge">${attachmentIcon()}</span>
              <span class="file-label">
                <strong>${escapeHtml(attachment.filename)}</strong>
                ${description}
              </span>
            </div>
          </td>
          <td data-label="Type">${escapeHtml(typeLabel(attachment.filename, attachment.contentType))}</td>
          <td data-label="Size">${formatBytes(attachment.size)}</td>
          <td data-label="Action">
            <button class="button button-light download-button" type="button" data-download-index="${index}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v12"></path>
                <path d="m7 10 5 5 5-5"></path>
                <path d="M5 21h14"></path>
              </svg>
              Download
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

async function renderPreview(pdf) {
  const token = (state.renderToken += 1);
  const page = await pdf.getPage(1);

  if (token !== state.renderToken) {
    return;
  }

  const baseViewport = page.getViewport({ scale: 1 });
  const framePadding = 34;
  const availableWidth = Math.max(elements.previewFrame.clientWidth - framePadding, 240);
  const scale = Math.min(1.75, Math.max(0.4, availableWidth / baseViewport.width));
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;
  const canvas = elements.previewCanvas;
  const context = canvas.getContext("2d", { alpha: false });

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, viewport.width, viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;

  if (token === state.renderToken) {
    elements.previewFrame.classList.add("has-preview");
  }
}

async function extractAttachments() {
  if (!state.file || !state.fileBuffer) {
    setStatus("Choose a PDF first.", "error");
    return;
  }

  setBusy(true);
  setStatus("Unlocking PDF...");

  try {
    await destroyCurrentPdf();
    const pdf = await loadPdfDocument();
    state.pdf = pdf;
    elements.pageCount.textContent = `${pdf.numPages} ${pdf.numPages === 1 ? "page" : "pages"}`;

    const attachmentsMap = await pdf.getAttachments();
    state.attachments = normalizeAttachments(attachmentsMap);
    renderAttachments();
    await renderPreview(pdf);

    const count = state.attachments.length;
    setStatus(
      count === 0
        ? "PDF unlocked. No embedded attachments found."
        : `PDF unlocked. ${count} ${count === 1 ? "attachment" : "attachments"} ready.`,
      count === 0 ? "neutral" : "success",
    );
  } catch (error) {
    state.attachments = [];
    renderEmptyAttachments();
    resetPreview();

    if (error?.name === "PasswordException") {
      const isIncorrect = error.code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD;
      setStatus(isIncorrect ? "Incorrect password." : "Password required.", "error");
      elements.password.focus();
      elements.password.select();
      return;
    }

    console.error(error);
    setStatus("Could not read this PDF.", "error");
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
    elements.togglePassword.setAttribute(
      "aria-label",
      nextType === "password" ? "Show password" : "Hide password",
    );
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
    resizeTimer = window.setTimeout(() => renderPreview(state.pdf), 150);
  });
  resizeObserver.observe(elements.previewFrame);
}

attachEvents();
