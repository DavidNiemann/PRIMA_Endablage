namespace Endabgabe {

    import fc = FudgeCore;



    export class HealthUp extends MoveObject {

        private static txtHeart: fc.TextureImage = new fc.TextureImage("../GameAssets/Heart.png");
       
        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) {
            super(_name, _size, _position);
            let mtrHeart: fc.Material = new fc.Material("Wall", fc.ShaderTexture, new fc.CoatTextured(null, HealthUp.txtHeart));
            let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrHeart);
            cmpMaterial.pivot.scaleX(_size.x / unit);
            cmpMaterial.pivot.scaleY(_size.y / unit);
            this.addComponent(cmpMaterial);
        }

        public hndUse(): void {
            gameState.health += 1;
            items.removeChild(this);
        }
        

    }





}