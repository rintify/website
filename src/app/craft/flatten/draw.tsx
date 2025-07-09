import * as THREE from 'three'
import { Unfolded } from './utils';

export const PolygonSVG: React.FC<{polygons: Unfolded}> = ({ polygons }) => {
  const allPoints = polygons.flat(2);
  if (allPoints.length === 0) {
    return null;
  }

  const xs = allPoints.map(p => p.x);
  const ys = allPoints.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;

  const viewBox = `${minX} ${minY} ${width} ${height}`;

  return (
    <svg viewBox={viewBox} style={{ width: '20rem', height: 'auto', display: 'block' }}>
      {polygons.map((group, gi) => group.map((poly, pi) => (
        <polygon
          key={`poly-${gi}-${pi}`}
          points={poly.map(pt => `${pt.x},${pt.y}`).join(' ')}
          fill='none'
          stroke={'black'}
          strokeWidth={0.02} />
      ))
      )}
    </svg>
  );
};
