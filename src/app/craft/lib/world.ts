import * as THREE from 'three'
import { alignGrid } from './object'

export type Basis = {
  o: THREE.Vector3, 
  x: THREE.Vector3, 
  y: THREE.Vector3, 
  z: THREE.Vector3
}


export function createBasis(points: THREE.Vector3[]): Basis | undefined{
  if(points.length == 0){
    return
  }
  else if(points.length == 1){
    return {o: points[0], x: new THREE.Vector3(1,0,0),y: new THREE.Vector3(0,1,0),z: new THREE.Vector3(0,0,1)}
  }
  else if(points.length == 2){
    const oa = points[1].clone().sub(points[0])
    if(oa.lengthSq() < 0.001) return

    const zAxis = oa.normalize()
    const a = new THREE.Vector3(0,0,1), b = new THREE.Vector3(0,1,0)
    const xAxis = zAxis.clone().cross(
      Math.abs(zAxis.dot(a)) < 0.99 ? a : 
      b
    ).normalize()
    const yAxis = new THREE.Vector3().crossVectors(zAxis,xAxis).normalize();
    return {o: points[0], x: xAxis,y: yAxis,z: zAxis}
  }
  else{
    const ob = points[2].clone().sub(points[0])
    const oa = points[1].clone().sub(points[0])
    if(oa.lengthSq() < 0.001 || ob.lengthSq() < 0.001) return

    const xAxis = oa.normalize();
    if(Math.abs(xAxis.dot(ob.normalize())) > 0.99) return
    const zAxis = xAxis.clone().cross(ob).normalize();
    const yAxis = new THREE.Vector3().crossVectors(zAxis,xAxis).normalize();
    return {o: points[0], x: xAxis,y: yAxis,z: zAxis}
  }
}