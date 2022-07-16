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
	let { joinRoom, createRoom, setModal } = useContext(SocketContext)!;
	
	const navigate = useNavigate();

	function navigate_promise() {
		return new Promise(function (resolve, reject) {
			resolve(navigate("/room", { replace: true }))
		})
	}
	
	return (
		<Center height="100%" flexGrow={2}>
			<Stack maxW="20em" spacing={4} direction='column' w="100%">
				<Image
					src="/favicon.webp"
					maxW={"10em"}
					alignSelf="center"
					marginBottom={"5em"}
				/>
				<Text alignSelf={"center"}>
					Connect to a room
				</Text>
				<Stack display={"flex"} justifyContent={"center"} flexDir={"column"}>
					<Input
						id="connect-uuid"
						type="text"
						placeholder="Room UUID"
						autoComplete="off"
						variant={"xd"}
					/>
					<Input
						id="connect-password"
						type="password"
						placeholder="Room password"
						variant={"xd"}
					/><br />
					<Button
						alignSelf={"center"}
						marginTop={"1em"}
						variant={"primary"}
						onClick={() => {
							const uuid     = (document.getElementById("connect-uuid")! as HTMLInputElement).value;
							if (uuid === "") {
								setModal({
									heading: "Connection failed - input error",
									text: "Missing UUID of the room you are trying to connect to",
									isVisible: true,
								});
								return;
							}

							const password = (document.getElementById("connect-password")! as HTMLInputElement).value;

							navigate_promise().then(() => {
								joinRoom(uuid, password);
							});
						}
					}>
						Connect
					</Button>
				</Stack>

				<br /><br />

				<Text alignSelf={"center"}>
					Create a new room
				</Text>

				<Stack display={"flex"} justifyContent={"center"} flexDir={"column"}>
					<Input
						id="create-name"
						type="text"
						placeholder="Room name"
						variant={"xd"}
					/>
					<Input
						id="create-password"
						type="password"
						placeholder="Room password (optional)"
						variant={"xd"}
					/>
					<Button
						alignSelf={"center"}
						marginTop={"1em"}
						variant={"primary"}
						onClick={() => {
							const name = (document.getElementById("create-name")! as HTMLInputElement).value;
							if (name === "") {
								setModal({
									heading: "Connection failed - input error",
									text: "A room must have a name",
									isVisible: true,
								})
								return;
							}
							const password = (document.getElementById("create-password")! as HTMLInputElement).value;
							navigate_promise().then(() => {
								createRoom(name, password);
							});
						}
					}>
						Create
					</Button>
				</Stack>
			</Stack>
		</Center>
	)
}

export default Home;