import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Create a profile in Aries
 * @param agent MoveAgentKit instance
 * @returns Transaction signature
 */
export async function createAriesProfile(agent: AgentRuntime): Promise<InputTransactionData> {
	try {
		const output :InputTransactionData={
			data: {
				function: "0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::controller::register_user",
				functionArguments: ["Main account"],
			}
		}


		return output
	} catch (error: any) {
		throw new Error(`Create profile failed: ${error.message}`)
	}
}
