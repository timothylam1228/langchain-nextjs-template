import { AccountAddress } from "@aptos-labs/ts-sdk";
import { Tool } from "langchain/tools";
import { type AgentRuntime, parseJson } from "../..";

export class AptosTransferNFTTool extends Tool {
  name = "aptos_transfer_nft";
  description = `
  
  This tool transfers an NFT on the Aptos blockchain to a specified recipient address.

  Inputs ( input is a JSON string ):
  to: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)
  mint: string, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa" (required)`;

  constructor(private agent: AgentRuntime) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = parseJson(input);
      const transfer = await this.agent.transferNFT(
        parsedInput.to,
        parsedInput.mint,
      );

      return JSON.stringify({
        status: "success",
        inputdata: transfer,
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
