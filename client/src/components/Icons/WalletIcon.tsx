import { SvgProps } from "types";

export const WalletIcon: React.FC<SvgProps> = ({
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
        d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 11h-4c-1.1 0-2-.9-2-2s.9-2 2-2h4v4zm0-6H4V6h16v3z"
        fill={fill}
      />
    </svg>
  );
};
