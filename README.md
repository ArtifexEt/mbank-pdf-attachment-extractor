# mBank PDF Attachment Extractor

A small static web app for extracting embedded files from encrypted mBank PDF documents. It runs entirely in the browser and can be hosted directly on GitHub Pages.

Live app: [https://artifexet.github.io/mbank-pdf-attachment-extractor/](https://artifexet.github.io/mbank-pdf-attachment-extractor/)

Repository: [https://github.com/ArtifexEt/mbank-pdf-attachment-extractor](https://github.com/ArtifexEt/mbank-pdf-attachment-extractor)

Support: [Buy me a coffee](https://buymeacoffee.com/szymonrybka)

## Features

- Drag and drop or select a PDF file.
- Paste the PDF password locally in the browser.
- Preview the first page after the PDF is unlocked.
- List embedded attachments in a table.
- Download each attachment as its original file.
- Switch between English and Polish; the app detects the browser language and saves the chosen language locally.

## Privacy

The app has no backend. PDF files, passwords, previews, and extracted attachments stay in the browser session. The included PDF parser is vendored under `vendor/pdfjs`, so the GitHub Pages deployment does not need a build step or runtime package install.

## Deploying to GitHub Pages

The live site is published from the `gh-pages` branch. The project is static, so deployment is just the HTML, CSS, JavaScript, and vendored PDF.js files with no build step.

## Local Development

Serve the directory with any static file server:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

## Third-Party Code

This project vendors Mozilla PDF.js in `vendor/pdfjs` for browser-side PDF parsing and rendering. See `vendor/pdfjs/LICENSE`.
