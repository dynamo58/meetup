import React, { useContext } from "react";
import { Link } from "react-router-dom";

import {
	Flex,
	Text,
	Button,
	useColorMode,
	Input,
	useMediaQuery
} from "@chakra-ui/react";

import {
	MoonIcon,
	SunIcon
} from "@chakra-ui/icons";

import { SocketContext } from "../Context";

interface IHeaderSectionProps {
	children?: React.ReactNode,
	width?: string | number,
	justify?: string,
}

const Header: React.FC = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const { setNameHandler, setModal } = useContext(SocketContext)!;
	const [isLargerThan1000] = useMediaQuery('(min-width: 1000px)');
	const [isLargerThan400] = useMediaQuery('(min-width: 400px)');

	const HeaderSection: React.FC<IHeaderSectionProps> = (props: IHeaderSectionProps) => {
		return (
			<Flex
				as="nav"
				align="center"
				justify="center"
				wrap="wrap"
				gap={2}
				padding={"4px"}
				flexDir={isLargerThan400 ? "row" : "column"}

				{...props}
			>
				{props.children}
			</Flex>
		)
	}

	const lineStyle = isLargerThan1000 ? {
		padding: "1em 0.5em 1em 0.5em"
	} : undefined

	return (
		<Flex
			as="nav"
			width="100%"
			justify="space-between"
			flexDir={isLargerThan1000 ? "row" : "column-reverse"}
			padding={isLargerThan1000 ? undefined : "0.5em"}
			maxHeight={isLargerThan1000 ? "3em" : undefined}
			align="center"
			fontSize="1.1em"
			bg={colorMode == "light" ? "bgAlt_lm" : "bgAlt_dm"}
		>
			<HeaderSection width={"15em"} justify={isLargerThan1000 ? "left" : "center"}>
				<div style={{ display: "flex", gap: ".4em" }}>
					<Input
						id={"newName"}
						placeholder={"New name"}
						variant={"secondary"}
						onChange={() => { (document.getElementById("newNameButton")! as HTMLButtonElement).disabled = false }}
					/>
					<Button
						id={"newNameButton"}
						textAlign={"center"}
						variant={"primary"}
						isDisabled
						style={{ padding: "0 .75em 0 .75em" }}
						onClick={setNameHandler}
					>Change</Button>
				</div>
			</HeaderSection>
			<HeaderSection>
				<Link to="/rooms" style={lineStyle}>ROOMS</Link>
				<Link to="/" style={lineStyle}>HOME</Link>
				<a href="https://github.com/dynamo58/meetup" target="_blank" style={lineStyle}>GITHUB</a>
			</HeaderSection>
			<HeaderSection width={"15em"} justify={isLargerThan1000 ? "right" : "center"}>
				<Button onClick={toggleColorMode} variant={"secondary"}>
					{colorMode === "light" ? <MoonIcon /> : <SunIcon />}
				</Button>
			</HeaderSection>
		</Flex>
	)
}

export default Header;
