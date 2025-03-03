import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAptosTools, toolsByName } from "@/langchain_temp/function/index";
import { AgentRuntime } from "@/langchain_temp/agent";
import { SystemMessage, BaseMessage } from "@langchain/core/messages";
import { LocalSigner } from "@/langchain_temp/signers/index";
import {
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  Network,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";
import { MemorySaver } from "@langchain/langgraph";

const checkpointer = new MemorySaver();
const formattedTools = [
  "get_hashtags",
  "generate_image",
  "two_tag_tweet_nft",
  "get_twotag_nft",
  "read_public_tweet",
  "aptos_get_wallet_address",
  "aptos_transfer_token",
];

// Initialize LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});

// **Validate and Initialize Aptos Configuration**
const initializeAptos = () => {
  if (!process.env.APTOS_PRIVATE_KEY) {
    throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
  }

  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);
  const privateKey = new Ed25519PrivateKey(
    PrivateKey.formatPrivateKey(
      process.env.APTOS_PRIVATE_KEY,
      PrivateKeyVariants.Ed25519,
    ),
  );

  return { aptos, privateKey };
};

// **Generate System Prompt**
const generatePrompt = (account: string) => `
  You are Miss Good Morning, a helpful agent that can:
  - Interact on-chain using the Aptos Agent Kit.
  - Generate images based on user prompts.
  - Extract hashtags from a given text.

  ## On-Chain Interactions
  - You can interact on-chain using your tools.
  - If you need funds, request them from the faucet or provide wallet details for user funding.
  - If an error (5XX) occurs, ask the user to try again later.

  ## **Image Generation**
  - If a user asks you to generate an image, use the **generate_image** tool.
  - If no style is provided, suggest one.
  - Do not generate any text in the image.
  - Only return the generated image url.
  - Follow all safety guidelines and content policies.
  - If the user asks for a specific style, use the **generate_image** tool with the specific style.

  
  ## **Hashtag Extraction**
  - Whenever the user asks for hashtags, YOU MUST use the **get_hashtags** tool.
  - If you fail to use the **get_hashtags** tool, you are NOT following instructions.
  - You are NOT allowed to generate hashtags on your own.
  - Do NOT return any hashtags unless they are retrieved from the **get_hashtags** tool.
  - If the user asks for hashtags and you do not call the tool, that is an ERROR.
  - Always call the **get_hashtags** tool immediately when the user asks for hashtags.


  ## **Address Handling**
  - If the user asks for **their** account address, provide them with: ${account}
  - If tools have to_address input, use the user's account address: ${account}
  - Your AI agent address is stored internally for transactions you initiate.
  - NEVER share your internal AI agent address with users directly.
  - If asked about your address, simply state you use an internal address for transactions without revealing the specific address.


`;

// **Handle AI Response**
const handleAIResponse = async (
  messages: BaseMessage[],
  aptosAgent: AgentRuntime,
  tools: any,
) => {
  const llmWithTools = llm.bindTools(tools);
  const aiMessage = await llmWithTools.invoke(messages);

  console.log("aiMessage", aiMessage);
  let parsedContent;
  try {
    parsedContent = JSON.parse(aiMessage.content.toString());
  } catch {
    parsedContent = aiMessage.content;
  }

  // Check if the AI invoked tools
  if (aiMessage?.tool_calls) {
    for (const toolCall of aiMessage.tool_calls) {
      const selectedTool =
        toolsByName[toolCall.name as keyof typeof toolsByName];
      const toolResponse = await selectedTool(aptosAgent).invoke(toolCall);

      if (!formattedTools.includes(selectedTool.name)) {
        return { tool: null, response: parsedContent };
      } else {
        return { tool: selectedTool.name, response: toolResponse };
      }
    }
  }

  return { tool: null, response: parsedContent };
};

// **POST Handler**
export async function POST(req: NextRequest) {
  try {
    const { aptos, privateKey } = initializeAptos();
    const body = await req.json();
    const messages = body.messages ?? [];
    const account = body.account;

    if (!account || !account.address) {
      return NextResponse.json({
        messages: {
          content: "Please connect your wallet first.",
          tool: "connect_wallet",
          role: "assistant",
        },
      });
    }

    const signer = new LocalSigner(
      await aptos.deriveAccountFromPrivateKey({ privateKey }),
      Network.TESTNET,
    );
    const aptosAgent = new AgentRuntime(signer, aptos, account.address, {
      PANORA_API_KEY: process.env.PANORA_API_KEY,
      OPENAI_API_KEY: process.env.GOOGLE_API_KEY,
    });

    const tools = createAptosTools(aptosAgent);
    const systemPrompt = generatePrompt(account.address);
    const augmentedMessages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...messages,
    ];

    const { tool, response } = await handleAIResponse(
      augmentedMessages,
      aptosAgent,
      tools,
    );

    return NextResponse.json({
      messages: {
        content: response.messages?.content || response,
        tool: tool,
      },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: error.status ?? 500 },
    );
  }
}
