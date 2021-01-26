namespace Endabgabe {
    import fc = FudgeCore;


    export enum Worldstatus {
        idel, genarate
    }
    export class WorldGenarator {
        public name: string;
        public worldstatus: Worldstatus;


   /*      public worldNumber: number = 0;
        public unit: number; // = 2;
        public worldLength: number; // = unit * 25;
        public worldhight: number; // = unit * 20; */

        private tempWall: GameObject;
        private txtFloor: fc.TextureImage = new fc.TextureImage("../GameAssets/Ground.png");
       
        constructor(_name: string) {
            this.name = _name;
            this.worldstatus = Worldstatus.idel;

        }

        public genarateWorld(_levelNumber: number, _position: fc.Vector3): fc.Node {
            let mtrWall: fc.Material = new fc.Material("Wall", fc.ShaderTexture, new fc.CoatTextured(null, this.txtFloor));
            let levelRoot: fc.Node = new fc.Node("level" + _levelNumber);
            levelRoot.addChild(new Floor("Ground", new fc.Vector3(worldLength, unit, unit), new fc.Vector3(0 + _position.x, -17 + _position.y, 0 + _position.z), mtrWall));
            this.tempWall = new GameObject("LeftWall", new fc.Vector3(unit, worldhight, unit), new fc.Vector3(-23 + _position.x, 0 + _position.y, 0 + _position.z));
            levelRoot.addChild(this.tempWall);
            levelRoot.addChild(new GameObject("RightWall", new fc.Vector3(unit, worldhight, unit), new fc.Vector3(23 + _position.x, 0 + _position.y, 0 + _position.z)));
            levelRoot.addChild(new GameObject("Ceiling", new fc.Vector3(worldLength, unit, unit), new fc.Vector3(0 + _position.x, 17 + _position.y, 0 + _position.z)));
            return levelRoot;
        }

        public createEnemie(_level: number): Enemy {
            return new Enemy("enemy", new fc.Vector3(unit, unit, 1), new fc.Vector3(fc.Random.default.getRange(5, 10) + worldLength * _level, 0, 0));

        }

        public newWorld(_worldNumber: number): void {
            enemies.addChild(this.createEnemie(_worldNumber + 1));
            gameWorld.addChild(this.genarateWorld(_worldNumber + 1, fc.Vector3.X((_worldNumber + 1) * worldLength)));
            /*gameWorld.getChildrenByName("level" + _worldNumber)[0].removeChild(gameWorld.getChildrenByName("level" + _worldNumber)[0].getChildrenByName("RightWall")[0]);
             gameWorld.getChildrenByName("level" + _worldNumber + 1)[0].removeChild(this.tempWall); */
            gameWorld.getChild(0).removeChild(gameWorld.getChild(0).getChildrenByName("RightWall")[0]);
            gameWorld.getChild(1).removeChild(this.tempWall);
        }

        public oldWorld(_worldNumber?: number): void {
            gameWorld.getChild(1).addChild(this.tempWall);
            gameWorld.removeChild(gameWorld.getChild(0));
            for (let enemy of enemies.getChildren() as Enemy[]) {
                enemy.setAnimation(JOB.walk);
                enemy.activ = true;
            }
            /* gameWorld.getChildrenByName("level" + _worldNumber + 1 )[0].addChild(this.tempWall);
            gameWorld.removeChild(gameWorld.getChildrenByName("level" + _worldNumber )[0]); */

        }

    /*     public loadWorldData() {

        } */

    }




}