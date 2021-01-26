namespace Endabgabe {
    import fc = FudgeCore;
    // import fcaid = FudgeAid;

    export class Floor extends GameObject {
        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3, _material: ƒ.Material ) { 
            super(_name, _size, _position);

            let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(_material);
            cmpMaterial.pivot.scaleX(_size.x / unit);
            cmpMaterial.pivot.scaleY(_size.y / unit);
            this.addComponent(cmpMaterial);
        }
    }
}
