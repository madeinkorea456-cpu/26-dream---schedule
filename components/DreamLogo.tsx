// 인천대학교 홍보대사 "드림이" 로고를 그대로 복제하지 않고, 블루/골드 팔레트만 참고해
// 새로 그린 워드마크입니다. 실제 교표(엠블럼)와는 무관한 창작 SVG입니다.

function Sparkle({ x, y, size = 10 }: { x: number; y: number; size?: number }) {
  const h = size / 2;
  return (
    <path
      d={`M ${x} ${y - h} C ${x} ${y - h * 0.25}, ${x + h * 0.25} ${y}, ${x + h} ${y} C ${x + h * 0.25} ${y}, ${x} ${y + h * 0.25}, ${x} ${y + h} C ${x} ${y + h * 0.25}, ${x - h * 0.25} ${y}, ${x - h} ${y} C ${x - h * 0.25} ${y}, ${x} ${y - h * 0.25}, ${x} ${y - h} Z`}
      style={{ fill: "var(--gold)" }}
    />
  );
}

export function DreamMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="15" cy="15" r="14" style={{ fill: "var(--accent)" }} />
      <path
        d="M9 9 C9 9 17 9 19 11 C21 13 21 17 19 19 C17 21 9 21 9 21 Z"
        style={{ fill: "var(--accent-ink)" }}
      />
      <circle cx="22.5" cy="8.5" r="1.6" style={{ fill: "var(--gold)" }} />
    </svg>
  );
}

export function DreamWordmark() {
  return (
    <svg
      width="240"
      height="84"
      viewBox="0 0 240 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DREAM 26기 드림이 홍보대사 로고"
    >
      <Sparkle x={22} y={16} size={12} />
      <Sparkle x={220} y={24} size={8} />
      <text
        x="120"
        y="46"
        textAnchor="middle"
        style={{
          fill: "var(--accent)",
          fontFamily: "var(--font-kr)",
          fontWeight: 800,
          fontSize: "40px",
          letterSpacing: "0.02em",
        }}
      >
        DREAM
      </text>
      <path
        d="M20 58 C 70 68, 170 68, 220 58"
        stroke="var(--gold)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="120"
        y="78"
        textAnchor="middle"
        style={{
          fill: "var(--ink-soft)",
          fontFamily: "var(--font-kr)",
          fontWeight: 700,
          fontSize: "12px",
          letterSpacing: "0.15em",
        }}
      >
        26기 드림이 홍보대사
      </text>
    </svg>
  );
}
