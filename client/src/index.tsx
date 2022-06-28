import ReactDOM from "react-dom";
import App from "./App";

import { ChakraProvider, ThemeProvider } from "@chakra-ui/react";
import { ContextProvider } from "./Context";
import theme, { myThemeConfig } from "./styles/theme";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <ChakraProvider resetCSS theme={ myThemeConfig }>
      <ContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ContextProvider>
    </ChakraProvider>
  </ThemeProvider>,
  document.getElementById("root") as HTMLElement
);
