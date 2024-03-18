import React, { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

import { IntlProvider } from './ui/components/IntlProvider';

import { App } from './ui/App';
import { Status, StatusProps } from './ui/pages/Status';
import { defaultMessages } from './ui/translations/default';

global.React = React;

export type Params = {
    language: string;
};

const render = async (component: ReactNode, params: Params) => {
    const messages =
        params.language === 'en'
            ? defaultMessages
            : await import(`./ui/translations/${params.language}.ts`)
                  .then(value => value.messages)
                  .catch(_ => defaultMessages);

    const sheet = new ServerStyleSheet();
    try {
        const html = renderToString(
            <IntlProvider locale={params.language} messages={messages}>
                <StyleSheetManager sheet={sheet.instance}>
                    <App>{component}</App>
                </StyleSheetManager>
            </IntlProvider>,
        );
        const styleTags = sheet.getStyleTags();
        return html + styleTags;
    } catch (error) {
        // handle error
        console.error(error);
        return 'error';
    } finally {
        sheet.seal();
    }
};

export const ui = {
    Status: (props: StatusProps, params: Params) => render(<Status {...props}></Status>, params),
};
