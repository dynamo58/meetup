import { extendTheme, type ThemeConfig  } from "@chakra-ui/react";

const chakraConfig: ThemeConfig = {
	initialColorMode: 'dark',
  	useSystemColorMode: false,
}

const theme = extendTheme({ chakraConfig });

const myThemeConfig = extendTheme({
	colors: {
		bg_primary:     "#202020",
		bg_secondary:   "#252525",
		fg_primary:     "#fff",
		accent_primary: "#00b099",
		is_success:     "#38c5a4",
		is_warning:     "#f37a17",
		is_error:       "#ee535d"
	},
	modes: {
		dark: {
			background: "#f1a"
		}
	}
});

export { myThemeConfig };
export default theme;
