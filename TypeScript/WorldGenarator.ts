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
        //private txtFloor: fc.TextureImage = new fc.TextureImage("../GameAssets/Ground.png");

        constructor(_name: string) {
            this.name = _name;
            this.worldstatus = Worldstatus.idel;

        }



        public genarateWorld(_levelNumber: number, _position: fc.Vector3): fc.Node {


            let levelRoot: fc.Node = new fc.Node("level" + _levelNumber);
            levelRoot.addChild(new Floor("Ground", new fc.Vector3(worldLength, unit, unit), new fc.Vector3(0 + _position.x, -17 + _position.y, 0 + _position.z)));
            this.tempWall = new GameObject("LeftWall", new fc.Vector3(unit, worldhight, unit), new fc.Vector3(-23 + _position.x, 0 + _position.y, 0 + _position.z));
            levelRoot.addChild(this.tempWall);
            levelRoot.addChild(new GameObject("RightWall", new fc.Vector3(unit, worldhight, unit), new fc.Vector3(23 + _position.x, 0 + _position.y, 0 + _position.z)));
            levelRoot.addChild(new GameObject("Ceiling", new fc.Vector3(worldLength, unit, unit), new fc.Vector3(0 + _position.x, 17 + _position.y, 0 + _position.z)));


            let length: number = fc.Random.default.getRange(unit, worldLength / 2);

            let xPos: number = fc.Random.default.getRange(-worldLength / 2 + length + unit, worldLength / 2 - length - unit);
            let jumpDistance: number = unit;
            for (let i: number = 0; i < fc.Random.default.getRange(0, 4); i++) {
                xPos = fc.Random.default.getRange(xPos + jumpDistance, -(xPos + jumpDistance));
                length = fc.Random.default.getRange(unit, worldLength / 2);
                levelRoot.addChild(new Floor("Ground", new fc.Vector3(length, unit, unit), new fc.Vector3(xPos + _position.x, (3 - (unit - unit / 4) * i) * -unit * 2 + _position.y, 0 + _position.z)));

            }


            return levelRoot;
        }

        public createEnemie(_level: number): Enemy {

            return new Enemy("enemy", new fc.Vector3(unit, 2 * unit, 1), new fc.Vector3(fc.Random.default.getRange(5, 10) + worldLength * _level, 0, 0), enemyProperties.startLife + _level * enemyProperties.lifePerLevel, Math.floor(enemyProperties.damage + _level * enemyProperties.damagePerLevel));



        }


        public createItems(_level: number): void {
            items.removeAllChildren();
            for (let i: number = 0; i < fc.Random.default.getRange(0, 2); i++) {

                items.addChild(new HealthUp("HealthUp", fc.Vector3.ONE(unit), new fc.Vector3(fc.Random.default.getRange(worldLength * _level - worldLength / 2, worldLength * _level + worldLength / 2), 0, 0)));
            }
        }

        public createNewWorld(_worldNumber: number): void {
            //for (let j: number = 0; j < Math.floor(_worldNumber / 10) + 1; j++) {
            enemies.addChild(this.createEnemie(_worldNumber + 1));
            // }
            gameWorld.addChild(this.genarateWorld(_worldNumber + 1, fc.Vector3.X((_worldNumber + 1) * worldLength)));

            root.addChild(new Background("Background", new fc.Vector3(worldLength, worldhight, unit), fc.Vector3.X((_worldNumber + 1) * worldLength)));

            /*gameWorld.getChildrenByName("level" + _worldNumber)[0].removeChild(gameWorld.getChildrenByName("level" + _worldNumber)[0].getChildrenByName("RightWall")[0]);
             gameWorld.getChildrenByName("level" + _worldNumber + 1)[0].removeChild(this.tempWall); */
            gameWorld.getChild(0).removeChild(gameWorld.getChild(0).getChildrenByName("RightWall")[0]);
            gameWorld.getChild(1).removeChild(this.tempWall);

        }
        public deleteoldWorld(_worldNumber?: number): void {
            gameWorld.getChild(1).addChild(this.tempWall);
            //gameWorld.getChildrenByName("level" + _worldNumber)[0].addChild(this.tempWall);
            gameWorld.removeChild(gameWorld.getChild(0));
            for (let enemy of enemies.getChildren() as Enemy[]) {
                // enemy.setJob(JOB.walk);
                enemy.activ = true;
            }
            /* gameWorld.getChildrenByName("level" + _worldNumber + 1 )[0].addChild(this.tempWall);
            gameWorld.removeChild(gameWorld.getChildrenByName("level" + _worldNumber )[0]); */
            this.createItems(_worldNumber);
            Hud.setHubhealth();
        }


        /*     public loadWorldData() {
     
            } */

    }




}