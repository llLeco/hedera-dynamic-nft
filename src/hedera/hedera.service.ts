import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction, TokenInfoQuery, TokenNftInfoQuery, NftId, TokenId, FileCreateTransaction, FileContentsQuery, TopicCreateTransaction, TopicMessageSubmitTransaction, TopicMessageQuery, Hbar, TopicId } from "@hashgraph/sdk";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HederaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HederaService.name);
  private client: Client;

  constructor(private configService: ConfigService) {}

  /**
   * Initializes the Hedera client when the module is initialized.
   */
  async onModuleInit() {
    await this.initializeClient();
  }

  /**
   * Closes the Hedera client connection when the module is destroyed.
   */
  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
    }
  }

  /**
   * Initializes the Hedera client with the operator account details from the configuration.
   * @throws Error if the required environment variables are not set.
   */
  private async initializeClient() {
    const operatorId = this.configService.get<string>('HEDERA_ACCOUNT_ID');
    const operatorKey = this.configService.get<string>('HEDERA_PRIVATE_KEY');

    if (!operatorId || !operatorKey) {
      throw new Error('Environment variables HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present');
    }

    try {
      const accountId = AccountId.fromString(operatorId);
      this.client = Client.forTestnet();
      this.client.setOperator(accountId, operatorKey);
    } catch (error) {
      this.logger.error('Error initializing Hedera client:', error);
      throw error;
    }
  }

  /**
   * Creates a new NFT collection on the Hedera network.
   * @param name The name of the NFT collection.
   * @param symbol The symbol of the NFT collection.
   * @returns A promise that resolves to the token ID of the created collection.
   */
  async createNFTCollection(name: string, symbol: string): Promise<string> {
    const treasuryAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

    const nftCreate = await new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(treasuryAccountId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(1000000)
      .setSupplyKey(treasuryKey)
      .freezeWith(this.client);

    const nftCreateTxSign = await nftCreate.sign(treasuryKey);
    const nftCreateSubmit = await nftCreateTxSign.execute(this.client);
    const nftCreateRx = await nftCreateSubmit.getReceipt(this.client);
    const tokenId = nftCreateRx.tokenId;

    this.logger.log(`Created NFT Collection with Token ID: ${tokenId}`);

    return tokenId.toString();
  }

  /**
   * Mints a new NFT in a specified collection.
   * @param collectionId The ID of the NFT collection.
   * @param fileId The ID of the file associated with the NFT.
   * @returns A promise that resolves to the serial number of the minted NFT.
   */
  async mintNFT(collectionId: string, fileId: string): Promise<string> {
    const supplyKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

    const mintTx = await new TokenMintTransaction()
      .setTokenId(collectionId)
      .setMetadata([Buffer.from(fileId.toString())])
      .freezeWith(this.client);

    const mintTxSign = await mintTx.sign(supplyKey);
    const mintTxSubmit = await mintTxSign.execute(this.client);
    const mintRx = await mintTxSubmit.getReceipt(this.client);

    const serialNumber = mintRx.serials[0].low.toString();
    this.logger.log(`Minted NFT ${collectionId} with serial: ${serialNumber}, referencing file: ${fileId}`);

    return serialNumber;
  }

  /**
   * Creates an immutable file on the Hedera network.
   * @param content The content to be stored in the file.
   * @returns A promise that resolves to the file ID of the created file.
   */
  public async createImmutableFile(content: any): Promise<string> {
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([]) // No keys means the file is immutable
      .setContents(JSON.stringify(content))
      .setMaxTransactionFee(new Hbar(2))
      .freezeWith(this.client);

    const signedTx = await fileCreateTx.sign(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));
    const submitTx = await signedTx.execute(this.client);
    const receipt = await submitTx.getReceipt(this.client);

    return receipt.fileId.toString();
  }

  /**
   * Retrieves the contents of a file from the Hedera network.
   * @param fileId The ID of the file to retrieve.
   * @returns A promise that resolves to the parsed contents of the file.
   */
  async getFileContents(fileId: string): Promise<any> {
    const query = new FileContentsQuery()
      .setFileId(fileId);

    const contents = await query.execute(this.client);
    return JSON.parse(contents.toString());
  }

  /**
   * Retrieves information about an NFT collection.
   * @param tokenId The ID of the NFT collection.
   * @returns A promise that resolves to an object containing collection information.
   */
  async getCollectionInfo(tokenId: string): Promise<any> {
    const query = new TokenInfoQuery().setTokenId(TokenId.fromString(tokenId));
    const tokenInfo = await query.execute(this.client);

    return {
      tokenId: tokenId,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      totalSupply: tokenInfo.totalSupply.toString(),
      maxSupply: tokenInfo.maxSupply.toString(),
    };
  }

  /**
   * Retrieves detailed information about a specific NFT.
   * @param tokenId The ID of the NFT collection.
   * @param serialNumber The serial number of the specific NFT.
   * @returns A promise that resolves to an object containing NFT information.
   */
  async getNFTInfo(tokenId: string, serialNumber: string): Promise<any> {
    const nftId = new NftId(TokenId.fromString(tokenId), serialNumber);
    const nftInfo = await new TokenNftInfoQuery()
      .setNftId(nftId)
      .execute(this.client);

    if (nftInfo.length === 0) {
      throw new Error('NFT not found');
    }

    const metadata = nftInfo[0].metadata.toString().trim();
    let parsedMetadata: any;
    let messages: Array<{ message: string }> | undefined;

    if (metadata.match(/^0\.0\.\d+$/)) {
      parsedMetadata = await this.getFileContents(metadata);
      messages = await this.getMessages(parsedMetadata.topicId, new Date(0), 100, 10000);
    } else {
      parsedMetadata = this.tryParseJSON(metadata) || { rawMetadata: metadata };
    }

    return {
      tokenId: nftInfo[0].nftId.tokenId.toString(),
      serialNumber: nftInfo[0].nftId.serial.toString(),
      owner: nftInfo[0].accountId.toString(),
      metadata: parsedMetadata,
      messages,
      creationTime: nftInfo[0].creationTime.toDate(),
    };
  }

  /**
   * Attempts to parse a string as JSON.
   * @param str The string to parse.
   * @returns The parsed JSON object if successful, or null if parsing fails.
   */
  private tryParseJSON(str: string): any {
    try {
      return JSON.parse(str);
    } catch (error) {
      this.logger.warn('Error parsing metadata as JSON:', error);
      return null;
    }
  }

  /**
   * Creates a new topic on the Hedera network.
   * @param memo A memo to associate with the topic.
   * @returns A promise that resolves to the created topic ID.
   */
  async createTopic(memo: string): Promise<string> {
    const transaction = new TopicCreateTransaction()
      .setAdminKey(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY))
      .setSubmitKey(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY))
      .setTopicMemo(memo)
      .setMaxTransactionFee(new Hbar(2));

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);
    return receipt.topicId.toString();
  }

  /**
   * Submits a message to a specified topic on the Hedera network.
   * @param topicId The ID of the topic to submit the message to.
   * @param message The message to submit.
   * @returns A promise that resolves to the status of the message submission.
   */
  async submitMessage(topicId: string, message: string): Promise<string> {
    const transaction = await new TopicMessageSubmitTransaction({
      topicId,
      message,
    }).freezeWith(this.client);

    const signTx = await transaction.sign(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));
    const txResponse = await signTx.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return receipt.status.toString();
  }

  /**
   * Retrieves messages from a specified topic on the Hedera network.
   * @param topicId The ID of the topic to retrieve messages from.
   * @param startTime The start time for message retrieval.
   * @param messageCount The maximum number of messages to retrieve.
   * @param timeout The timeout duration for the retrieval operation.
   * @returns A promise that resolves to an array of retrieved messages.
   */
  async getMessages(topicId: string, startTime: Date, messageCount: number, timeout: number): Promise<Array<{ message: string }>> {
    return new Promise<Array<{ message: string }>>((resolve, reject) => {
      const messages = [];
      const topicIdObj = TopicId.fromString(topicId);
      this.logger.log(`Fetching messages for topic ${topicId}`);

      const attemptSubscription = (attempt = 0) => {
        let subscription;
        try {
          subscription = new TopicMessageQuery()
            .setTopicId(topicIdObj)
            .setStartTime(startTime)
            .subscribe(
              this.client,
              (error) => {
                if (error) {
                  this.logger.error(`Subscription error (attempt ${attempt}): ${error}`);
                  if (subscription) subscription.unsubscribe();
                  if (attempt < 3) {
                    setTimeout(() => attemptSubscription(attempt + 1), 1000 * (attempt + 1));
                  } else {
                    reject(new Error(`Failed to subscribe after ${attempt} attempts: ${error}`));
                  }
                }
              },
              (message) => {
                try {
                  const parsedMessage = JSON.parse(Buffer.from(message.contents).toString("utf8"));
                  messages.push(parsedMessage);
                  if (messages.length >= messageCount) {
                    if (subscription) subscription.unsubscribe();
                    resolve(messages);
                  }
                } catch (parseError) {
                  this.logger.error(`Error parsing message: ${parseError}`);
                }
              }
            );
        } catch (setupError) {
          this.logger.error(`Error setting up subscription (attempt ${attempt}): ${setupError}`);
          if (attempt < 3) {
            setTimeout(() => attemptSubscription(attempt + 1), 1000 * (attempt + 1));
          } else {
            reject(new Error(`Failed to set up subscription after ${attempt} attempts: ${setupError}`));
          }
        }
      };

      attemptSubscription();

      setTimeout(() => {
        resolve(messages);
      }, timeout);
    });
  }
}
