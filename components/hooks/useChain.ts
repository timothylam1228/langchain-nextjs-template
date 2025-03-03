import { useState, useRef, useEffect } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { TransactionCode } from "@/enum/TransactionCode";

// Types
interface UseChainOptions {
  nodeUrl?: string;
  network?: Network;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  error?: string;
  code?: TransactionCode;
}

export interface TransactionState {
  isSubmitting: boolean;
  transactionHash: string | null;
  deployMessage: string;
  error: string | null;
  code: TransactionCode;
}

/**
 * Custom hook for interacting with the Aptos blockchain
 * @param options Configuration options for the chain connection
 * @returns Methods and state for chain interaction
 */
export const useChain = (options: UseChainOptions = {}) => {
  // Default to TESTNET if not specified
  const network = options.nodeUrl
    ? undefined
    : options.network || Network.TESTNET;

  // Initialize the Aptos client

  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);
  // Transaction state
  const [transactionStates, setTransactionStates] = useState<
    Record<string, TransactionState>
  >({});

  // Use ref to prevent race conditions with multiple transactions
  const pendingTransactionRef = useRef(false);

  // Access wallet functionality
  const { signAndSubmitTransaction } = useWallet();

  const getTransactionState = (messageId: string): TransactionState => {
    return (
      transactionStates[messageId] || {
        isSubmitting: false,
        transactionHash: null,
        deployMessage: "",
        error: null,
        code: TransactionCode.TRANSACTION_PENDING,
      }
    );
  };

  /**
   * Submits a transaction to the blockchain
   * @param transaction The transaction data to submit
   * @returns Result of the transaction submission
   */
  const submitToChain = async (
    transaction: InputTransactionData,
    messageId: string,
  ): Promise<TransactionResult> => {
    if (transactionStates[messageId]?.isSubmitting) {
      return {
        hash: "",
        success: false,
        error: "Transaction already in progress for this message",
        code: TransactionCode.TRANSACTION_PENDING,
      };
    }

    // Initialize state for the new transaction
    setTransactionStates((prev) => ({
      ...prev,
      [messageId]: {
        isSubmitting: true,
        transactionHash: null,
        deployMessage: "",
        error: null,
        code: TransactionCode.TRANSACTION_PENDING,
      },
    }));

    try {
      const response = await signAndSubmitTransaction(transaction);
      const hash = response.hash;

      if (!hash) {
        throw new Error("Transaction rejected by user");
      }

      setTransactionStates((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          transactionHash: hash,
        },
      }));

      const result = await aptos.waitForTransaction({ transactionHash: hash });

      setTransactionStates((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          deployMessage: `Transaction successful: ${result.hash}`,
          isSubmitting: false,
          code: TransactionCode.TRANSACTION_SUCCESS,
        },
      }));

      return {
        hash: result.hash,
        success: true,
        code: TransactionCode.TRANSACTION_SUCCESS,
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";

      setTransactionStates((prev) => ({
        ...prev,
        [messageId]: {
          ...prev[messageId],
          isSubmitting: false,
          error: errorMessage,
          deployMessage: `Transaction failed: ${errorMessage}`,
          code: TransactionCode.TRANSACTION_FAILED,
        },
      }));

      return {
        hash: "",
        success: false,
        error: errorMessage,
        code: TransactionCode.TRANSACTION_FAILED,
      };
    }
  };

  // Clean up function to reset the pending transaction flag when component unmounts
  useEffect(() => {
    return () => {
      pendingTransactionRef.current = false;
    };
  }, []);

  // Extract state properties for return

  return {
    submitToChain,
    getTransactionState,
    aptos,
  };
};
