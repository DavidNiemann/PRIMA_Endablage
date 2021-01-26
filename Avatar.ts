///<reference path= "GameObject.ts"/>
///<reference path= "MoveObject.ts"/>



namespace Endabgabe {
    import fc = FudgeCore;
    import fcAid = FudgeAid;

    export enum AvatarStatus {
        idle, walk, jump, strike
    }

    export class Avatar extends MoveObject {


        private static animations: fcAid.SpriteSheetAnimations;
        private control: fc.Control = new fc.Control("AvatarControl", 10, fc.CONTROL_TYPE.PROPORTIONAL);

      /*   private avatarLife: number;
        private avatarDamage: number; */

        private fist: MoveObject;
        private sprite: fcAid.NodeSprite;
        private avatarStatus: AvatarStatus = AvatarStatus.idle;

        public constructor(_name: string, _size: fc.Vector3, _position: fc.Vector3) {
            super(_name, _size, _position);

            this.sprite = new fcAid.NodeSprite("sprite");

            this.sprite.addComponent(new fc.ComponentTransform());
            this.sprite.setFrameDirection(1);
            this.sprite.mtxLocal.translateY(-_size.y / 2);
            this.sprite.framerate = 7;
            this.sprite.mtxLocal.translateZ(0.1);
            this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Avatar.animations["Idle"]);
            this.addChild(this.sprite);

            this.fist = new MoveObject("fist", new fc.Vector3(_size.x, _size.y, _size.z), new fc.Vector3(/* _position.x, _position.y, _position.z */));
            this.fist.grounded = true;
            this.fist.mtxLocal.translateY(_size.y / 2);
            this.sprite.addChild(this.fist);
            //this.removeComponent(this.getComponents(fc.ComponentMaterial)[0]);
            //this.fist.removeComponent(this.fist.getComponents(fc.ComponentMaterial)[0]);
        }


        public static generateSprites(_spritesheet: fc.CoatTextured): void {
            this.animations = {};
            let name: string = "Walk";
            let sprite: fcAid.SpriteSheetAnimation = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(30, 772, 33, 33), 7, 10, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(49));
            this.animations[name] = sprite;

            name = "Idle";
            sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(30, 468, 33, 33), 13, 10, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(49));
            this.animations[name] = sprite;

            name = "Strike";
            sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(30, 45, 66, 52), 4, 10, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(72));
            this.animations[name] = sprite;

            name = "jump";
            sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
            sprite.generateByGrid(fc.Rectangle.GET(30, 1071, 33, 33), 7, 10, fc.ORIGIN2D.BOTTOMCENTER, fc.Vector2.X(47));
            this.animations[name] = sprite;
        }

        public hadKeyboard = (): void => {
            if (this.fist.grounded)

                if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.A, fc.KEYBOARD_CODE.ARROW_LEFT, fc.KEYBOARD_CODE.D, fc.KEYBOARD_CODE.ARROW_RIGHT])) {
                    this.setAnimation(AvatarStatus.walk);
                    this.control.setInput(
                        fc.Keyboard.mapToValue(-1, 0, [fc.KEYBOARD_CODE.A, fc.KEYBOARD_CODE.ARROW_LEFT])
                        + fc.Keyboard.mapToValue(1, 0, [fc.KEYBOARD_CODE.D, fc.KEYBOARD_CODE.ARROW_RIGHT])
                    );
                    this.velocity.x = this.control.getOutput();
                }
        }



        public hndJump = (): void => {
            if (this.grounded) {

                if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SPACE])) {
                    this.velocity.y = 25;

                }

            }

        }


        public update(): void {

            if (!fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.A, fc.KEYBOARD_CODE.ARROW_LEFT, fc.KEYBOARD_CODE.D, fc.KEYBOARD_CODE.ARROW_RIGHT])) {

                this.velocity.x = 0;
            }
            super.update();
            this.fist.rect.position.x = this.fist.mtxWorld.translation.x - this.fist.rect.size.x / 2;
            this.fist.rect.position.y = this.fist.mtxWorld.translation.y - this.fist.rect.size.y / 2;
            if (this.fist.grounded == false) {

                for (let enemy of enemies.getChildren() as GameObject[]) {
                    //console.log(this.fist.rect, enemy.rect , this.rect);
                    if (this.fist.checkCollision(enemy, false)) {
                        console.log();
                        enemies.removeChild(enemy);
                    }
                }
            }
            if (!this.grounded) {
                this.setAnimation(AvatarStatus.jump);
            }
            if (!fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.A, fc.KEYBOARD_CODE.ARROW_LEFT, fc.KEYBOARD_CODE.D, fc.KEYBOARD_CODE.ARROW_RIGHT]) && this.fist.grounded && this.grounded) {
                this.setAnimation(AvatarStatus.idle);
            }
            if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.A, fc.KEYBOARD_CODE.ARROW_LEFT, fc.KEYBOARD_CODE.D, fc.KEYBOARD_CODE.ARROW_RIGHT]) && this.fist.grounded && this.grounded) {
                this.setAnimation(AvatarStatus.walk);
            }

        }
        public strike = (): void => {
            if (this.grounded)
                if (this.fist.grounded) {
                    this.fist.grounded = false;
                    this.fist.mtxLocal.translateX(unit);
                    this.sprite.mtxLocal.translateX(unit);
                    this.setAnimation(AvatarStatus.strike);
                    fc.Time.game.setTimer(500, 1, this.endstrike);

                }


        }

        public endstrike = (): void => {
            this.setAnimation(AvatarStatus.idle);
            this.fist.mtxLocal.translateX(-unit);
            this.sprite.mtxLocal.translateX(-unit);
            this.fist.grounded = true;
        }

        public hndMouse = (_event: MouseEvent): void  => {
            if (_event.movementX < 0) {
                this.flip(true);

            } else if (_event.movementX > 0) {
                this.flip(false);
            }
        }


        private flip(_reverse: boolean): void {
            if (this.fist.grounded)

                this.sprite.mtxLocal.rotation = fc.Vector3.Y(_reverse ? 180 : 0);
        }

        private setAnimation(_status: AvatarStatus): void {
            if (_status != this.avatarStatus) {
                this.avatarStatus = _status;
                switch (_status) {
                    case AvatarStatus.strike:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Avatar.animations["Strike"]);
                        this.avatarStatus = AvatarStatus.strike;
                        break;
                    case AvatarStatus.idle:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Avatar.animations["Idle"]);
                        this.avatarStatus = AvatarStatus.idle;
                        break;
                    case AvatarStatus.walk:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Avatar.animations["Walk"]);
                        this.avatarStatus = AvatarStatus.walk;
                        break;
                    case AvatarStatus.jump:
                        this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Avatar.animations["jump"]);
                        this.avatarStatus = AvatarStatus.jump;
                        break;
                    default:
                        break;
                }

            }

        }



    }



}