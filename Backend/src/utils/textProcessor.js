const fs = require('fs');
const pdf = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');

// 1. Parse PDF to Text (Enhanced for Page-by-Page extraction)
const parsePDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);

        // 1. Validate PDF Magic Header (%PDF-)
        const header = dataBuffer.slice(0, 5).toString();
        if (header !== '%PDF-') {
            throw new Error('Invalid file type: File is not a valid PDF.');
        }

        let processingBuffer = dataBuffer;

        // 2. Robust Repair using pdf-lib (Deep Cleanup)
        // We create a brand new PDF and copy pages to strip malformed streams
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
            processingBuffer = Buffer.from(cleanBytes);
            console.log("PDF successfully deep-repaired and normalized.");
        } catch (repairError) {
            console.warn("Note: Deep repair failed, attempting fallback. Error:", repairError.message);
            // Fallback to original buffer if repair fails
        }

        // 3. Custom pagerender to capture text per page
        const pages = [];
        const options = {
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
        };

        // 4. Extract Text
        await pdf(processingBuffer, options);

        if (pages.length === 0) {
            throw new Error('No text content found in the PDF. It might be scanned or image-only.');
        }

        return {
            pages: pages,
            totalPages: pages.length
        };
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
