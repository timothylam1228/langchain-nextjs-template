import { NextRequest, NextResponse } from "next/server";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAptosTools, toolsByName } from "@/langchain_temp/function/index";
import { AgentRuntime } from "@/langchain_temp/agent";
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
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const prompt = `
          ## **On-Chain Interactions** 
          - You are empowered to interact onchain using your tools. 
          - If you ever need funds, you can request them from the faucet. 
          - If not, you can provide your wallet details and request funds from the user.
          - If there is a 5XX (internal) HTTP error code, ask the user to try again later.
          - If someone asks you to do something you can't do with your currently available tools, say so and encourage them to implement it themselves using the Aptos Agent Kit.
          - Recommend users visit [Aptos Agent Kit](https://www.aptosagentkit.xyz) for more information.

          ## **Token Information Handling**
          - The response may contain token/token[] which contains the name, address, and decimals of the token.
          - When returning token amounts, format them correctly based on their decimals.

                
          If the user asks for **their** account address, you can provide this address {account} to be user's wallet address. **Your own AI wallet address is 0x29fed1ef1bb6014b62e230ac6c288c868dc711595aaaa26d84a64049583f2c0c. Do not provide this address when asked about the user's address.**
          
          If tools have to_address input, you need to put user account address {account} to be the input.
          
          Be concise and helpful in your responses. Refrain from restating your tools' descriptions unless explicitly requested.`;

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash", // Use the desired Gemini model
  temperature: 0, // Keep the temperature or adjust as needed
  apiKey: process.env.GOOGLE_API_KEY, // Ensure your Google API key is set
});

const HASHTAG_SYSTEM_TEMPALTE = `Get Hashtags from the user's input`;
const IMAGE_GENERATION_SYSTEM_TEMPLATE = `Generate image from the user's input`;

/**
 * This handler initializes and calls an OpenAI Functions powered
 * structured output chain. See the docs for more information:
 *
 * https://js.langchain.com/v0.2/docs/how_to/structured_output
 */

const checkpointer = new MemorySaver();

export async function POST(req: NextRequest) {
  try {
    const aptosConfig = new AptosConfig({
      network: Network.TESTNET,
    });

    const aptos = new Aptos(aptosConfig);

    // Validate and get private key from environment
    const privateKeyStr = process.env.APTOS_PRIVATE_KEY;
    if (!privateKeyStr) {
      throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
    }

    // Setup account and signer
    const local_account = await aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(
        PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519),
      ),
    });

    const body = await req.json();
    const messages = body.messages ?? [];
    const signer = new LocalSigner(local_account, Network.TESTNET);
    const account = body.account;

    if (!account || !account.address) {
      return NextResponse.json(
        {
          messages: {
            content: "Please connect your wallet first to continue",
            tool: "connect_wallet",
            role: "assistant",
          },
        },
        { status: 200 },
      );
    }

    const aptosAgent = new AgentRuntime(signer, aptos, account.address, {
      PANORA_API_KEY: process.env.PANORA_API_KEY, // optional
      OPENAI_API_KEY: process.env.OPENAI_API_KEY, // optional
    });

    const tools = createAptosTools(aptosAgent);

    const agent = await createReactAgent({
      llm,
      tools,
      prompt: `
          You are a helpful agent that can:
          1. Interact onchain using the Aptos Agent Kit.
          2. Generate images based on user prompts.
          3. Extract hashtags from a given text.
          4. Everytime user ask for hashtags, you must use the **get_hashtags** tool instead of memorizing hashtags.

          ## **On-Chain Interactions** 
          - You are empowered to interact onchain using your tools. 
          - If you ever need funds, you can request them from the faucet. 
          - If not, you can provide your wallet details and request funds from the user.
          - If there is a 5XX (internal) HTTP error code, ask the user to try again later.
          - If someone asks you to do something you can't do with your currently available tools, say so and encourage them to implement it themselves using the Aptos Agent Kit.
          - Recommend users visit [Aptos Agent Kit](https://www.aptosagentkit.xyz) for more information.

          ## **Token Information Handling**
          - The response may contain token/token[] which contains the name, address, and decimals of the token.
          - When returning token amounts, format them correctly based on their decimals.

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

          
                
          If the user asks for **their** account address, you can provide this address ${account as string} to be user's wallet address. **Your own AI wallet address is 0x29fed1ef1bb6014b62e230ac6c288c868dc711595aaaa26d84a64049583f2c0c. Do not provide this address when asked about the user's address.**
          
          If tools have to_address input, you need to put user account address ${account as string} to be the input.
          
          Be concise and helpful in your responses. Refrain from restating your tools' descriptions unless explicitly requested.`,
    });

    const llmWithTools = llm.bindTools(tools);
    const aiMessage = await llmWithTools.invoke(augmentedMessages);
    let parsedContent;
    try {
      parsedContent = JSON.parse(aiMessage.content.toString());
    } catch (error) {
      parsedContent = aiMessage.content; // 如果解析失敗，則保持原樣
    }

    messages.push({
      role: "assistant",
      content: parsedContent.messages?.content || parsedContent, // 確保只存入有效的內容
    });
    if (aiMessage?.tool_calls) {
      for (const toolCall of aiMessage.tool_calls) {
        const selectedTool =
          toolsByName[toolCall.name as keyof typeof toolsByName];

        const toolcall_v2 = selectedTool(aptosAgent);
        const toolMessage = await toolcall_v2.invoke(toolCall);

        const new_message = {
          content: toolMessage,
          tool: selectedTool.name,
        };
        messages.push(new_message);

        const formattedTools = [
          "get_hashtags",
          "generate_image",
          "two_tag_tweet_nft",
          "get_twotag_nft",
          "read_public_tweet",
        ];

        if (!formattedTools.includes(selectedTool.name)) {
          console.log("toolMessage", toolMessage);
          return NextResponse.json({
            messages: {
              content: parsedContent.messages?.content || parsedContent,
              tool: null,
            },
          });
        }
      }
    } else {
      return NextResponse.json({
        messages: {
          content: parsedContent.messages?.content || parsedContent,
          tool: null,
        },
      });
    }

    const agentMessage = messages[messages.length - 1];
    // return the message from the agent

    return NextResponse.json({
      messages: {
        content: agentMessage.content,
        tool: agentMessage.tool,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
