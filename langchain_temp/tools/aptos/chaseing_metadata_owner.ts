
import type { AgentRuntime } from "../../agent"

/**
 * Get metadata owner address
 * @param agent MoveAgentKit instance
 * @param metadata coin/fungible asset data
 * @returns owner_address
 * @example
 * ```ts
 * const owner_address = await chaseing_metadata_owner(agent,metadata)
 * ```
 */
export async function chasing_metadata_owner(agent: AgentRuntime, metadata:string): Promise<string> {

    const fungibleAssetPattern = /^0x[0-9a-f]{62,}$/; // 匹配 0x + 62 個十六進制字符
    console.log("test =",fungibleAssetPattern.test(metadata),"meta =",metadata)
    try {
        if(fungibleAssetPattern.test(metadata)){
            const result = await agent.aptos.view({
                payload:{
                    function:"0xac314e37a527f927ee7600ac704b1ee76ff95ed4d21b0b7df1c58be8872da8f0::powerful::follow_owner",
                    functionArguments:[metadata],
                }
            })
            console.log("result",String(result[0]))
            return String(result[0])
        } else{
            return "Sorry something error"
        }
    } catch (error: unknown) {
        throw new Error(`Something error`)
    }
}
