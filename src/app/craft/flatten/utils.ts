import * as THREE from 'three';

export function createEdgeKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`
}

export function makePairs<T>(arr: T[]): [T, T][] {
  const result: [T, T][] = []
  if (arr.length < 2) return result
  for (let i = 0; i < arr.length; i++) {
    result.push([arr[i], arr[(i + 1) % arr.length]])
  }
  return result
}

export function signedArea(points: THREE.Vector2[]): number {
  let area = 0;
  const N = points.length;
  for (let k = 0; k < N; k++) {
    const p1 = points[k];
    const p2 = points[(k + 1) % N];
    area += p1.x * p2.y - p2.x * p1.y;
  }
  return area / 2;
}

export type CraftyMesh = {
  verts: THREE.Vector3[];
  tris: number[][];
};

export type UnfoldedTree = { pi: number; cs: UnfoldedTree[]; a: number; b: number }
export type UnfoldedPolygon = THREE.Vector2[]
export type UnfoldedFragment = UnfoldedPolygon[]
export type Unfolded = UnfoldedFragment[]

export function toCraftyMesh(geometry: THREE.BufferGeometry): CraftyMesh {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  const values = posAttr.array as Float32Array;
  const indexAttr = geometry.index;
  const indices = indexAttr ? (indexAttr.array as Uint16Array | Uint32Array) : undefined;

  const tris: [number, number, number][] = [];
  const verts: THREE.Vector3[] = [];

  for (let i = 0; i < values.length; i += 3) {
    verts.push(new THREE.Vector3(values[i], values[i + 1], values[i + 2]));
  }

  if (indices) {
    for (let i = 0; i < indices.length; i += 3) {
      tris.push([indices[i], indices[i + 1], indices[i + 2]]);
    }
  } else {
    const verts_count = values.length / 3;
    for (let verts_id = 0; verts_id < verts_count; verts_id += 3) {
      tris.push([verts_id, verts_id + 1, verts_id + 2]);
    }
  }

  return { tris, verts };
}

