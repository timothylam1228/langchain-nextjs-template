
import type { AgentRuntime } from "../../agent"

/**
 * Fetches transaction from aptos
 * @param agent MoveAgentKit instance
 * @param metadata coin/fungible asset data
 * @param account user address
 * @returns boolean
 * @example
 * ```ts
 * const transaction = await getTransaction(agent, "HASH")
 * ```
 */
export async function is_frozen(agent: AgentRuntime, metadata:string,account:string): Promise<boolean> {

    const fungibleAssetPattern = /^0x[0-9a-f]{62,}$/; // 匹配 0x + 62 個十六進制字符
    const aptosCoinPattern = /^0x1::aptos_coin::[A-Za-z]+$/; // 匹配 0x1::aptos_coin:: 後面跟著一個或多個字母

    console.log("zheng 1 =",fungibleAssetPattern.test(metadata),"zheng 2 = ",aptosCoinPattern.test(metadata),"metadata = ",metadata)
    try {
        if(fungibleAssetPattern.test(metadata)){
            const result = await agent.aptos.view({
                payload:{
                    function:"0x1::primary_fungible_store::is_frozen",
                    functionArguments:[ account,metadata],
                    typeArguments:["0x1::fungible_asset::Metadata"]
                }
            })
            console.log("user are frozen? ",Boolean(result[0]))
            return Boolean(result[0])
        }else if( aptosCoinPattern.test(metadata)){
            const result = await agent.aptos.view({
                payload:{
                    function:"0x1::coin::is_coin_store_frozen",
                    typeArguments:[metadata,account]
                }
            })
            console.log("user are frozen? ",Boolean(result[0]))
            return Boolean(result[0])
        }else{
            return false
        }
    } catch (error: unknown) {
        throw new Error(`Something error`)
    }
}
