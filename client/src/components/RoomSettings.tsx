import React, { useContext } from "react";

import {
	Stack,
	Text,
	Table,
	Tbody,
	Tr,
	Td,
	TableContainer,
	Input,
	Button,
	useClipboard,
	useColorMode,
} from '@chakra-ui/react'

import { Context } from "../Context";

interface IRoomSettings {
	ownerName?: string,
}

const RoomSettings: React.FC<IRoomSettings> = (props) => {
	let { updateRoom, roomInfo } = useContext(Context)!;
	const { hasCopied, onCopy } = useClipboard(roomInfo.uuid!);
	const { colorMode } = useColorMode();

	const updateRoomName = () => {
		const name = (document.getElementById("current-name")! as HTMLInputElement).value;
		updateRoom({ roomName: name, roomPassword: null });
	}

	const updateRoomPassword = () => {
		const password_div = document.getElementById("current-password")! as HTMLInputElement;
		const _password = (password_div).value;
		password_div.value = "";

		updateRoom({ roomPassword: _password, roomName: null });
	}

	return (
		<Stack direction="column" maxW="30em" bg={colorMode === "light" ? "bgAlt_lm" : "bgAlt_dm"}>
			<Text fontWeight={800} width="100%" textAlign="center">Room settings</Text>
			<TableContainer>
				<Table variant='simple'>
					<Tbody>
						<Tr>
							<Td w={"50%"} padding={0}>Owner</Td>
							<Td w={"50%"} padding={0}>You</Td>
						</Tr>
						<Tr>
							<Td padding={0} w={"50%"}>UUID (click to copy)</Td>
							<Td
								onClick={onCopy}
								cursor={"pointer"}
								padding={0}
								w={"50%"}
							>
								<Text
									maxW={"10em"}
									padding={"0.2em"}
									borderRadius={"0.5em"}
									bg={hasCopied ? "accentSecondary" : undefined}
								>
									{roomInfo.uuid ? roomInfo.uuid.slice(0, 10) + "..." : ""}
								</Text>
							</Td>
						</Tr>
						<Tr>
							<Td padding={0} w={"50%"}>Room name</Td>
							<Td padding={0} w={"50%"}>
								{roomInfo.isOwner ? (<>
									<Input
										id="current-name"
										placeholder={"New name"}
										defaultValue={roomInfo.roomName}
										variant={"xd"}
										style={{
											borderBottomLeftRadius: 0,
											borderBottomRightRadius: 0
										}}
									/>
									<br />
									<Button
										width={"100%"}
										onClick={updateRoomName}
										style={{
											maxHeight: "1.75em",
											borderRadius: 0,
										}}
										variant={"primary"}
									>Apply
									</Button></>) : roomInfo.roomName
								}
							</Td>
						</Tr>
						{roomInfo.isOwner && (<>
							<Tr>
								<Td padding={0} w={"50%"}>Room password</Td>
								<Td padding={0} w={"50%"}>
									<Input
										id="current-password"
										isDisabled={!roomInfo.isOwner}
										type="password"
										placeholder={"New password"}
										variant={"xd"}
										style={{
											borderBottomLeftRadius: 0,
											borderBottomRightRadius: 0
										}}
									/>
									<br />
									<Button
										width={"100%"}
										onClick={updateRoomPassword}
										style={{
											borderRadius: 0,
											maxHeight: "1.75em"
										}}
										variant={"primary"}
									>
										Apply
									</Button>
								</Td>
							</Tr>
						</>)}
					</Tbody>
				</Table>
			</TableContainer>

		</Stack>
	)
}

export default RoomSettings;
