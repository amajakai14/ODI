import { useMemo } from 'react';

interface HexData {
  id: string;
  label: string;
  score: number; // 0-100 normalized
  riskLevel: string;
}

interface HexMapProps {
  data: HexData[];
  totalScore: number;
  classification: string;
}

const riskFill = (level: string) => {
  if (level === 'LOW') return { bg: '#059669', text: '#ffffff' };
  if (level === 'MODERATE') return { bg: '#d97706', text: '#ffffff' };
  if (level === 'HIGH') return { bg: '#ea580c', text: '#ffffff' };
  if (level === 'VERY HIGH') return { bg: '#dc2626', text: '#ffffff' };
  return { bg: '#7f1d1d', text: '#ffffff' };
};

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

export default function HexMap({ data, totalScore, classification }: HexMapProps) {
  const layout = useMemo(() => {
    const r = 72;
    const gap = 6;
    const h = r * Math.sqrt(3);
    // Honeycomb: top row 2, middle row 3 (offset), bottom row 1 center
    // Actually let's do: ring of 6 around center
    // Center hex for total score, 6 dimensions around it
    const cx = 280, cy = 210;
    const ringR = r * 1.82 + gap;

    const positions = data.map((_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      return { x: cx + ringR * Math.cos(angle), y: cy + ringR * Math.sin(angle) };
    });

    return { cx, cy, r, positions };
  }, [data]);

  const overallColor = riskFill(
    totalScore <= 20 ? 'LOW' : totalScore <= 40 ? 'MODERATE' : totalScore <= 60 ? 'HIGH' : totalScore <= 80 ? 'VERY HIGH' : 'CRITICAL'
  );

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 560 420" className="w-full max-w-[600px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Dimension hexagons */}
        {data.map((d, i) => {
          const { x, y } = layout.positions[i];
          const colors = riskFill(d.riskLevel);
          const fillOpacity = 0.15 + (d.score / 100) * 0.85;
          return (
            <g key={d.id}>
              <polygon
                points={hexPoints(x, y, layout.r)}
                fill={colors.bg}
                fillOpacity={fillOpacity}
                stroke={colors.bg}
                strokeWidth="2.5"
              />
              <text x={x} y={y - 16} textAnchor="middle" fill={colors.bg} fontSize="11" fontWeight="700">
                {d.label.length > 16 ? d.label.slice(0, 14) + '…' : d.label}
              </text>
              <text x={x} y={y + 6} textAnchor="middle" fill={colors.bg} fontSize="24" fontWeight="800">
                {d.score.toFixed(0)}
              </text>
              <text x={x} y={y + 24} textAnchor="middle" fill={colors.bg} fontSize="10" fontWeight="600">
                {d.riskLevel}
              </text>
            </g>
          );
        })}

        {/* Center hex — overall */}
        <polygon
          points={hexPoints(layout.cx, layout.cy, layout.r * 0.85)}
          fill={overallColor.bg}
          fillOpacity="0.9"
          stroke={overallColor.bg}
          strokeWidth="3"
        />
        <text x={layout.cx} y={layout.cy - 14} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600">
          ODI TOTAL
        </text>
        <text x={layout.cx} y={layout.cy + 12} textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">
          {totalScore.toFixed(0)}
        </text>
        <text x={layout.cx} y={layout.cy + 30} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">
          {classification}
        </text>
      </svg>
    </div>
  );
}
