namespace Endabgabe {

    import fc = FudgeCore;

    export enum GamesConditions {
        PLAY, GAMEOVER, BREAK, STARTGAME
    }

    window.addEventListener("load", sceneLoad);

    export let gameCondition: GamesConditions;
    export let viewport: fc.Viewport;

    export let avatar: Avatar;
    export let gameWorld: fc.Node;
    export let enemies: fc.Node;

    export let worldNumber: number = 0;
    export let unit: number; // = 2;
    export let worldLength: number; // = unit * 25;
    export let worldhight: number; // = unit * 20;

    let root: fc.Node;
    let camaraNode: fc.Node;
    let worldGenerator: WorldGenarator;
    let movableCamara: boolean = false;

    export let avatarProperties: AvatarProperties;
    export let enemyProperties: EnemyProperties;

    async function sceneLoad(_event?: Event): Promise<void> {

        hndGameConditiones();

        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        gameCondition = GamesConditions.STARTGAME;
        await loaddata("../Data/data.json");
        gameState.health = avatarProperties.startLife;
        root = new fc.Node("root");


        camaraNode = new fc.Node("camara");
        camaraNode.addComponent(new fc.ComponentTransform());
        root.addChild(camaraNode);
        gameWorld = new fc.Node("GameWorld");
        root.addChild(gameWorld);

        worldGenerator = new WorldGenarator("world");
        genarateWorld(worldNumber);


        await createAvatarAssets();
        avatar = new Avatar("Avatar", new fc.Vector3(unit, unit, 1), fc.Vector3.ZERO());

        root.addChild(avatar);

        enemies = new fc.Node("Enemies");
        await createEnemyAssets();

        root.addChild(enemies);

        enemies.addChild(worldGenerator.createEnemie(worldNumber));
        (<Enemy>enemies.getChild(0)).activ = true;



        let cmpCamera: fc.ComponentCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translateZ(worldLength);
        cmpCamera.pivot.rotateY(180);
        camaraNode.addComponent(cmpCamera);

        document.addEventListener("keypress", avatar.hndJump);
        document.addEventListener("keypress", avatar.hadKeyboard);
        document.addEventListener("click", avatar.strike);
        // canvas.addEventListener("click", canvas.requestPointerLock);
        //canvas.addEventListener("mousemove", avatar.hndMouse);
        Hud.start();
        viewport = new fc.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
        fc.Debug.log(viewport);
        viewport.camera.backgroundColor = fc.Color.CSS("Blue");
        fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
        viewport.draw();
    }


    function hndLoop(_event: Event): void {
        if (gameCondition == GamesConditions.PLAY) {

            if (!enemies.getChild(0)) {
                worldGenerator.newWorld(worldNumber);
                movableCamara = true;
            }
            if (movableCamara) {
                if (avatar.mtxLocal.translation.x > worldNumber * worldLength) {
                    camaraNode.mtxLocal.translation = new fc.Vector3(avatar.mtxWorld.translation.x, 0, 0);
                }
                if (avatar.mtxLocal.translation.x >= (worldNumber + 1) * worldLength) {
                    movableCamara = false;
                    worldNumber++;
                    camaraNode.mtxLocal.translation = new fc.Vector3(worldLength * worldNumber, 0, 0);
                    worldGenerator.oldWorld(worldNumber);
                }

            }

            // worldGenerator.updateWorld(worldNumber);
            avatar.update();

            for (let enemy of enemies.getChildren() as MoveObject[]) {
                enemy.update();

            }
            viewport.draw();
        }

    }


    function genarateWorld(_worldNumber: number): void {
        gameWorld.addChild(worldGenerator.genarateWorld(_worldNumber, fc.Vector3.X(_worldNumber)));
    }

    async function createAvatarAssets(): Promise<void> {
        let txtCacodemon: fc.TextureImage = new fc.TextureImage();
        await txtCacodemon.load("../GameAssets/AvatarAssets.png");
        let coatSprite: fc.CoatTextured = new fc.CoatTextured(null, txtCacodemon);
        Avatar.generateSprites(coatSprite);

    }
    async function createEnemyAssets(): Promise<void> {
        let txtCacodemon: fc.TextureImage = new fc.TextureImage();
        await txtCacodemon.load("../GameAssets/AvatarAssets.png");
        let coatSprite: fc.CoatTextured = new fc.CoatTextured(null, txtCacodemon);
        Enemy.generateSprites(coatSprite);

    }

    async function loaddata(_url: string): Promise<void> {
        let response: Response = await fetch(_url);
        let data: Data = await response.json();
        await loadWoldData(data.worldProperties);
        avatarProperties = data.avatarProperties;
        enemyProperties = data.enemyProperties;
    }

    async function loadWoldData(_world: World): Promise<void> {
        unit = _world.unit;
        worldLength = _world.worldLength;
        worldhight = _world.worldhight;
    }




    export function hndGameConditiones(): void {
        let buttenDiv: HTMLDivElement = (<HTMLDivElement>document.getElementById("gameButtenDiv"));


        let restartButten: HTMLButtonElement = document.createElement("button");
        let butten: HTMLButtonElement = document.createElement("button");

        restartButten.value = "restart";
        restartButten.innerHTML = "restart";
        butten.id = "RButten";
        buttenDiv.appendChild(restartButten);


        butten.value = "start";
        butten.innerHTML = "start";
        butten.id = "PSButten";
        buttenDiv.appendChild(butten);
        butten.addEventListener("click", hndGameButtons);


        restartButten.addEventListener("click", hndGameButtons);

        function hndGameButtons(_event: Event): void {
            switch ((<HTMLButtonElement>_event.currentTarget).value) {

                case "start":
                    gameCondition = GamesConditions.PLAY;
                    butten.value = "pause";
                    butten.innerHTML = "pause";


                    break;
                case "pause":
                    gameCondition = GamesConditions.BREAK;
                    butten.value = "start";
                    butten.innerHTML = "start";

                    break;
                case "restart":
                    let gameOverText: HTMLParagraphElement = (<HTMLParagraphElement>document.getElementById("gameover"));

                    if (gameOverText) {
                        gameOverText.remove();
                    }
                    buttenDiv.removeChild(butten);
                    buttenDiv.removeChild(restartButten);


                    sceneLoad();
                    break;
                default:
                    break;
            }
        }


    }
    export function hndGameOver(): void {
        gameCondition = GamesConditions.GAMEOVER;
        let butten: HTMLButtonElement = (<HTMLButtonElement>document.getElementById("PSButten"));
        if (butten) {butten.style.display = "none"; }
        let buttenDiv: HTMLDivElement = (<HTMLDivElement>document.getElementById("gameButtenDiv"));
        let gameOverText: HTMLParagraphElement = document.createElement("p");
        gameOverText.id = "gameover";
        gameOverText.innerHTML = "Game Over"; buttenDiv.appendChild(gameOverText);
    }

}