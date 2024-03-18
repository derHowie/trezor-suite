import { ReactNode } from 'react';
import styled, { ThemeProvider as SCThemeProvider } from 'styled-components';

import { intermediaryTheme } from '@trezor/components/src/config/colors';

import GlobalStyle from './styles/GlobalStyle';

type AppProps = {
    children: ReactNode;
};

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
`;

export const App = ({ children }: AppProps) => {
    // proper theming (for a SSR app) would require using proper media queries as described in https://www.jonathan-harrell.com/blog/system-based-theming-with-styled-components/#supporting-disabled-javascript-with-css-variables
    const themeVariant: 'light' | 'dark' = 'light';

    return (
        <html>
            <head>
                {/* this cant be translated, renders as <span>Trezor Bridge</span> */}
                <title>Trezor Bridge</title>
                <meta charSet="utf-8" />
                <link
                    rel="icon"
                    href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAAQQAAAEECAYAAADOCEoKAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAtvSURBVHgB7d29chvXGYDhDz+ayVBFYP7MpAt9Baa6dIK7dFKuQPQVSOrSiezShezSkbwCsU3FVZdO9BWIqUEoTMOZDEEg35F3P9O2CGCB3T0/+z4zGMA2JYMg9uXuOYuzIgAAAAAAAAAAAAAAAAAAAHXpCJI1UL1eb9jtdgez2ew7vQ06nc6uu7n/Pp1O3T8Pfv3n9N9d6dfe6MPidqVf+2/9ey4nk8nljRIkiSAkwm38/X5/Tx8+19uebtDDr23sVXCx0L/7Uh9+0Ft2fX2dCZJAECKmDdjV39ov9fZCN9K9ugKwpEyfw9n9/X2mOxBXgigRhMjkewKv9eEwv4XoUuNwTBziQxAisb29PdS7dxJuBB5z7vYcxuPxuSB4BCFgbm9ADwf29VDgdTEQGCuNwpXeHWoYTgXBIggBKg4LdCN643lcoHKEIWwEITBbW1v7evcu9j2CRQhDmAhCICIeI1iLC4MOPn7P4GMYCIJn+eGBC8EbabejyWRyyElPfhEEj9xegf6GPEn98GBZbm9BX4sfONHJn57AC43B3/XuH6kNGq4jfy32NzY25Pb29oOgcewhNMydXaiHCO/14Z7gUYwt+NEVNMYdIvR6vQshBgu5wyj3Wu3s7PBaNYggNGRzc9OdbnzBeMHy3GulewofNaRtH3BtDGMIDdA3tDuv4G+CVf2ZcYVmEISauRjo3YFgXUOiUD+CUCNiUDmiUDOCUBNiUBuiUCOCUANiUDuiUBOCUDE3m8AAYiNcFP6rUfiXoDKcmFShwWCw1+/3Pwqa9D2nOleH8xAq4s5A7PV67wVNe+9ee0ElCEJF3Fl1nHTkxSA/FRwVYAyhAvmJRy8FvvxBxxMGOp7wT8FaGENYU76wyYUgBIwnrIkgrCG/MtJHDhXCkH9C8hmLrKyOMYQ1uJWOiEE43M8iX30KK2IPYUX5ugafBCHi0GFFfcFKUhjZdtdo7Ha7v9i9fuwCsJFxewmZoDT2EFbglkrXjeZEIlFcnFXvf9R/zPQ4212o9WbesbY7yUrHR9yVor9cQDaAa0eWxV7CCgjCCjQIn0IfO8gv536mz/O8qg0jXxR2Xx8+j+D7vxqPx98KSiEIJUWwd5A9uNBqbaPtMVxQRl+HH7gQTDkEoaSA9w7cYcDbpneTAw/Dpb4ezwRLIwgl6Jv/pb7xgxpMzMcHDvWNfyQebW5uuutQvgtwnIGxhBI4D6EEdxVmCYsbIHzmOwbO58+fj9xzkZ/2VELCeQklsIewpNDOO9A4HY9GoyBXI9bBxwMJaEOcTCbfcPbicvhw05KePn16oBvhnyQM7hDhrxKo29vbbGNjw/2yGUoAut3u/9xzEizEIcPyXkgYXAwOJHD5czyUMIR2qBcs9hCW4Obfde8ghN3zKGJQCGhP4Xf6PD7o87kSzMUewhJ0JN/7WgduzCCmGBTcc3bnRYh/Q8FCBGEJujE+F4/cWXehDiAuYzweu+fue/YhlEO+oBGEBfL1+rxecNRdBVkipyP9fxG/9tz6FYK5CMICvV7P99WHD1O4JHr+PXgdZNSfJcvcLUAQFhuKJ+5QQX+zej/pqCrue8k/dOWFTj9yafkFCMICOn7wnfhzmNIJNe57cYOj4onGyOtYUAwIwmJD8cR9YlES43kvYVcwF0GYwy0SIp7oRnOawtjBr+V7PGfihxtX/KPgUQRhjn6/721UWnetfW00tXOLtognOrDIx6HnIAhzTKdTb3sIKX9kVw8bLn0dNrBK9nwEYQ4dlfa1h5BJwvLBRV8nKnEuwhwEYQ79LbYrHujG8qMkLl/w1cf/lzGEOQjCHLphennz6KFKaIuMVE73vrx8j/oz/UbwKIIQIH3TXkniNHq+ph5/L3gUQYAXGj1WMAoQQQhQGzYWnWm4EgSHIATo7u7uPwJ4QBAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIA05eIbW9vH0iN3KrLnU5HmvbkyZO3+r0lvWqSvrYshx6g5t/tFdKNZiZASXUvYjsajb6VSEW9hwCswtf1NmLAGAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwHBtxzXNZrObbreb9JWaYzGdTgedToerSq+BIKzv7Wg0OhV4t7Ozs6+BPhGsjEMGAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQQBgCAIAQxAAGIIAwBAEAIYgADAEAYAhCAAMQVhTp9M52draOhkMBrsCL7a3t4fuZzCbzU4Ea+lIxPSNMJOwnOvt+Pr6OhPUzoVA797pbSgB0Z9/tNsVQajHpf62Oh6Px6eCyoUaggJB8CTgIHyhUbjSu0PCsD49JBt0u919PUR7rbddCRhB8CT0IBSKMNzf32c3NzdXgqW5EPT7/df6Gr7REAwkAgTBk1iCUMjDkGkYDgnDfDGGoEAQPIktCA/pG/2UMPyWdmCv1+u5w4J9iRRB8CTmIBRcGPTNf9b2mYnQBwrLIAiepBCEBzKNw1nbBiBTCkGBIHiSWBC+aMvMxNbWlpsxeCUJhaBAEDxJMQiFFGcmYh4oLIMgeJJyEAouDDr/fn53d3ccaxjaEoICQfCkDUF4KLaZCff5jjwE+20IQYEgeNK2IBRCD0OKA4VlEARP2hqEBzK9HYYyZdn2EBQIgicE4Se+ZyZSnjFYBUHwhCD8UpNheDBQuB/6h42aRhA8IQhf58KgG+npZDI5q3qcoW0zBqsgCJ4QhMWqGoDMZwxeEYLFCIInBGF5q4bBDRTqn30V84eNmhZzEGJfUzETLMVt0Pob/pNu4Bf5bMBc7mvc1+rDC2JQSiYRi3oPwcl/gxWj3FjSYwOQTB2uLJOApoBXFX0QCu4Yt9frHRCGcoow6P0ghuXJQqKv2Y3enXe73ePRaHQpCUgmCIUiDPrwOW9u1MGFQN9bxzqLc6RjMjeSkOSCUMjDMNSH7wgDqpByCArJBuEhdyadEAasyB1WuWX1p9PpaaohKLQiCIX8FNvX+nBPgMUySWCgsIxWBaGQz0y4AbSXAvxWJi0LQaGVQSgwM4GHWPC25UEoEIb2asNAYRkE4YH8fP39/FTdXUGyCMHXEYRHMDORpvyToGeE4OsIwgKEIRlZfkXuc8GjCMKSOMc/Wpm0dMZgFQShJAYgo5EJISiNIKyIMIQn/7DR2f39/REX0V0NQVhTHoY3+vAF4wx+MGNQHYJQET5M1TxCUD2CUANmJmrXyitlN4Eg1IjrFVQuEwYKa0UQGsAyb2vLhBA0giA0iJmJctyHjVJaniwGBMEDlnl7HAOFfhEEj5iZ+BkhCANBCERbZybatDxZDAhCYFq0zFsmDBQGhyAEKuEPU2VCCIJFEAKXyswEy5PFgSBEIsYwMFAYH4IQmRiWeSME8SIIEQttZoLlyeJHEBIQQBj4sFEiCEJCPMxMZMKMQVIIQoIaGIDMhBAkiSAkrMowsDxZOxCEFlhnmTdmDNqFILRImQ9TEYJ2IggtNWdmghmDFiMILfdgmTeHgUIAAAAAAAAAAAAAAAAAAADU5P9aPyj4nJ/zagAAAABJRU5ErkJggg=="
                />
                <GlobalStyle theme={intermediaryTheme[themeVariant]} />
            </head>
            <body>
                <SCThemeProvider theme={intermediaryTheme[themeVariant]}>
                    <Wrapper>{children}</Wrapper>
                </SCThemeProvider>
            </body>
        </html>
    );
};
