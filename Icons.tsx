import type { ReactElement } from "react";

export type IconName =
  | "home" | "search" | "library" | "heart" | "heart-filled" | "clock" | "play" | "pause" | "next"
  | "previous" | "volume" | "volume-muted" | "plus" | "trash" | "up" | "down" | "music" | "user"
  | "logout" | "edit" | "x" | "check";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const HEART =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

function glyph(name: IconName): ReactElement {
  switch (name) {
    case "home":
      return <path d="M12 3.2 3 10.6V21h6.4v-6.2h5.2V21H21V10.6L12 3.2z" />;
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="6.5" {...stroke} />
          <path d="m16 16 4.5 4.5" {...stroke} />
        </>
      );
    case "library":
      return <path d="M4 4h3v16H4V4zm5 0h3v16H9V4zm5.6 1.3 2.9-.8 3.7 14.3-2.9.8-3.7-14.3z" />;
    case "heart":
      return <path d={HEART} {...stroke} />;
    case "heart-filled":
      return <path d={HEART} />;
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" {...stroke} />
          <path d="M12 7.5V12l3 2" {...stroke} />
        </>
      );
    case "play":
      return <path d="M8 5.5v13l11-6.5-11-6.5z" />;
    case "pause":
      return <path d="M7 5h3.5v14H7V5zm6.5 0H17v14h-3.5V5z" />;
    case "next":
      return <path d="M6 6.5v11l8.5-5.5L6 6.5zM16 6h2.2v12H16V6z" />;
    case "previous":
      return <path d="M18 6.5v11L9.5 12 18 6.5zM5.8 6H8v12H5.8V6z" />;
    case "volume":
      return (
        <>
          <path d="M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4z" />
          <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...stroke} />
        </>
      );
    case "volume-muted":
      return (
        <>
          <path d="M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4z" />
          <path d="m16 9.5 5 5m0-5-5 5" {...stroke} />
        </>
      );
    case "plus":
      return <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" />;
    case "trash":
      return <path d="M9 4h6l.8 1.6H20v2H4v-2h4.2L9 4zM6 9.5h12l-.9 10.5H6.9L6 9.5z" />;
    case "up":
      return <path d="m6.5 14.5 5.5-5.5 5.5 5.5" {...stroke} />;
    case "down":
      return <path d="m6.5 9.5 5.5 5.5 5.5-5.5" {...stroke} />;
    case "music":
      return <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />;
    case "user":
      return (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20.5c0-4.1 3.6-6.5 8-6.5s8 2.4 8 6.5H4z" />
        </>
      );
    case "logout":
      return (
        <>
          <path d="M9 4H5v16h4v-2H7V6h2V4z" />
          <path d="M11 12h9m0 0-3.5-3.5M20 12l-3.5 3.5" {...stroke} />
        </>
      );
    case "edit":
      return <path d="m14.5 5.5 4 4M5 19l.8-3.8L16 5l3 3L8.8 18.2 5 19z" {...stroke} />;
    case "x":
      return <path d="m6.5 6.5 11 11m0-11-11 11" {...stroke} />;
    case "check":
      return <path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} />;
  }
}

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {glyph(name)}
    </svg>
  );
}
