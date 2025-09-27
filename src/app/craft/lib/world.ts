import * as THREE from 'three'
import { alignGrid } from './object'

export type Basis = {
  o: THREE.Vector3, 
  x: THREE.Vector3, 
  y: THREE.Vector3, 
  z: THREE.Vector3
}


export function createBasis(points: THREE.Vector3[], preBasis?: Basis): Basis | undefined{
  if(points.length == 0){
    return
  }
  else if(points.length == 1){
    if(preBasis){
      return {o: points[0], x: preBasis.x.clone(), y: preBasis.y.clone(), z: preBasis.z.clone()}
    }else{
      return {o: points[0], x: new THREE.Vector3(1,0,0),y: new THREE.Vector3(0,1,0),z: new THREE.Vector3(0,0,1)}
    }
  }
  else if(points.length == 2){
    const oa = points[1].clone().sub(points[0])
    if(oa.lengthSq() < 0.001) return

    const targetZ = oa.normalize()
    if(preBasis){
      const currentZ = preBasis.z.clone()
      const rotationAxis = new THREE.Vector3().crossVectors(currentZ, targetZ).normalize()
      const angle = currentZ.angleTo(targetZ)
      const quaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle)
      const newX = preBasis.x.clone().applyQuaternion(quaternion)
      const newY = preBasis.y.clone().applyQuaternion(quaternion)
      const newZ = targetZ
      return {o: points[0], x: newX, y: newY, z: newZ}
    }else{
      const zAxis = targetZ
      const a = new THREE.Vector3(0,0,1), b = new THREE.Vector3(0,1,0)
      const xAxis = zAxis.clone().cross(
        Math.abs(zAxis.dot(a)) < 0.99 ? a : 
        b
      ).normalize()
      const yAxis = new THREE.Vector3().crossVectors(zAxis,xAxis).normalize();
      return {o: points[0], x: xAxis,y: yAxis,z: zAxis}
    }
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