import { useMemo } from 'react';

interface HexData {
  id: string;
  label: string;
  score: number;
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
  const cx = 300, cy = 280, maxR = 160;
  const n = data.length;

  const axes = useMemo(() => {
    return data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return angle;
    });
  }, [data, n]);

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const gridPaths = gridLevels.map(pct => {
    const r = maxR * pct;
    const points = axes.map(a => polarToXY(cx, cy, a, r));
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  const dataPoints = data.map((d, i) => {
    const r = (d.score / 100) * maxR;
    return polarToXY(cx, cy, axes[i], r);
  });
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const overallLevel = totalScore <= 20 ? 'LOW' : totalScore <= 40 ? 'MODERATE' : totalScore <= 60 ? 'HIGH' : totalScore <= 80 ? 'VERY HIGH' : 'CRITICAL';
  const fillColor = riskColor(overallLevel);

  // Compute label anchor based on angle to avoid overlap
  const getLabelAnchor = (angle: number) => {
    const deg = ((angle * 180) / Math.PI + 360) % 360;
    if (deg > 80 && deg < 100) return 'middle'; // bottom
    if (deg > 260 && deg < 280) return 'middle'; // top
    if (deg >= 90 && deg <= 270) return 'end';
    return 'start';
  };

  const getLabelDy = (angle: number) => {
    const deg = ((angle * 180) / Math.PI + 360) % 360;
    if (deg > 250 && deg < 290) return -6; // top — push up
    if (deg > 70 && deg < 110) return 14; // bottom — push down
    return 4;
  };

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 600 560" className="w-full max-w-[600px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
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

        {/* Grid labels */}
        {gridLevels.map((pct, i) => (
          <text key={i} x={cx + 4} y={cy - maxR * pct + 4} fontSize="9" fill="#9ca3af" textAnchor="start">
            {pct * 100}
          </text>
        ))}

        {/* Data polygon */}
        <polygon
          points={dataPath}
          fill={fillColor}
          fillOpacity="0.15"
          stroke={fillColor}
          strokeWidth="2.5"
        />

        {/* Data points and dimension labels */}
        {data.map((d, i) => {
          const r = (d.score / 100) * maxR;
          const pt = polarToXY(cx, cy, axes[i], r);
          const labelPt = polarToXY(cx, cy, axes[i], maxR + 30);
          const scorePt = polarToXY(cx, cy, axes[i], maxR + 48);
          const color = riskColor(d.riskLevel);
          const anchor = getLabelAnchor(axes[i]);
          const dy = getLabelDy(axes[i]);

          return (
            <g key={d.id}>
              <circle cx={pt.x} cy={pt.y} r="5" fill={color} stroke="#fff" strokeWidth="2" />
              <text x={labelPt.x} y={labelPt.y} dy={dy} textAnchor={anchor} fontSize="11" fontWeight="700" fill="#374151">
                {d.label}
              </text>
              <text x={scorePt.x} y={scorePt.y} dy={dy} textAnchor={anchor} fontSize="10" fontWeight="600" fill={color}>
                {d.score.toFixed(0)} — {d.riskLevel}
              </text>
            </g>
          );
        })}

        {/* Center label */}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">ODI TOTAL</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="28" fontWeight="800" fill={fillColor}>{totalScore.toFixed(0)}</text>
        <text x={cx} y={cy + 36} textAnchor="middle" fontSize="10" fontWeight="600" fill={fillColor}>{classification}</text>
      </svg>
    </div>
  );
}
