import { SvgProps } from "types";

export const EmailIcon: React.FC<SvgProps> = ({
  width = 24,
  height = 24,
  fill = "black",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 1.5l8 5 8-5v1.5l-8 5-8-5V5.5z"
        fill={fill}
      />
    </svg>
  );
};
