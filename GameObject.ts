namespace Endabgabe {
    import fc = FudgeCore;
    // import fcaid = FudgeAid;

    export class GameObject extends fc.Node { 

        protected static readonly meshQuad: fc.MeshQuad = new fc.MeshQuad();
       // private static readonly mtrSolidWhite: fc.Material = new fc.Material("SolidWhite", fc.ShaderUniColor, new fc.CoatColored(fc.Color.CSS("WHITE")));
        public rect: fc.Rectangle;
      //  private cmpMaterial: fc.ComponentMaterial;


        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) { 
            super(_name);
            this.rect = new fc.Rectangle(_position.x, _position.y, _size.x, _size.y, fc.ORIGIN2D.CENTER);
            this.addComponent(new fc.ComponentTransform(fc.Matrix4x4.TRANSLATION(_position)));
            let cmpQuad: fc.ComponentMesh = new fc.ComponentMesh(GameObject.meshQuad);
            this.addComponent(cmpQuad);
            cmpQuad.pivot.scale(_size);
            //this.cmpMaterial = new fc.ComponentMaterial(GameObject.mtrSolidWhite);
           // this.addComponent(this.cmpMaterial);

             
        }
    }
}