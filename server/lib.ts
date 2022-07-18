import { Socket } from "socket.io";
import { UUID } from "../shared/shared";


interface IUser {
	name: string,
	socket: Socket,
}

export class User implements IUser {
	name: string;
	socket: Socket;

	constructor(name: string, socket: Socket) {
		this.name = name;
		this.socket = socket;
	}
}


interface IRoom {
	uuid: string,
	name: string,
	password: string,
	owner: User,
	participants: User[],
}

export class Room implements IRoom {
	participants: User[];
	uuid: string;
	owner: User;
	name: string;
	password: string;

	constructor(uuid: string, name: string, password: string, owner: User) {
		this.uuid = uuid;
		this.name = name;
		this.password = password;
		this.owner = owner;
		this.participants = [];
	}

	getIds(): string[] {
		return [this.owner.socket.id, ...this.participants.map((p) => p.socket.id)];
	};
}


export interface UserRoomLookup {
	isConnected: boolean,
	isOwner: boolean,
	uuid: UUID,
	name: string,
}
