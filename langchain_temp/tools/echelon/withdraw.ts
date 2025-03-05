import type { InputGenerateTransactionPayloadData, MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Withdraw tokens from Echelon
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to lend
 * @param amount Amount to lend
 * @param poolAddress Pool address
 * @param fungibleAsset Whether the asset is fungible
 * @returns Transaction signature
 */
export async function withdrawTokenWithEchelon(
	agent: AgentRuntime,
	mintType: MoveStructId,
	amount: number,
	poolAddress: string,
	fungibleAsset: boolean
): Promise<InputTransactionData> {
	try {
		const FUNCTIONAL_ARGS_DATA = [poolAddress, amount]

		const COIN_STANDARD_DATA: InputTransactionData = {data:{
				function: "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::scripts::withdraw",
				typeArguments: [mintType.toString()],
				functionArguments: FUNCTIONAL_ARGS_DATA,
			}
		}
		const FUNGIBLE_ASSET_DATA: InputTransactionData = {data:{
				function: "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::scripts::withdraw_fa",
				functionArguments: FUNCTIONAL_ARGS_DATA,
			}}


		return fungibleAsset ? FUNGIBLE_ASSET_DATA : COIN_STANDARD_DATA
	} catch (error: any) {
		throw new Error(`Withdraw failed: ${error.message}`)
	}
}
