import * as THREE from 'three'
import { Basis } from './world'

export function createColoredGrid(
  scale: number,
  lineCount: number,
  xSize: number,
  ySize: number,
  zSize: number,
  colorX: string,
  colorY: string,
  colorZ: string,
  colorRest: string,
  opacity2: number,
  opacity3: number
) {
  const halfSize = (lineCount * scale) / 2

  const vertices = [],
    vertices2: number[] = [],
    vertices3: number[] = []

  const colors = [],
    colors2: number[] = [],
    colors3: number[] = []

  const colorXVec = new THREE.Color(colorX)
  const colorZVec = new THREE.Color(colorZ)
  const colorYVec = new THREE.Color(colorY)
  const colorRestVec = new THREE.Color(colorRest)

  vertices.push(0, 0, 0, 0, xSize, 0)
  colors.push(colorYVec.r, colorYVec.g, colorYVec.b)
  colors.push(colorYVec.r, colorYVec.g, colorYVec.b)

  vertices.push(0, 0, 0, ySize, 0, 0)
  colors.push(colorXVec.r, colorXVec.g, colorXVec.b)
  colors.push(colorXVec.r, colorXVec.g, colorXVec.b)

  vertices.push(0, 0, 0, 0, 0, zSize)
  colors.push(colorZVec.r, colorZVec.g, colorZVec.b)
  colors.push(colorZVec.r, colorZVec.g, colorZVec.b)

  for (let i = 0; i <= lineCount; i++) {
    const v = i * scale - halfSize
    const vs = i % 2 == 0 ? vertices2 : vertices3
    const cs = i % 2 == 0 ? colors2 : colors3

    vs.push(-halfSize, v, 0, halfSize, v, 0)
    vs.push(v, -halfSize, 0, v, halfSize, 0)
    for (let j = 0; j < 4; j++) {
      cs.push(colorRestVec.r, colorRestVec.g, colorRestVec.b)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const geometry2 = new THREE.BufferGeometry()
  geometry2.setAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3))
  geometry2.setAttribute('color', new THREE.Float32BufferAttribute(colors2, 3))

  const geometry3 = new THREE.BufferGeometry()
  geometry3.setAttribute('position', new THREE.Float32BufferAttribute(vertices3, 3))
  geometry3.setAttribute('color', new THREE.Float32BufferAttribute(colors3, 3))

  const gridGroup = new THREE.Group()
  gridGroup.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ vertexColors: true })))
  gridGroup.add(
    new THREE.LineSegments(
      geometry2,
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: opacity2 })
    )
  )
  gridGroup.add(
    new THREE.LineSegments(
      geometry3,
      new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: opacity3 })
    )
  )

  return gridGroup
}

export function createPoint() {
  const pointPosition = new Float32Array([0, 0, 0])

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(pointPosition, 3))

  const material = new THREE.PointsMaterial({
    color: 0xff00ff,
    size: 0.1,
  })

  const point = new THREE.Points(geometry, material)

  return point
}

export function alignGrid(grid: THREE.Group, basis: Basis) {
  grid.position.copy(basis.o)

  const quaternion = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(basis.x, basis.y, basis.z)
  )

  grid.quaternion.copy(quaternion)
}

export function createPyramid(n: number, r: number, h: number): THREE.BufferGeometry {
  if (n < 3) throw new Error('n must be >= 3')

  const positions: number[] = []

  for (let i = 0; i < n; i++) {
    const theta = (2 * Math.PI * i) / n
    positions.push(r * Math.cos(theta), r * Math.sin(theta), 0)
  }

  positions.push(0, 0, h)
  const apexIndex = n

  const indices: number[] = []

  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n
    indices.push(i, next, apexIndex)
  }

  for (let i = 1; i < n - 1; i++) {
    indices.push(0, i + 1, i)
  }

  const geom = new THREE.BufferGeometry()
  const posArray = new Float32Array(positions)
  geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
  geom.setIndex(indices)
  geom.computeVertexNormals()

  return geom
}

export function createCross(size: number = 0.5, color: number = 0x888888): THREE.Group {
  const crossGroup = new THREE.Group()

  const vertices = [-size, 0, 0, size, 0, 0, 0, -size, 0, 0, size, 0, 0, 0, -size, 0, 0, size]

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  const material = new THREE.LineBasicMaterial({ color })
  const cross = new THREE.LineSegments(geometry, material)

  crossGroup.add(cross)
  return crossGroup
}
