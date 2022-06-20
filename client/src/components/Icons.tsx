import React, {} from "react";

import {
	Icon
} from "@chakra-ui/react";

const PulseIcon = (props: any) => (
	<Icon viewBox='0 0 24 24' {...props}>
		<circle cx="12" cy="12" r="0" fill="#00b099"><animate attributeName="r" calcMode="spline" dur="1.2s" values="0;11" keySplines=".52,.6,.25,.99" repeatCount="indefinite" /><animate attributeName="opacity" calcMode="spline" dur="1.2s" values="1;0" keySplines=".52,.6,.25,.99" repeatCount="indefinite" /></circle>
	</Icon>
);

// const PulseIcon: React.FC = () => {
// 	return (
// 		<svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="0" fill="#00b099"><animate attributeName="r" calcMode="spline" dur="1.2s" values="0;11" keySplines=".52,.6,.25,.99" repeatCount="indefinite" /><animate attributeName="opacity" calcMode="spline" dur="1.2s" values="1;0" keySplines=".52,.6,.25,.99" repeatCount="indefinite" /></circle></svg>
// 	)
// };

const ShowIcon = (props: any) => (
	<Icon  viewBox='0 0 24 24' {...props}>
		<path d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316-.105-.316C21.927 11.617 19.633 5 12 5zm0 11c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" /><path d="M12 10c-1.084 0-2 .916-2 2s.916 2 2 2 2-.916 2-2-.916-2-2-2z" />
	</Icon>
);


const HideIcon = (props: any) => (
	<Icon viewBox='0 0 24 24' {...props}>
		<g><path d="M51.8,25.1c-1.6-3.2-3.7-6.1-6.3-8.4L37,25.1c0,0.3,0,0.6,0,0.9c0,6.1-4.9,11-11,11c-0.3,0-0.6,0-0.9,0l-5.4,5.4c2,0.4,4.1,0.7,6.2,0.7c11.3,0,21.1-6.6,25.8-16.1C52.1,26.3,52.1,25.7,51.8,25.1z" /><path d="M48.5,5.6l-2.1-2.1C45.8,2.9,44.7,3,44,3.8l-7.3,7.3C33.4,9.7,29.8,9,26,9C14.7,9,4.9,15.6,0.2,25.1c-0.3,0.6-0.3,1.3,0,1.8c2.2,4.5,5.5,8.2,9.6,11L3.8,44c-0.7,0.7-0.8,1.8-0.3,2.4l2.1,2.1C6.2,49.1,7.3,49,8,48.2L48.2,8C49,7.3,49.1,6.2,48.5,5.6z M15,26c0-6.1,4.9-11,11-11c2,0,3.8,0.5,5.4,1.4l-3,3C27.6,19.2,26.8,19,26,19c-3.9,0-7,3.1-7,7c0,0.8,0.2,1.6,0.4,2.4l-3,3C15.5,29.8,15,28,15,26z" /></g>
	</Icon>
);



export { PulseIcon, ShowIcon, HideIcon };