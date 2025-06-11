import { saveAs } from 'file-saver';

export function downloadBase64File(base64: string, fileName: string, fileType: string = 'application/octet-stream') {
    // Decode base64 to binary data
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray: Uint8Array = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    // Create a Blob and trigger file download
    const blob = new Blob(byteArrays, { type: fileType });
    saveAs(blob, fileName);
}
