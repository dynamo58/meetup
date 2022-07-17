import React, { createContext, useState, useRef, RefObject, PropsWithChildren, useEffect } from "react";
import { io } from "socket.io-client";
import Peer, { Instance } from "simple-peer";

import { IGetRoomsRes, ISocketConnectRes, IJoinRoomData, IJoinRoomRes, IUserIsCallingData, IAnswerCallData, ICreateRoomData, ICreateRoomRes, IEditRoomRes, ICallUserData, ICallAcceptedData, IEditRoomData, IUserDisconnectedData, IChangeNameData, IChangeNameRes } from "../../shared/shared";

import { ModalControls } from "./components/Modal";

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
	peers: Map<string, VideoParticipant>,
	uuid: string | null,
}

interface ISocketContext {
	ownVideoRef: RefObject<HTMLVideoElement>,
	// stream: MediaStream | undefined,
	name: string,
	setNameHandler: () => void,
	socketId: string,
	createRoom: (roomUUID: string, roomPassword: string) => void,
	joinRoom: (roomUUID: string, roomPassword: string) => void,
	leaveRoom: () => void,
	initConnection: () => void,
	updateRoom: (arg0: IEditRoomData) => void,
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
		peers: new Map(),
		uuid: null,
		ownerName: null,
	});

	const ownVideoRef = useRef<HTMLVideoElement>(null);

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

	const setNameHandler = () => {
		const name = (document.getElementById("newName")! as HTMLInputElement).value;

		if (name === "") {
			setModal({
				heading: "Error changing name",
				text: "You must set a valid name!",
				isVisible: true,
			});
			return;
		}

		socket.emit("changeName", {
			newName: name,
		} as IChangeNameData)

		socket.on("changeNameRes", (data: IChangeNameRes) => {
			if (!data.isSuccess) {
				setModal({
					heading: "Error changing name",
					text: data.errorMessage || "",
					isVisible: true,
				});
				return;
			}

			setName(name);
			localStorage.setItem("name", name);

			(document.getElementById("newNameButton")! as HTMLButtonElement).disabled = true;
		})
	}

	// gets triggered everytime user goes out of the `/room` endpoint 
	const leaveRoomHandler = () => {
		
	}

	useEffect(() => {
		const recoveredName = localStorage.getItem("name");
		if (recoveredName) {
			setName(recoveredName);
			(document.getElementById("newName")! as HTMLInputElement).value = recoveredName;
		}
	}, [])

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

		socket.on("promotedToOwner", () => {
			setRoomInfo((i) => {
				return {
					isOwner: true,
					peers: i.peers,
					isConnected: true,
					uuid: i.uuid,
					ownerName: i.ownerName,
					roomName: i.roomName
				}
				
			})
		});

		socket.on("userDisconnected", (data: IUserDisconnectedData) => {

		})
	}

	const joinRoom = (roomUUID: string, roomPassword: string) => {
		dbg(`Attempting to join room ${roomUUID}`);

		socket.emit("joinRoom", {
			roomUUID,
			roomPassword,
			nickname: name,
		} as IJoinRoomData);

		socket.on("joinRoomRes", (joinRoomData: IJoinRoomRes) => {
			if (!joinRoomData.isSuccess) {
				setModal({
					text: joinRoomData.errorMessage || "",
					heading: "Error connecting",
					isVisible: true,
				});
				return;
			}

			dbg(`Successfully joined room ${roomUUID}`);

			for (const id of joinRoomData.peerSocketIds) {
				dbg(`Attempting to call ${id}`);


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
							isOwner: false,
							peers: foo,
							isConnected: true,
							uuid: i.uuid,
							ownerName: i.ownerName,
							roomName: joinRoomData.roomName
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
					heading: "Error creating room",
					text: data.errorMessage || "",
					isVisible: true,
				});
				return;
			}

			dbg(`Successfully created room ${roomName}, uuid ${data.roomUuid}`);

			setRoomInfo((i) => {
				return {
					isOwner: true,
					peers: i.peers,
					isConnected: true,
					uuid: data.roomUuid!,
					ownerName: i.ownerName,
					roomName,
				}
			})
		});
	}

	// update the information about the current room
	const updateRoom = (arg0: IEditRoomData) => {
		dbg(`Attempting to update room ${name}`);

		socket.emit("editRoom", arg0);

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
					isOwner: i.isOwner, // should be true anyway if the edit succeeded
					peers: i.peers,
					isConnected: i.isConnected,
					uuid: i.uuid,
					ownerName: i.ownerName,
					roomName: i.roomName
				}
			})
		})
	}

	// get info about all of the rooms there are
	const getRooms = () => {
		dbg("Attempting to fetch rooms");

		socket.emit("getRooms");

		socket.on("getRoomsRes", (data: IGetRoomsRes) => {
			setRooms(data);
			dbg(`Received rooms`)
		});
	}

	const leaveRoom = () => {
		dbg(`Leaving room`);

		// identify the server, which tells all other peers in room
		socket.emit("leaveRoom");

		// clean up
		Array.from(roomInfo.peers).forEach(p => {
			p[1].peer.destroy();
		});

		setRoomInfo({
			roomName: "",
			isConnected: false,
			isOwner: false,
			peers: new Map(),
			uuid: null,
			ownerName: null,
		});
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
				setNameHandler,
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
