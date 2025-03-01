import type { Message } from "ai/react";
import HashtagsView from "@/components/HashtagsView";
import Image from "next/image";
import Wallet from "@/components/wallet/client_wallet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

export const parseContentToJson = (message: Message) => {
  if (!message?.content) return;
  if (message.role !== "assistant") return message.content;

  try {
    const content = JSON.parse(message.content);
    const tool = content.messages?.tool;

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

      case "get_twotag_tweet":
        const formattedData = JSON.parse(content.messages.content);
        return (
          <div>
            <div className="flex flex-row gap-4 flex-wrap">
              {formattedData.nfts.length > 0 ? (
                formattedData.nfts.map((nft: any) => (
                  <div
                    key={nft.token_id}
                    className="border border-gray-300 rounded-lg p-2"
                  >
                    {nft.token_uri && (
                      <Image
                        src={nft.token_uri}
                        alt={nft.token_name}
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    )}
                    <p>{nft.token_name}</p>
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
    return message.content;
  }
};
