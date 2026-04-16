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

const riskColor = (level: string) => {
  if (level === 'LOW') return '#059669';
  if (level === 'MODERATE') return '#d97706';
  if (level === 'HIGH') return '#ea580c';
  if (level === 'VERY HIGH') return '#dc2626';
  return '#7f1d1d';
};

function polarToXY(cx: number, cy: number, angle: number, r: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export default function HexMap({ data, totalScore, classification }: HexMapProps) {
  const cx = 250, cy = 230, maxR = 160;
  const n = data.length; // 6

  const axes = useMemo(() => {
    return data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return angle;
    });
  }, [data, n]);

  // Grid hexagons at 20%, 40%, 60%, 80%, 100%
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const gridPaths = gridLevels.map(pct => {
    const r = maxR * pct;
    const points = axes.map(a => polarToXY(cx, cy, a, r));
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Data polygon
  const dataPoints = data.map((d, i) => {
    const r = (d.score / 100) * maxR;
    return polarToXY(cx, cy, axes[i], r);
  });
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Overall fill color based on total
  const overallLevel = totalScore <= 20 ? 'LOW' : totalScore <= 40 ? 'MODERATE' : totalScore <= 60 ? 'HIGH' : totalScore <= 80 ? 'VERY HIGH' : 'CRITICAL';
  const fillColor = riskColor(overallLevel);

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 500 460" className="w-full max-w-[550px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {/* Grid hexagons */}
        {gridPaths.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray={i < gridLevels.length - 1 ? '4,4' : '0'}
          />
        ))}

        {/* Axis lines */}
        {axes.map((a, i) => {
          const end = polarToXY(cx, cy, a, maxR);
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e5e7eb" strokeWidth="1" />;
        })}

        {/* Grid labels (percentages) */}
        {gridLevels.map((pct, i) => (
          <text key={i} x={cx + 4} y={cy - maxR * pct + 4} fontSize="9" fill="#9ca3af" textAnchor="start">
            {pct * 100}
          </text>
        ))}

        {/* Data polygon */}
        <polygon
          points={dataPath}
          fill={fillColor}
          fillOpacity="0.2"
          stroke={fillColor}
          strokeWidth="2.5"
        />

        {/* Data points and dimension labels */}
        {data.map((d, i) => {
          const r = (d.score / 100) * maxR;
          const pt = polarToXY(cx, cy, axes[i], r);
          const labelPt = polarToXY(cx, cy, axes[i], maxR + 28);
          const scorePt = polarToXY(cx, cy, axes[i], maxR + 44);
          const color = riskColor(d.riskLevel);

          return (
            <g key={d.id}>
              <circle cx={pt.x} cy={pt.y} r="5" fill={color} stroke="#fff" strokeWidth="2" />
              <text x={labelPt.x} y={labelPt.y} textAnchor="middle" fontSize="11" fontWeight="700" fill="#374151">
                {d.label}
              </text>
              <text x={scorePt.x} y={scorePt.y} textAnchor="middle" fontSize="10" fontWeight="600" fill={color}>
                {d.score.toFixed(0)} — {d.riskLevel}
              </text>
            </g>
          );
        })}

        {/* Center label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">ODI TOTAL</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="26" fontWeight="800" fill={fillColor}>{totalScore.toFixed(0)}</text>
        <text x={cx} y={cy + 32} textAnchor="middle" fontSize="9" fontWeight="600" fill={fillColor}>{classification}</text>
      </svg>
    </div>
  );
}
