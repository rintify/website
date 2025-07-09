import * as THREE from 'three'
import { Basis } from './world';

export function createColoredGrid(size: number, yAxisLength: number, colorX: string, colorY: string, colorZ: string, colorRest: string, opacity: number) {
  const step = 1;
  const halfSize = size / 2;

  const vertices = [], vertices2 = [];
  const colors = [], colors2 = [];

  const colorXVec = new THREE.Color(colorX);
  const colorZVec = new THREE.Color(colorZ);
  const colorYVec = new THREE.Color(colorY);
  const colorRestVec = new THREE.Color(colorRest);

  vertices.push(0, 0, 0, 0, yAxisLength, 0);
  colors.push(colorYVec.r, colorYVec.g, colorYVec.b);
  colors.push(colorYVec.r, colorYVec.g, colorYVec.b);

  vertices.push(0, 0, 0, yAxisLength, 0, 0);
  colors.push(colorXVec.r, colorXVec.g, colorXVec.b);
  colors.push(colorXVec.r, colorXVec.g, colorXVec.b);

  vertices.push(0, 0, 0, 0, 0, yAxisLength);
  colors.push(colorZVec.r, colorZVec.g, colorZVec.b);
  colors.push(colorZVec.r, colorZVec.g, colorZVec.b);

  for (let i = 0; i <= size; i++) {
    const v = (i * step) - halfSize;

    vertices2.push(-halfSize, v, 0, halfSize, v, 0);
    vertices2.push(v, -halfSize, 0, v, halfSize, 0);
    for (let j = 0; j < 4; j++) {
      colors2.push(colorRestVec.r, colorRestVec.g, colorRestVec.b);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const geometry2 = new THREE.BufferGeometry();
  geometry2.setAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3));
  geometry2.setAttribute('color', new THREE.Float32BufferAttribute(colors2, 3));

  const gridGroup = new THREE.Group();
  gridGroup.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ vertexColors: true })));
  gridGroup.add(new THREE.LineSegments(geometry2, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: opacity })));

  return gridGroup;
}

export function alignGrid(grid: THREE.Group, basis: Basis) {
  grid.position.copy(basis.o);

  const quaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(basis.x, basis.y, basis.z)
  );

  grid.quaternion.copy(quaternion);
}


function mergeVerticesInline(
  geom: THREE.BufferGeometry,
  tolerance = 1e-4
): THREE.BufferGeometry {
  const posAttr = geom.attributes.position as THREE.BufferAttribute
  const positions = posAttr.array as Float32Array
  const indices = geom.index ? Array.from(geom.index.array) : undefined

  const vertsMap: Record<string, number> = {}
  const unique: number[] = []
  const changes: number[] = []
  let nextIndex = 0

  // ① 全頂点をキーでグルーピング
  for (let i = 0; i < positions.length / 3; i++) {
    const x = positions[3 * i]
    const y = positions[3 * i + 1]
    const z = positions[3 * i + 2]
    const key = `${x.toFixed(4)}_${y.toFixed(4)}_${z.toFixed(4)}`

    if (vertsMap[key] === undefined) {
      vertsMap[key] = nextIndex
      unique.push(x, y, z)
      changes[i] = nextIndex
      nextIndex++
    } else {
      changes[i] = vertsMap[key]
    }
  }

  // ② 新しいインデックスを作成
  let newIndices: number[] = []
  if (indices) {
    newIndices = indices.map((origIdx) => changes[origIdx])
  } else {
    // 非インデックスジオメトリなら、各三角形の頂点を map し直す
    newIndices = []
    for (let i = 0; i < positions.length / 3; i += 3) {
      newIndices.push(changes[i], changes[i + 1], changes[i + 2])
    }
  }

  // ③ 新ジオメトリを構築
  const newGeom = new THREE.BufferGeometry()
  const posArray = new Float32Array(unique)
  newGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  newGeom.setIndex(newIndices)
  newGeom.computeVertexNormals()
  return newGeom
}

/**
 * 正 n 角錐ジオメトリを生成する
 * @param n 底面の辺数（>=3）
 * @param r 底面が外接する円の半径
 * @param h 頂点の高さ
 */
export function createRegularNPyramidGeometry(
  n: number,
  r: number,
  h: number
): THREE.BufferGeometry {
  if (n < 3) throw new Error('n must be >= 3')

  // 頂点配列（x,y,zを順に詰める）
  const positions: number[] = []

  // 1) 底面頂点を n 個
  for (let i = 0; i < n; i++) {
    const theta = (2 * Math.PI * i) / n
    positions.push(
      r * Math.cos(theta),
      r * Math.sin(theta),
      0
    )
  }

  // 2) 頂点（apex）
  positions.push(0, 0, h)
  const apexIndex = n

  // インデックス配列（三角形単位で３つずつ）
  const indices: number[] = []

  // 側面：底面 i→i+1→apex の三角形を n 枚
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n
    indices.push(i, next, apexIndex)
  }

  // 底面：0 番頂点を基準とした扇状に triangulate（n-2 枚）
  // （0, i+1, i） という順序で頂点の向きが上向きになるように
  for (let i = 1; i < n - 1; i++) {
    indices.push(0, i + 1, i)
  }

  // BufferGeometry に詰める
  const geom = new THREE.BufferGeometry()
  const posArray = new Float32Array(positions)
  geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  geom.setIndex(indices)
  geom.computeVertexNormals()

  return geom
}


export function createWeldedRegularNPyramidGeometry(
  n: number,
  r: number,
  h: number,
  weldTolerance = 1e-4
): THREE.BufferGeometry {
  // ① 通常の正 n 角錐を作成
  const geom = createRegularNPyramidGeometry(n, r, h);

  // ② 同一座標の頂点を tolerance 内でまとめる
  const welded = mergeVerticesInline(geom, weldTolerance);

  // ③ 法線だけ再計算（UV がなければ不要）
  welded.computeVertexNormals();

  return welded;
}