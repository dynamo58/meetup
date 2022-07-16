import { extendTheme, type ThemeConfig  } from "@chakra-ui/react";
import { mode, whiten, darken, StyleFunctionProps } from "@chakra-ui/theme-tools";
import { Dict } from "@chakra-ui/utils";

const chakraConfig: ThemeConfig = {
	initialColorMode: 'dark',
  	useSystemColorMode: false,
}

const ButtonStyles = {
	baseStyle: {},
	sizes: {},
	variants: {
		primary: (props: Dict<any> | StyleFunctionProps) => ({
			bg: "accentPrimary",
			_hover: {
				bg: mode(darken("accentPrimary", 15), whiten("accentPrimary", 15))(props)
			}
		}),
		secondary: (props: Dict<any> | StyleFunctionProps) => ({
			bg: "accentSecondary",
			_hover: {
				bg: mode(darken("accentSecondary", 15), whiten("accentSecondary", 15))(props)
			}
		}),
		transparent: (props: Dict<any> | StyleFunctionProps) => ({
			bg: "#00000025",
			_hover: {
				bg: mode("#00000025", "#00000040")(props)
			}
		}),
	},
	defaultProps: {},
}

const InputStyles = {
	baseStyle: (props: Dict) => ({
		field: {
			bg: mode('bgAlt_lm', 'bgAlt_dm')(props),
			_hover: {
				borderColor: mode('bgAlt_dm', 'bgAlt_lm')(props),
			},
			borderColor: mode('bgAlt_dm', 'bgAlt_lm')(props),
			_placeholder: {
				color: mode('bgAlt_dm', 'bgAlt_lm')(props),
        	},
		}
	}),
	sizes: {},
	variants: {},
	defaultProps: {}
}

const theme = extendTheme({
  chakraConfig,
  styles: {
    global: (props: Dict<any> | StyleFunctionProps) => ({
      body: {
        bg: mode("#efefef","#202020")(props),
      }
    })
  },
  colors: {
	bgAlt_lm:        "#dedede",
	bgAlt_dm:        "#151515",
	accentPrimary:   "#68bd51",
	accentSecondary: "#663fbf",
	isWarning:       "#f37a17",
	isError:         "#ee535d"
  },
  components: {
	Button: ButtonStyles,
	Input: InputStyles,
  }
})


// export { myThemeConfig };
export default theme;
