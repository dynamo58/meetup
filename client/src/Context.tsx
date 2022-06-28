import React, { createContext, useState, useRef, useEffect, RefObject, PropsWithChildren, MutableRefObject } from "react";
import { io } from "socket.io-client";
import Peer, { Instance, SignalData } from "simple-peer";

import { ISocketConnectRes, IJoinRoomData, IJoinRoomRes, IUserIsCallingData, IAnswerCallData, ICreateRoomData, ICreateRoomRes } from "../../shared/shared";


interface VideoParticipant {
	peer: Instance,
	stream: MediaStream,
	name: string | null,
};

interface ISocketContext {
	callAccepted: boolean,
	callEnded: boolean,
	ownVideo: RefObject<HTMLVideoElement>,
	userVideo: RefObject<HTMLVideoElement>,
	stream: MediaStream | undefined,
	name: string,
	setName: React.Dispatch<React.SetStateAction<string>>,
	socketId: string,
	createRoom: (roomUUID: string, roomPassword: string) => void,
	joinRoom: (roomUUID: string, roomPassword: string) => void,
	leaveRoom: () => void,
};

const SocketContext = createContext<ISocketContext | undefined>(undefined);
const socket = io("http://localhost:3001");

const ContextProvider = (props: PropsWithChildren) => {
	const ownVideo = useRef<HTMLVideoElement>(null);
	const userVideo = useRef<HTMLVideoElement>(null);
	const connRef: MutableRefObject<Instance | null>  = useRef(null);

	const videoParticipants = new Map<string, VideoParticipant>();

	const [stream, setStream]               = useState<MediaStream | undefined>(undefined);
	const [socketId, setSocketId]           = useState("");
	const [callAccepted, setCallAccepted]   = useState(false);
	const [callEnded, setCallEnded]         = useState(false);
	const [name, setName]                   = useState("");
	
	const [isModalVisible, setModalVisible] = useState(false);
	const [modalHeading, setModalHeading]   = useState("");
	const [modalText, setModalText]         = useState("");

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		}).then((_stream) => {
			setStream(_stream);
			ownVideo!.current!.srcObject = _stream;
		});

		socket.on("connectionRes", ({ socketId }: ISocketConnectRes) => {
			setSocketId(socketId);
		});

		socket.on("userIsCalling", (data: IUserIsCallingData) => {
			const peer = new Peer({
				initiator: false,
				trickle: false,
				stream,
			});

			peer.on("signal", (signalData) => {
				socket.emit("answerCall", {
					endpointSocketId: data.callerSocketId,
					signalData
				} as IAnswerCallData);
			});

			peer.on("stream", (_stream) => {
				let ref = React.createRef<HTMLVideoElement>();
				ref.current!.srcObject = _stream;

				videoParticipants.set(data.callerSocketId, {
					name: data.callerName,
					stream: _stream,
					peer,
					ref,
				} as VideoParticipant)
			});
		})
	}, []);

	const joinRoom = (roomUUID: string, roomPassword: string) => {
		socket.emit("joinRoom", {
			roomUUID,
			roomPassword,
			nickname: name,
		} as IJoinRoomData);

		socket.on("joinRoomRes", (data: IJoinRoomRes) => {
			if (!data.isSuccess) {
				setModalHeading("Error while attempting to connect");
				setModalText(data.errorMesage!);
				setModalVisible(true);
				return;
			}

			for (const id of data.peerSocketIds) {
				const peer = new Peer({
					initiator: true,
					trickle: false,
					stream,
				});

				peer.on("signal", (data) => {
					socket.emit("callUser", {
						userToCall: id,
						sessionSignal: data,
						from: socketId,
						name
					});
				});

				peer.on("stream", (_stream) => {
					let ref = React.createRef<HTMLVideoElement>();
					ref.current!.srcObject = _stream;

					videoParticipants.set(id, {
						name: null,
						stream: _stream,
						peer,
						ref: ref,
					} as VideoParticipant);
				});

				socket.on("callAccepted", (signal: SignalData) => {
					setCallAccepted(true);
					peer.signal(signal);
				});

				connRef.current = peer;
			}
		});
	}

	const createRoom = (roomName: string, roomPassword: string) => {
		socket.emit("createRoom", {
			roomName,
			roomPassword
		} as ICreateRoomData);

		socket.on("createRoomRes", (data: ICreateRoomRes) => {
			if (!data.isSuccess) {
				setModalHeading("Error creating the room");
				setModalText(data.errorMessage!);
				setModalVisible(true);
				return;
			}

			
		});
	}

	const leaveRoom = () => {
		setCallEnded(true);
		connRef.current!.destroy();
	};

	return (
		<SocketContext.Provider value={{
				callAccepted,
				callEnded,
				ownVideo,
				userVideo,
				stream,
				name,
				setName,
				socketId,
				leaveRoom,
				joinRoom,
				createRoom
			}}
		>
			{props.children}
		</SocketContext.Provider>
	);
};

export { ContextProvider, SocketContext };
export type { ISocketContext };