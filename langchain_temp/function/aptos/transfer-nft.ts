import { AccountAddress } from "@aptos-labs/ts-sdk";
import { Tool } from "langchain/tools";
import { type AgentRuntime, parseJson } from "../..";

export class AptosTransferNFTTool extends Tool {
  name = "aptos_transfer_nft";
  description = `This tool transfers an NFT on the Aptos blockchain to a specified recipient.
  
  Input: A JSON string with the following parameters:
  - to: string - The recipient's wallet address (required)
    Example: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa"
  - mint: string - The NFT's identifier/address (required)
    Example: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa"
    
  Output: A JSON string containing:
  - status: "success" or "error"
  - transfer: Transaction hash (if successful)
  - nft: The NFT identifier that was transferred (if successful)
  - message: Error message (if failed)
  
  Example:
  Input: {"to": "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa", "mint": "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa"}
  Output: {"status": "success", "transfer": "0x123...abc", "nft": "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa"}`;

  constructor(private agent: AgentRuntime) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = parseJson(input);

      const transfer = await this.agent.transferNFT(
        AccountAddress.from(parsedInput.to),
        parsedInput.mint,
      );

      return JSON.stringify({
        status: "success",
        transfer,
        nft: parsedInput.mint,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
