import React, { PropsWithChildren } from "react";

import {
	Flex,
	Text,
	Button,
	useColorMode,
} from "@chakra-ui/react";

import {
	MoonIcon,
	SunIcon
} from "@chakra-ui/icons";

interface IHeaderSectionProps {
	children?: React.ReactNode,
}

const HeaderSection: React.FC<IHeaderSectionProps> = (props) => {
	return (
		<Flex
			as="nav"
			align="center"
			justify="center"
			wrap="wrap"
			gap={5}
			padding={6}
		>
			{props.children}
		</Flex>
	)
}

const Header: React.FC = () => {
	const { colorMode, toggleColorMode } = useColorMode();

	return (
		<Flex
			as="nav"
			width="100%"
			justify="space-between"
			maxHeight="4em"
			align="center"
		>
			<HeaderSection>
				{/*  */}
			</HeaderSection>
			<HeaderSection>
				<Text>Public rooms</Text>
				<Text>About</Text>
			</HeaderSection>
			<HeaderSection>
				<Button onClick={toggleColorMode}>
					{colorMode === "light" ? <MoonIcon /> : <SunIcon />}
				</Button>
			</HeaderSection>
		</Flex>
	)
}

export default Header;