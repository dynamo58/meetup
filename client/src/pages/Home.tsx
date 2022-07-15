import React, { useContext } from "react";

import {
	Stack,
	Text,
	Input,
	Button,
	Center,
	Image,
} from '@chakra-ui/react'

import {
	SocketContext
} from "../Context";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
	let { joinRoom, createRoom } = useContext(SocketContext)!;
	
	const navigate = useNavigate();

	function navigate_promise() {
		return new Promise(function (resolve, reject) {
			resolve(navigate("/room", { replace: true }))
		})
	}
	
	return (
		<Center height="100%" flexGrow={2}>
			<Stack maxW="20em" spacing={4} direction='column' w="100%">
				<Text fontSize="1.125rem" fontWeight="bold">
					Hello! You can meet up safely with your peers here.
				</Text>
				<Image
					src="/favicon.webp"
					maxW={"10em"}
					alignSelf="center"
					marginBottom={"5em"}
				/><br /><br /><br />
				<Text>
					... simply connect to a room
				</Text>
				<Stack display={"flex"} justifyContent={"center"} flexDir={"column"}>
					<Input
						id="connect-uuid"
						type="text"
						placeholder="Room UUID"
						autoComplete="off"
					/>
					<Input
						id="connect-password"
						type="password"
						placeholder="Room password"
					/><br />
					<Button alignSelf={"center"} marginTop={"1em"} onClick={() => {
						const uuid     = (document.getElementById("connect-uuid")! as HTMLInputElement).value;
						const password = (document.getElementById("connect-password")! as HTMLInputElement).value;

						navigate_promise().then(() => {
							joinRoom(uuid, password);
						});
					}}>
						Connect
					</Button>
				</Stack>

				<Text>
					... or create a brand new room here!
				</Text>

				<Stack display={"flex"} justifyContent={"center"} flexDir={"column"}>
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
					<Button alignSelf={"center"} marginTop={"1em"} onClick={() => {
						const name = (document.getElementById("create-name")! as HTMLInputElement).value;
						const password = (document.getElementById("create-password")! as HTMLInputElement).value;

						navigate_promise().then(() => {
							createRoom(name, password);
						});
					}}>
						Create
					</Button>
				</Stack>
			</Stack>
		</Center>
	)
}

export default Home;