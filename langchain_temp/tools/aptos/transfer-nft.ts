import { type AccountAddress, Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Transfer NFT
 * @param agent MoveAgentKit instance
 * @param to Recipient's public key
 * @param mint NFT mint address
 * @returns Transaction signature
 */
export async function transferNFT(
	agent: AgentRuntime, // Replace with the actual type of the move-agent
	to: AccountAddress,
	mint: AccountAddress
):Promise<InputTransactionData> {
		const ootput:InputTransactionData={
			data:{
				function:"0x1::object::transfer",
				typeArguments:["0x4::token::Token"],
				functionArguments:[mint,to]
			}
		}
	 try {
	   return ootput;
	 } catch (error: unknown) {
	   throw new Error(`NFT transfer failed: ${error}`);
	 }
}
