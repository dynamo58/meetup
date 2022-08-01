import { Instance } from "simple-peer";

export interface VideoParticipant {
	peer: Instance,
	stream: MediaStream,
	name: string,
	socketId: string,
};

export interface RoomUserSpecifics {
	roomName: string,
	isConnected: boolean,
	isOwner: boolean,
	// is `null` if `isOwner` is `true`
	ownerName: string | null,
	peers: VideoParticipant[],
	uuid: string | null,
}
