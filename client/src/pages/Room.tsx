import React, { useContext, useEffect } from "react";
import {
	Stack,
	Divider,
} from "@chakra-ui/react";

import { SocketContext } from "../Context";
import RoomSettings from "../components/RoomSettings";

const videoStyles = {
	padding: "1rem",
};

const Room: React.FC = () => {
	let { ownVideoRef, roomInfo } = useContext(SocketContext)!;

	useEffect(() => {
		window.dispatchEvent(new Event("videoInit"));
	}, [])

	useEffect(() => {
		Array.from(roomInfo.peers).forEach((p) => {
			(document.getElementById(p.socketId)! as HTMLVideoElement).srcObject = p.stream;
		})
	}, [roomInfo]);


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
				<RoomSettings />
			</Stack>

			<Divider orientation='vertical' />

			<Stack
				width="100%"
				height="100%"
				direction="column"
			>
				<div
					style={{
						margin: "0 auto",
						display: "grid",
						gap: "1rem",
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					}}
				>
					<div style={videoStyles}>
						<p>You</p>
						<video
							ref={ownVideoRef}
							autoPlay
							muted={true}
						/>
					</div>

					{
						Array.from(roomInfo.peers).map((p) =>
							<div key={p.socketId} style={videoStyles}>
								<p>{p.name}</p>
								<video
									id={p.socketId}
									muted={false}
									autoPlay={true}
									controls={true}
								/>
							</div>
						)
					}
				</div>
			</Stack>
		</Stack>
	)
}

export default Room;