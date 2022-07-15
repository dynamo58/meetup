import React, { useContext, useEffect } from "react";
import {
	Stack,
	Center,
	Text,
	Button,
	Input,
} from "@chakra-ui/react";
import { SocketContext } from "../Context";

const Room: React.FC = () => {
	let { getRooms, rooms, joinRoom } = useContext(SocketContext)!;

	useEffect(() => {
		getRooms(); 
	}, [getRooms])

	return (
		<Center height={"100%"} flexGrow={"2"}>
			<Stack direction="column" maxW="30em" borderRadius="5px">
				{rooms?.rooms.length === 0 ? (
					<Text>No rooms are currently up, create one!</Text>
				) : (
					rooms?.rooms.map((r) => {
						return (
							<div key={r.uuid} style={{ borderRadius: "0.5em", borderWidth: "2px", padding: "0.5em", textAlign: "center", marginBottom: "1em" }}>
								<Text fontWeight={"bold"}>{r.name}</Text>
								<Text>Active chatters: {r.activeCallersNum}</Text>

								{r.has_password && (
									<Input
										id={`connect-password-${r.uuid}`}
										type="password"
										placeholder="Room password"
										padding={"0.2em"}
									/>
								)}
								<br />

								<Button alignSelf={"center"} marginTop={"1em"} onClick={() => {
									const uuid = r.uuid;
									let pwd = document.getElementById(`connect-password-${r.uuid}`);
									let password = pwd ? (pwd as HTMLInputElement).value : "";
									joinRoom(uuid, password);
								}}>
									Connect
								</Button>
							</div>
						)
					})
				)}
				
			</Stack>
		</Center>
	)
}

export default Room;