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

The application follows a clean, modular architecture based on NestJS:

![Architecture](docs/architecture-diagram.svg)

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
├── test/                          # Comprehensive test suite
├── docs/                          # Documentation assets
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
   Edit the `.env` file with your Hedera account details and Pinata API keys.

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

## Code Quality

The project includes several tools to maintain high code quality:

```bash
# Format code using Prettier
npm run format

# Lint code using ESLint
npm run lint
```

These tools are also configured to run automatically in the CI pipeline and as Git hooks to ensure consistent code quality.

### Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run with coverage report
npm run test:cov
```

See the [Test Documentation](test/README.md) for more details on the testing strategy.

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

Detailed API documentation is available in the [API.md](API.md) file.

## Sample Application

The repository includes a sample frontend application in the `public` directory to demonstrate how to interact with the API. Access it by running the server and navigating to http://localhost:3000.

## Use Cases

This project can be used as a foundation for various dynamic NFT applications:

- **Gaming Assets**: NFTs that evolve based on gameplay achievements
- **Digital Art**: Artwork that changes based on external conditions
- **Loyalty Programs**: Membership NFTs that gain benefits over time
- **Event Tickets**: Tickets that change state before/during/after events
- **Certifications**: Credentials that update as new skills are acquired

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes all tests and linting rules.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Hedera Hashgraph for their powerful distributed ledger technology
- IPFS and Pinata for decentralized storage solutions
- NestJS team for the excellent framework