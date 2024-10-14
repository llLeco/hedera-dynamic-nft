# Hedera Dynamic NFT Showcase

This repository demonstrates how to create and manage dynamic NFTs (Non-Fungible Tokens) on the Hedera network. It provides a clean, robust, and well-documented implementation of key features for working with dynamic NFTs.

## Features

- Create NFT collections
- Mint dynamic NFTs with updateable metadata
- Update NFT metadata
- Fetch NFT and collection information
- Handle NFT transfers
- Manage asset events using Hedera Consensus Service (HCS)

## Project Structure

```
hedera-dynamic-nft/
├── src/
│   ├── config/
│   │   └── config.service.ts
│   ├── hedera/
│   │   └── hedera.service.ts
│   ├── nft/
│   │   ├── nft.service.ts
│   │   ├── nft.controller.ts
│   │   └── nft.module.ts
│   ├── collection/
│   │   ├── collection.service.ts
│   │   ├── collection.controller.ts
│   │   └── collection.module.ts
│   ├── models/
│   │   ├── nft.model.ts
│   │   └── collection.model.ts
│   ├── dto/
│   │   ├── create-nft.dto.ts
│   │   ├── update-nft.dto.ts
│   │   └── create-collection.dto.ts
│   └── app.module.ts
├── test/
│   ├── nft.service.spec.ts
│   └── collection.service.spec.ts
├── .env.example
├── package.json
└── README.md
```

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/hedera-dynamic-nft.git
   cd hedera-dynamic-nft
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your Hedera account details:
   ```
   cp .env.example .env
   ```

4. Run the application:
   ```
   npm run start
   ```

## Usage

Detailed API documentation can be found in the [API.md](API.md) file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.