// todo: get rid of react import
import React from 'react';

// todo: direct imports to avoid SyntaxError: Unexpected token '<' from svgs
import { H1, H2 } from '@trezor/components/src/components/typography/Heading/Heading';
import { Descriptor } from '@trezor/transport/src/types';
// import { TREZOR_USB_DESCRIPTORS } from '@trezor/transport/src/constants';

export type StatusProps = {
    version: string;
    logs: any[];
    descriptors: Descriptor[];
};

// 2 - T - bootloader - product 21440, vendor 4617
// 2 - T - normal     - product 21441, vendor 4617

// 2 - one - bl       - product 21440, vendor 4617
// 1 - one - normal   - product 21441, vendor 4617

const Descriptor = ({ descriptor }: { descriptor: Descriptor }) => {
    const modelName = (() => {
        switch (descriptor.type) {
            case 0:
                return 'Trezor One (HID)';
            case 1:
                return 'Trezor One (WebUSB)';
            case 2:
                return 'Trezor One (WebUSB Bootloader)';
            case 3:
                return 'Trezor model T/R';
            case 4:
                return 'Trezor model T/R Bootloader';
            case 5:
                return 'Emulator';
            default:
                return 'Unknown';
        }
    })();
    return (
        <div>
            <div>model: {modelName}</div>
            <div>path: {descriptor.path}</div>
            <div>session: {descriptor.session ? descriptor.session : 'none'}</div>
        </div>
    );
};

export const Status = ({ version, descriptors }: StatusProps) => {
    return (
        <div>
            <div>
                <H1>Trezor Bridge</H1>
                {version}
            </div>

            <div>
                Trezor Bridge is a small tool facilitating connection between Trezor devices and
                computer applications
            </div>

            <div>
                <H2>Connected devices</H2>
                <div> count: {descriptors.length}</div>
                {descriptors.map(descriptor => {
                    return <Descriptor key={descriptor.path} descriptor={descriptor} />;
                })}
            </div>
        </div>
    );
};
