export type UUID = string;

export interface ISocketConnectResponse {
	socketId: string,
};

export interface IUserDisconnectedData {
	userSocketId: string,
};

export interface IMakeRoomData {
	roomName: string,
	_roomPassword: string,
};

export interface IMakeRoomResponse {
	isSuccess: boolean,
	errorMessage?: string,
	roomUuid?: UUID,
};

export interface IDeleteRoomResponse {
	isSuccess: boolean,
	errorMessage?: string,
};

export interface IRoomEditedResponse {
	isSuccess: boolean,
	errorMessage?: string,
};

export interface IJoinRoomData {
	isError: boolean,
	errorMesage?: string,
	roomUUID: UUID,
	roomPassword: string,
	nickname: string,
};

export interface IJoinRoomRes {
	isSuccess: true,
	errorMesage?: string,
	peerSocketIds: string[]
};
