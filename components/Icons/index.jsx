import Svg, { Path } from "react-native-svg";

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
