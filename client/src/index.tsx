import ReactDOM from "react-dom";
import App from "./App";

import { ChakraProvider, ThemeProvider } from "@chakra-ui/react"
import { ContextProvider } from "./Context";
import theme, { myThemeConfig } from "./styles/theme";


ReactDOM.render(
  <ThemeProvider theme={theme}>
    <ChakraProvider resetCSS theme={ myThemeConfig }>
      <ContextProvider>
        <App />
      </ContextProvider>
    </ChakraProvider>
  </ThemeProvider>,
  document.getElementById("root") as HTMLElement
);
