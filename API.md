# Hedera Dynamic NFT API Documentation

This document outlines the REST API endpoints available in the Hedera Dynamic NFT project.

## Base URL

All API URLs referenced in this documentation have the base:

```
http://localhost:3000
```

## Authentication

Currently, this demo application does not implement authentication. In a production environment, you would need to implement an authentication mechanism such as JWT or OAuth.

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a message describing the error:

```json
{
  "statusCode": 400,
  "message": "Description of the error",
  "error": "Bad Request"
}
```

## API Endpoints

### Collections

#### Create a Collection

Creates a new NFT collection on Hedera.

- **URL**: `/collection`
- **Method**: `POST`
- **Request Body**:

```json
{
  "name": "My Collection",
  "symbol": "MYCOL",
  "description": "A description of my NFT collection"
}
```

- **Response**: `201 Created`

```json
{
  "id": "0.0.12345",
  "name": "My Collection",
  "symbol": "MYCOL",
  "description": "A description of my NFT collection"
}
```

#### Get Collection Information

Retrieves information about a collection.

- **URL**: `/collection/:collectionId`
- **Method**: `GET`
- **URL Parameters**: `collectionId` - The ID of the collection (e.g., `0.0.12345`)
- **Response**: `200 OK`

```json
{
  "id": "0.0.12345",
  "name": "My Collection",
  "symbol": "MYCOL",
  "totalSupply": "5",
  "maxSupply": "1000",
  "description": "A description of my NFT collection"
}
```

#### Get Collection Assets

Retrieves all NFTs in a collection.

- **URL**: `/collection/:collectionId/assets`
- **Method**: `GET`
- **URL Parameters**: `collectionId` - The ID of the collection (e.g., `0.0.12345`)
- **Response**: `200 OK`

```json
[
  {
    "tokenId": "0.0.12345",
    "serialNumber": "1",
    "owner": "0.0.54321",
    "metadata": {
      "name": "NFT #1",
      "description": "Description of NFT #1",
      "image": "ipfs://QmXYZ..."
    },
    "creationTime": "2023-01-01T00:00:00.000Z"
  },
  // ... more NFTs
]
```

### NFTs

#### Create (Mint) an NFT

Creates a new NFT in a collection.

- **URL**: `/nft/:collectionId`
- **Method**: `POST`
- **URL Parameters**: `collectionId` - The ID of the collection (e.g., `0.0.12345`)
- **Request Body**:

```json
{
  "name": "My NFT",
  "description": "A description of my NFT",
  "image": "ipfs://QmXYZ...",
  "attributes": [
    {
      "trait_type": "Color",
      "value": "Blue"
    },
    {
      "trait_type": "Size",
      "value": "Medium"
    }
  ]
}
```

- **Response**: `201 Created`

```
"0.0.12345:1"
```

Note: The response is the NFT ID in the format `{collectionId}:{serialNumber}`.

#### Get NFT Information

Retrieves information about an NFT.

- **URL**: `/nft/:nftId`
- **Method**: `GET`
- **URL Parameters**: `nftId` - The ID of the NFT (e.g., `0.0.12345:1`)
- **Response**: `200 OK`

```json
{
  "tokenId": "0.0.12345",
  "serialNumber": "1",
  "owner": "0.0.54321",
  "metadata": {
    "name": "My NFT",
    "description": "A description of my NFT",
    "image": "ipfs://QmXYZ...",
    "attributes": [
      {
        "trait_type": "Color",
        "value": "Blue"
      },
      {
        "trait_type": "Size",
        "value": "Medium"
      }
    ],
    "topicId": "0.0.67890"
  },
  "creationTime": "2023-01-01T00:00:00.000Z"
}
```

#### Add Event to NFT

Adds a dynamic event to an NFT.

- **URL**: `/nft/:nftId/event`
- **Method**: `POST`
- **URL Parameters**: `nftId` - The ID of the NFT (e.g., `0.0.12345:1`)
- **Request Body**:

```json
{
  "name": "Level Up",
  "description": "NFT has leveled up",
  "attributes": {
    "level": 2,
    "power": 100
  }
}
```

- **Response**: `201 Created`

#### Get NFT History

Retrieves the history of events for an NFT.

- **URL**: `/nft/:nftId/history`
- **Method**: `GET`
- **URL Parameters**: `nftId` - The ID of the NFT (e.g., `0.0.12345:1`)
- **Response**: `200 OK`

```json
[
  {
    "name": "Creation",
    "description": "NFT was created",
    "timestamp": "2023-01-01T00:00:00.000Z"
  },
  {
    "name": "Level Up",
    "description": "NFT has leveled up",
    "attributes": {
      "level": 2,
      "power": 100
    },
    "timestamp": "2023-01-02T00:00:00.000Z"
  }
]
```

### IPFS

#### Get Image from IPFS

Retrieves an image from IPFS.

- **URL**: `/ipfs/:cid`
- **Method**: `GET`
- **URL Parameters**: `cid` - The IPFS Content Identifier (e.g., `QmXYZ...`)
- **Response**: `200 OK` - The image binary data with appropriate Content-Type

## Pagination

Endpoints that return collections of items don't currently support pagination but will in a future update.

## Rate Limiting

There is currently no rate limiting implemented. In a production environment, you should implement rate limiting to protect your API from abuse.

## Webhook Notifications

The API does not currently support webhooks for event notifications. This could be added in a future update to allow applications to receive real-time updates when an NFT's state changes.

## SDK Integration

For easier integration with your application, consider using the Hedera JavaScript SDK:

```bash
npm install @hashgraph/sdk
``` 