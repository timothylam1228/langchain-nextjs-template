import type { Message } from "ai/react";
import type { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { type FC, useEffect, useRef } from "react";
import HashtagsView from "@/components/HashtagsView";
import Image from "next/image";
import Wallet from "@/components/wallet/client_wallet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TransactionCode } from "@/enum/TransactionCode";
import { TransactionState } from "@/components/hooks/useChain";
import { Tweet } from "@/langchain_temp/function/twotag/get_twotag_nft";

export const shareToTwitter = (tweet: string, url?: string) => {
  const tweetText = encodeURIComponent(tweet.replace(/&|@/g, ""));
  const tweetUrl = `https://x.com/intent/tweet?text=${tweetText}${
    url ? `&url=${encodeURIComponent(url)}` : ""
  }`;

  window.open(tweetUrl, "_blank");
};

const copyImageToClipboard = async (image: string) => {
  try {
    // Use our internal API route to fetch the image
    const response = await fetch(
      `/api/fetch-image?url=${encodeURIComponent(image)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const blob = await response.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    toast.success("Image copied to clipboard!");
  } catch (error) {
    console.error("Copy error:", error);
    toast.error("Failed to copy image!");
  }
};

const copyTweetToClipboard = async (tweet: string, image?: string) => {
  try {
    if (image) {
      const response = await fetch(
        `/api/fetch-image?url=${encodeURIComponent(image)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([tweet], { type: "text/plain" }),
          [blob.type]: blob,
        }),
      ]);
      toast.success("Tweet and image copied to clipboard!");
    } else {
      await navigator.clipboard.writeText(tweet);
      toast.success("Tweet copied to clipboard!");
    }
  } catch (error) {
    console.error("Copy error:", error);
    toast.error("Failed to copy tweet!");
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied nft id to clipboard!");
  } catch (error) {
    console.error("Copy error:", error);
    toast.error("Failed to copy!");
  }
};

interface ContentParserProps {
  message: Message;
  transactionState?: TransactionState;
  aptos: any;
  setDeployMessage: (message: string | undefined) => void;
}

export const ContentParser: React.FC<ContentParserProps> = ({
  message,
  transactionState,
}) => {
  const hasSubmittedRef = useRef(false);

  if (!message?.content) return null;
  if (message.role !== "assistant") return <div>{message.content}</div>;

  try {
    const content = JSON.parse(message.content);
    const tool = content.messages?.tool;
    console.log("content in parser", content.messages);

    if (content.messages.content.inputdata) {
      const inputData = content.messages.content.inputdata as InputTransactionData;
      
      if (!transactionState) {
        return <div>Transaction state not found</div>;
      }

      const { transactionHash, code } = transactionState;

      if (code === TransactionCode.USER_REJECTED) {
        return <div>Transaction rejected by user</div>;
      }

      if (code === TransactionCode.TRANSACTION_ALREADY_IN_PROGRESS) {
        return <div>Transaction already in progress</div>;
      }

      if (code === TransactionCode.TRANSACTION_FAILED) {
        return <div>Transaction failed</div>;
      }

      if (code === TransactionCode.TRANSACTION_SUCCESS) {
        return (
          <div>
            Transaction successful
            <div>transactionHash: {transactionHash}</div>
          </div>
        );
      }

      if (code === TransactionCode.TRANSACTION_PENDING) {
        return <div>Transaction pending</div>;
      }
    }
    switch (tool) {
      case "get_hashtags":
        return <HashtagsView hashtags={content.messages.content} />;

      case "generate_image":
        return (
          <div className="relative w-full h-full min-w-[250px] min-h-[250px] sm:min-w-[350px] sm:min-h-[350px] md:min-w-[450px] md:min-h-[450px]">
            <Image
              src={content.messages.content}
              alt="Generated Image"
              sizes="(max-width: 640px) 250px, (max-width: 768px) 350px, 450px"
              className="object-contain rounded-lg"
              width={450}
              height={450}
              priority
            />

            <Button
              className="mt-4"
              onClick={() => copyImageToClipboard(content.messages.content)}
            >
              Copy Image
            </Button>
          </div>
        );

      case "get_twotag_nft":
        const formattedData: Tweet[] = content.messages.content;
        return (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formattedData.length > 0 ? (
                formattedData.map((nft: Tweet) => (
                  <div
                    key={nft.token_id}
                    onClick={() => copyToClipboard(nft.token_id)}
                    className="border border-gray-300 rounded-lg p-2"
                  >
                    {nft.token_uri ? (
                      <div className="relative min-h-40 w-full flex ">
                        {/* Ensure token_uri is a valid URL */}
                        <Image
                          src={
                            nft.token_uri.startsWith("http")
                              ? nft.token_uri
                              : "/placeholder.jpg"
                          }
                          alt={nft.token_name || "NFT Image"}
                          width={300}
                          height={300}
                          className="rounded-lg mb-2 object-cover"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500">Image not available</p>
                    )}
                    <p className="line-clamp-2 text-sm">{nft.text}</p>
                    <p className="truncate line-clamp-2 text-blue-500">
                      {nft.tag.map((tag) => `#${tag}`).join(" ")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(nft.deploy_Date * 1000).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p>No NFTs found</p>
              )}
            </div>
          </div>
        );

      case "two_tag_tweet_nft":
        return (
          <div>
            <Image
              src={content.messages.content.image}
              alt="Generated Image"
              width={200}
              height={200}
            />
            <p>{content.messages.content.tweet}</p>
            <p>{content.messages.content.data}</p>
            <div className="flex flex-row gap-4">
              <Button
                onClick={() =>
                  shareToTwitter(
                    content.messages.content.tweet,
                    content.messages.content.image,
                  )
                }
              >
                Share to Twitter
              </Button>
              <Button
                onClick={() =>
                  copyImageToClipboard(content.messages.content.image)
                }
              >
                Copy Image
              </Button>
              <Button
                onClick={() =>
                  copyTweetToClipboard(
                    content.messages.content.tweet,
                    content.messages.content.image,
                  )
                }
              >
                Copy Tweet
              </Button>
            </div>
          </div>
        );

      case "connect_wallet":
        return (
          <div>
            <p>Please connect your wallet to continue</p>
            <Wallet />
          </div>
        );

      default:
        try {
          const jsonContent = JSON.parse(content.messages.content);
          return <div>{jsonContent.content}</div>;
        } catch (error) {
          // Don't try to parse JSON again if it failed the first time
          return <div>{content.messages.content}</div>;
        }
    }
  } catch (error) {
    console.error("Error parsing message content:", error);
    return <div>{message.content}</div>;
  }
};
