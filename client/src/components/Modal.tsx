import React, { useContext } from "react";

import {
	Text,
	Button,
	Stack,
	Center,
} from "@chakra-ui/react";

import { Context } from "../Context";

export interface ModalControls {
	heading: string,
	text: string,
	isVisible: boolean
}

const Modal: React.FC = () => {
	const { modal, setModal } = useContext(Context)!;

	return (
		<div style={{ textAlign: "center", position: "fixed", zIndex: 1, left: 0, top: 0, width: "100%", height: "100%", overflow: "auto", backgroundColor: "#00000055", display: `${modal.isVisible ? "flex" : "none"}`, justifyContent: "center", flexDirection: "column" }}>
			<Center backgroundColor={"isWarning"} maxW={"80%"} maxH={"50%"} marginLeft={"auto"} marginRight={"auto"} padding={"1em"} borderRadius={"1em"}>
				<Stack direction="column">
					<Text fontWeight={"bold"} fontSize={"1.3em"}>
						{modal.heading}
					</Text>
					<Text>
						{modal.text}
					</Text>
					<br />
					<Button
						alignSelf={"center"}
						variant={"transparent"}
						onClick={() => setModal({ isVisible: false, text: "", heading: "" })}
					>Close</Button>
				</Stack>
			</Center>
		</div>
	)
}

export default Modal;
