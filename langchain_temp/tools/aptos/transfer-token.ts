import { type AccountAddress } from "@aptos-labs/ts-sdk";
import type { AgentRuntime } from "../../agent";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

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
	mint: string
): Promise<InputTransactionData> {
	// const COIN_STANDARD_DATA: InputGenerateTransactionPayloadData = {
	// 	function: "0x1::coin::transfer",
	// 	typeArguments: [mint],
	// 	functionArguments: [to.toString(), amount],
	// }
	//
	// const FUNGIBLE_ASSET_DATA: InputGenerateTransactionPayloadData = {
	// 	function: "0x1::primary_fungible_store::transfer",
	// 	typeArguments: ["0x1::fungible_asset::Metadata"],
	// 	functionArguments: [mint, to.toString(), amount],
	// }

	try {
		// const signedTransaction = await agent.aptos.waitForTransaction({
			// 	transactionHash: committedTransactionHash,
			// })
			// const hash = await agent.aptos.waitForTransaction({transactionHash:committedTransactionHash.hash});
			// const transaction = await agent.aptos.transaction.build.simple({
			// 	sender: agent.account.getAddress(),
			// 	data: mint.split("::").length === 3 ? COIN_STANDARD_DATA : FUNGIBLE_ASSET_DATA,
			// })

			// const committedTransactionHash = await agent.account.sendTransaction(transaction)
			// if (!hash) {
			// 	console.error(hash, "Token transfer failed")
			// 	throw new Error("Token transfer failed")
			// }

			return (mint.split("::").length === 3 ? {
				data: {
					function: "0x1::coin::transfer",
					typeArguments: [mint],
					functionArguments: [to.toString(), amount],
				}
			} : {
				data: {
					function: "0x1::primary_fungible_store::transfer",
					typeArguments: ["0x1::fungible_asset::Metadata"],
					functionArguments: [mint, to.toString(), amount],
				}
			})

	} catch (error: any) {
		throw new Error(`Token transfer failed: ${error.message}`)
	}
}
