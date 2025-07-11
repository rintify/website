import * as THREE from 'three'
import { Unfolded, UnfoldedTree, createEdgeKey, makePairs, signedArea } from './utils';
import { PolygonSVG } from './draw';

export function flatten(vertices: THREE.Vector3[], { polys, forest, adjs }: ReturnType<typeof unfold>): Unfolded {
  const pointss: THREE.Vector2[][][] = []
  for (const f of forest) {
    const points: THREE.Vector2[][] = []
    pointss.push(points)
    const len = vertices[polys[f.pi].indexOf(f.a)].distanceTo(vertices[polys[f.pi].indexOf(f.b)])
    visit(new THREE.Vector2(0, 0), new THREE.Vector2(len, 0), f)

    function visit(a: THREE.Vector2, b: THREE.Vector2, tree: UnfoldedTree) {
      const poly = polys[tree.pi]
      const ai = poly.indexOf(tree.a)
      const bi = poly.indexOf(tree.b)
      const originPoints = to2D(
        poly.map(vi => vertices[vi]),
        ai,
        bi
      )
      const opints = align2DPolygon(originPoints, ai, bi, a, b)
      points.push(opints)
      for (const cTree of tree.cs) {
        visit(opints[poly.indexOf(cTree.a)], opints[poly.indexOf(cTree.b)], cTree)
      }
    }
  }
  return pointss
}

function to2D(vertices: THREE.Vector3[], i: number, j: number): THREE.Vector2[] {
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

export function unfold(
  verts: THREE.Vector3[],
  tris: number[][],
  eps: number = 0.001
): { polys: number[][]; forest: UnfoldedTree[]; adjs: Record<string, number[]>; } {
  const edgeLen: Record<string, number> = {};
  const adjs: Record<string, number[]> = {};
  for (let ti = 0; ti < tris.length; ti++) {
    const [a, b, c] = tris[ti];
    for (const [u, v] of [
      [a, b],
      [b, c],
      [c, a],
    ] as [number, number][]) {
      const k = createEdgeKey(u, v); (adjs[k] = adjs[k] || []).push(ti);
      if (edgeLen[k] === undefined) edgeLen[k] = verts[u].clone().sub(verts[v]).length();
    }
  }

  const normals: THREE.Vector3[] = tris.map(([a, b, c]) => {
    const v0 = verts[a], v1 = verts[b], v2 = verts[c];
    return new THREE.Vector3().subVectors(v1, v0).cross(new THREE.Vector3().subVectors(v2, v0)).normalize();
  });

  const polys: number[][] = [];
  {
    const visited: boolean[] = [];

    for (let start = 0; start < tris.length; start++) {
      if (visited[start]) continue;

      const queue = [start];
      const cluster: number[] = [];
      visited[start] = true;

      while (queue.length > 0) {
        const ti = queue.shift()!;
        cluster.push(ti);
        const [a, b, c] = tris[ti];

        for (const [u, v] of [
          [a, b],
          [b, c],
          [c, a],
        ]) {
          const adj = adjs[createEdgeKey(u, v)];
          const other = adj[0] === ti ? adj[1] : adj[0];
          if (visited[other]) continue;
          if (normals[ti].angleTo(normals[other]) < eps) {
            visited[other] = true;
            queue.push(other);
          }
        }
      }

      const edges: Record<string, boolean> = {};

      for (const ti of cluster) {
        const [a, b, c] = tris[ti];
        for (const [u, v] of [
          [a, b],
          [b, c],
          [c, a],
        ]) {
          const k = createEdgeKey(u, v);
          edges[k] = edges[k] ? false : true;
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
        const next = a === prev ? b : a;
        prev = curr;
        curr = next;
      }

      if (poly.length > 2) {
        const v0 = verts[poly[0]];
        const v1 = verts[poly[1]];
        const v2 = verts[poly[2]];
        const polyNormal = new THREE.Vector3().subVectors(v1, v0).cross(new THREE.Vector3().subVectors(v2, v0));

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

  const forest: UnfoldedTree[] = [];
  const polyAdjs: Record<string, number[]> = {};
  {
    for (let pi = 0; pi < polys.length; pi++) {
      const poly = polys[pi];
      for (const [u, v] of makePairs(poly)) {
        const k = createEdgeKey(u, v); (polyAdjs[k] = polyAdjs[k] || []).push(pi);
      }
    }

    const visited: boolean[] = [];

    for (let start = 0; start < polys.length; start++) {
      if (visited[start]) continue;

      const root: UnfoldedTree = { pi: start, cs: [], a: polys[start][0], b: polys[start][1] };
      forest.push(root);
      visited[start] = true;

      const stack: UnfoldedTree[] = [root];

      while (stack.length > 0) {
        const node = stack.pop()!;
        const pi = node.pi;

        const poly = polys[pi];

        const edges = makePairs(poly)
          .map(e => createEdgeKey(e[0], e[1]))
          .sort((a, b) => edgeLen[a] - edgeLen[b]);

        for (const e of edges) {
          const adj = polyAdjs[e];
          if (adj.length >= 2) {
            const other = adj[0] === pi ? adj[1] : adj[0];
            if (!visited[other]) {
              const [a, b] = e.split('-');
              const child: UnfoldedTree = { pi: other, cs: [], a: +a, b: +b };
              node.cs.push(child);
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

