import Svg, { Path, Circle } from "react-native-svg";

export function PlayIcon() {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="14"
      viewBox="0 0 11 14"
      fill="none"
    >
      <Path
        d="M0.015625 0.015625L10.9844 7L0.015625 13.9844V0.015625Z"
        fill="#021123"
      />
    </Svg>
  );
}

export function PauseIcon() {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
    >
      <Path
        d="M8.01562 0.015625H12V13.9844H8.01562V0.015625ZM0 13.9844V0.015625H3.98438V13.9844H0Z"
        fill="#021123"
      />
    </Svg>
  );
}

export const IconEdit = () => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 32 32"
      fill="none"
    >
      <Path
        d="M24.7188 11.0312L22.8906 12.8594L19.1406 9.10938L20.9688 7.28125C21.1562 7.09375 21.3906 7 21.6719 7C21.9531 7 22.1875 7.09375 22.375 7.28125L24.7188 9.625C24.9062 9.8125 25 10.0469 25 10.3281C25 10.6094 24.9062 10.8438 24.7188 11.0312ZM7 21.25L18.0625 10.1875L21.8125 13.9375L10.75 25H7V21.25Z"
        fill="#021123"
      />
      <Circle cx="16" cy="16" r="15.5" stroke="#021123" />
    </Svg>
  );
};
export const IconDelete = () => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 10 12"
      fill="none"
    >
      <Path
        d="M7.34375 0.65625H9.65625V2H0.34375V0.65625H2.65625L3.34375 0H6.65625L7.34375 0.65625ZM2.34375 4V10.6562H7.65625V4H2.34375ZM1 10.6562V2.65625H9V10.6562C9 11.0104 8.86458 11.3229 8.59375 11.5938C8.32292 11.8646 8.01042 12 7.65625 12H2.34375C1.98958 12 1.67708 11.8646 1.40625 11.5938C1.13542 11.3229 1 11.0104 1 10.6562Z"
        fill="#021123"
      />
    </Svg>
  );
};
export const IconDeleteA = () => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 10 12"
      fill="none"
    >
      <Path
        d="M7.34375 0.65625H9.65625V2H0.34375V0.65625H2.65625L3.34375 0H6.65625L7.34375 0.65625ZM2.34375 4V10.6562H7.65625V4H2.34375ZM1 10.6562V2.65625H9V10.6562C9 11.0104 8.86458 11.3229 8.59375 11.5938C8.32292 11.8646 8.01042 12 7.65625 12H2.34375C1.98958 12 1.67708 11.8646 1.40625 11.5938C1.13542 11.3229 1 11.0104 1 10.6562Z"
        fill="#021123"
      />
    </Svg>
  );
};
export const IconAdd = ({ outline }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M15.0156 10.9844V9.01562H10.9844V4.98438H9.01562V9.01562H4.98438V10.9844H9.01562V15.0156H10.9844V10.9844H15.0156ZM2.92188 2.96875C4.89062 1 7.25 0.015625 10 0.015625C12.75 0.015625 15.0938 1 17.0312 2.96875C19 4.90625 19.9844 7.25 19.9844 10C19.9844 12.75 19 15.1094 17.0312 17.0781C15.0938 19.0156 12.75 19.9844 10 19.9844C7.25 19.9844 4.89062 19.0156 2.92188 17.0781C0.984375 15.1094 0.015625 12.75 0.015625 10C0.015625 7.25 0.984375 4.90625 2.92188 2.96875Z"
        fill={outline ? "#021123" : "#B872FF"}
      />
    </Svg>
  );
};

export const IconSave = () => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <Path
        d="M8 4V1.34375H1.34375V4H8ZM4.59375 10.0625C4.98958 10.4583 5.45833 10.6562 6 10.6562C6.54167 10.6562 7.01042 10.4583 7.40625 10.0625C7.80208 9.66667 8 9.19792 8 8.65625C8 8.11458 7.80208 7.64583 7.40625 7.25C7.01042 6.85417 6.54167 6.65625 6 6.65625C5.45833 6.65625 4.98958 6.85417 4.59375 7.25C4.19792 7.64583 4 8.11458 4 8.65625C4 9.19792 4.19792 9.66667 4.59375 10.0625ZM9.34375 0L12 2.65625V10.6562C12 11.0104 11.8646 11.3229 11.5938 11.5938C11.3229 11.8646 11.0104 12 10.6562 12H1.34375C0.96875 12 0.645833 11.875 0.375 11.625C0.125 11.3542 0 11.0312 0 10.6562V1.34375C0 0.96875 0.125 0.65625 0.375 0.40625C0.645833 0.135417 0.96875 0 1.34375 0H9.34375Z"
        fill="#021123"
      />
    </Svg>
  );
};
export const IconCheck = ({ checked }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <Circle cx="12" cy="12" r="12" fill={checked ? "#00F4BF" : "white"} />
      <Path
        d="M9 16.1719L19.5938 5.57812L21 6.98438L9 18.9844L3.42188 13.4062L4.82812 12L9 16.1719Z"
        fill="#021123"
      />
    </Svg>
  );
};

export function MusicIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M9 18V5L21 3V16" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M6 21C7.66 21 9 19.66 9 18C9 16.34 7.66 15 6 15C4.34 15 3 16.34 3 18C3 19.66 4.34 21 6 21Z" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M18 19C19.66 19 21 17.66 21 16C21 14.34 19.66 13 18 13C16.34 13 15 14.34 15 16C15 17.66 16.34 19 18 19Z" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  );
}

export function PauseCircleIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M10 15V9" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M14 15V9" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  );
}