import {
  type AccountAddress,
  type InputGenerateTransactionPayloadData,
  SimpleTransaction,
  convertAmountFromHumanReadableToOnChain,
} from "@aptos-labs/ts-sdk";
import type { AgentRuntime } from "../../agent";

/**
 * Transfer APT, tokens or fungible asset to a recipient
 * @param agent MoveAgentKit instance
 * @param to Recipient's public key
 * @param amount Amount to transfer
 * @param mint Move struct ID or address of the token / fungible asset to transfer
 * @returns Transaction signature
 * @example
 * ```ts
 * const transactionHash = await transferTokens(agent, recipientAddress, amount, APTOS_COIN); // For APT
 * const otherTransactionHash = await transferTokens(agent, recipientAddress, amount, OTHER_TOKEN); // For another token
 * const fungibleAssetTransactionHash = await transferTokens(agent, recipientAddress, amount, fungibleAssetAddress); // For fungible asset
 * ```
 */
export async function transferTokens(
  agent: AgentRuntime,
  to: AccountAddress,
  amount: number,
  mint: string,
): Promise<{
  data: {
    function: string;
    typeArguments: string[];
    functionArguments: string[];
  };
}> {
  const COIN_STANDARD_DATA: InputGenerateTransactionPayloadData = {
    function: "0x1::coin::transfer",
    typeArguments: [mint],
    functionArguments: [to.toString(), amount],
  };

  const FUNGIBLE_ASSET_DATA: InputGenerateTransactionPayloadData = {
    function: "0x1::primary_fungible_store::transfer",
    typeArguments: ["0x1::fungible_asset::Metadata"],
    functionArguments: [mint, to.toString(), amount],
  };

  try {
    return mint.split("::").length === 3
      ? {
          data: {
            function: "0x1::coin::transfer",
            typeArguments: [mint],
            functionArguments: [to.toString(), amount.toString()],
          },
        }
      : {
          data: {
            function: "0x1::primary_fungible_store::transfer",
            typeArguments: ["0x1::fungible_asset::Metadata"],
            functionArguments: [mint, to.toString(), amount.toString()],
          },
        };
  } catch (error: any) {
    throw new Error(`Token transfer failed: ${error.message}`);
  }
}
