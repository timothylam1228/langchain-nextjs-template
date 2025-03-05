import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Stake tokens in Thala
 * @param agent MoveAgentKit instance
 * @param amount Amount of token to stake
 * @returns Transaction signature
 */
export async function stakeTokenWithThala(agent: AgentRuntime, amount: number): Promise<InputTransactionData> {
	try {
		return {data: {
				function: "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::scripts::stake_APT_and_thAPT",
				functionArguments: [amount],
			}}
	} catch (error: any) {
		throw new Error(`Stake APT failed: ${error.message}`)
	}
}
