import React, { createContext, useState, useRef, RefObject, PropsWithChildren, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

import { IGetRoomsRes, ISocketConnectRes, IJoinRoomData, IJoinRoomRes, IUserIsCallingData, IAnswerCallData, ICreateRoomData, ICreateRoomRes, IEditRoomRes, ICallUserData, ICallAcceptedData, IEditRoomData, IUserDisconnectedData, IChangeNameData, IChangeNameRes, IRoomEdited } from "../../shared/socket";

import { ModalControls } from "./components/Modal";

import { RoomUserSpecifics } from "./lib"

export function dbg(a: any) {
	// if (IS_DEBUG_MODE)
	console.log(`[${(new Date()).toLocaleTimeString("cs-CZ")}] ${a}`);
}

interface ISocketContext {
	ownVideoRef: RefObject<HTMLVideoElement>,
	name: string,
	setNameHandler: () => void,
	socketId: string,
	createRoom: (roomUUID: string, roomPassword: string) => void,
	joinRoom: (roomUUID: string, roomPassword: string) => void,
	leaveRoomHandler: () => void,
	initVideo: () => void,
	updateRoom: (arg0: IEditRoomData) => void,
	roomInfo: RoomUserSpecifics,
	getRooms: () => void,
	rooms: IGetRoomsRes | null,
	modal: ModalControls,
	setModal: React.Dispatch<React.SetStateAction<ModalControls>>,
};

const SocketContext = createContext<ISocketContext | undefined>(undefined);
const socket = io("http://localhost:3001");


const ContextProvider = (props: PropsWithChildren) => {
	let [myStream, setMyStream] = useState<MediaStream>();
	const [socketId, setSocketId] = useState("");
	const [name, setName] = useState("");

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
		peers: [],
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
		const newName = (document.getElementById("newName")! as HTMLInputElement).value;

		if (newName === "") {
			setModal({
				heading: "Error changing name",
				text: "You must set a valid name!",
				isVisible: true,
			});
			return;
		}

		socket.emit("changeName", {
			newName,
		} as IChangeNameData)

		socket.on("changeNameRes", (data: IChangeNameRes) => {
			dbg(`Received name change response`);

			if (!data.isSuccess) {
				setModal({
					heading: "Error changing name",
					text: data.errorMessage || "",
					isVisible: true,
				});
				return;
			}

			dbg(`Name changed to ${newName}`)
			setName(newName);
			localStorage.setItem("name", newName);
		});
	}

	useEffect(() => {
		const recoveredName = localStorage.getItem("name");
		if (recoveredName) {
			setName(recoveredName);
			(document.getElementById("newName")! as HTMLInputElement).value = recoveredName;
		}

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
			});

			peer.on("stream", (_stream) => {
				dbg(`Stream from user ${data.callerSocketId}`);

				setRoomInfo((i) => ({
					isOwner: i.isOwner,
					peers: [...i.peers, {
						name: data.callerName,
						stream: _stream,
						peer,
						socketId: data.callerSocketId
					}],
					isConnected: i.isConnected,
					uuid: i.uuid,
					ownerName: i.ownerName,
					roomName: i.roomName
				}))
			});
			peer.signal(data.signalData);
		});

		socket.on("promotedToOwner", () => {
			setRoomInfo((i) => ({
				...i,
				isOwner: true,
			}));
		});

		socket.on("userDisconnected", (data: IUserDisconnectedData) => {

		});

		const roomEditedHandler = (data: IRoomEdited) => {
			setRoomInfo((i) => ({
				...i,
				roomName: data.roomName,
			}));
			// setRoomName(data.roomName);
		}
		socket.on("roomEdited", (data: IRoomEdited) => roomEditedHandler(data));
	}, [])

	const initVideo = () => {
		getStream()
			.then((st) => {
				if (st === null) {
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

			for (const id of joinRoomData.peerSocketIds!) {
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

					setRoomInfo((i) => ({
						isOwner: false,
						peers: [...i.peers, {
							name: "xd",
							stream: _stream,
							peer,
							socketId: id,
						}],
						isConnected: true,
						uuid: roomUUID,
						ownerName: joinRoomData.ownerName!,
						roomName: joinRoomData.roomName!
					}));
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

			setRoomInfo((i) => ({
				isOwner: true,
				peers: i.peers,
				isConnected: true,
				uuid: data.roomUuid!,
				ownerName: name,
				roomName,
			}));
		});
	}

	// update the current room
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

			dbg(`Room ${roomInfo.roomName} successfully edited`);
			setRoomInfo((i) => ({
				...i,
				roomName: arg0.roomName!,
			}));
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

	// gets triggered everytime user goes out of the `/room` endpoint 
	const leaveRoomHandler = () => {
		if (!roomInfo.isConnected) return;
		dbg(`Leaving room`);

		// identify the server, which tells all other peers in room
		socket.emit("leaveRoom");

		// clean up
		roomInfo.peers.forEach(p => {
			p.peer.destroy();
		});

		setRoomInfo(_ => ({
			roomName: "",
			isConnected: false,
			isOwner: false,
			peers: [],
			uuid: null,
			ownerName: null,
		}));
	};

	return (
		<SocketContext.Provider value={{
			setModal,
			modal,
			rooms,
			getRooms,
			updateRoom,
			initVideo,
			ownVideoRef,
			name,
			setNameHandler,
			socketId,
			leaveRoomHandler,
			joinRoom,
			createRoom,
			roomInfo,
		}}
		>
			{props.children}
		</SocketContext.Provider>
	);
};

export { ContextProvider, SocketContext };
export type { ISocketContext };
