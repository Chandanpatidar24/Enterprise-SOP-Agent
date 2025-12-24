const fs = require('fs');
const pdf = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');

// 1. Parse PDF to Text (Enhanced for Page-by-Page extraction)
const parsePDF = async (filePath) => {
    try {
        let dataBuffer = fs.readFileSync(filePath);

        // EXTRA: Repair PDF if malformed
        try {
            const pdfDoc = await PDFDocument.load(dataBuffer);
            const repairedBuffer = await pdfDoc.save();
            dataBuffer = Buffer.from(repairedBuffer);
        } catch (repairError) {
            console.log("Note: PDF repair not possible or not needed.");
        }

        // Custom pagerender to capture text per page
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

        await pdf(dataBuffer, options);

        return {
            pages: pages, // Array of strings (one per page)
            totalPages: pages.length
        };
    } catch (error) {
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
