import React, { useContext } from "react";

import { Context } from "../Context";

import {
	Text,
	Stack,
	Divider,
	useColorMode
} from "@chakra-ui/react"

const RoomActivityLog: React.FC = () => {
	const { colorMode } = useColorMode();
	const { roomActivityLog } = useContext(Context)!;

	return (
		<Stack direction="column" w="100%" bg={colorMode === "light" ? "bgAlt_lm" : "bgAlt_dm"}>
			<Text w={"100%"} textAlign={"center"} fontWeight={"bold"}>Room log</Text>
			{roomActivityLog.map(a =>
				<Text fontSize={"0.85em"} key={a}>{a}</Text>
			)}
		</Stack>
	)
}

export default RoomActivityLog;
