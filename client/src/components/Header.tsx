import React, { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

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
			maxHeight="3.5em"
			align="center"
			fontSize="1.1em"
		>
			<HeaderSection>
				{/*  */}
			</HeaderSection>
			<HeaderSection>
				<Link to="/rooms">Public rooms</Link>
				<Link to="/">Home</Link>
				<a href="https://github.com/dynamo58/meetup" target="_blank">Check code on GitHub</a>
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