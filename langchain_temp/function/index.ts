import type { AgentRuntime } from "../agent";
import { AptosAccountAddressTool } from "./account";
import { AmnisStakeTool, AmnisWithdrawStakeTool } from "./amnis";
import {
  AptosBalanceTool,
  AptosBurnTokenTool,
  AptosCreateTokenTool,
  AptosGetTokenDetailTool,
  AptosGetTokenPriceTool,
  AptosMintTokenTool,
  AptosTransactionTool,
  AptosTransferTokenTool,
} from "./aptos";
import {
  AriesBorrowTool,
  AriesCreateProfileTool,
  AriesLendTool,
  AriesRepayTool,
  AriesWithdrawTool,
} from "./aries";
import {
  JouleBorrowTokenTool,
  JouleGetPoolDetails,
  JouleGetUserAllPositions,
  JouleGetUserPosition,
  JouleLendTokenTool,
  JouleRepayTokenTool,
  JouleWithdrawTokenTool,
} from "./joule";
import {
  LiquidSwapAddLiquidityTool,
  LiquidSwapCreatePoolTool,
  LiquidSwapRemoveLiquidityTool,
  LiquidSwapSwapTool,
} from "./liquidswap";

import type { ToolsNameList } from "../types";
import {
  EchelonBorrowTokenTool,
  EchelonLendTokenTool,
  EchelonRepayTokenTool,
  EchelonWithdrawTokenTool,
} from "./echelon";
import { EchoStakeTokenTool, EchoUnstakeTokenTool } from "./echo";
// import { OpenAICreateImageTool } from "./openai";
import { PanoraSwapTool } from "./panora";
import {
  ThalaAddLiquidityTool,
  ThalaMintMODTool,
  ThalaRedeemMODTool,
  ThalaRemoveLiquidityTool,
  ThalaStakeTokenTool,
  ThalaUnstakeTokenTool,
} from "./thala";
import { GetTwotagNFT } from "./twotag/get_twotag_nft";
import { TweetNFTTool } from "./twotag/two_tag_tweet_nft";
import { Read_public_tweet } from "./twotag/read_public_tweet";
import { GetHashtags } from "./twotag/get_hashtags";
import { GenerateImage } from "./twotag/generate_image";

export const createAptosTools = (
  agent: AgentRuntime,
  config: { filter?: ToolsNameList[]; account?: string } = {},
) => {
  const tools = [
    // Aptos tools
    new AptosBalanceTool(agent),
    new AptosAccountAddressTool(agent),
    new AptosTransferTokenTool(agent),
    // new AptosBurnNFTTool(agent),
    new AptosBurnTokenTool(agent),
    // new AptosTransferNFTTool(agent),
    new AptosTransactionTool(agent),
    new AptosGetTokenDetailTool(agent),
    new AptosMintTokenTool(agent),
    new AptosCreateTokenTool(agent),
    new AptosGetTokenPriceTool(agent),
    // Amnis tools
    new AmnisStakeTool(agent),
    new AmnisWithdrawStakeTool(agent),
    // Joule tools
    new JouleLendTokenTool(agent),
    new JouleWithdrawTokenTool(agent),
    new JouleBorrowTokenTool(agent),
    new JouleRepayTokenTool(agent),
    new JouleGetPoolDetails(agent),
    new JouleGetUserPosition(agent),
    new JouleGetUserAllPositions(agent),
    // LiquidSwap tools
    new LiquidSwapCreatePoolTool(agent),
    new LiquidSwapAddLiquidityTool(agent),
    new LiquidSwapRemoveLiquidityTool(agent),
    new LiquidSwapSwapTool(agent),
    // Aries tools
    new AriesCreateProfileTool(agent),
    new AriesWithdrawTool(agent),
    new AriesBorrowTool(agent),
    new AriesLendTool(agent),
    new AriesRepayTool(agent),
    // Thala tools
    new ThalaAddLiquidityTool(agent),
    new ThalaRemoveLiquidityTool(agent),
    new ThalaMintMODTool(agent),
    new ThalaRedeemMODTool(agent),
    new ThalaUnstakeTokenTool(agent),
    new ThalaStakeTokenTool(agent),
    // Panora tools
    new PanoraSwapTool(agent),
    // OpenAI tools
    // new OpenAICreateImageTool(agent),
    // Echo tools
    new EchoStakeTokenTool(agent),
    new EchoUnstakeTokenTool(agent),
    // Echelon tools
    new EchelonLendTokenTool(agent),
    new EchelonWithdrawTokenTool(agent),
    new EchelonRepayTokenTool(agent),
    new EchelonBorrowTokenTool(agent),
    // Twotag tools
    new TweetNFTTool(agent),
    new Read_public_tweet(agent),
    new GetTwotagNFT(agent),
    new GetHashtags(agent),
    new GenerateImage(agent),
  ];

  return config.filter
    ? tools.filter((tool) =>
        config?.filter?.includes(tool.name as ToolsNameList),
      )
    : tools;
};

export * from "./account";
export * from "./amnis";
export * from "./aptos";
export * from "./joule";
export * from "./aries";
export * from "./echelon";
export * from "./echo";
export * from "./liquidswap";
export * from "./panora";
// export * from "./openai";
export * from "./thala";
export * from "./twotag";

export const toolsByName = {
  get_hashtags: (agent: AgentRuntime) => new GetHashtags(agent),
  generate_image: (agent: AgentRuntime) => new GenerateImage(agent),
  get_twotag_nft: (agent: AgentRuntime) => new GetTwotagNFT(agent),
  read_public_tweet: (agent: AgentRuntime) => new Read_public_tweet(agent),
  two_tag_tweet_nft: (agent: AgentRuntime) => new TweetNFTTool(agent),

  // Aptos tools
  aptos_balance: (agent: AgentRuntime) => new AptosBalanceTool(agent),
  aptos_get_wallet_address: (agent: AgentRuntime) =>
    new AptosAccountAddressTool(agent),
  aptos_transfer_token: (agent: AgentRuntime) =>
    new AptosTransferTokenTool(agent),
  aptos_burn_token: (agent: AgentRuntime) => new AptosBurnTokenTool(agent),
  aptos_transaction: (agent: AgentRuntime) => new AptosTransactionTool(agent),
  aptos_get_token_detail: (agent: AgentRuntime) =>
    new AptosGetTokenDetailTool(agent),
  aptos_mint_token: (agent: AgentRuntime) => new AptosMintTokenTool(agent),
  aptos_create_token: (agent: AgentRuntime) => new AptosCreateTokenTool(agent),
  aptos_token_price: (agent: AgentRuntime) => new AptosGetTokenPriceTool(agent),

  // Amnis tools
  amnis_stake: (agent: AgentRuntime) => new AmnisStakeTool(agent),
  amnis_withdraw_stake: (agent: AgentRuntime) =>
    new AmnisWithdrawStakeTool(agent),

  // Joule tools
  joule_lend_token: (agent: AgentRuntime) => new JouleLendTokenTool(agent),
  joule_withdraw_token: (agent: AgentRuntime) =>
    new JouleWithdrawTokenTool(agent),
  joule_borrow_token: (agent: AgentRuntime) => new JouleBorrowTokenTool(agent),
  joule_repay_token: (agent: AgentRuntime) => new JouleRepayTokenTool(agent),
  joule_get_pool_details: (agent: AgentRuntime) =>
    new JouleGetPoolDetails(agent),
  joule_get_user_position: (agent: AgentRuntime) =>
    new JouleGetUserPosition(agent),
  joule_get_user_all_positions: (agent: AgentRuntime) =>
    new JouleGetUserAllPositions(agent),

  // LiquidSwap tools
  liquidswap_create_pool: (agent: AgentRuntime) =>
    new LiquidSwapCreatePoolTool(agent),
  liquidswap_add_liquidity: (agent: AgentRuntime) =>
    new LiquidSwapAddLiquidityTool(agent),
  liquidswap_remove_liquidity: (agent: AgentRuntime) =>
    new LiquidSwapRemoveLiquidityTool(agent),
  liquidswap_swap: (agent: AgentRuntime) => new LiquidSwapSwapTool(agent),

  // Panora tools
  panora_swap: (agent: AgentRuntime) => new PanoraSwapTool(agent),

  // OpenAI tools
  // openai_generate_image: (agent: AgentRuntime) =>
  //   new OpenAICreateImageTool(agent),

  // Echo tools
  echo_stake_token: (agent: AgentRuntime) => new EchoStakeTokenTool(agent),
  echo_unstake_token: (agent: AgentRuntime) => new EchoUnstakeTokenTool(agent),

  // Echelon tools
  echelon_lend_token: (agent: AgentRuntime) => new EchelonLendTokenTool(agent),
  echelon_withdraw_token: (agent: AgentRuntime) =>
    new EchelonWithdrawTokenTool(agent),
  echelon_borrow_token: (agent: AgentRuntime) =>
    new EchelonBorrowTokenTool(agent),
  echelon_repay_token: (agent: AgentRuntime) =>
    new EchelonRepayTokenTool(agent),

  // Thala tools
  thala_add_liquidity: (agent: AgentRuntime) =>
    new ThalaAddLiquidityTool(agent),
  thala_remove_liquidity: (agent: AgentRuntime) =>
    new ThalaRemoveLiquidityTool(agent),
  thala_mint_mod: (agent: AgentRuntime) => new ThalaMintMODTool(agent),
  thala_redeem_mod: (agent: AgentRuntime) => new ThalaRedeemMODTool(agent),
  thala_stake_token: (agent: AgentRuntime) => new ThalaStakeTokenTool(agent),
  thala_unstake_token: (agent: AgentRuntime) =>
    new ThalaUnstakeTokenTool(agent),

  // Aries tools
  aries_create_profile: (agent: AgentRuntime) =>
    new AriesCreateProfileTool(agent),
  aries_withdraw: (agent: AgentRuntime) => new AriesWithdrawTool(agent),
  aries_borrow: (agent: AgentRuntime) => new AriesBorrowTool(agent),
  aries_lend: (agent: AgentRuntime) => new AriesLendTool(agent),
  aries_repay: (agent: AgentRuntime) => new AriesRepayTool(agent),
};
