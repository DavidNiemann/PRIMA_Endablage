namespace Endabgabe {

    import fc = FudgeCore;



    export class HealthUp extends MoveObject {

        private static txtHeart: fc.TextureImage = new fc.TextureImage("../GameAssets/Heart.png");
       
        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) {
            super(_name, _size, _position);
            let mtrHeart: fc.Material = new fc.Material("Heart", fc.ShaderTexture, new fc.CoatTextured(white, HealthUp.txtHeart));
            let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrHeart);
            cmpMaterial.mtxPivot.scaleX(_size.x / unit);
            cmpMaterial.mtxPivot.scaleY(_size.y / unit);
            this.addComponent(cmpMaterial);
        }
        /*gibt dem Avatar ein Leben*/
        public hndUse(): void {
            gameState.health += 1;
            items.removeChild(this);
            sounds.playSound(Sounds.collect);
        }
        

    }





}