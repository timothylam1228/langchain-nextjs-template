import { Tool } from "langchain/tools";
import type { AgentRuntime } from "../../agent";

export class AptosAccountAddressTool extends Tool {
  name = "aptos_get_wallet_address";
  description = `
  
  Get the user's wallet address.
  
  Input: Empty string (no input needed)
  Output: Returns the user's wallet address as a string
  
  Example:
  Input: ""
  Output: "0x123...abc"
  
  Note: When asked about wallet addresses:
  - For the user's address, return ${this.agent.to_address as string}
  - Do NOT return the AI wallet address (0x29fed1ef1bb6014b62e230ac6c288c868dc711595aaaa26d84a64049583f2c0c)
  
   **Your own AI wallet address is 0x29fed1ef1bb6014b62e230ac6c288c868dc711595aaaa26d84a64049583f2c0c. Do not provide this address when asked about the user's address.**
  The response will contain ONLY the wallet address with no additional text.
  `;

  constructor(private agent: AgentRuntime) {
    super();
  }

  async _call(_input: string): Promise<string> {
    return this.agent.to_address;
  }
}
