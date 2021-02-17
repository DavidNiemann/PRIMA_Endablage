namespace Endabgabe {
    import fc = FudgeCore;
    import fcAid = FudgeAid;
    export enum JOB {
        walk, idle, attack, die
    }

    export class Enemy extends MoveObject {

        private static animations: fcAid.SpriteSheetAnimations;

        public activ: boolean = false;
        public health: number;


        private fist: MoveObject;
        private job: JOB = JOB.idle;
        private sprite: fcAid.NodeSprite;

        private damage: number;
        private invulnerable: boolean = false;

        private attackTime: boolean = false;
        // private static readonly mtrSolidWhite: fc.Material = new fc.Material("SolidWhite", fc.ShaderUniColor, new fc.CoatColored(fc.Color.CSS("WHITE")));
        // private cmpMaterial: fc.ComponentMaterial;
        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3, _health: number, _damage: number) {
            super(_name, _size, _position);
            this.sprite = new fcAid.NodeSprite("sprite");

            this.sprite.addComponent(new fc.ComponentTransform());
            this.sprite.setFrameDirection(1);
            this.sprite.framerate = 7;
            this.addChild(this.sprite);
            this.sprite.mtxLocal.translateY(-_size.y / 2);
            this.sprite.mtxLocal.translateZ(0.01);
            this.fist = new MoveObject("fist", new fc.Vector3(_size.x, _size.y, _size.z), new fc.Vector3(0, 0, 0));
            this.fist.grounded = true;
            this.fist.mtxLocal.translateY(_size.y / 2);
            this.sprite.addChild(this.fist);
            this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Idle"]);
            this.health = _health;
            this.damage = _damage;

            // this.cmpMaterial = new fc.ComponentMaterial(Enemy.mtrSolidWhite);
            //  this.addComponent(this.cmpMaterial);


        }
        public static generateSprites(_spritesheet: fc.CoatTextured): void {
            this.animations = {};


            let name: string = "Walk";
            let sprite: fcAid.SpriteSheetAnimation = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(15, 158, 22, 32), 13, 6, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(22));
            this.animations[name] = sprite;

            name = "Idle";
            sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(14, 119, 24, 32), 11, 6, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(24));
            this.animations[name] = sprite;

            name = "Strike";
            sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(0, 0, 44, 37), 17, 6, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(43));
            this.animations[name] = sprite;

            name = "Die";
            sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(33, 40, 30, 32), 16, 6, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(33));
            this.animations[name] = sprite;
        }

        public update(): void {
            if (this.health <= 0)
                this.setJob(JOB.die);
            if (this.job == JOB.die) {
                return;
            }
            super.update();
            if (this.activ && this.invulnerable == false) {


                if (this.job == JOB.walk) {
                    this.velocity.x = 2 * (avatar.mtxWorld.translation.x - this.mtxWorld.translation.x) / Math.abs(avatar.mtxWorld.translation.x - this.mtxWorld.translation.x);
                }
                else {
                    this.velocity.x = 0;
                }

                if (avatar.mtxWorld.translation.x - this.mtxWorld.translation.x < 0) {
                    this.flip(true);
                } else {
                    this.flip(false);
                }

                if (Math.abs(avatar.mtxWorld.translation.y - this.mtxWorld.translation.y) > unit) {

                    this.setJob(JOB.idle);
                }
                else if (Math.abs(avatar.mtxWorld.translation.x - this.mtxWorld.translation.x) < 2 * unit) {
                    this.strike();
                }
                else {
                    this.setJob(JOB.walk);
                }



                if (this.attackTime) {


                    this.fist.rect.position.x = this.fist.mtxWorld.translation.x - this.fist.rect.size.x / 2;
                    this.fist.rect.position.y = this.fist.mtxWorld.translation.y - this.fist.rect.size.y / 2;
                    if (this.fist.checkCollision(avatar, false)) {


                        //enemies.removeChild(avatar);
                        avatar.newhealth(this.damage);
                    }


                }


            }
        }



        public setJob(_status: JOB): void {

            if (_status != this.job && this.fist.grounded || _status == JOB.die && this.job != JOB.die) {
                this.job = _status;
                switch (_status) {

                    case JOB.idle:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Idle"]);
                        this.job = JOB.idle;
                        break;
                    case JOB.walk:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Walk"]);
                        this.job = JOB.walk;
                        break;
                    case JOB.attack:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Strike"]);
                        this.job = JOB.attack;
                        break;
                    case JOB.die:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Die"]);
                        this.invulnerable = true;
                        this.job = JOB.die;
                        break;
                    default:
                        break;
                }

            }

        }
        public strike(): void {
            if (this.grounded)
                if (this.fist.grounded) {
                    this.setJob(JOB.attack);
                    this.fist.grounded = false;
                    this.sprite.mtxLocal.translateX(unit / 2);
                    fc.Time.game.setTimer(1000, 1, this.strikeSetHitBox);
                    fc.Time.game.setTimer(1300, 1, this.endstrike);
                    fc.Time.game.setTimer(2500, 1, this.endstrikeAnimation);
                }
        }
        public endstrikeAnimation = (): void => {
            this.setJob(JOB.idle);
            this.fist.grounded = true;
            this.sprite.mtxLocal.translateX(-unit / 2);
        }


        public strikeSetHitBox = (): void => {
            sounds.playSound(Sounds.Shword);
            this.attackTime = true;
            //this.fist.mtxLocal.translateX(unit / 2);

        }

        public endstrike = (): void => {
            avatar.setVulnerable();
            this.attackTime = false;
            //this.fist.mtxLocal.translateX(-unit / 2);
        }

        public setHealth(_damage: number): boolean {
            if (this.invulnerable || this.job == JOB.die) {
                return false;
            }
           
            this.invulnerable = true;
            fc.Time.game.setTimer(500, 1, this.setVulnerable/* function (): void { this.invulnerable  } */);
            this.health -= _damage;
            sounds.playSound(Sounds.EnemyHit);

            gameState.currentEnemyHealth -= avatarProperties.damage;
            Hud.hndHealthBar();
            if (this.health <= 0) {
                fc.Time.game.setTimer(2200, 1, this.deleteEnemy);
                this.setJob(JOB.die);

                return true;
            }
            return false;

        }
        public setVulnerable = (): void => {
            this.invulnerable = false;
        }
        public deleteEnemy = (): void => {
            enemies.removeChild(this);
        }

        private flip(_reverse: boolean): void {
            if (this.fist.grounded)
                this.sprite.mtxLocal.rotation = fc.Vector3.Y(_reverse ? 180 : 0);
        }





    }

}


