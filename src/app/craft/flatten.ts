import { number } from 'framer-motion';
import * as THREE from 'three';

type Tree = { t: number, c: Tree[], a: number, b: number };

export function unfold(verts: THREE.Vector3[], tris: number[][], eps: number = 0.001): { polys: number[][], forest: Tree[], adjs: Record<string, number[]> } {

  const edgeLen: Record<string, number> = {}
  const adjs: Record<string, number[]> = {};
  for (let ti = 0; ti < tris.length; ti++) {
    const [a, b, c] = tris[ti];
    for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      const k = key(u, v);
      (adjs[k] = adjs[k] || []).push(ti);
      if (edgeLen[k] === undefined) edgeLen[k] = verts[u].clone().sub(verts[v]).length();
    }
  }

  const normals: THREE.Vector3[] = tris.map(([a, b, c]) => {
    const v0 = verts[a], v1 = verts[b], v2 = verts[c];
    return new THREE.Vector3()
      .subVectors(v1, v0)
      .cross(new THREE.Vector3().subVectors(v2, v0))
      .normalize();
  });

  const polys: number[][] = [];
  {
    const visited: boolean[] = []

    for (let start = 0; start < tris.length; start++) {
      if (visited[start]) continue;

      const queue = [start];
      const cluster: number[] = [];
      visited[start] = true;

      while (queue.length > 0) {
        const ti = queue.shift()!;
        cluster.push(ti);
        const [a, b, c] = tris[ti];

        for (const [u, v] of [[a, b], [b, c], [c, a]]) {
          const adj = adjs[key(u, v)];
          const other = adj[0] === ti ? adj[1] : adj[0];
          if (visited[other]) continue;
          if (normals[ti].angleTo(normals[other]) < eps) {
            visited[other] = true;
            queue.push(other);
          }
        }
      }

      const edges: Record<string, boolean> = {}

      for (const ti of cluster) {
        const [a, b, c] = tris[ti];
        for (const [u, v] of [[a, b], [b, c], [c, a]]) {
          const k = key(u, v)
          edges[k] = edges[k] ? false : true
        }
      }

      const boundaryEdges: [number, number][] = Object.entries(edges)
        .filter(([, isBoundary]) => isBoundary)
        .map(([key]) => key.split('-').map(s => +s) as [number, number]);


      const adjMap: Record<number, number[]> = {};
      for (const [u, v] of boundaryEdges) {
        adjMap[u] = adjMap[u] || [];
        adjMap[v] = adjMap[v] || [];
        adjMap[u].push(v);
        adjMap[v].push(u);
      }

      const poly: number[] = [];
      start = boundaryEdges[0][0];
      let prev = start;
      let curr = adjMap[start][0];
      poly.push(start);

      while (curr !== start) {
        poly.push(curr);
        const [a, b] = adjMap[curr];
        const next = (a === prev ? b : a);
        prev = curr;
        curr = next;
      }

      if (poly.length > 2) {
        const v0 = verts[poly[0]];
        const v1 = verts[poly[1]];
        const v2 = verts[poly[2]];
        const polyNormal = new THREE.Vector3()
          .subVectors(v1, v0)
          .cross(new THREE.Vector3().subVectors(v2, v0));

        const referenceNormal = normals[cluster[0]];

        if (polyNormal.dot(referenceNormal) < 0) {
          const correctedPoly = [poly[0], ...poly.slice(1).reverse()];
          polys.push(correctedPoly);
        } else {
          polys.push(poly);
        }
      } else {
        polys.push(poly);
      }

    }
  }

  const forest: Tree[] = [];
  const polyAdjs: Record<string, number[]> = {};
  {

    for (let pi = 0; pi < polys.length; pi++) {
      const poly = polys[pi];
      for (const [u, v] of makePairs(poly)) {
        const k = key(u, v);
        (polyAdjs[k] = polyAdjs[k] || []).push(pi);
      }
    }

    const visited: boolean[] = []

    for (let start = 0; start < polys.length; start++) {
      if (visited[start]) continue;


      const root: Tree = { t: start, c: [], a: polys[start][0], b: polys[start][1] };
      forest.push(root);
      visited[start] = true

      const stack: Tree[] = [root];


      while (stack.length > 0) {
        const node = stack.pop()!;
        const pi = node.t;

        const poly = polys[pi];

        const edges = makePairs(poly)
          .map(e => key(e[0], e[1]))
          .sort((a, b) => edgeLen[a] - edgeLen[b])

        for (const e of edges) {
          const adj = polyAdjs[e];
          if (adj.length >= 2) {
            const other = adj[0] === pi ? adj[1] : adj[0];
            if (!visited[other]) {
              const [a, b] = e.split('-')
              const child: Tree = { t: other, c: [], a: +a, b: +b };
              node.c.push(child);
              stack.push(child);
              visited[other] = true;
            }
          }
        }
      }
    }
  }

  return { polys, forest, adjs: polyAdjs };
}

function key(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function makePairs<T>(arr: T[]): [T, T][] {
  const result: [T, T][] = [];
  if (arr.length < 2) return result;
  for (let i = 0; i < arr.length; i++) {
    result.push([arr[i], arr[(i + 1) % arr.length]]);
  }
  return result;
}

type CubeMesh = {
  verts: THREE.Vector3[];
  tris: number[][];
};


export function makeCubeMesh(
  size: number = 1,
  center: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
): CubeMesh {
  const h = size / 2;
  const cx = center.x, cy = center.y, cz = center.z;


  const verts: THREE.Vector3[] = [
    new THREE.Vector3(cx - h, cy - h, cz - h),
    new THREE.Vector3(cx + h, cy - h, cz - h),
    new THREE.Vector3(cx + h, cy + h, cz - h),
    new THREE.Vector3(cx - h, cy + h, cz - h),
    new THREE.Vector3(cx - h, cy - h, cz + h),
    new THREE.Vector3(cx + h, cy - h, cz + h),
    new THREE.Vector3(cx + h, cy + h, cz + h),
    new THREE.Vector3(cx - h, cy + h, cz + h),
  ];



  const tris: number[][] = [

    [0, 2, 1],
    [0, 3, 2],

    [4, 5, 6],
    [4, 6, 7],

    [0, 7, 3],
    [0, 4, 7],

    [1, 2, 6],
    [1, 6, 5],

    [3, 7, 6],
    [3, 6, 2],

    [0, 1, 5],
    [0, 5, 4],
  ];

  return { verts, tris };
}
