const fs = require('fs');
const pdf = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');

// 1. Parse PDF to Text (Enhanced for Page-by-Page extraction)
const parsePDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);

        // 1. Validate PDF Magic Header (%PDF-)
        // Relaxed check: Look for %PDF- within the first 1024 bytes
        const headerSearch = dataBuffer.slice(0, 1024).toString();
        if (!headerSearch.includes('%PDF-')) {
            throw new Error('Invalid file type: File is not a valid PDF (No %PDF- header found).');
        }

        // STRATEGY 1: Try parsing original buffer
        try {
            console.log("Attempting to parse original PDF...");
            // We use a separate function or just call it here. 
            // We need to access pages.
            // Let's refactor slightly to avoid duplication.

            const extractText = async (buffer) => {
                let extractedPages = [];
                await pdf(buffer, {
                    pagerender: (pageData) => {
                        return pageData.getTextContent().then((textContent) => {
                            let lastY, text = '';
                            for (let item of textContent.items) {
                                if (lastY == item.transform[5] || !lastY) {
                                    text += item.str;
                                } else {
                                    text += '\n' + item.str;
                                }
                                lastY = item.transform[5];
                            }
                            extractedPages.push(text);
                            return text;
                        });
                    }
                });
                return extractedPages;
            };

            const pages = await extractText(dataBuffer);
            if (pages.length > 0) {
                return { pages, totalPages: pages.length };
            }
            throw new Error("No text found in original PDF");

        } catch (originalError) {
            console.warn("Original PDF parse failed/empty, attempting deep repair...", originalError.message);

            // STRATEGY 2: Deep Repair
            try {
                const originalDoc = await PDFDocument.load(dataBuffer, {
                    ignoreEncryption: true,
                    throwOnInvalidObject: false
                });

                const newDoc = await PDFDocument.create();
                const pageIndices = originalDoc.getPageIndices();
                const copiedPages = await newDoc.copyPages(originalDoc, pageIndices);

                copiedPages.forEach((page) => newDoc.addPage(page));
                const cleanBytes = await newDoc.save();
                const processingBuffer = Buffer.from(cleanBytes);

                console.log("PDF Repaired. Retrying parse...");

                // Re-define extractText or use the same logic if I could...
                // I'll just copy the logic for now to be safe and simple within this replacement
                let pages = [];
                await pdf(processingBuffer, {
                    pagerender: (pageData) => {
                        return pageData.getTextContent().then((textContent) => {
                            let lastY, text = '';
                            for (let item of textContent.items) {
                                if (lastY == item.transform[5] || !lastY) {
                                    text += item.str;
                                } else {
                                    text += '\n' + item.str;
                                }
                                lastY = item.transform[5];
                            }
                            pages.push(text);
                            return text;
                        });
                    }
                });

                if (pages.length === 0) {
                    throw new Error('No text content found even after repair.');
                }

                return { pages, totalPages: pages.length };

            } catch (repairError) {
                console.error("Repair failed:", repairError);
                throw new Error("Failed to parse PDF (Original & Repaired). File might be corrupted or image-only.");
            }
        }


    } catch (error) {
        console.error("PDF Parsing Critical Error:", error);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
};

// 2. Chunk Text (1000 chars, 100 overlap)
const chunkText = (text, maxLength = 1000, overlap = 100) => {
    const chunks = [];
    let start = 0;

    // Loop until we reach the end of the text
    while (start < text.length) {
        let end = start + maxLength;

        // Ensure we don't cut words in half (optional but good for AI)
        // For strict 1000 requirement, we can just slice.
        // Let's implement strict slicing first as requested.

        if (end > text.length) {
            end = text.length;
        }

        const chunk = text.slice(start, end);
        chunks.push(chunk);

        // Stop if we reached end
        if (end >= text.length) break;

        // Move start forward, but minus overlap
        start += (maxLength - overlap);
    }

    return chunks;
};

module.exports = { parsePDF, chunkText };
