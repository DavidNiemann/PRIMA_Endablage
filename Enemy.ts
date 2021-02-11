namespace Endabgabe {
    import fc = FudgeCore;
    import fcAid = FudgeAid;
    export enum JOB {
        jump, walk, idle, attack
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

        private damageTime: boolean = false;
        //private static readonly mtrSolidWhite: fc.Material = new fc.Material("SolidWhite", fc.ShaderUniColor, new fc.CoatColored(fc.Color.CSS("WHITE")));
        //private cmpMaterial: fc.ComponentMaterial;
        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3, _health: number, _damage: number) {
            super(_name, _size, _position);

            this.sprite = new fcAid.NodeSprite("sprite");

            this.sprite.addComponent(new fc.ComponentTransform());
            this.sprite.setFrameDirection(1);
            this.sprite.framerate = 7;
            this.addChild(this.sprite);
            this.sprite.mtxLocal.translateY(-_size.y / 2);
            this.sprite.mtxLocal.translateZ(0.01);
            // this.removeComponent(this.getComponents(fc.ComponentMaterial)[0]);
            //this.jump();
            this.fist = new MoveObject("fist", new fc.Vector3(_size.x, _size.y, _size.z), new fc.Vector3(0, 0, 0));
            this.fist.grounded = true;
            this.fist.mtxLocal.translateY(_size.y / 2);
            this.sprite.addChild(this.fist);
            this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Idle"]);
            this.health = _health;
            this.damage = _damage;

            //this.cmpMaterial = new fc.ComponentMaterial(Enemy.mtrSolidWhite);
            // this.fist.addComponent(this.cmpMaterial);


        }
        public static generateSprites(_spritesheet: fc.CoatTextured): void {
            this.animations = {};
            /*  let name: string = "Walk";
             let sprite: fcAid.SpriteSheetAnimation = new fcAid.SpriteSheetAnimation(name, _spritesheet);
             sprite.generateByGrid(fc.Rectangle.GET(30, 772, 33, 33), 7, 8, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(49));
             this.animations[name] = sprite;
 
             name = "Idle";
             sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
             sprite.generateByGrid(fc.Rectangle.GET(30, 468, 33, 33), 13, 8, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(49));
             this.animations[name] = sprite;
 
             name = "Strike";
             sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
             sprite.generateByGrid(fc.Rectangle.GET(30, 45, 66, 52), 4, 8, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(72));
             this.animations[name] = sprite;
 
             name = "jump";
             sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
             sprite.generateByGrid(fc.Rectangle.GET(30, 1071, 33, 33), 7, 8, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(47));
             this.animations[name] = sprite; */

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
            sprite.generateByGrid(fc.Rectangle.GET(3, 0, 40, 37), 16, 6, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(43));
            this.animations[name] = sprite;
        }

        public update(): void {
            super.update();
            if (this.activ && this.invulnerable == false) {

                switch (this.job) {
                    case JOB.walk:
                        this.velocity.x = 2 * (avatar.mtxWorld.translation.x - this.mtxWorld.translation.x) / Math.abs(avatar.mtxWorld.translation.x - this.mtxWorld.translation.x);

                        break;
                    case JOB.idle:
                        this.setAnimation(JOB.idle);
                        break;
                    default:
                        break;
                }

                if (avatar.mtxWorld.translation.x - this.mtxWorld.translation.x < 0) {
                    this.flip(true);
                } else {
                    this.flip(false);
                }

                /* let test: fc.Vector3 = fc.Vector3.DIFFERENCE(avatar.mtxWorld.translation, this.mtxWorld.translation);
                if (test.y > 3) {
                    if (this.grounded) {
                        this.velocity.y = 20;
                    }
                } */

                if (this.job != JOB.attack)


                    if (this.grounded) {
                        this.setAnimation(JOB.walk);
                    }
                    else {
                        this.setAnimation(JOB.jump);
                    }

                if (!this.grounded) {
                    this.setAnimation(JOB.jump);
                }

                if (fc.Vector3.DIFFERENCE(avatar.mtxWorld.translation, this.mtxWorld.translation).magnitude < 2 * unit) {

                    this.strike();
                }

                if (this.fist.grounded == false) {
                    if (this.damageTime) {


                        this.fist.rect.position.x = this.fist.mtxWorld.translation.x - this.fist.rect.size.x / 2;
                        this.fist.rect.position.y = this.fist.mtxWorld.translation.y - this.fist.rect.size.y / 2;
                        if (this.fist.checkCollision(avatar, false)) {

                            console.log("hit");
                            //enemies.removeChild(avatar);
                            avatar.newhealth(this.damage);
                        }
                    }

                }

            }
        }

        /*   public jump = (): void => {
              if (this.grounded) {
                  this.velocity.y = 20;
              }
              fc.Time.game.setTimer(10000, 1, this.jump);
          }
   */




        public setAnimation(_status: JOB): void {
            if (_status != this.job) {
                this.job = _status;
                switch (_status) {

                    case JOB.idle:
                        //  this.cmpStepAudio.play(false);
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Idle"]);
                        this.job = JOB.idle;
                        break;
                    case JOB.walk:
                        //  this.cmpStepAudio.play(true);
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Walk"]);
                        this.job = JOB.walk;
                        break;
                    case JOB.jump:
                        //  this.cmpStepAudio.play(false);
                        //   this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["jump"]);
                        this.job = JOB.jump;
                        break;
                    case JOB.attack:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Strike"]);
                        this.job = JOB.attack;
                        break;
                    default:
                        break;
                }

            }

        }
        public strike(): void {
            if (this.grounded)

                if (this.fist.grounded) {

                    /*      this.cmpShwordAudio.play(true); */
                    this.setAnimation(JOB.attack);
                    this.fist.grounded = false;
                    this.setAnimation(JOB.attack);
                    fc.Time.game.setTimer(1000, 1, this.strikeSetHitBox);
                    fc.Time.game.setTimer(1500, 1, this.endstrike);
                    fc.Time.game.setTimer(2500, 1, this.endstrikeAnimation);
                }
        }
        public endstrikeAnimation = (): void => {
            this.setAnimation(JOB.idle);
            this.fist.grounded = true;
        }
          

        public strikeSetHitBox = (): void => {
        sounds.playSound(Sounds.Shword);
        this.damageTime = true;
        this.fist.mtxLocal.translateX(unit / 2);
        this.sprite.mtxLocal.translateX(unit / 2);
    }

        public endstrike = (): void => {
        this.damageTime = false;
        this.fist.mtxLocal.translateX(-unit / 2);
        this.sprite.mtxLocal.translateX(-unit / 2);
        
    }

        public setHealth(_damage: number): boolean {

        if (this.invulnerable) {
            return false;
        }

        this.invulnerable = true;
        fc.Time.game.setTimer(500, 1, this.setVulnerable/* function (): void { this.invulnerable  } */);
        this.health -= _damage;
        sounds.playSound(Sounds.Hit);
        /*    this.cmpHitAudio.play(true); */
        gameState.currentEnemyHealth -= avatarProperties.damage;
        Hud.hndHealthBar();
        if (this.health <= 0) {
            //this.cmpStepAudio.play(false);
            return true;
        }
        return false;

    }
        public setVulnerable = (): void => {
        this.invulnerable = false;
    }


        private flip(_reverse: boolean): void {
        if (this.fist.grounded)
        this.sprite.mtxLocal.rotation = fc.Vector3.Y(_reverse ? 180 : 0);
    }





}

}


