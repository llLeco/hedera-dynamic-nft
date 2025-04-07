# Hedera Dynamic NFT Showcase

This repository demonstrates how to create and manage dynamic NFTs (Non-Fungible Tokens) on the Hedera network. It provides a clean, robust, and well-documented implementation of key features for working with dynamic NFTs.

## What are Dynamic NFTs?

Unlike regular NFTs, Dynamic NFTs (dNFTs) can change their metadata or properties over time based on external events, interactions, or conditions. This project demonstrates how to implement dNFTs using Hedera's unique capabilities:

- **NFT Standards**: Using Hedera Token Service (HTS) for NFT creation and management
- **State Storage**: Storing NFT state changes on-chain using Hedera Consensus Service (HCS)
- **Event Tracking**: Recording and querying NFT history through the HCS topic messaging system

## Features

- Create NFT collections on Hedera
- Mint dynamic NFTs with updateable metadata
- Add events to NFTs, changing their properties
- Track NFT history through an immutable record of events
- Query NFT and collection information
- Handle NFT images through IPFS integration

## Architecture

The application follows a clean, modular architecture based on NestJS with four main layers:

1. **Client Layer**: Handles web browser, mobile app, and external service requests
2. **API Layer**: Manages REST endpoints, validation, and error handling
3. **Core Layer**: Contains NFT, Collection, and IPFS modules for business logic
4. **Service Layer**: Provides Hedera, Config, and IPFS services for external integrations
5. **External Layer**: Connects to Hedera Network, HCS Topics, and IPFS/Pinata

### Key Components

- **Collection Module**: Manages NFT collections (creating, querying)
- **NFT Module**: Handles individual NFTs (minting, updating, querying)
- **Hedera Service**: Core integration with Hedera's SDK, handling all blockchain operations
- **IPFS Service**: Manages asset storage through IPFS (using Pinata as a pinning service)

### Data Flow

1. Client makes API requests to create collections, mint NFTs, or update NFT state
2. NestJS controllers validate incoming data through DTOs
3. Service layer processes business logic
4. Hedera service interacts with the Hedera network
5. For state changes, events are recorded to the NFT's dedicated HCS topic
6. History is retrieved by querying the HCS topic's message stream

## Project Structure

```
hedera-dynamic-nft/
├── src/
│   ├── app.module.ts              # Main application module
│   ├── main.ts                    # Application entry point
│   ├── config/                    # Configuration management
│   ├── hedera/                    # Hedera blockchain integration
│   ├── nft/                       # NFT operations
│   ├── collection/                # Collection operations
│   ├── ipfs/                      # IPFS storage integration
│   ├── models/                    # Data models
│   └── dto/                       # Data Transfer Objects
├── public/                        # Static assets
├── .env.example                   # Environment variables template
└── package.json                   # Dependencies and scripts
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Hedera testnet or mainnet account
- Pinata account for IPFS (or alternative IPFS service)

## Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/hedera-dynamic-nft.git
   cd hedera-dynamic-nft
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your Hedera account details and Pinata API keys:
   ```
   HEDERA_NETWORK=testnet
   HEDERA_OPERATOR_ID=0.0.123
   HEDERA_OPERATOR_KEY=your-private-key
   PINATA_API_KEY=your-pinata-api-key
   PINATA_SECRET_KEY=your-pinata-secret-key
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start the server**:
   ```bash
   npm run start
   ```
   The API will be available at http://localhost:3000

## Development

For development with hot-reloading:
```bash
npm run start:dev
```

Available npm scripts:
```bash
npm run start:dev    # Start development server with hot-reload
npm run start:prod   # Start production server
npm run build       # Build the application
npm run format      # Format code using Prettier
npm run lint        # Lint code using ESLint
```

## Code Quality

The project includes several tools to maintain high code quality:

```bash
# Format code using Prettier
npm run format

# Lint code using ESLint
npm run lint
```

These tools are configured to run automatically in the CI pipeline and as Git hooks to ensure consistent code quality.

## Security Considerations

### API Security

- The sample application does not include authentication. For production, implement proper authentication and authorization mechanisms.
- Rate limiting should be added in production to prevent abuse.

### Hedera Account Security

- **NEVER** commit real private keys to source control.
- Use environment variables for all sensitive credentials.
- Consider using a vault solution for production deployments.
- Use separate accounts for development, testing, and production.

## Deployment

### Prerequisites for Production

- Dedicated Hedera account with sufficient funds
- Secure environment variable management
- Appropriate scaling based on expected load

### Deployment Options

#### Basic Node.js Deployment
```bash
NODE_ENV=production npm run start:prod
```

#### Docker Deployment
A Dockerfile is provided:

```bash
# Build the Docker image
docker build -t hedera-dynamic-nft .

# Run the container
docker run -p 3000:3000 --env-file .env hedera-dynamic-nft
```

#### Cloud Platforms

The application can be deployed to various cloud platforms:

- **AWS**: Use Elastic Beanstalk or ECS
- **Google Cloud**: Cloud Run or GKE
- **Azure**: App Service or AKS
- **Heroku**: Follow Heroku Node.js deployment guidelines

## API Documentation

The API endpoints are documented in the following sections:

### Collection Endpoints

#### Create Collection
```http
POST /collection
Content-Type: application/json

{
  "name": "My NFT Collection",
  "symbol": "MNC",
  "maxSupply": 1000
}
```

#### Get Collection
```http
GET /collection/:id
```

#### List Collections
```http
GET /collection
```

### NFT Endpoints

#### Mint NFT
```http
POST /nft
Content-Type: application/json

{
  "collectionId": "0.0.123",
  "metadata": {
    "name": "My NFT",
    "description": "A dynamic NFT",
    "image": "ipfs://Qm..."
  }
}
```

#### Get NFT Details
```http
GET /nft/:collectionId/:serialNumber
```

#### Add Event to NFT
```http
POST /nft/:collectionId/:serialNumber/event
Content-Type: application/json

{
  "name": "Event Name",
  "description": "Event Description"
}
```

#### Get NFT History
```http
GET /nft/:collectionId/:serialNumber/history
```

### IPFS Endpoints

#### Upload Image
```http
POST /ipfs/upload
Content-Type: multipart/form-data

file: <image_file>
```

#### Get Image
```http
GET /ipfs/:cid
```

All endpoints return JSON responses. Error responses follow this format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```