import ReactDOM from "react-dom";
import App from "./App";

import { ChakraProvider, ThemeProvider } from "@chakra-ui/react";
import { ContextProvider } from "./Context";
import theme, { } from "./styles/theme";
import { BrowserRouter } from "react-router-dom";


import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <ThemeProvider theme={theme}>
    <ChakraProvider resetCSS theme={theme}>
      <BrowserRouter>
        <ContextProvider>
          <App />
        </ContextProvider>
      </BrowserRouter>
    </ChakraProvider>
  </ThemeProvider>
);
