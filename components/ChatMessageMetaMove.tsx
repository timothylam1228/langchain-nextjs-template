import { cn } from "@/utils/cn";
import type { Message } from "ai/react";
import { useEffect, useState } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { useChain } from "./hooks/useChain";
import { ContentParser } from "@/utils/ContentParser";

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(aptosConfig);

export function ChatMessageMetaMove(props: {
  message: Message;
  aiEmoji?: string;
  sources: any[];
}) {
  const { message } = props;
  const [deployMessage, setDeployMessage] = useState<string | undefined>();
  const { submitToChain, getTransactionState } = useChain();
  const [pendingTransaction, setPendingTransaction] =
    useState<InputTransactionData | null>(null);

  // Store last processed message ID to avoid duplicate processing
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<
    string | null
  >(null);

  /**
   * Detect if message requires a transaction (aptos_transfer_token)
   */
  useEffect(() => {
    if (
      getTransactionState(message.id).isSubmitting ||
      message.id === lastProcessedMessageId
    )
      return;

    if (message.role === "assistant" && message.content) {
      try {
        const content = JSON.parse(message.content);

        if (content.messages?.tool === "aptos_transfer_token") {
          const txData = content.messages.content.inputdata;
          setPendingTransaction(txData);
          setLastProcessedMessageId(message.id);

          // Update message content to indicate processing
          const updatedContent = JSON.stringify({
            ...content,
            messages: {
              ...content.messages,
              content: {
                ...content.messages.content,
                status: "processing",
              },
            },
          });

          props.message.content = updatedContent;
        }
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    }
  }, [
    message,
    getTransactionState(message.id).isSubmitting,
    lastProcessedMessageId,
  ]);

  /**
   * Process transaction when detected
   */
  useEffect(() => {
    if (!pendingTransaction || getTransactionState(message.id).isSubmitting)
      return;

    const processTransaction = async () => {
      try {
        console.log(`Processing transaction for message ID: ${message.id}`);

        const result = await submitToChain(pendingTransaction, message.id);
        console.log("Transaction result:", result);

        const content = JSON.parse(message.content);

        if (result.success) {
          // Update message with success status and transaction hash
          message.content = JSON.stringify({
            ...content,
            messages: {
              ...content.messages,
              content: {
                ...content.messages.content,
                status: "success",
                hash: result.hash,
              },
            },
          });
        } else {
          // Update message with failure status
          message.content = JSON.stringify({
            ...content,
            messages: {
              ...content.messages,
              content: {
                ...content.messages.content,
                status: "error",
                error: result.error || "Unknown error occurred",
              },
            },
          });
        }
      } catch (err) {
        console.error("Transaction submission error:", err);

        const content = JSON.parse(message.content);
        message.content = JSON.stringify({
          ...content,
          messages: {
            ...content.messages,
            content: {
              ...content.messages.content,
              status: "error",
              error:
                err instanceof Error ? err.message : "Unknown error occurred",
            },
          },
        });
      } finally {
        setPendingTransaction(null);
      }
    };

    processTransaction();
  }, [
    pendingTransaction,
    submitToChain,
    getTransactionState(message.id).isSubmitting,
  ]);

  return (
    <div
      className={cn(
        `rounded-[24px] max-w-[80%] mb-8 flex`,
        props.message.role === "user"
          ? "bg-secondary text-secondary-foreground px-4 py-2"
          : null,
        props.message.role === "user" ? "ml-auto" : "mr-auto",
      )}
    >
      {props.message.role !== "user" && (
        <div className="mr-4 border bg-secondary -mt-2 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
          {props.aiEmoji}
        </div>
      )}

      <div className="whitespace-pre-wrap flex flex-col w-full">
        {deployMessage ? (
          <div className="text-green-500">{deployMessage}</div>
        ) : (
          <ContentParser
            message={props.message}
            aptos={aptos}
            setDeployMessage={setDeployMessage}
            transactionState={getTransactionState(props.message.id)}
          />
        )}

        {props.sources && props.sources.length ? (
          <>
            <code className="mt-4 mr-auto bg-primary px-2 py-1 rounded">
              <h2>🔍 Sources:</h2>
            </code>
            <code className="mt-1 mr-2 bg-primary px-2 py-1 rounded text-xs">
              {props.sources?.map((source, i) => (
                <div className="mt-2" key={"source:" + i}>
                  {i + 1}. &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined ? (
                    <div>
                      <br />
                      Lines {source.metadata?.loc?.lines?.from} to{" "}
                      {source.metadata?.loc?.lines?.to}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))}
            </code>
          </>
        ) : null}
      </div>
    </div>
  );
}
