// Hedera Dynamic NFT Demo Frontend JavaScript

// API endpoint configuration
const API_BASE_URL = 'http://localhost:3000';

console.log('Hedera Dynamic NFT Demo Frontend loaded successfully');
console.log(`API endpoint configured as: ${API_BASE_URL}`);

// Bootstrap modal instance
let responseModal;

// Utility function to show API responses in the modal
function showResponseModal(title, data) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('response-data').textContent = 
        typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    responseModal.show();
}

// Utility function for API calls
async function callApi(endpoint, method, body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const contentType = response.headers.get('content-type');
        
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return { success: true, data };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// Collection form submission
document.getElementById('collection-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('collection-name');
    const symbolInput = document.getElementById('collection-symbol');
    const descriptionInput = document.getElementById('collection-description');
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-spinner me-2"></span>Creating...';
    
    const payload = {
        name: nameInput.value,
        symbol: symbolInput.value,
        description: descriptionInput.value
    };
    
    const result = await callApi('/collection', 'POST', payload);
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
    if (result.success) {
        showResponseModal('Collection Created', result.data);
        // Auto-fill the collection ID in the mint NFT form
        if (result.data && result.data.id) {
            document.getElementById('collection-id').value = result.data.id;
        }
    } else {
        showResponseModal('Error Creating Collection', { error: result.error });
    }
});

// NFT form submission
document.getElementById('nft-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const collectionIdInput = document.getElementById('collection-id');
    const nameInput = document.getElementById('nft-name');
    const descriptionInput = document.getElementById('nft-description');
    const imageInput = document.getElementById('nft-image');
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-spinner me-2"></span>Minting...';
    
    // Collect attributes
    const attributes = [];
    const attributeRows = document.querySelectorAll('#attributes-container .attribute-row');
    attributeRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 2 && inputs[0].value && inputs[1].value) {
            attributes.push({
                trait_type: inputs[0].value,
                value: inputs[1].value
            });
        }
    });
    
    const payload = {
        name: nameInput.value,
        description: descriptionInput.value,
        image: imageInput.value,
        attributes
    };
    
    const collectionId = collectionIdInput.value;
    const result = await callApi(`/nft/${collectionId}`, 'POST', payload);
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
    if (result.success) {
        showResponseModal('NFT Minted', { nftId: result.data });
        // Auto-fill the NFT ID in the NFT details form
        if (result.data) {
            document.getElementById('nft-id').value = result.data;
            // Trigger the NFT details form to load the newly created NFT
            document.getElementById('nft-details-form').dispatchEvent(new Event('submit'));
        }
    } else {
        showResponseModal('Error Minting NFT', { error: result.error });
    }
});

// NFT details form submission
document.getElementById('nft-details-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nftIdInput = document.getElementById('nft-id');
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-spinner me-2"></span>Loading...';
    
    const nftId = nftIdInput.value;
    const result = await callApi(`/nft/${nftId}`, 'GET');
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
    if (result.success) {
        // Update the NFT details display
        const nftDetails = document.getElementById('nft-details');
        nftDetails.classList.remove('d-none');
        
        // Display NFT information
        document.getElementById('nft-display-name').textContent = result.data.metadata.name || 'Unnamed NFT';
        document.getElementById('nft-display-description').textContent = result.data.metadata.description || '';
        document.getElementById('nft-display-token-id').textContent = result.data.tokenId;
        document.getElementById('nft-display-serial').textContent = result.data.serialNumber;
        
        // Handle image
        const imgElement = document.getElementById('nft-display-image');
        if (result.data.metadata.image) {
            const imageCid = result.data.metadata.image.replace('ipfs://', '');
            imgElement.src = `${API_BASE_URL}/ipfs/${imageCid}`;
            imgElement.alt = result.data.metadata.name;
        } else {
            imgElement.src = 'placeholder.png';
            imgElement.alt = 'No image available';
        }
        
        // Display attributes
        const attributesContainer = document.getElementById('nft-display-attributes');
        attributesContainer.innerHTML = '';
        
        if (result.data.metadata.attributes && result.data.metadata.attributes.length > 0) {
            result.data.metadata.attributes.forEach(attr => {
                const badge = document.createElement('div');
                badge.className = 'attribute-badge';
                badge.innerHTML = `
                    <span class="trait-type">${attr.trait_type}:</span>
                    <span class="value">${attr.value}</span>
                `;
                attributesContainer.appendChild(badge);
            });
        } else {
            attributesContainer.innerHTML = '<p class="text-muted">No attributes available</p>';
        }
        
        // Load NFT history
        loadNFTHistory(nftId);
    } else {
        showResponseModal('Error Loading NFT', { error: result.error });
    }
});

// Event form submission
document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nftIdInput = document.getElementById('nft-id');
    const nameInput = document.getElementById('event-name');
    const descriptionInput = document.getElementById('event-description');
    
    if (!nftIdInput.value) {
        showResponseModal('Error', { error: 'Please enter an NFT ID first' });
        return;
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-spinner me-2"></span>Adding Event...';
    
    // Collect custom properties
    const attributes = {};
    const propRows = document.querySelectorAll('#event-props-container .prop-row');
    propRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 2 && inputs[0].value && inputs[1].value) {
            attributes[inputs[0].value] = inputs[1].value;
        }
    });
    
    const payload = {
        name: nameInput.value,
        description: descriptionInput.value,
        attributes
    };
    
    const nftId = nftIdInput.value;
    const result = await callApi(`/nft/${nftId}/event`, 'POST', payload);
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
    if (result.success) {
        showResponseModal('Event Added', { success: true });
        // Reload NFT history
        loadNFTHistory(nftId);
        // Clear form
        nameInput.value = '';
        descriptionInput.value = '';
        const container = document.getElementById('event-props-container');
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
        container.querySelector('input:first-child').value = '';
        container.querySelector('input:nth-child(2)').value = '';
    } else {
        showResponseModal('Error Adding Event', { error: result.error });
    }
});

// Load NFT history
async function loadNFTHistory(nftId) {
    if (!nftId) return;
    
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<li class="list-group-item text-center"><span class="loading-spinner me-2"></span>Loading history...</li>';
    
    const result = await callApi(`/nft/${nftId}/history`, 'GET');
    
    if (result.success && Array.isArray(result.data)) {
        historyList.innerHTML = '';
        
        if (result.data.length === 0) {
            historyList.innerHTML = '<li class="list-group-item text-center text-muted">No history available</li>';
            return;
        }
        
        result.data.forEach((event, index) => {
            const date = new Date(event.timestamp);
            const formattedDate = date.toLocaleString();
            
            let eventClass = 'event-update';
            let eventIcon = '↑';
            
            if (index === 0) {
                eventClass = 'event-creation';
                eventIcon = '★';
            } else if (event.name.toLowerCase().includes('transfer')) {
                eventClass = 'event-transfer';
                eventIcon = '↔';
            }
            
            const listItem = document.createElement('li');
            listItem.className = `list-group-item d-flex history-item ${eventClass}`;
            
            // Create attributes HTML if present
            let attributesHtml = '';
            if (event.attributes && Object.keys(event.attributes).length > 0) {
                attributesHtml = '<div class="mt-2">';
                for (const [key, value] of Object.entries(event.attributes)) {
                    attributesHtml += `<div class="attribute-badge">
                        <span class="trait-type">${key}:</span>
                        <span class="value">${value}</span>
                    </div>`;
                }
                attributesHtml += '</div>';
            }
            
            listItem.innerHTML = `
                <div class="history-icon">${eventIcon}</div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${event.name}</h6>
                    <p class="mb-1">${event.description || ''}</p>
                    ${attributesHtml}
                    <small class="text-muted">${formattedDate}</small>
                </div>
            `;
            
            historyList.appendChild(listItem);
        });
    } else {
        historyList.innerHTML = '<li class="list-group-item text-center text-danger">Failed to load history</li>';
    }
}

// Refresh history button
document.getElementById('refresh-history').addEventListener('click', () => {
    const nftId = document.getElementById('nft-id').value;
    if (nftId) {
        loadNFTHistory(nftId);
    }
});

// Add attribute button
document.getElementById('add-attribute').addEventListener('click', () => {
    const container = document.getElementById('attributes-container');
    const newRow = document.createElement('div');
    newRow.className = 'attribute-row d-flex mb-2';
    newRow.innerHTML = `
        <input type="text" class="form-control me-2" placeholder="Trait name">
        <input type="text" class="form-control" placeholder="Value">
        <button type="button" class="btn btn-sm btn-danger ms-2 remove-attribute">✕</button>
    `;
    container.appendChild(newRow);
});

// Add property button for events
document.getElementById('add-prop').addEventListener('click', () => {
    const container = document.getElementById('event-props-container');
    const newRow = document.createElement('div');
    newRow.className = 'prop-row d-flex mb-2';
    newRow.innerHTML = `
        <input type="text" class="form-control me-2" placeholder="Property name">
        <input type="text" class="form-control" placeholder="Value">
        <button type="button" class="btn btn-sm btn-danger ms-2 remove-prop">✕</button>
    `;
    container.appendChild(newRow);
});

// Remove buttons for attributes and properties
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-attribute')) {
        const row = e.target.closest('.attribute-row');
        row.parentNode.removeChild(row);
    }
    if (e.target.classList.contains('remove-prop')) {
        const row = e.target.closest('.prop-row');
        row.parentNode.removeChild(row);
    }
});

// Initialize the Bootstrap modal when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    responseModal = new bootstrap.Modal(document.getElementById('response-modal'));
}); 