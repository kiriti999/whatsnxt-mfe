
// public/deleteWorker.js - Updated for BFF API
console.log('🔧 [Delete Worker] Worker script loaded');

// Since we can't use ES6 imports in a worker loaded directly,
// we'll use dynamic imports or make the API call through postMessage

const extractPublicIds = (assetsList) => {
    console.log(' extractPublicIds :: assetsList:', assetsList)
    if (!Array.isArray(assetsList)) {
        console.error('assetsList is not an array:', assetsList);
        return [];
    }

    return assetsList
        .map(asset => asset.publicId)
};

self.onmessage = async (event) => {
    console.log('🔧 [Delete Worker] Received message:', event.data);
    const { assetsList, bffApiUrl } = event.data;

    try {
        const public_ids = extractPublicIds(assetsList);
        console.log(' self.onmessage= :: public_ids:', public_ids)

        if (public_ids.length === 0) {
            self.postMessage({
                status: 'error',
                error: 'No valid assets to delete'
            });
            return;
        }

        console.log('🔧 [Delete Worker] Deleting:', public_ids);

        // Since we can't import CloudinaryAPI directly in a worker,
        // we'll use fetch to call your BFF API directly
        // This assumes your BFF API is accessible from the browser

        // Get the BFF API base URL (you may need to adjust this)
        const BFF_API_BASE = bffApiUrl;

        const response = await fetch(`${BFF_API_BASE}/cloudinary/delete-multiple-assets`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Add any authentication headers your BFF requires
            },
            body: JSON.stringify({ public_ids }),
        });

        if (!response.ok) {
            throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
        }

        const results = await response.json();

        self.postMessage({
            status: 'success',
            results: results
        });

    } catch (error) {
        console.error('🔧 [Delete Worker] Error:', error);
        self.postMessage({
            status: 'error',
            error: error.message || 'Unknown error occurred'
        });
    }
};