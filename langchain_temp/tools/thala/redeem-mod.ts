import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Redeem MOD in Thala
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to redeem MOD for
 * @param amount Amount to redeem
 * @returns Transaction signature
 */
export async function redeemMODWithThala(agent: AgentRuntime, mintType: MoveStructId, amount: number): Promise<InputTransactionData> {
	try {

		return {data: {
				function: "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::psm_scripts::redeem",
				typeArguments: [mintType],
				functionArguments: [amount],
			}}
	} catch (error: any) {
		throw new Error(`Redeem MOD failed: ${error.message}`)
	}
}
