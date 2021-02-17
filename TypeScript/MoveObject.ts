namespace Endabgabe {
    import fc = FudgeCore;


    export class MoveObject extends GameObject {


        public velocity: fc.Vector3 = fc.Vector3.ZERO();
        public grounded: boolean = false;
        public acceleration: number = 0.9;



        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) {
            super(_name, _size, _position);
            this.velocity = fc.Vector3.ZERO();

        }

        /**********Anfang*************/
        // Bewegt die Elemente mit abhänig von der FrameRate
        public move(): void {

            let frameTime: number = fc.Loop.timeFrameGame / 1000;

            let distance: fc.Vector3 = fc.Vector3.SCALE(this.velocity, frameTime);
            this.translate(distance);
        }


        public translate(_distance: fc.Vector3): void {
            this.mtxLocal.translate(_distance);
            this.rect.position.x = this.mtxLocal.translation.x - this.rect.size.x / 2;
            this.rect.position.y = this.mtxLocal.translation.y - this.rect.size.y / 2;
        }
        /***********Ende**************/
        /************Anfang***************/
        public checkCollision(_target: GameObject, _world?: boolean): GameObject { // World besimmt ob es sich um ein Oject handelt an dem Das Movobject Abbrallen soll oder nur Eine Kolliesion Feststellen 
            let intersection: fc.Rectangle = this.rect.getIntersection(_target.rect);

            if (!intersection) {

                return null;
            }
            if (_world == true || _world == undefined)
                if (intersection.size.x < intersection.size.y) {
                    this.hndXCollision(_target);
                    return null;
                }
            return _target;
        }

        /***********Anfang**************/
        // Verarbeitet die Colloesion mit einer Wand und Boden
        public hndYCollision(_target: GameObject): void {
            if (this.mtxLocal.translation.y > _target.mtxLocal.translation.y) {

                if (this.mtxLocal.translation.y != _target.mtxLocal.translation.y + 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y)) {
                    this.grounded = true;
                    sounds.playSound(Sounds.Land);
                    this.velocity.y = 0;
                    this.mtxLocal.translation = new fc.Vector3(this.mtxLocal.translation.x, _target.mtxLocal.translation.y + 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y), 0);
                }
            } else { this.grounded = false; }

        }
        public hndXCollision(_target: GameObject): void {
            if (_target.name.includes("Wall") == false)
                return;
            if (this.mtxLocal.translation.x < _target.mtxLocal.translation.x) {
                if (this.mtxLocal.translation.x != _target.mtxLocal.translation.x - 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.x + _target.getComponent(fc.ComponentMesh).pivot.scaling.x)) {

                    this.mtxLocal.translation = new fc.Vector3(_target.mtxLocal.translation.x - 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.x + _target.getComponent(fc.ComponentMesh).pivot.scaling.x), this.mtxLocal.translation.y, 0);
                }
            }
            else {
                if (this.mtxLocal.translation.x != _target.mtxLocal.translation.x + 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.x + _target.getComponent(fc.ComponentMesh).pivot.scaling.x)) {
                    this.velocity.x = 0;
                    this.mtxLocal.translation = new fc.Vector3(_target.mtxLocal.translation.x + 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.x + _target.getComponent(fc.ComponentMesh).pivot.scaling.x), this.mtxLocal.translation.y, 0);
                }
            }
        }

        public chooseTarget(_targets: GameObject[]): void {

            let target: GameObject = _targets[0];
            if (!target) {
                this.grounded = false;
                return;
            }
            if (_targets.length > unit)
                for (let i: number = 1; i <= _targets.length; i++) {
                    if (target.mtxWorld.translation.y < _targets[i].mtxWorld.translation.y) {
                        target = _targets[i];
                    }

                }
            this.hndYCollision(target);

        }
        /************Ende***********/

        /**************Anfang*************/
        // Verhalten Des MoveObjectes
        public update(): void {
            if (!this.grounded) {
                this.velocity.y -= this.acceleration;
            }
            let hitTargets: GameObject[] = [];
            for (let level of gameWorld.getChildren()) {
                for (let ground of level.getChildren() as GameObject[]) {
                    let target: GameObject = this.checkCollision(ground);
                    if (target) {
                        hitTargets.push(target);
                    }

                }
            }

            this.chooseTarget(hitTargets);
            this.move();
        }
        /**************Ende*************/


    }


}
