import React, {} from "react";



const PulseIcon: React.FC = () => {
	return (
		<svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="0" fill="#00b099"><animate attributeName="r" calcMode="spline" dur="1.2s" values="0;11" keySplines=".52,.6,.25,.99" repeatCount="indefinite" /><animate attributeName="opacity" calcMode="spline" dur="1.2s" values="1;0" keySplines=".52,.6,.25,.99" repeatCount="indefinite" /></circle></svg>
	)
};

export { PulseIcon };