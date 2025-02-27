import { ChatWindowMetaMove } from "@/components/ChatWindowMetaMove";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function AgentsPage() {
  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">🤖</li>
        <li>
          🎯
          <span className="ml-2">
            We are AI assistant for crypto-related tasks and blockchain interactions.
          </span>
        </li>
        <li className="hidden text-l md:block">
          🔗
          <span className="ml-2">
            Powered by the Aptos Agent Kit, enabling direct blockchain interactions and NFT operations.
          </span>
        </li>
        <li className="hidden text-l md:block">
          🎨
          <span className="ml-2">
            Generate AI images related to crypto themes with customizable styles.
          </span>
        </li>
        <li className="hidden text-l md:block">
          #️⃣
          <span className="ml-2">
            Create relevant hashtags for your crypto content using AI-powered suggestions.
          </span>
        </li>
        <li className="hidden text-l md:block">
          📱
          <span className="ml-2">
            Compose engaging crypto-focused tweets with AI assistance.
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            Try typing e.g. <code>Generate hashtags for Bitcoin NFTs</code> or <code>Create a tweet about DeFi</code> below!
          </span>
        </li>
      </ul>
    </GuideInfoBox>
  );
  return (
    <ChatWindowMetaMove
      endpoint="api/chat/metamove"
      emptyStateComponent={InfoCard}
      placeholder={`Ask me to generate hashtags, create images, or help with blockchain tasks!`}
      emoji="🤖"
    />
  );
}
