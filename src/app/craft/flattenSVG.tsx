import * as THREE from 'three'

type UnfoldResult = { polys: number[][]; forest: Tree[]; adjs: Record<string, number[]> }

type Tree = { t: number; c: Tree[]; a: number; b: number }

export function flatten(vertices: THREE.Vector3[], { polys, forest, adjs }: UnfoldResult) {
  const pointss: THREE.Vector2[][][] = []
  for (const f of forest) {
    const points: THREE.Vector2[][] = []
    pointss.push(points)
    visit(new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), f)

    function visit(a: THREE.Vector2, b: THREE.Vector2, tree: Tree) {
      const poly = polys[tree.t]
      const ai = poly.indexOf(tree.a)
      const bi = poly.indexOf(tree.b)
      const originPoints = to2D(
        poly.map(vi => vertices[vi]),
        ai,
        bi
      )
      const opints = align2DPolygon(originPoints, ai, bi, a, b)
      points.push(opints)
      for (const cTree of tree.c) {
        visit(opints[poly.indexOf(cTree.a)], opints[poly.indexOf(cTree.b)], cTree)
      }
    }
  }
  return pointss
}

export function to2D(vertices: THREE.Vector3[], i: number, j: number): THREE.Vector2[] {
  const N = vertices.length
  if (N < 3) return []

  const vi = vertices[i]
  const vip1 = vertices[j]

  const next_i = (i + 1) % N
  const prev_i = (i - 1 + N) % N

  const k = j === next_i ? prev_i : next_i
  const vim1 = vertices[k]

  const shifted = vertices.map(v => v.clone().sub(vi))

  const u = vip1.clone().sub(vi).normalize()

  const edgePrev = vim1.clone().sub(vi)

  const n = new THREE.Vector3().crossVectors(vip1.clone().sub(vi), edgePrev).normalize()

  const w = new THREE.Vector3().crossVectors(n, u).normalize()

  return shifted.map(p => new THREE.Vector2(p.dot(u), p.dot(w)))
}

function align2DPolygon(
  projected: THREE.Vector2[],
  i: number,
  j: number,
  a: THREE.Vector2,
  b: THREE.Vector2
): THREE.Vector2[] {
  if (projected.length < 2) return []

  if (signedArea(projected) < 0) {
    projected = projected.map(p => new THREE.Vector2(p.x, -p.y))
  }

  const pA = projected[i]
  const pB = projected[j]
  const L = pA.distanceTo(pB)

  const target = new THREE.Vector2(b.x - a.x, b.y - a.y)
  const D = target.length()
  const theta = Math.atan2(target.y, target.x)

  const s = D / L

  return projected.map(p => {
    const q = p.clone().multiplyScalar(s)

    q.rotateAround(new THREE.Vector2(0, 0), theta)

    return q.add(new THREE.Vector2(a.x, a.y))
  })
}

function signedArea(points: THREE.Vector2[]): number {
  let area = 0
  const N = points.length
  for (let k = 0; k < N; k++) {
    const p1 = points[k]
    const p2 = points[(k + 1) % N]
    area += p1.x * p2.y - p2.x * p1.y
  }
  return area / 2
}

type Props = {
  polygons: THREE.Vector2[][][]
}

const PolygonSVG: React.FC<Props> = ({ polygons }) => {
  const allPoints = polygons.flat(2)
  if (allPoints.length === 0) {
    return null
  }

  const xs = allPoints.map(p => p.x)
  const ys = allPoints.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const width = maxX - minX
  const height = maxY - minY

  const viewBox = `${minX} ${minY} ${width} ${height}`

  return (
    <svg viewBox={viewBox} style={{ width: '20rem', height: 'auto', display: 'block' }}>
      {polygons.map((group, gi) =>
        group.map((poly, pi) => (
          <polygon
            key={`poly-${gi}-${pi}`}
            points={poly.map(pt => `${pt.x},${pt.y}`).join(' ')}
            fill='none'
            stroke={'black'}
            strokeWidth={0.02}
          />
        ))
      )}
    </svg>
  )
}

export default PolygonSVG
