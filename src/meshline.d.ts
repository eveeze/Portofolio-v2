// meshline.d.ts
import {  BufferGeometry, Material } from "three";
import { ReactThreeFiber } from "@react-three/fiber";

declare module "meshline" {
  export class MeshLineGeometry extends BufferGeometry {
    constructor();
    setPoints(points: any[]): void;
  }

  export class MeshLineMaterial extends Material {
    constructor(parameters?: {
      color?: string | number;
      map?: any;
      useMap?: boolean;
      lineWidth?: number;
      resolution?: [number, number];
      sizeAttenuation?: boolean;
      depthTest?: boolean;
      repeat?: [number, number];
    });
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: ReactThreeFiber.Object3DNode<
        MeshLineGeometry,
        typeof MeshLineGeometry
      >;
      meshLineMaterial: ReactThreeFiber.Object3DNode<
        MeshLineMaterial,
        typeof MeshLineMaterial
      >;
    }
  }
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ReactThreeFiber.Object3DNode<
      MeshLineGeometry,
      typeof MeshLineGeometry
    >;
    meshLineMaterial: ReactThreeFiber.Object3DNode<
      MeshLineMaterial,
      typeof MeshLineMaterial
    >;
  }
}
