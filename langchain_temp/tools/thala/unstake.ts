import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Unstake tokens in Thala
 * @param agent MoveAgentKit instance
 * @param amount Amount of APT to unstake
 * @returns Transaction signature
 */
export async function unstakeAPTWithThala(agent: AgentRuntime, amount: number): Promise<InputTransactionData> {
	try {
		return {data: {
				function: "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::scripts::unstake_thAPT",
				functionArguments: [amount],
			}}
	} catch (error: any) {
		throw new Error(`Unstake token failed: ${error.message}`)
	}
}
