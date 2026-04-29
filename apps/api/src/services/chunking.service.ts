const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export function chunkText(text: string): string[] {
    const chunks: string[] = [];
    const words = text.split(" ");
    let currentChunk: string[] = [];
    let currentSize = 0;

    for(const word of words) {
        currentChunk.push(word);
        currentSize++;

        if(currentSize >= CHUNK_SIZE) {
            chunks.push(currentChunk.join(" "));
            currentChunk = currentChunk.slice(-CHUNK_OVERLAP);
            currentSize = currentChunk.length;
        }
    }
    if(currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
    }
    return chunks;
}

export function extractText(buffer: Buffer, mimeType: string): string {
    if(mimeType === "text/plain" || mimeType === "text/markdown") {
        return buffer.toString("utf-8");
    }
    throw new Error(`Unsupported file type: ${mimeType}. Only test and markdown files are supporte currently. `);
}