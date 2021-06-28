namespace Endabgabe {
    import fc = FudgeCore;

    export class Background extends fc.Node {
        private static txtBackground: fc.TextureImage = new fc.TextureImage("../GameAssets/Background.png");
        private static readonly meshQuad: fc.MeshQuad = new fc.MeshQuad();

        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) {
            super(_name);

            let cmpQuad: fc.ComponentMesh = new fc.ComponentMesh(Background.meshQuad);
            let mtrBackground: fc.Material = new fc.Material("Background", fc.ShaderTexture, new fc.CoatTextured(white, Background.txtBackground));
            let cmpMaterial: fc.ComponentMaterial = new fc.ComponentMaterial(mtrBackground);
            this.addComponent(new fc.ComponentTransform(fc.Matrix4x4.TRANSLATION(_position)));
            this.addComponent(cmpQuad);
            this.mtxLocal.scale(_size);
            this.addComponent(cmpMaterial);
          

        }

    }

}