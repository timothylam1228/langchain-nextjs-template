import type { InputGenerateTransactionPayloadData, MoveStructId } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";

/**
 * Borrow tokens from Echelon
 * @param agent MoveAgentKit instance
 * @param mintType Type of coin to lend
 * @param amount Amount to lend
 * @param poolAddress Pool address
 * @param fungibleAsset Whether the asset is fungible
 * @returns Transaction signature
 */
export async function borrowTokenWithEchelon(
	agent: AgentRuntime,
	mintType: MoveStructId,
	amount: number,
	poolAddress: string,
	fungibleAsset: boolean
): Promise<InputTransactionData> {
	const FUNCTIONAL_ARGS_DATA = [poolAddress, amount]

	const COIN_STANDARD_DATA: InputTransactionData = {
	data:{
		  function: "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::scripts::borrow",
			typeArguments: [mintType.toString()],
			functionArguments: FUNCTIONAL_ARGS_DATA,
	}
}

	const FUNGIBLE_ASSET_DATA: InputTransactionData = {data:{
			function: "0xc6bc659f1649553c1a3fa05d9727433dc03843baac29473c817d06d39e7621ba::scripts::borrow_fa",
			functionArguments: FUNCTIONAL_ARGS_DATA,
		}}

	try {
		return fungibleAsset ? FUNGIBLE_ASSET_DATA : COIN_STANDARD_DATA
	} catch (error: any) {
		throw new Error(`Borrow failed: ${error.message}`)
	}
}
