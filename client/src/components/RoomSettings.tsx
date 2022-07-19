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
} from '@chakra-ui/react'

import { SocketContext } from "../Context";

interface IRoomSettings {
	ownerName?: string,
}

const RoomSettings: React.FC<IRoomSettings> = (props) => {
	let { updateRoom, roomInfo } = useContext(SocketContext)!;
	const { hasCopied, onCopy } = useClipboard(roomInfo.uuid!);

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
		<Stack direction="column" maxW="30em" borderRadius="5px">
			<Text fontWeight={800} width="100%" textAlign="center">Room settings</Text>
			<TableContainer>
				<Table variant='simple'>
					<Tbody>
						<Tr>
							<Td>Owner</Td>
							<Td>You</Td>
						</Tr>
						<Tr>
							<Td>UUID (click to copy)</Td>
							<Td
								onClick={onCopy}
								cursor={"pointer"}
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
							<Td>Room name</Td>
							<Td>
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
											borderTopLeftRadius: 0,
											borderTopRightRadius: 0,
											maxHeight: "1.75em"
										}}
									>Apply
									</Button></>) : roomInfo.roomName
								}
							</Td>
						</Tr>
						{roomInfo.isOwner && (<>
							<Tr>
								<Td>Room password</Td>
								<Td>
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
											borderTopLeftRadius: 0,
											borderTopRightRadius: 0,
											maxHeight: "1.75em"
										}}
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
