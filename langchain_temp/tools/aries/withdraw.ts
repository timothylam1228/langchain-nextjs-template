import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Withdraw tokens from Aries
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to withdraw
 * @param amount Amount to withdraw
 * @returns Transaction signature
 */
export async function withdrawAriesToken(agent: AgentRuntime, mintType: MoveStructId, amount: number): Promise<InputTransactionData> {
	try {
		return { data: {
				function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::withdraw",
				typeArguments: [mintType],
				functionArguments: ["Main account", amount, false],
			} }
	} catch (error: any) {
		throw new Error(`Withdraw failed: ${error.message}`)
	}
}
