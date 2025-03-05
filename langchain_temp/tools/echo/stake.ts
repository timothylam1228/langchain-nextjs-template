import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Stake tokens in Echo
 * @param agent MoveAgentKit instance
 * @param amount Amount of token to stake
 * @returns Transaction signature
 */
export async function stakeTokenWithEcho(agent: AgentRuntime, amount: number): Promise<InputTransactionData> {
	try {

		return {data: {
				function: "0xa0281660ff6ca6c1b68b55fcb9b213c2276f90ad007ad27fd003cf2f3478e96e::lsdmanage::stake",
				functionArguments: [amount],
			} }
	} catch (error: any) {
		throw new Error(`Stake token in Echo failed: ${error.message}`)
	}
}
