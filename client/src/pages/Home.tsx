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
	Center,
	FormControl
} from '@chakra-ui/react'

import {
	SocketContext
} from "../Context";

const Home: React.FC = () => {
	let { joinRoom, createRoom } = useContext(SocketContext)!;

	return (
		<Center>
			<Stack maxW="20em" spacing={4} direction='column' w="100%">
				<Text>
					Hello! You can safely meet up with your peers here.
				</Text>

				<Text>
					... simply connect to a room with its UUID and password (if there is one)
				</Text>

				<FormControl>
					<Input
						id="connect-uuid"
						type="text"
						placeholder="Room UUID"
					/>
					<Input
						id="connect-password"
						type="password"
						placeholder="Room password"
					/>
					<Button onClick={() => {
						const uuid     = (document.getElementById("connect-uuid")! as HTMLInputElement).value;
						const password = (document.getElementById("connect-password")! as HTMLInputElement).value;
						joinRoom(uuid, password);
					}}>
						Connect
					</Button>
				</FormControl>

				<Text>
					... or create a brand new room here!
				</Text>

				<FormControl>
					<Input
						id="create-name"
						type="text"
						placeholder="Room name"
					/>
					<Input
						id="create-password"
						type="password"
						placeholder="Room password (optional)"
					/>
					<Button onClick={() => {
						const uuid = (document.getElementById("create-uuid")! as HTMLInputElement).value;
						const password = (document.getElementById("create-password")! as HTMLInputElement).value;
						createRoom(uuid, password);
					}}>
						Create
					</Button>
				</FormControl>
			</Stack>
			

			

			{/* <FormControl>
				<Stack spacing={4} direction='row' align='center' marginBottom={4} marginTop={50}>
					<Input
						id="name"
						type="text"
						placeholder="Your name"
						onChange={(e) => setName(e.target.value)}
					/>

					<Button onClick={onCopy} w="8em" bg={hasCopied ? "accent_primary" : undefined}>
						{hasCopied ? (
							<Text>Copied</Text>
						) : (
							<>
								<CopyIcon m={1} />
								<Text>Copy ID</Text>
							</>
						)}
					</Button>
				</Stack>
			</FormControl> */}
		</Center>
	)
}

export default Home;