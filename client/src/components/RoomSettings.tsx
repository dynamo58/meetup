import React, { useState } from "react";

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
	Center
} from '@chakra-ui/react'

import {
	ShowIcon,
	HideIcon,
} from "./Icons";

export enum RoomRole {
	Participant,
	Owner,
}

interface IRoomSettings {
	role: RoomRole,
	ownerName?: string,
}

const RoomSettings: React.FC<IRoomSettings> = (props) => {
	const isOwner = props.role === RoomRole.Owner;
	// const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

	const [roomName, setRoomName] = ["xd", (s: string) => { }];
	const [roomPassword, setRoomPassword] = ["xd", (s: string) => { }];

	return (
		<Stack direction="column" maxW="35em" borderRadius="5px">
			<Text fontWeight={800} width="100%" textAlign="center">Room settings</Text>
			<TableContainer>
				<Table variant='simple'>
					<Tbody>
						<Tr>
							<Td>Owner</Td>
							<Td>You</Td>
						</Tr>
						<Tr>
							<Td>Room name</Td>
							<Td>
								{ isOwner ? (
									<Input
										value={ roomName } 
										onChange={ (e) => setRoomName(e.target.value) }
									/>) : roomName
								}
							</Td>
						</Tr>
						{ isOwner && (
							<Tr>
								<Td>Room password</Td>
								<Td>
									<Input
										isDisabled={!isOwner}
										type="password"
										value={ roomPassword }
										onChange={ (e) => setRoomPassword(e.target.value)}
									/>
								</Td>
							</Tr>
						)}
					</Tbody>
				</Table>
			</TableContainer>
		</Stack>
	)
}

export default RoomSettings;