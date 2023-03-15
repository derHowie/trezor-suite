import type { types } from '@fivebinaries/coin-selection';
import BigNumber from 'bignumber.js';

import {
    Account,
    Output,
    PrecomposedTransactionFinal,
    PrecomposedTransactionFinalCardano,
    PoolsResponse,
    StakePool,
} from '@suite-common/wallet-types';
import { Network } from '@suite-common/wallet-config';
import { CARDANO, CardanoCertificate, CardanoOutput, PROTO } from '@trezor/connect';
import { CARDANO_DEFAULT_TTL_OFFSET } from '@suite-common/wallet-constants';

import {
    amountToSatoshi,
    formatAmount,
    formatNetworkAmount,
    networkAmountToSatoshi,
} from './accountUtils';

const loadCardanoLib = async () => {
    const lib = await import(
        /* webpackChunkName: "@fivebinaries/coin-selection" */ '@fivebinaries/coin-selection'
    );
    return lib;
};

const getProtocolMagic = (accountSymbol: Account['symbol']) =>
    // TODO: use testnet magic from connect once this PR is merged https://github.com/trezor/connect/pull/1046
    accountSymbol === 'ada' ? CARDANO.PROTOCOL_MAGICS.mainnet : 1097911063;

const getNetworkId = (accountSymbol: Account['symbol']) =>
    accountSymbol === 'ada' ? CARDANO.NETWORK_IDS.mainnet : CARDANO.NETWORK_IDS.testnet;

const getDerivationType = (accountType: Network['accountType']) => {
    switch (accountType) {
        case 'normal':
            return 1;
        case 'legacy':
            return 2;
        case 'ledger':
            return 0;
        default:
            return 1;
    }
};

const getAddressType = (_accountType: Account['accountType']) => PROTO.CardanoAddressType.BASE;

const getStakingPath = (account: Account) => `m/1852'/1815'/${account.index}'/2/0`;

const getChangeAddressParameters = (account: Account) => {
    if (!account.addresses || account.networkType !== 'cardano') return;
    const stakingPath = getStakingPath(account);
    // Find first unused change address or fallback to the last address if all are used (should not happen)
    const changeAddress =
        account.addresses.change.find(a => !a.transfers) ||
        account.addresses.change[account.addresses.change.length - 1];

    return {
        address: changeAddress.address,
        addressParameters: {
            path: changeAddress.path,
            addressType: getAddressType(account.accountType),
            stakingPath,
        },
    };
};

const transformUserOutputs = (
    outputs: Output[],
    accountTokens: Account['tokens'],
    symbol: Account['symbol'],
    maxOutputIndex?: number,
): types.UserOutput[] =>
    outputs.map((output, i) => {
        const setMax = i === maxOutputIndex;
        const amount =
            output.amount === '' ? undefined : networkAmountToSatoshi(output.amount, symbol);
        const tokenDecimals = accountTokens?.find(t => t.address === output.token)?.decimals ?? 0;
        return {
            address: output.address === '' ? undefined : output.address,
            amount: output.token ? undefined : amount,
            assets: output.token
                ? [
                      {
                          unit: output.token,
                          quantity: output.amount
                              ? amountToSatoshi(output.amount, tokenDecimals)
                              : '0',
                      },
                  ]
                : [],
            setMax,
        };
    });

const getShortFingerprint = (fingerprint: string) => {
    const firstPart = fingerprint.substring(0, 10);
    const lastPart = fingerprint.substring(fingerprint.length - 10);
    return `${firstPart}…${lastPart}`;
};

const transformUtxos = (utxos: Account['utxo']): types.Utxo[] => {
    const result: types.Utxo[] = [];
    utxos?.forEach(utxo => {
        const foundItem = result.find(
            res => res.txHash === utxo.txid && res.outputIndex === utxo.vout,
        );

        if (utxo.cardanoSpecific) {
            if (!foundItem) {
                // path: utxo.path,
                result.push({
                    // path: utxo.path,
                    address: utxo.address,
                    txHash: utxo.txid,
                    outputIndex: utxo.vout,
                    amount: [{ quantity: utxo.amount, unit: utxo.cardanoSpecific.unit }],
                });
            } else {
                foundItem.amount.push({ quantity: utxo.amount, unit: utxo.cardanoSpecific.unit });
            }
        }
    });

    return result;
};

const prepareCertificates = (certs: CardanoCertificate[]) => {
    // convert @trezor/connect certificate format to cardano coin-selection lib format
    const convertedCerts: types.Certificate[] = [];
    certs.forEach(cert => {
        switch (cert.type) {
            case PROTO.CardanoCertificateType.STAKE_DELEGATION:
                convertedCerts.push({
                    type: cert.type,
                    pool: cert.pool!,
                });
                break;
            case PROTO.CardanoCertificateType.STAKE_REGISTRATION:
            case PROTO.CardanoCertificateType.STAKE_DEREGISTRATION:
                convertedCerts.push({
                    type: cert.type,
                });
                break;
            // no default
        }
    });
    return convertedCerts;
};

const parseAsset = (
    hex: string,
): {
    policyId: string;
    assetNameInHex: string;
} => {
    const policyIdSize = 56;
    const policyId = hex.slice(0, policyIdSize);
    const assetNameInHex = hex.slice(policyIdSize);
    return {
        policyId,
        assetNameInHex,
    };
};

const getDelegationCertificates = (
    stakingPath: string,
    poolHex: string | undefined,
    shouldRegister: boolean,
) => {
    const result: CardanoCertificate[] = [
        {
            type: PROTO.CardanoCertificateType.STAKE_DELEGATION,
            path: stakingPath,
            pool: poolHex,
        },
    ];

    if (shouldRegister) {
        result.unshift({
            type: PROTO.CardanoCertificateType.STAKE_REGISTRATION,
            path: stakingPath,
        });
    }

    return result;
};

const getTtl = (testnet: boolean) => {
    // Time-to-live (TTL) in cardano represents a slot, or deadline by which a transaction must be submitted.
    // Suite doesn't store information about current slot number.
    // In order to correctly calculate current slot (and TTL) we start from a point from which we know that
    // 1 slot = 1 second (which was not always the case)
    // https://cardano.stackexchange.com/questions/491/calculate-timestamp-from-slot/494#494
    const shelleySlot = testnet ? 6192449 : 4924800;
    const shelleyTimestamp = testnet ? 1672848449 : 1596491091;
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    const currentSlot = shelleySlot + currentTimestamp - shelleyTimestamp;
    return currentSlot + CARDANO_DEFAULT_TTL_OFFSET;
};

const composeTxPlan = async (
    descriptor: string,
    utxo: Account['utxo'],
    certificates: CardanoCertificate[],
    withdrawals: { amount: string; path: string; stakeAddress: string }[],
    changeAddress: {
        address: string;
        addressParameters: {
            path: string;
            addressType: PROTO.CardanoAddressType;
            stakingPath: string;
        };
    },
    ttl?: number,
) => {
    const { coinSelection } = await loadCardanoLib();

    const txPlan = coinSelection({
        utxos: transformUtxos(utxo),
        outputs: [],
        changeAddress: changeAddress.address,
        certificates: prepareCertificates(certificates),
        withdrawals,
        accountPubKey: descriptor,
        ttl,
    });

    return { txPlan, certificates, withdrawals, changeAddress };
};

const isPoolOverSaturated = (pool: StakePool, additionalStake?: string) =>
    new BigNumber(pool.live_stake)
        .plus(additionalStake ?? '0')
        .div(pool.saturation)
        .toNumber() > 0.8;

const getStakePoolForDelegation = (trezorPools: PoolsResponse, accountBalance: string) => {
    let pool = trezorPools.next;
    if (isPoolOverSaturated(pool, accountBalance)) {
        // eslint-disable-next-line prefer-destructuring
        pool = trezorPools.pools[0];
    }
    return pool;
};
// Type guard to differentiate between PrecomposedTransactionFinal and PrecomposedTransactionFinalCardano
const isCardanoTx = (
    account: Account,
    _tx: PrecomposedTransactionFinalCardano | PrecomposedTransactionFinal,
): _tx is PrecomposedTransactionFinalCardano => account.networkType === 'cardano';

const isCardanoExternalOutput = (
    output: CardanoOutput,
): output is Extract<CardanoOutput, 'address'> => 'address' in output;

const formatMaxOutputAmount = (
    maxAmount: string | undefined,
    maxOutput: types.UserOutput | undefined,
    account: Account,
) => {
    // Converts 'max' amount returned from coinselection in lovelaces (or token equivalent) to ADA (or token unit)
    if (!maxOutput || !maxAmount) return;
    if (maxOutput.assets.length === 0) {
        // output without asset, convert lovelaces to ADA
        return formatNetworkAmount(maxAmount, account.symbol);
    }

    // output with a token, format using token decimals
    const tokenDecimals =
        account.tokens?.find(t => t.address === maxOutput.assets[0].unit)?.decimals ?? 0;

    return formatAmount(maxAmount, tokenDecimals);
};

export const cardanoUtils = {
    formatMaxOutputAmount,
    isCardanoExternalOutput,
    isCardanoTx,
    getStakePoolForDelegation,
    isPoolOverSaturated,
    composeTxPlan,
    getTtl,
    loadCardanoLib,
    getProtocolMagic,
    parseAsset,
    getNetworkId,
    getDelegationCertificates,
    getDerivationType,
    getAddressType,
    prepareCertificates,
    transformUserOutputs,
    getShortFingerprint,
    transformUtxos,
    getStakingPath,
    getChangeAddressParameters,
};
