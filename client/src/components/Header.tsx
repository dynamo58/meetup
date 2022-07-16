import React, { useContext } from "react";
import { Link } from "react-router-dom";

import {
	Flex,
	Text,
	Button,
	useColorMode,
	Input,
} from "@chakra-ui/react";

import {
	MoonIcon,
	SunIcon
} from "@chakra-ui/icons";

import { SocketContext } from "../Context";

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
	const { setNameHandler, setModal } = useContext(SocketContext)!;

	return (
		<Flex
			as="nav"
			width="100%"
			justify="space-between"
			maxHeight="3em"
			align="center"
			fontSize="1.1em"
			bg={colorMode == "light" ? "bgAlt_lm" : "bgAlt_dm"}
		>
			<HeaderSection>
				<div style={{display: "flex", gap: ".4em"}}>
					<Input
						id={"newName"}
						placeholder={"New name"}
						maxW={"10em"}
						variant={"xd"}
					/>
					<Button
						textAlign={"center"}
						variant={"primary"}
						style={{ display: "inline-block", padding: "0 1em 0 1em" }}
						onClick={setNameHandler}
					>Set</Button>
				</div>
			</HeaderSection>
			<HeaderSection>
				<Link to="/rooms" style={{ padding: "1em 0.5em 1em 0.5em" }}>ROOMS</Link>
				<Link to="/" style={{ padding: "1em 0.5em 1em 0.5em" }}>HOME</Link>
				<a href="https://github.com/dynamo58/meetup" target="_blank" style={{ padding: "1em 0.5em 1em 0.5em" }}>GITHUB</a>
			</HeaderSection>
			<HeaderSection>
				<Button onClick={toggleColorMode} variant={"secondary"}>
					{colorMode === "light" ? <MoonIcon /> : <SunIcon />}
				</Button>
			</HeaderSection>
		</Flex>
	)
}

export default Header;
