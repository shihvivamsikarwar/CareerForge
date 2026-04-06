const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * extractTextFromBuffer
 * ──────────────────────
 * Converts a file buffer (from multer memoryStorage) into plain text.
 * Supports PDF, DOC, and DOCX.
 *
 * @param {Buffer} buffer    - Raw file bytes
 * @param {string} mimetype  - MIME type from multer (e.g. 'application/pdf')
 * @returns {Promise<string>} Extracted plain text
 */
const extractTextFromBuffer = async (buffer, mimetype) => {
  if (!buffer || buffer.length === 0) {
    throw new Error("File buffer is empty.");
  }

  // ── PDF ────────────────────────────────────────────────────────────────
  if (mimetype === "application/pdf") {
    const parsed = await pdfParse(buffer);
    const text = parsed.text?.trim();

    if (!text) {
      throw new Error(
        "No text could be extracted from this PDF. " +
          "The file may be scanned/image-based. Please use a text-based PDF."
      );
    }

    return sanitizeText(text);
  }

  // ── DOCX / DOC ────────────────────────────────────────────────────────
  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim();

    if (!text) {
      throw new Error("No text could be extracted from this Word document.");
    }

    return sanitizeText(text);
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
};

/**
 * sanitizeText
 * ─────────────
 * Normalises whitespace, removes null bytes, collapses repeated blank lines.
 * Keeps text clean before sending to the AI.
 */
const sanitizeText = (text) =>
  text
    .replace(/\0/g, "") // null bytes
    .replace(/\r\n/g, "\n") // Windows line endings
    .replace(/\r/g, "\n") // old Mac line endings
    .replace(/[ \t]+/g, " ") // collapse horizontal whitespace
    .replace(/\n{3,}/g, "\n\n") // max two consecutive blank lines
    .trim();

module.exports = { extractTextFromBuffer };
