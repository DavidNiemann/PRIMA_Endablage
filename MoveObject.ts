namespace Endabgabe {
    import fc = FudgeCore;
    // import fcaid = FudgeAid;

    export class MoveObject extends GameObject {

        public velocity: fc.Vector3 = fc.Vector3.ZERO();
        public grounded: boolean = false;
        public acceleration: number = 0.9;

        protected audioShword: fc.Audio;
        protected audioHit: fc.Audio;
        protected cmpShwordAudio: fc.ComponentAudio;
        protected cmpHitAudio: fc.ComponentAudio;
        protected audioStep: fc.Audio;
        protected cmpStepAudio: fc.ComponentAudio;
        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) {
            super(_name, _size, _position);
            this.velocity = fc.Vector3.ZERO();

            this.audioShword = new fc.Audio("../GameSounds/mixkit_fast_sword.wav");
            this.cmpShwordAudio = new fc.ComponentAudio(this.audioShword, false, false);
            this.cmpShwordAudio.connect(true);
            this.cmpShwordAudio.volume = 1;

            this.audioHit = new fc.Audio("../GameSounds/mixkit_Hit.mp3");
            this.cmpHitAudio = new fc.ComponentAudio(this.audioHit, false, false);
            this.cmpHitAudio.connect(true);
            this.cmpHitAudio.volume = 1;

            this.audioStep = new fc.Audio("../GameSounds/mixkit_step.wav");
            this.cmpStepAudio = new fc.ComponentAudio(this.audioStep, true, false);
            this.cmpStepAudio.connect(true);
            this.cmpStepAudio.volume = 1;

        }


        public move(): void {

            let frameTime: number = fc.Loop.timeFrameGame / 1000;
            // this.velocity.normalize(this.speed);
            let distance: fc.Vector3 = fc.Vector3.SCALE(this.velocity, frameTime);
            this.translate(distance);
        }

        public translate(_distance: fc.Vector3): void {
            this.mtxLocal.translate(_distance);
            this.rect.position.x = this.mtxLocal.translation.x - this.rect.size.x / 2;
            this.rect.position.y = this.mtxLocal.translation.y - this.rect.size.y / 2;
        }
        public checkCollision(_target: GameObject, _world?: boolean): GameObject {
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
        public setPause(): void {
            this.cmpStepAudio.play(false);
        }

        public hndYCollision(_target: GameObject): void {
            if (this.mtxLocal.translation.y > _target.mtxLocal.translation.y) {

                if (/* !this.grounded) { */this.mtxLocal.translation.y != _target.mtxLocal.translation.y + 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y)) {
                    this.grounded = true;
                    this.velocity.y = 0;
                    this.mtxLocal.translation = new fc.Vector3(this.mtxLocal.translation.x, _target.mtxLocal.translation.y + 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y), 0);
                }
            }
            /*  else {
                 if (this.mtxLocal.translation.y != _target.mtxLocal.translation.y - 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y)) {
                     this.velocity.y = 0;
                     this.mtxLocal.translation = new fc.Vector3(this.mtxLocal.translation.x, _target.mtxLocal.translation.y - 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y), 0);
                     //}
                 }
 
             } */
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
            //   hitTargets = this.removeWall(hitTargets);
            this.chooseTarget(hitTargets);
            this.move();
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




    }


}
