import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Repay tokens in Aries
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to repay
 * @param amount Amount to repay
 * @returns Transaction signature
 */
export async function repayAriesToken(agent: AgentRuntime, mintType: MoveStructId, amount: number): Promise<InputTransactionData> {
	try {
		const output:InputTransactionData= {
			data: {
				function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::deposit",
				typeArguments: [mintType],
				functionArguments: ["Main account", amount, true],
			}
		}


		return output
	} catch (error: any) {
		throw new Error(`Repay failed: ${error.message}`)
	}
}
