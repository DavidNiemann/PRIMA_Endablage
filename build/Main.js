"use strict";
var Endabgabe;
(function (Endabgabe) {
    var fc = FudgeCore;
    // import fcaid = FudgeAid;
    let GameObject = /** @class */ (() => {
        class GameObject extends fc.Node {
            //  private cmpMaterial: fc.ComponentMaterial;
            constructor(_name, _size, _position) {
                super(_name);
                this.rect = new fc.Rectangle(_position.x, _position.y, _size.x, _size.y, fc.ORIGIN2D.CENTER);
                this.addComponent(new fc.ComponentTransform(fc.Matrix4x4.TRANSLATION(_position)));
                let cmpQuad = new fc.ComponentMesh(GameObject.meshQuad);
                this.addComponent(cmpQuad);
                cmpQuad.pivot.scale(_size);
                //this.cmpMaterial = new fc.ComponentMaterial(GameObject.mtrSolidWhite);
                // this.addComponent(this.cmpMaterial);
            }
        }
        GameObject.meshQuad = new fc.MeshQuad();
        return GameObject;
    })();
    Endabgabe.GameObject = GameObject;
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    var fc = FudgeCore;
    // import fcaid = FudgeAid;
    class MoveObject extends Endabgabe.GameObject {
        constructor(_name, _size, _position) {
            super(_name, _size, _position);
            this.velocity = fc.Vector3.ZERO();
            this.grounded = false;
            this.acceleration = 0.9;
            this.velocity = fc.Vector3.ZERO();
        }
        move() {
            let frameTime = fc.Loop.timeFrameGame / 1000;
            // this.velocity.normalize(this.speed);
            let distance = fc.Vector3.SCALE(this.velocity, frameTime);
            this.translate(distance);
        }
        translate(_distance) {
            this.mtxLocal.translate(_distance);
            this.rect.position.x = this.mtxLocal.translation.x - this.rect.size.x / 2;
            this.rect.position.y = this.mtxLocal.translation.y - this.rect.size.y / 2;
        }
        checkCollision(_target, _world) {
            let intersection = this.rect.getIntersection(_target.rect);
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
        hndYCollision(_target) {
            if (this.mtxLocal.translation.y > _target.mtxLocal.translation.y) {
                if (!this.grounded) { //this.mtxLocal.translation.y != _target.mtxLocal.translation.y + 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y)) {
                    this.grounded = true;
                    this.velocity.y = 0;
                    this.mtxLocal.translation = new fc.Vector3(this.mtxLocal.translation.x, _target.mtxLocal.translation.y + 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y), 0);
                }
            }
            else {
                //if (this.mtxLocal.translation.y != _target.mtxLocal.translation.y - 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y)) {
                this.velocity.y = 0;
                this.mtxLocal.translation = new fc.Vector3(this.mtxLocal.translation.x, _target.mtxLocal.translation.y - 0.5 * (this.getComponent(fc.ComponentMesh).pivot.scaling.y + _target.getComponent(fc.ComponentMesh).pivot.scaling.y), 0);
                //}
            }
        }
        hndXCollision(_target) {
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
        update() {
            if (!this.grounded) {
                this.velocity.y -= this.acceleration;
            }
            let hitTargets = [];
            for (let level of Endabgabe.gameWorld.getChildren()) {
                for (let ground of level.getChildren()) {
                    let target = this.checkCollision(ground);
                    if (target) {
                        hitTargets.push(target);
                    }
                }
            }
            //   hitTargets = this.removeWall(hitTargets);
            this.chooseTarget(hitTargets);
            this.move();
        }
        chooseTarget(_targets) {
            let target = _targets[0];
            if (!target) {
                this.grounded = false;
                return;
            }
            if (_targets.length > Endabgabe.unit)
                for (let i = 1; i <= _targets.length; i++) {
                    if (target.mtxWorld.translation.y < _targets[i].mtxWorld.translation.y) {
                        target = _targets[i];
                    }
                }
            this.hndYCollision(target);
        }
    }
    Endabgabe.MoveObject = MoveObject;
})(Endabgabe || (Endabgabe = {}));
///<reference path= "GameObject.ts"/>
///<reference path= "MoveObject.ts"/>
var Endabgabe;
///<reference path= "GameObject.ts"/>
///<reference path= "MoveObject.ts"/>
(function (Endabgabe) {
    var fc = FudgeCore;
    var fcAid = FudgeAid;
    let AvatarStatus;
    (function (AvatarStatus) {
        AvatarStatus[AvatarStatus["idle"] = 0] = "idle";
        AvatarStatus[AvatarStatus["walk"] = 1] = "walk";
        AvatarStatus[AvatarStatus["jump"] = 2] = "jump";
        AvatarStatus[AvatarStatus["strike"] = 3] = "strike";
    })(AvatarStatus = Endabgabe.AvatarStatus || (Endabgabe.AvatarStatus = {}));
    class Avatar extends Endabgabe.MoveObject {
        constructor(_name, _size, _position) {
            super(_name, _size, _position);
            this.control = new fc.Control("AvatarControl", 10, 0 /* PROPORTIONAL */);
            this.avatarStatus = AvatarStatus.idle;
            this.hadKeyboard = () => {
                if (this.fist.grounded)
                    if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.A, fc.KEYBOARD_CODE.ARROW_LEFT, fc.KEYBOARD_CODE.D, fc.KEYBOARD_CODE.ARROW_RIGHT])) {
                        this.setAnimation(AvatarStatus.walk);
                        this.control.setInput(fc.Keyboard.mapToValue(-1, 0, [fc.KEYBOARD_CODE.A, fc.KEYBOARD_CODE.ARROW_LEFT])
                            + fc.Keyboard.mapToValue(1, 0, [fc.KEYBOARD_CODE.D, fc.KEYBOARD_CODE.ARROW_RIGHT]));
                        this.velocity.x = this.control.getOutput();
                    }
            };
            this.hndJump = () => {
                if (this.grounded) {
                    if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SPACE])) {
                        this.velocity.y = 25;
                    }
                }
            };
            this.strike = () => {
                if (this.grounded)
                    if (this.fist.grounded) {
                        this.fist.grounded = false;
                        this.fist.mtxLocal.translateX(Endabgabe.unit);
                        this.sprite.mtxLocal.translateX(Endabgabe.unit);
                        this.setAnimation(AvatarStatus.strike);
                        fc.Time.game.setTimer(500, 1, this.endstrike);
                    }
            };
            this.endstrike = () => {
                this.setAnimation(AvatarStatus.idle);
                this.fist.mtxLocal.translateX(-Endabgabe.unit);
                this.sprite.mtxLocal.translateX(-Endabgabe.unit);
                this.fist.grounded = true;
            };
            this.hndMouse = (_event) => {
                if (_event.movementX < 0) {
                    this.flip(true);
                }
                else if (_event.movementX > 0) {
                    this.flip(false);
                }
            };
            this.sprite = new fcAid.NodeSprite("sprite");
            this.sprite.addComponent(new fc.ComponentTransform());
            this.sprite.setFrameDirection(1);
            this.sprite.mtxLocal.translateY(-_size.y / 2);
            this.sprite.framerate = 7;
            this.sprite.mtxLocal.translateZ(0.1);
            this.sprite.setAnimation(Avatar.animations["Idle"]);
            this.addChild(this.sprite);
            this.fist = new Endabgabe.MoveObject("fist", new fc.Vector3(_size.x, _size.y, _size.z), new fc.Vector3( /* _position.x, _position.y, _position.z */));
            this.fist.grounded = true;
            this.fist.mtxLocal.translateY(_size.y / 2);
            this.sprite.addChild(this.fist);
            //this.removeComponent(this.getComponents(fc.ComponentMaterial)[0]);
            //this.fist.removeComponent(this.fist.getComponents(fc.ComponentMaterial)[0]);
        }
        static generateSprites(_spritesheet) {
            this.animations = {};
            let name = "Walk";
            let sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
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
        update() {
            if (!fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.A, fc.KEYBOARD_CODE.ARROW_LEFT, fc.KEYBOARD_CODE.D, fc.KEYBOARD_CODE.ARROW_RIGHT])) {
                this.velocity.x = 0;
            }
            super.update();
            this.fist.rect.position.x = this.fist.mtxWorld.translation.x - this.fist.rect.size.x / 2;
            this.fist.rect.position.y = this.fist.mtxWorld.translation.y - this.fist.rect.size.y / 2;
            if (this.fist.grounded == false) {
                for (let enemy of Endabgabe.enemies.getChildren()) {
                    //console.log(this.fist.rect, enemy.rect , this.rect);
                    if (this.fist.checkCollision(enemy, false)) {
                        console.log();
                        Endabgabe.enemies.removeChild(enemy);
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
        flip(_reverse) {
            if (this.fist.grounded)
                this.sprite.mtxLocal.rotation = fc.Vector3.Y(_reverse ? 180 : 0);
        }
        setAnimation(_status) {
            if (_status != this.avatarStatus) {
                this.avatarStatus = _status;
                switch (_status) {
                    case AvatarStatus.strike:
                        this.sprite.setAnimation(Avatar.animations["Strike"]);
                        this.avatarStatus = AvatarStatus.strike;
                        break;
                    case AvatarStatus.idle:
                        this.sprite.setAnimation(Avatar.animations["Idle"]);
                        this.avatarStatus = AvatarStatus.idle;
                        break;
                    case AvatarStatus.walk:
                        this.sprite.setAnimation(Avatar.animations["Walk"]);
                        this.avatarStatus = AvatarStatus.walk;
                        break;
                    case AvatarStatus.jump:
                        this.sprite.setAnimation(Avatar.animations["jump"]);
                        this.avatarStatus = AvatarStatus.jump;
                        break;
                    default:
                        break;
                }
            }
        }
    }
    Endabgabe.Avatar = Avatar;
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    var fc = FudgeCore;
    var fcAid = FudgeAid;
    let JOB;
    (function (JOB) {
        JOB[JOB["jump"] = 0] = "jump";
        JOB[JOB["walk"] = 1] = "walk";
        JOB[JOB["idle"] = 2] = "idle";
        JOB[JOB["attack"] = 3] = "attack";
    })(JOB = Endabgabe.JOB || (Endabgabe.JOB = {}));
    class Enemy extends Endabgabe.MoveObject {
        constructor(_name, _size, _position) {
            super(_name, _size, _position);
            this.job = JOB.idle;
            this.activ = false;
            this.jump = () => {
                if (this.grounded) {
                    this.velocity.y = 20;
                }
                fc.Time.game.setTimer(10000, 1, this.jump);
            };
            this.endstrike = () => {
                this.setAnimation(JOB.idle);
                this.fist.mtxLocal.translateX(-1);
                this.sprite.mtxLocal.translateX(-1);
                this.fist.grounded = true;
            };
            this.sprite = new fcAid.NodeSprite("sprite");
            this.sprite.addComponent(new fc.ComponentTransform());
            this.sprite.setFrameDirection(1);
            this.sprite.framerate = 7;
            this.addChild(this.sprite);
            this.sprite.mtxLocal.translateY(-_size.y / 2);
            // this.removeComponent(this.getComponents(fc.ComponentMaterial)[0]);
            this.jump();
            this.fist = new Endabgabe.MoveObject("fist", new fc.Vector3(_size.x, _size.y, _size.z), new fc.Vector3(0, 0, 0));
            this.fist.grounded = true;
            this.fist.mtxLocal.translateY(_size.y / 2);
            this.sprite.addChild(this.fist);
            //  this.sprite.setAnimation(<fcAid.SpriteSheetAnimation>Enemy.animations["Idle"]);
        }
        update() {
            super.update();
            if (this.activ) {
                switch (this.job) {
                    case JOB.walk:
                        this.velocity.x = 2 * (Endabgabe.avatar.mtxWorld.translation.x - this.mtxWorld.translation.x) / Math.abs(Endabgabe.avatar.mtxWorld.translation.x - this.mtxWorld.translation.x);
                        break;
                    case JOB.idle:
                        this.setAnimation(JOB.idle);
                        break;
                    default:
                        break;
                }
                if (Endabgabe.avatar.mtxWorld.translation.x - this.mtxWorld.translation.x < 0) {
                    this.flip(true);
                }
                else {
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
                if (fc.Vector3.DIFFERENCE(Endabgabe.avatar.mtxWorld.translation, this.mtxWorld.translation).magnitude < 3 * Endabgabe.unit / 2) {
                    this.strike();
                }
                if (this.fist.grounded == false) {
                    this.fist.rect.position.x = this.fist.mtxWorld.translation.x - this.fist.rect.size.x / 2;
                    this.fist.rect.position.y = this.fist.mtxWorld.translation.y - this.fist.rect.size.y / 2;
                    if (this.fist.checkCollision(Endabgabe.avatar, false)) {
                        console.log("hit");
                        //enemies.removeChild(avatar);
                    }
                }
            }
        }
        static generateSprites(_spritesheet) {
            this.animations = {};
            let name = "Walk";
            let sprite = new fcAid.SpriteSheetAnimation(name, _spritesheet);
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
        setAnimation(_status) {
            if (_status != this.job) {
                this.job = _status;
                switch (_status) {
                    case JOB.idle:
                        this.sprite.setAnimation(Enemy.animations["Idle"]);
                        this.job = JOB.idle;
                        break;
                    case JOB.walk:
                        this.sprite.setAnimation(Enemy.animations["Walk"]);
                        this.job = JOB.walk;
                        break;
                    case JOB.jump:
                        this.sprite.setAnimation(Enemy.animations["jump"]);
                        this.job = JOB.jump;
                        break;
                    case JOB.attack:
                        this.sprite.setAnimation(Enemy.animations["Strike"]);
                        this.job = JOB.attack;
                        break;
                    default:
                        break;
                }
            }
        }
        flip(_reverse) {
            this.sprite.mtxLocal.rotation = fc.Vector3.Y(_reverse ? 180 : 0);
        }
        strike() {
            if (this.grounded)
                if (this.fist.grounded) {
                    this.setAnimation(JOB.attack);
                    this.fist.grounded = false;
                    this.fist.mtxLocal.translateX(1);
                    this.sprite.mtxLocal.translateX(1);
                    this.setAnimation(JOB.attack);
                    fc.Time.game.setTimer(500, 1, this.endstrike);
                }
        }
    }
    Endabgabe.Enemy = Enemy;
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    // import fcaid = FudgeAid;
    class Floor extends Endabgabe.GameObject {
        constructor(_name, _size, _position, _material) {
            super(_name, _size, _position);
            let cmpMaterial = new ƒ.ComponentMaterial(_material);
            cmpMaterial.pivot.scaleX(_size.x / Endabgabe.unit);
            cmpMaterial.pivot.scaleY(_size.y / Endabgabe.unit);
            this.addComponent(cmpMaterial);
        }
    }
    Endabgabe.Floor = Floor;
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    var fc = FudgeCore;
    window.addEventListener("load", sceneLoad);
    Endabgabe.worldNumber = 0;
    let root;
    let camaraNode;
    let worldGenerator;
    let movableCamara = false;
    async function sceneLoad(_event) {
        const canvas = document.querySelector("canvas");
        await loaddata("../Data/data.json");
        root = new fc.Node("root");
        camaraNode = new fc.Node("camara");
        camaraNode.addComponent(new fc.ComponentTransform());
        root.addChild(camaraNode);
        Endabgabe.gameWorld = new fc.Node("GameWorld");
        root.addChild(Endabgabe.gameWorld);
        worldGenerator = new Endabgabe.WorldGenarator("world");
        genarateWorld(Endabgabe.worldNumber);
        await createAvatarAssets();
        Endabgabe.avatar = new Endabgabe.Avatar("Avatar", new fc.Vector3(Endabgabe.unit, Endabgabe.unit, 1), fc.Vector3.ZERO());
        root.addChild(Endabgabe.avatar);
        Endabgabe.enemies = new fc.Node("Enemies");
        await createEnemyAssets();
        root.addChild(Endabgabe.enemies);
        Endabgabe.enemies.addChild(worldGenerator.createEnemie(Endabgabe.worldNumber));
        Endabgabe.enemies.getChild(0).activ = true;
        let cmpCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translateZ(Endabgabe.worldLength);
        cmpCamera.pivot.rotateY(180);
        camaraNode.addComponent(cmpCamera);
        document.addEventListener("keypress", Endabgabe.avatar.hndJump);
        document.addEventListener("keypress", Endabgabe.avatar.hadKeyboard);
        document.addEventListener("click", Endabgabe.avatar.strike);
        canvas.addEventListener("click", canvas.requestPointerLock);
        canvas.addEventListener("mousemove", Endabgabe.avatar.hndMouse);
        Endabgabe.viewport = new fc.Viewport();
        Endabgabe.viewport.initialize("Viewport", root, cmpCamera, canvas);
        fc.Debug.log(Endabgabe.viewport);
        Endabgabe.viewport.camera.backgroundColor = fc.Color.CSS("Blue");
        fc.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
    }
    function hndLoop(_event) {
        if (!Endabgabe.enemies.getChild(0)) {
            worldGenerator.newWorld(Endabgabe.worldNumber);
            movableCamara = true;
        }
        if (movableCamara) {
            if (Endabgabe.avatar.mtxLocal.translation.x > Endabgabe.worldNumber * Endabgabe.worldLength) {
                camaraNode.mtxLocal.translation = new fc.Vector3(Endabgabe.avatar.mtxWorld.translation.x, 0, 0);
            }
            if (Endabgabe.avatar.mtxLocal.translation.x >= (Endabgabe.worldNumber + 1) * Endabgabe.worldLength) {
                movableCamara = false;
                Endabgabe.worldNumber++;
                camaraNode.mtxLocal.translation = new fc.Vector3(Endabgabe.worldLength * Endabgabe.worldNumber, 0, 0);
                worldGenerator.oldWorld(Endabgabe.worldNumber);
            }
        }
        // worldGenerator.updateWorld(worldNumber);
        Endabgabe.avatar.update();
        Endabgabe.viewport.draw();
        for (let enemy of Endabgabe.enemies.getChildren()) {
            enemy.update();
        }
    }
    function genarateWorld(_worldNumber) {
        Endabgabe.gameWorld.addChild(worldGenerator.genarateWorld(_worldNumber, fc.Vector3.X(_worldNumber)));
    }
    async function createAvatarAssets() {
        let txtCacodemon = new fc.TextureImage();
        await txtCacodemon.load("../GameAssets/AvatarAssets.png");
        let coatSprite = new fc.CoatTextured(null, txtCacodemon);
        Endabgabe.Avatar.generateSprites(coatSprite);
    }
    async function createEnemyAssets() {
        let txtCacodemon = new fc.TextureImage();
        await txtCacodemon.load("../GameAssets/AvatarAssets.png");
        let coatSprite = new fc.CoatTextured(null, txtCacodemon);
        Endabgabe.Enemy.generateSprites(coatSprite);
    }
    async function loaddata(_url) {
        let response = await fetch(_url);
        let data = await response.json();
        await loadWoldData(data.world);
    }
    async function loadWoldData(_world) {
        Endabgabe.unit = _world.unit;
        Endabgabe.worldLength = _world.worldLength;
        Endabgabe.worldhight = _world.worldhight;
    }
})(Endabgabe || (Endabgabe = {}));
var Endabgabe;
(function (Endabgabe) {
    var fc = FudgeCore;
    let Worldstatus;
    (function (Worldstatus) {
        Worldstatus[Worldstatus["idel"] = 0] = "idel";
        Worldstatus[Worldstatus["genarate"] = 1] = "genarate";
    })(Worldstatus = Endabgabe.Worldstatus || (Endabgabe.Worldstatus = {}));
    class WorldGenarator {
        constructor(_name) {
            this.txtFloor = new fc.TextureImage("../GameAssets/Ground.png");
            this.name = _name;
            this.worldstatus = Worldstatus.idel;
        }
        genarateWorld(_levelNumber, _position) {
            let mtrWall = new fc.Material("Wall", fc.ShaderTexture, new fc.CoatTextured(null, this.txtFloor));
            let levelRoot = new fc.Node("level" + _levelNumber);
            levelRoot.addChild(new Endabgabe.Floor("Ground", new fc.Vector3(Endabgabe.worldLength, Endabgabe.unit, Endabgabe.unit), new fc.Vector3(0 + _position.x, -17 + _position.y, 0 + _position.z), mtrWall));
            this.tempWall = new Endabgabe.GameObject("LeftWall", new fc.Vector3(Endabgabe.unit, Endabgabe.worldhight, Endabgabe.unit), new fc.Vector3(-23 + _position.x, 0 + _position.y, 0 + _position.z));
            levelRoot.addChild(this.tempWall);
            levelRoot.addChild(new Endabgabe.GameObject("RightWall", new fc.Vector3(Endabgabe.unit, Endabgabe.worldhight, Endabgabe.unit), new fc.Vector3(23 + _position.x, 0 + _position.y, 0 + _position.z)));
            levelRoot.addChild(new Endabgabe.GameObject("Ceiling", new fc.Vector3(Endabgabe.worldLength, Endabgabe.unit, Endabgabe.unit), new fc.Vector3(0 + _position.x, 17 + _position.y, 0 + _position.z)));
            return levelRoot;
        }
        createEnemie(_level) {
            return new Endabgabe.Enemy("enemy", new fc.Vector3(Endabgabe.unit, Endabgabe.unit, 1), new fc.Vector3(fc.Random.default.getRange(5, 10) + Endabgabe.worldLength * _level, 0, 0));
        }
        newWorld(_worldNumber) {
            Endabgabe.enemies.addChild(this.createEnemie(_worldNumber + 1));
            Endabgabe.gameWorld.addChild(this.genarateWorld(_worldNumber + 1, fc.Vector3.X((_worldNumber + 1) * Endabgabe.worldLength)));
            /*gameWorld.getChildrenByName("level" + _worldNumber)[0].removeChild(gameWorld.getChildrenByName("level" + _worldNumber)[0].getChildrenByName("RightWall")[0]);
             gameWorld.getChildrenByName("level" + _worldNumber + 1)[0].removeChild(this.tempWall); */
            Endabgabe.gameWorld.getChild(0).removeChild(Endabgabe.gameWorld.getChild(0).getChildrenByName("RightWall")[0]);
            Endabgabe.gameWorld.getChild(1).removeChild(this.tempWall);
        }
        oldWorld(_worldNumber) {
            Endabgabe.gameWorld.getChild(1).addChild(this.tempWall);
            Endabgabe.gameWorld.removeChild(Endabgabe.gameWorld.getChild(0));
            for (let enemy of Endabgabe.enemies.getChildren()) {
                enemy.setAnimation(Endabgabe.JOB.walk);
                enemy.activ = true;
            }
            /* gameWorld.getChildrenByName("level" + _worldNumber + 1 )[0].addChild(this.tempWall);
            gameWorld.removeChild(gameWorld.getChildrenByName("level" + _worldNumber )[0]); */
        }
    }
    Endabgabe.WorldGenarator = WorldGenarator;
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=Main.js.map