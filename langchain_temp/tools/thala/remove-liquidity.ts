import type { MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Remove liquidity from Thala pool
 * @param agent MoveAgentKit instance
 * @param mintTypeX First coin type
 * @param mintTypeY Second coin type
 * @param lpAmount Amount of LP tokens to remove
 * @returns Transaction signature
 */
export async function removeLiquidityWithThala(
	agent: AgentRuntime,
	mintTypeX: MoveStructId,
	mintTypeY: MoveStructId,
	lpAmount: number
): Promise<InputTransactionData> {
	try {

		return {data: {
				function:
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool_scripts::remove_liquidity",
				typeArguments: [
					mintTypeX,
					mintTypeY,
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::Weight_50",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::Weight_50",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
					"0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
				],
				functionArguments: [lpAmount, 0, 0, 0, 0],
			}}
	} catch (error: any) {
		throw new Error(`Remove liquidity failed: ${error.message}`)
	}
}
