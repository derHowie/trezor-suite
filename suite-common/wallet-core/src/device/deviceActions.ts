import { createAction } from '@reduxjs/toolkit';

import { Device, DEVICE } from '@trezor/connect';
import { ButtonRequest, TrezorDevice } from '@suite-common/suite-types';

export const MODULE_PREFIX = '@suite/device';

const connectDevice = createAction(DEVICE.CONNECT, (payload: Device) => ({ payload }));

const connectUnacquiredDevice = createAction(DEVICE.CONNECT_UNACQUIRED, (payload: Device) => ({
    payload,
}));

const deviceChanged = createAction(DEVICE.CHANGED, (payload: Device | TrezorDevice) => ({
    payload,
}));

const deviceDisconnect = createAction(DEVICE.DISCONNECT, (payload: Device) => ({ payload }));

const updatePassphraseMode = createAction(
    `${MODULE_PREFIX}/updatePassphraseMode`,
    (payload: { device: TrezorDevice; hidden: boolean; alwaysOnDevice?: boolean }) => ({ payload }),
);

const authFailed = createAction(`${MODULE_PREFIX}/authFailed`, (payload: TrezorDevice) => ({
    payload,
}));

const receiveAuthConfirm = createAction(
    `${MODULE_PREFIX}/receiveAuthConfirm`,
    (payload: { device: TrezorDevice; success: boolean }) => ({ payload }),
);

const createDeviceInstance = createAction(
    `${MODULE_PREFIX}/createDeviceInstance`,
    (payload: TrezorDevice) => ({ payload }),
);

const rememberDevice = createAction(
    `${MODULE_PREFIX}/rememberDevice`,
    (payload: { device: TrezorDevice; remember: boolean; forceRemember: undefined | true }) => ({
        payload,
    }),
);

const forgetDevice = createAction(`${MODULE_PREFIX}/forgetDevice`, (payload: TrezorDevice) => ({
    payload,
}));

const authDevice = createAction(
    `${MODULE_PREFIX}/authDevice`,
    (payload: { device: TrezorDevice; state: string }) => ({ payload }),
);

const addButtonRequest = createAction(
    `${MODULE_PREFIX}/addButtonRequest`,
    (payload: { device?: TrezorDevice; buttonRequest: ButtonRequest }) => ({ payload }),
);

const requestDeviceReconnect = createAction(`${MODULE_PREFIX}/requestDeviceReconnect`);

const selectDevice = createAction(`${MODULE_PREFIX}/selectDevice`, (payload?: TrezorDevice) => ({
    payload,
}));

const updateSelectedDevice = createAction(
    `${MODULE_PREFIX}/updateSelectedDevice`,
    (payload?: TrezorDevice) => ({ payload }),
);

// Remove button requests for specific device by button request code or all button requests if no code is provided.
export const removeButtonRequests = createAction(
    `${MODULE_PREFIX}/removeButtonRequests`,
    (payload: { device?: TrezorDevice; buttonRequestCode?: ButtonRequest['code'] }) => ({
        payload,
    }),
);

export const forgetAndDisconnectDevice = createAction(
    `${MODULE_PREFIX}/forgetAndDisconnectDevice`,
    (payload: TrezorDevice) => ({
        payload,
    }),
);

export const deviceActions = {
    connectDevice,
    connectUnacquiredDevice,
    deviceChanged,
    deviceDisconnect,
    updatePassphraseMode,
    authFailed,
    receiveAuthConfirm,
    createDeviceInstance,
    rememberDevice,
    forgetDevice,
    authDevice,
    addButtonRequest,
    requestDeviceReconnect,
    selectDevice,
    updateSelectedDevice,
    removeButtonRequests,
    forgetAndDisconnectDevice,
};
