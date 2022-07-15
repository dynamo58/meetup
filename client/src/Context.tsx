import React, { createContext, useState, useRef, RefObject, PropsWithChildren, useEffect } from "react";
import { io } from "socket.io-client";
import Peer, { Instance } from "simple-peer";

import { IGetRoomsRes, ISocketConnectRes, IJoinRoomData, IJoinRoomRes, IUserIsCallingData, IAnswerCallData, ICreateRoomData, ICreateRoomRes, IEditRoomRes, ICallUserData, ICallAcceptedData } from "../../shared/shared";

import { ModalControls } from "./components/Modal";
import { setInterval } from "timers/promises";

interface VideoParticipant {
	peer: Instance,
	stream: MediaStream,
	name: string | null,
};

interface RoomUserSpecifics {
	roomName: string,
	isConnected: boolean,
	isOwner: boolean,
	// is `null` if `isOwner` is `true`
	ownerName: string | null,
	name: string,
	peers: Map<string, VideoParticipant>,
	uuid: string | null,
}

interface ISocketContext {
	ownVideoRef: RefObject<HTMLVideoElement>,
	// stream: MediaStream | undefined,
	name: string,
	setName: React.Dispatch<React.SetStateAction<string>>,
	socketId: string,
	createRoom: (roomUUID: string, roomPassword: string) => void,
	joinRoom: (roomUUID: string, roomPassword: string) => void,
	leaveRoom: () => void,
	initConnection: () => void,
	updateRoom: (name: string, password: string) => void,
	roomInfo: RoomUserSpecifics,
	getRooms: () => void,
	rooms: IGetRoomsRes | null,
	modal: ModalControls,
	setModal: React.Dispatch<React.SetStateAction<ModalControls>>,
};

const IS_DEBUG_MODE = true;
function dbg(a: any) {
	if (IS_DEBUG_MODE)
		console.log(`[${(new Date()).toLocaleTimeString("cs-CZ")}] ${a}`);
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);
const socket = io("http://localhost:3001");


const ContextProvider = (props: PropsWithChildren) => {
	let [myStream, setMyStream] = useState<MediaStream>();
	const [socketId, setSocketId]           = useState("");
	const [name, setName]                   = useState("");
	
	const [modal, setModal] = useState<ModalControls>({
		heading: "",
		text: "",
		isVisible: false,
	});

	const [rooms, setRooms] = useState<IGetRoomsRes | null>(null)
	
	const [roomInfo, setRoomInfo] = useState<RoomUserSpecifics>({
		roomName: "",
		isConnected: false,
		isOwner: false,
		name: "",
		peers: new Map(),
		uuid: null,
		ownerName: null,
	});

	const ownVideoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		// window.setInterval(async () => {
		// 	console.log("foo")
		// 	if (!myStream) {
		// 		console.log("foo1")

		// 		getStream().then((s) => {
		// 			if (s) setMyStream(s)
		// 			console.log("foo2")
		// 		});
		// 	}
		// }, 1000);
	}, []);

	const getStream: () => Promise<MediaStream | null> = async () => {
		let t = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		})
			.then((s) => {
				setMyStream(s);
				return s;
			})
			.catch((e) => {
				console.log(e);
				return null;
			});


		return t;
	}

	const initConnection = () => {

		getStream()
			.then((st) => {
				if (typeof st === null) {
					setModal({
						heading: "No webcam or microphone detected",
						text: "Those two components are required for participation in calls",
						isVisible: true,
					});
					return;
				}

				dbg(`Got stream from webcam and microphone`);
				setMyStream(st!);
				window.addEventListener("videoInit", () => {
					ownVideoRef.current!.srcObject = st;
				})
			});

		socket.on("connectionRes", (data: ISocketConnectRes) => {
			dbg(`Connected to server with socket.io`);
			setSocketId(data.socketId);
		});

		socket.on("userIsCalling", async (data: IUserIsCallingData) => {
			dbg(`Received call request from ${data.callerSocketId}`);

			const peer = new Peer({
				initiator: false,
				trickle: false,
				stream: myStream || (await getStream()) || myStream,
			});

			peer.on("signal", (signalData) => {
				dbg(`Answering call to ${data.callerSocketId}`);

				socket.emit("answerCall", {
					endpointSocketId: data.callerSocketId,
					signalData
				} as IAnswerCallData);

				// peer.removeListener("signal", () => {});
			});

			peer.on("stream", (_stream) => {
				dbg(`Received stream from user ${data.callerSocketId}`);

				// let ref = React.createRef<HTMLVideoElement>();
				// ref.current!.srcObject = _stream;

				setRoomInfo((i) => {
					let foo = i.peers;
					foo.set(data.callerSocketId, {
						name: data.callerName,
						stream: _stream,
						peer,
					});

					return {
						name: i.name,
						isOwner: i.isOwner,
						peers: foo,
						isConnected: i.isConnected,
						uuid: i.uuid,
						ownerName: i.ownerName,
						roomName: i.roomName
					}
				})
			});
			peer.signal(data.signalData);
		});
	}

	const joinRoom = (roomUUID: string, roomPassword: string) => {
		dbg(`Attempting to join room ${roomUUID}`);

		socket.emit("joinRoom", {
			roomUUID,
			roomPassword,
			nickname: name,
		} as IJoinRoomData);

		socket.on("joinRoomRes", (data: IJoinRoomRes) => {
			if (!data.isSuccess) {
				setModal({
					text: data.errorMessage || "",
					heading: "Error connecting",
					isVisible: true,
				});
				return;
			}

			dbg(`Successfully joined room ${roomUUID}`);

			for (const id of data.peerSocketIds) {
				dbg(`Attempting to call ${id}`);

				console.log({myStream});
				const peer = new Peer({
					initiator: true,
					trickle: false,
					stream: myStream,
				});

				peer.on("signal", (data) => {
					socket.emit("callUser", {
						userToCallUUID: id,
						signalData: data,
						name
					} as ICallUserData);
				});

				peer.on("stream", (_stream) => {
					dbg(`Stream received from  ${id}`);

					setRoomInfo((i) => {
						let foo = i.peers;
						foo.set(id, {
							name: "xd",
							stream: _stream,
							peer,
						});

						return {
							name: i.name,
							isOwner: i.isOwner,
							peers: foo,
							isConnected: i.isConnected,
							uuid: i.uuid,
							ownerName: i.ownerName,
							roomName: i.roomName
						}
					});
				});

				socket.on("callAccepted", (data: ICallAcceptedData) => {
					dbg(`${id} accepted call`);
					peer.signal(data.signalData);
				});
			}
		});
	}

	const createRoom = (roomName: string, roomPassword: string) => {
		dbg(`Attempting to create room ${roomName}`);

		socket.emit("createRoom", {
			roomName,
			roomPassword
		} as ICreateRoomData);

		socket.on("createRoomRes", (data: ICreateRoomRes) => {

			if (!data.isSuccess) {
				setModal({
					text: data.errorMessage || "",
					heading: "Error creating room",
					isVisible: true,
				});
				return;
			}

			dbg(`Successfully created room ${roomName}, uuid ${data.roomUuid}`);

			setRoomInfo((i) => {
				return {
					name: i.name,
					isOwner: true,
					peers: i.peers,
					isConnected: i.isConnected,
					uuid: data.roomUuid!,
					ownerName: i.ownerName,
					roomName,
				}
			})
		});
	}

	const updateRoom = (name: string, password: string) => {
		dbg(`Attempting to update room ${name}`);

		socket.emit("editRoom", {
			roomName: name,
			roomPassword: password,
		} as ICreateRoomData);

		socket.on("editRoomRes", (data: IEditRoomRes) => {
			if (!data.isSuccess) {
				setModal({
					text: data.errorMessage || "",
					heading: "Error editing room",
					isVisible: true,
				});
				return;
			}

			dbg(`Room ${name} successfully edited`);


			setRoomInfo((i) => {
				return {
					name,
					isOwner: i.isOwner,
					peers: i.peers,
					isConnected: i.isConnected,
					uuid: i.uuid,
					ownerName: i.ownerName,
					roomName: i.roomName
				}
			})
		})
	}

	const getRooms = () => {
		dbg("Attempting to fetch rooms");

		socket.emit("getRooms");

		socket.on("getRoomsRes", (data: IGetRoomsRes) => {
			setRooms(data);
			dbg(`Received rooms ${data.rooms}`)
		});
	}

	const leaveRoom = () => {
		dbg(`Leaving room`);
	};

	return (
		<SocketContext.Provider value={{
				setModal,
				modal,
				rooms,
				getRooms,
				updateRoom,
				initConnection,
				ownVideoRef,
				// stream,
				name,
				setName,
				socketId,
				leaveRoom,
				joinRoom,
				createRoom,
				roomInfo
			}}
		>
			{props.children}
		</SocketContext.Provider>
	);
};

export { ContextProvider, SocketContext };
export type { ISocketContext };
