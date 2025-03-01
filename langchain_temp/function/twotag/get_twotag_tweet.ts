import { Tool } from "langchain/tools";
import { type AgentRuntime } from "../../agent";

/**
 * get user address 2tag nft
 * @returns string[] - nft token id []
 */

export class GetTwotagNFT extends Tool {
  name = "get_twotag_tweet";
  description = `
    This tool retrieves all TwoTag Tweet NFTs owned by the user from their wallet.
    
    Input: No input required (empty string)
    Output: JSON object containing an array of NFTs with their token IDs, URLs, and descriptions
    
    Example response:
    {
      "nfts": [
        {
          "token_id": "123456",
          "url": "https://example.com/nft/123456",
          "description": "My first TwoTag Tweet NFT"
        }
      ]
    }
    
    Use this tool when you need to display or list the user's TwoTag Tweet NFT collection.
    `;

  constructor(private agent: AgentRuntime) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const nftData = await this.agent.get_twotag_nft();

      return JSON.stringify({
        nfts: nftData,
      });
    } catch (error: any) {
      console.error("Error retrieving Tweet NFTs:", error);
      return JSON.stringify({
        error: `Error retrieving Tweet NFTs: ${error.message}`,
      });
    }
  }
}
