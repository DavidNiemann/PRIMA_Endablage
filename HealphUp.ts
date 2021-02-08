namespace Endabgabe {

    import fc = FudgeCore;



    export class HealthUp extends MoveObject {

        private static txtHeart: fc.TextureImage = new fc.TextureImage("../GameAssets/Heart.jpg");
        private static readonly mtrHeart: fc.Material = new fc.Material("SolidWhite", fc.ShaderUniColor, new fc.CoatTextured(fc.Color.CSS("WHITE"))/* , HealthUp.txtHeart) */);
        private cmpMaterial: fc.ComponentMaterial;
        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) {
            super(_name, _size, _position);
            this.cmpMaterial = new fc.ComponentMaterial(HealthUp.mtrHeart);
            this.addComponent(this.cmpMaterial);

        }

    }





}