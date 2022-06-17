import ReactDOM from "react-dom";
import App from "./App";

import { ChakraProvider, ThemeProvider } from "@chakra-ui/react"
import { ContextProvider } from "./Context";
import theme, { myThemeConfig } from "./styles/theme";


ReactDOM.render(
  <ChakraProvider resetCSS theme={ myThemeConfig }>
    <ThemeProvider theme={theme}>
      <ContextProvider>
        <App />
      </ContextProvider>
    </ThemeProvider>
  </ChakraProvider>,
  document.getElementById("root") as HTMLElement
);
