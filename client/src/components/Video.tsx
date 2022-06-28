import React, {} from "react";

interface VideoProps {
	name: string,
	mute: boolean,
}

const Video = React.forwardRef<HTMLVideoElement, VideoProps>((props, ref) => {
	return (
		<div>
			<p>{props.name}</p>
			<video
				ref={ref}
				autoPlay
				muted={props.mute}
			></video>
		</div>
	)
});

export default Video;