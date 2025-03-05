import { type AccountAddress, Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Burn NFT
 * @param agent MoveAgentKit instance
 * @param mint NFT mint address
 * @returns Transaction signature
 */
export async function burnNFT(agent: AgentRuntime, mint: AccountAddress): Promise<InputTransactionData> {

	 try {
		 const output:InputTransactionData= {
			 data:{
				 function: "0x4::aptos_token::burn",
				 typeArguments:["0x4::token::Token"],
				 functionArguments:[mint]
			 }
		 }

	   return output;
	 } catch (error: unknown) {
	   throw new Error(`NFT burn failed: ${error}`);
	 }
}
