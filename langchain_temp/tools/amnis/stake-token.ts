import { type AccountAddress, convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import type { AgentRuntime } from "../../agent"

/**
 * Stake APT or any tokens on Amnis
 * @param agent MoveAgentKit instance
 * @param to Recipient's public key
 * @param amount Amount to transfer
 * @returns Transaction signature
 */
export async function stakeTokens(agent: AgentRuntime, to: AccountAddress, amount: number): Promise<string> {
	try {
		const transaction = await agent.aptos.transaction.build.simple({
			sender: agent.account.getAddress(),
			data: {
				function: "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::router::deposit_and_stake_entry",
				functionArguments: [amount, to.toString()],
			},
		})

		const committedTransactionHash = await agent.account.sendTransaction(transaction)

		const signedTransaction = await agent.aptos.waitForTransaction({
			transactionHash: committedTransactionHash,
		})

		if (!signedTransaction.success) {
			console.error(signedTransaction, "Token staking failed")
			throw new Error("Token staking failed")
		}

		return signedTransaction.hash
	} catch (error: any) {
		throw new Error(`Token staking failed: ${error.message}`)
	}
}
