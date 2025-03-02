import type { AgentRuntime } from "../../agent";

/**
 * read public tweet from 2tag
 * @param agent MoveAgentKit instance
 * @param to user address
 * @returns Transaction signature
 *
 */

const operationName = "MyQuery";

interface NFTData {
  token_data_id: string;
  token_uri: string;
  token_name: string;
}
interface CollectionData {
  description: string;
  uri: string;
}
export interface FormattedNFTData {
  token_id: string;
  token_uri: string;
  token_name: string;
}
export async function get_twotag_nft(
  agent: AgentRuntime,
  to: string,
): Promise<FormattedNFTData[]> {
  const operations = `
      query MyQuery {
        current_token_ownerships_v2(
          where: {
            owner_address: { _eq: "${to}" }
            current_token_data: {
              collection_id: { _eq: "0x8e48ee91ad8e73200bc24e3a5c415a9b470cd3292480031857c42b24b5153bbd" }
            }
          }
      ) {
        current_token_data {
          token_data_id
          token_uri
          token_name
        }
      }
    }
    `;
  async function fetchGraphQL(
    operationsDoc: string,
    operationName: string,
    variables: Record<string, any>,
  ): Promise<any> {
    try {
      const response = await fetch(`${process.env.NODIT_END_POINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // 確保設定 Content-Type
        },
        body: JSON.stringify({
          query: operationsDoc,
          variables,
          operationName,
        }),
      });
      const result = await response.json();
      return result;
    } catch (e: unknown) {
      console.log(e);
    }
    return "";
  }
  try {
    const graphqlData = await fetchGraphQL(operations, "MyQuery", {});

    console.log("graphqlData", graphqlData);
    // const graphqlData = JSON.parse(Data)

    // Extract and format data
    const tokenOwnerships: { current_token_data: NFTData }[] =
      graphqlData.data.current_token_ownerships_v2;
    const collectionData: CollectionData[] =
      graphqlData.data.current_collections_v2;

    const formattedData: FormattedNFTData[] = tokenOwnerships.map(
      (ownership) => {
        return {
          token_id: ownership.current_token_data.token_data_id,
          token_uri: ownership.current_token_data.token_uri,
          token_name: ownership.current_token_data.token_name,
        };
      },
    );
    return formattedData;
  } catch (error: any) {
    return [];
  }
}
