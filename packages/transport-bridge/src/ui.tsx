import React from 'react';
import { renderToString } from 'react-dom/server';

import { Status, StatusProps } from './ui/status';

export const ui = {
    Status: (props: StatusProps) => renderToString(<Status {...props} />),
};
