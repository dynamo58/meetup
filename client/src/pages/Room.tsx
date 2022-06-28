import React, { useContext } from "react";
import {
	Stack,
	Divider,
	Center
} from "@chakra-ui/react";

import { SocketContext } from "../Context";
import Video from "../components/Video";
import RoomSettings, { RoomRole } from "../components/RoomSettings";

const Room: React.FC = () => {
	let { socketId, callAccepted, callEnded, ownVideo, userVideo, stream, setName, leaveRoom } = useContext(SocketContext)!;

	return (
		<Stack
			direction="row"
			width="100vw"
			justifyContent="space"
		>
			<Stack
				position="relative"
				left={0}
				height="100%"
			>
				<RoomSettings role={RoomRole.Owner} />
			</Stack>

			<Divider orientation='vertical' />

			<Stack
				width="100%"
				height="100%"

			>
				<Center>
					{stream && (
						<Video
							ref={ownVideo}
							name="You"
							mute={true}
						/>
					)}
				</Center>

			</Stack>
		</Stack>
	)
}

export default Room;