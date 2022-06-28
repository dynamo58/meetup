export type UUID = string;

export interface ISocketConnectRes {
	socketId: string,
};

export interface IUserDisconnectedData {
	userSocketId: string,
};

export interface ICreateRoomData {
	roomName: string,
	roomPassword: string,
};

export interface ICreateRoomRes {
	isSuccess: boolean,
	errorMessage?: string,
	roomUuid?: UUID,
};

export interface IDeleteRoomRes {
	isSuccess: boolean,
	errorMessage?: string,
};

export interface IRoomEditedRes {
	isSuccess: boolean,
	errorMessage?: string,
};

export interface IJoinRoomData {
	roomUUID: UUID,
	roomPassword: string,
	nickname: string,
};

export interface IJoinRoomRes {
	isSuccess: true,
	errorMesage?: string,
	peerSocketIds: string[]
};

export interface ICallUserData {
	signalData: any,
	name: string,
	userToCallUUID: string,
};

export interface IUserIsCallingData {
	signalData: any,
	callerName: string,
	callerSocketId: string,
};

export interface IAnswerCallData {
	endpointSocketId: string,
	signalData: any,
};
