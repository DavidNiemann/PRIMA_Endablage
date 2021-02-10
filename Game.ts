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
    export let items: fc.Node;
    export let worldNumber: number = 0;
    export let unit: number; // = 2;
    export let worldLength: number; // = unit * 25;
    export let worldhight: number; // = unit * 20;

    export let sounds: Sound;

    let root: fc.Node;
    let camaraNode: fc.Node;
    let worldGenerator: WorldGenarator;
    let movableCamara: boolean = false;

    export let avatarProperties: AvatarProperties;
    export let enemyProperties: EnemyProperties;

    async function sceneLoad(_event?: Event): Promise<void> {
        sounds = new Sound();
        hndGameConditiones();

        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        gameCondition = GamesConditions.STARTGAME;

        await loaddata("../Data/data.json");

        gameState.health = avatarProperties.startLife;

        root = new fc.Node("root");
        items = new fc.Node("items");

        camaraNode = new fc.Node("camara");
        camaraNode.addComponent(new fc.ComponentTransform());
        root.addChild(camaraNode);
        gameWorld = new fc.Node("GameWorld");

        root.addChild(gameWorld);
        root.addChild(items);
        worldGenerator = new WorldGenarator("world");
        genarateWorld(worldNumber);


        await createAvatarAssets();
        avatar = new Avatar("Avatar", new fc.Vector3(2 * unit, 2 * unit, 1), fc.Vector3.ZERO());

        root.addChild(avatar);

        enemies = new fc.Node("Enemies");
        await createEnemyAssets();

        root.addChild(enemies);

        enemies.addChild(worldGenerator.createEnemie(worldNumber));
        (<Enemy>enemies.getChild(0)).activ = true;

        /* 
                test = new HealthUp("HealthUp", fc.Vector3.ONE(unit), fc.Vector3.ZERO());
                gameWorld.addChild(test); */

        let cmpCamera: fc.ComponentCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translateZ(worldLength);
        cmpCamera.pivot.rotateY(180);
        camaraNode.addComponent(cmpCamera);

        document.addEventListener("keypress", avatar.hndJump);
        document.addEventListener("keypress", avatar.hadKeyboard);
        document.addEventListener("click", avatar.strike);
        //canvas.addEventListener("click", canvas.requestPointerLock);
        //canvas.addEventListener("mousemove", avatar.hndMouse);

        Hud.start();
        Hud.setHubhealth();

        viewport = new fc.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
        fc.Debug.log(viewport);
        viewport.camera.backgroundColor = fc.Color.CSS("Blue");
        fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
        viewport.draw();

    }


    function hndLoop(_event: Event): void {
        /*  test.update(); */
        if (gameCondition == GamesConditions.PLAY) {

            if (!enemies.getChild(0)) {
                worldGenerator.createNewWorld(worldNumber);
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
                    worldGenerator.deleteoldWorld(worldNumber);
                }

            }


            // worldGenerator.updateWorld(worldNumber);
            avatar.update();

            for (let enemy of enemies.getChildren() as MoveObject[]) {
                enemy.update();

            }
            for (let item of items.getChildren() as MoveObject[]) {
                item.update();

            }
            viewport.draw();
        }
        else {
            /*  avatar.setPause();
             for (let enemy of enemies.getChildren() as Enemy[]) {
                 enemy.setPause();
             } */

        }
    }


    function genarateWorld(_worldNumber: number): void {
        gameWorld.addChild(worldGenerator.genarateWorld(_worldNumber, fc.Vector3.X(_worldNumber)));
    }

    async function createAvatarAssets(): Promise<void> {
        let txtAvatar: fc.TextureImage = new fc.TextureImage();
        await txtAvatar.load("../GameAssets/AvatarAssets.png");
        let coatSprite: fc.CoatTextured = new fc.CoatTextured(null, txtAvatar);
        Avatar.generateSprites(coatSprite);

    }
    async function createEnemyAssets(): Promise<void> {
        let txtEnemy: fc.TextureImage = new fc.TextureImage();
        await txtEnemy.load("../GameAssets/AvatarAssets.png");
        let coatSprite: fc.CoatTextured = new fc.CoatTextured(null, txtEnemy);
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

            let currentTarget: HTMLButtonElement = (<HTMLButtonElement>_event.currentTarget);
            currentTarget.focus();
            switch (currentTarget.value) {

                case "start":
                    gameCondition = GamesConditions.PLAY;
                    butten.value = "pause";
                    butten.innerHTML = "pause";
                    sounds.hndBackroundSound(true);

                    break;
                case "pause":
                    gameCondition = GamesConditions.BREAK;
                    butten.value = "start";
                    butten.innerHTML = "start";
                    sounds.hndBackroundSound(false);
                    break;
                case "restart":
                    let gameOverText: HTMLParagraphElement = (<HTMLParagraphElement>document.getElementById("gameover"));

                    if (gameOverText) {
                        gameOverText.remove();
                    }
                    buttenDiv.removeChild(butten);
                    buttenDiv.removeChild(restartButten);
                    worldNumber = 0;
                    gameState.score = 0;
                    movableCamara = false;
                    sounds.hndBackroundSound(false);
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
        if (butten) { butten.style.display = "none"; }
        let buttenDiv: HTMLDivElement = (<HTMLDivElement>document.getElementById("gameButtenDiv"));
        let gameOverText: HTMLParagraphElement = document.createElement("p");
        gameOverText.id = "gameover";
        gameOverText.innerHTML = "Game Over"; buttenDiv.appendChild(gameOverText);
    }



}