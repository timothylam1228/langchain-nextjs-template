import { Tool } from "langchain/tools";
import { type AgentRuntime } from "../../agent";
import { FormattedNFTData } from "@/langchain_temp/tools/twotag/get_twotag_nft";

/**
 * get user address 2tag nft
 * @returns string[] - nft token id []
 */

export class GetTwotagNFT extends Tool {
  name = "get_twotag_nft";
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

  async _call(): Promise<Tweet[]> {
    try {
      const nftData = await this.agent.get_twotag_nft();
      const tweets = await Promise.all(
        nftData.map((nft) => fetch_single_tweet(this.agent, nft.token_id)),
      );

      // Combine NFT data with tweet data
      const combinedData = tweets.map((tweet, index) => {
        return {
          ...tweet,
          token_id: nftData[index].token_id,
          token_uri: nftData[index].token_uri,
          token_name: nftData[index].token_name,
        };
      });

      return combinedData;
    } catch (error: any) {
      console.error("Error retrieving Tweet NFTs:", error);
      return [];
    }
  }
}

export interface Tweet {
  deploy_Date: number;
  owner: string;
  text: string;
  tag: string[];
  token_id: string;
  token_uri: string;
  token_name: string;
}

async function fetch_single_tweet(
  agent: AgentRuntime,
  nft_token_id: string,
): Promise<Tweet> {
  try {
    let respone = await agent.aptos.view({
      payload: {
        function:
          "0xac314e37a527f927ee7600ac704b1ee76ff95ed4d21b0b7df1c58be8872da8f0::post::read_public_tweet",
        functionArguments: [nft_token_id],
      },
    });
    return respone[0] as Tweet;
  } catch (e: unknown) {
    console.log(e);
  }

  return {
    deploy_Date: 0,
    owner: "",
    text: "",
    tag: [],
    token_id: "",
    token_uri: "",
    token_name: "",
  };
}
