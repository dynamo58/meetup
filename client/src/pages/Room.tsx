import React, { useContext, useEffect } from "react";
import {
	Stack,
	Divider,
	useFocusEffect,
} from "@chakra-ui/react";

import { SocketContext } from "../Context";
import Video from "../components/Video";
import RoomSettings from "../components/RoomSettings";

const Room: React.FC = () => {
	let { ownVideoRef, initConnection, roomInfo } = useContext(SocketContext)!;

	useEffect(() => {
		window.dispatchEvent(new Event("videoInit"));
	}, [])

	useEffect(() => {
		Array.from(roomInfo.peers).forEach((p) => {
			(document.getElementById(p[0])! as HTMLVideoElement).srcObject = p[1].stream;
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
					<>
						<div>
							<p>You</p>
							<video
								ref={ownVideoRef}
								autoPlay
								muted={true}
								style={{ maxWidth: "20em", borderRadius: "1em" }}
							/>
						</div>

						{
							Array.from(roomInfo.peers).map((p) =>
								<div>
									<p>{p[1].name}</p>
									<video
										key={p[0]}
										id={p[0]}
										muted={false}
										autoPlay={true}
										controls={true}
										style={{ maxWidth: "20em", borderRadius: "1em" }}
									/>
								</div>
							)
						}
					</>
				</Stack>
			</Stack>
	)
}

export default Room;