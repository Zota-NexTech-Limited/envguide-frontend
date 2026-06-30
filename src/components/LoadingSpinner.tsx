import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: { box: 28, logo: 14, stroke: 2 },
  md: { box: 44, logo: 22, stroke: 2.5 },
  lg: { box: 60, logo: 30, stroke: 2.5 },
} as const;

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label,
  className = "",
}) => {
  const d = SIZE_MAP[size];
  const center = d.box / 2;
  const r = center - d.stroke;
  const circ = 2 * Math.PI * r;

  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      className={`inline-flex flex-col items-center ${className}`}
    >
      <div
        className="relative"
        style={{ width: d.box, height: d.box }}
      >
        <svg
          aria-hidden
          width={d.box}
          height={d.box}
          viewBox={`0 0 ${d.box} ${d.box}`}
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "1.2s" }}
        >
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="#16a34a"
            strokeWidth={d.stroke}
            strokeLinecap="round"
            strokeDasharray={`${circ * 0.3} ${circ * 0.7}`}
          />
        </svg>

        <img
          src="/logo.png"
          alt=""
          draggable={false}
          className="absolute select-none object-contain animate-enviraan-pulse"
          style={{
            width: d.logo,
            height: d.logo,
            top: "50%",
            left: "50%",
          }}
        />
      </div>

      {label && (
        <p className="mt-3 text-sm text-slate-500">{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
