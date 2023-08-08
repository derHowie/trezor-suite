import type { Network } from '../networks';
import type { CoinSelectPaymentType } from './coinselect';

// UTXO == unspent transaction output = all I can spend
export interface ComposeInput {
    vout: number; // index of output IN THE TRANSACTION
    txid: string; // hash of the transaction
    amount: string; // how much money sent
    coinbase: boolean; // coinbase transaction = utxo from mining, cannot be spend before 100 blocks
    own: boolean; // is the ORIGIN me (the same account)
    confirmations: number; // might be spent immediately (own) or after 6 conf (not own) see ./coinselect/tryConfirmed
    required?: boolean; // must be included into transaction
}

// Output parameter of coinselect algorithm which is either:
//    - 'payment' - address and amount
//    - 'payment-noaddress' - just amount
//    - 'send-max' - address
//    - 'send-max-noaddress' - no other info
//    - 'opreturn' - dataHex
export interface ComposeOutputPayment {
    type: 'payment';
    address: string;
    amount: string;
}

export interface ComposeOutputPaymentNoAddress {
    type: 'payment-noaddress';
    amount: string;
}

export interface ComposeOutputSendMax {
    type: 'send-max'; // only one in TX request
    address: string;
    amount?: typeof undefined;
}

export interface ComposeOutputSendMaxNoAddress {
    type: 'send-max-noaddress';
    amount?: typeof undefined;
}

export interface ComposeOutputOpreturn {
    type: 'opreturn'; // it doesn't need to have address
    dataHex: string;
    amount?: typeof undefined;
    address?: typeof undefined;
}

export type ComposeFinalOutput =
    | ComposeOutputPayment
    | ComposeOutputSendMax
    | ComposeOutputOpreturn;

export type ComposeNotFinalOutput = ComposeOutputPaymentNoAddress | ComposeOutputSendMaxNoAddress;

export type ComposeOutput = ComposeFinalOutput | ComposeNotFinalOutput;

export interface ComposeRequest<Input extends ComposeInput> {
    txType?: CoinSelectPaymentType;
    utxos: Input[]; // all inputs
    outputs: ComposeOutput[]; // all output "requests"
    feeRate: string | number; // in sat/byte, virtual size
    longTermFeeRate?: string | number; // dust output feeRate multiplier in sat/byte, virtual size
    basePath: number[]; // for trezor inputs
    network: Network;
    changeId: number;
    changeAddress: string;
    dustThreshold: number; // explicit dust threshold, in satoshi
    baseFee?: number; // DOGE or RBF base fee
    floorBaseFee?: boolean; // DOGE floor base fee to the nearest integer
    dustOutputFee?: number; // DOGE fee for every output below dust limit
    skipUtxoSelection?: boolean; // use custom utxo selection, without algorithm
    skipPermutation?: boolean; // Do not sort inputs/outputs and preserve the given order. Handy for RBF.
}

// types for building the transaction in trezor.js
export type ComposedTxOutput =
    | {
          path: number[];
          amount: string;
          address?: typeof undefined;
          opReturnData?: typeof undefined;
      }
    | {
          address: string;
          amount: string;
          path?: typeof undefined;
          opReturnData?: typeof undefined;
      }
    | {
          opReturnData: Buffer;
          path?: typeof undefined;
          address?: typeof undefined;
          amount?: typeof undefined;
      };

export interface ComposedTransaction<Input extends ComposeInput> {
    inputs: Input[];
    outputs: { sorted: ComposedTxOutput[]; permutation: number[] }; // compose/Permutation<X>
}

// Output from coinselect algorithm
// 'nonfinal' - contains info about the outputs, but not Trezor tx
// 'final' - contains info about outputs + Trezor tx
// 'error' - some error, so far only NOT-ENOUGH-FUNDS and EMPTY strings

export interface ComposeResultError {
    type: 'error';
    error: string;
}

export interface ComposeResultNonFinal {
    type: 'nonfinal';
    max?: string;
    totalSpent: string; // all the outputs, no fee, no change
    fee: string;
    feePerByte: string;
    bytes: number;
}

export interface ComposeResultFinal<Input extends ComposeInput> {
    type: 'final';
    max?: string;
    totalSpent: string; // all the outputs, no fee, no change
    fee: string;
    feePerByte: string;
    bytes: number;
    transaction: ComposedTransaction<Input>;
}

export type ComposeResult<Input extends ComposeInput> =
    | ComposeResultError
    | ComposeResultNonFinal
    | ComposeResultFinal<Input>;
