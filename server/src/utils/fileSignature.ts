/**
 * Identifies a file from its leading bytes.
 *
 * The Content-Type on an upload is supplied by the client and can say anything;
 * so can the file extension. Reading the actual signature is the only check of
 * the three that the sender cannot simply assert. A file claiming to be a PDF
 * while containing something else is rejected before it is stored.
 */

const SIGNATURES: Array<{ mimeType: string; bytes: number[] }> = [
  // "%PDF"
  { mimeType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  // JPEG start-of-image marker
  { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  // PNG signature
  { mimeType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

/** Returns the detected media type, or null if the bytes match none of them. */
export function detectFileType(buffer: Buffer): string | null {
  for (const signature of SIGNATURES) {
    if (buffer.length < signature.bytes.length) continue;

    const matches = signature.bytes.every((byte, index) => buffer[index] === byte);
    if (matches) return signature.mimeType;
  }

  return null;
}

/**
 * Strips characters that would let a filename break out of the header it is
 * placed in, or escape the directory it is saved to on the recipient's machine.
 */
export function sanitiseFilename(filename: string): string {
  const cleaned = filename
    .replace(/[\r\n"\\]/g, "")
    .replace(/[/\\]/g, "-")
    .trim();

  return cleaned.length > 0 ? cleaned.slice(0, 120) : "salary-slip";
}
