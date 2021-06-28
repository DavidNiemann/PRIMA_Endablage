namespace Endabgabe {
    import fc = FudgeCore;

    export class Floor extends GameObject {
        private static txtFloor: fc.TextureImage = new fc.TextureImage("../GameAssets/Ground.png");
        
        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) { 
            super(_name, _size, _position);
            let mtrWall: fc.Material = new fc.Material("Wall", fc.ShaderTexture, new fc.CoatTextured(white, Floor.txtFloor));
            let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrWall);
            cmpMaterial.mtxPivot.scaleX(_size.x / unit);
            cmpMaterial.mtxPivot.scaleY(_size.y / unit);
            this.addComponent(cmpMaterial);
        }
    }
}
