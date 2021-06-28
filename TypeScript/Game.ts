namespace Endabgabe {

    import fc = FudgeCore;

    export enum GamesConditions {
        PLAY, GAMEOVER, BREAK, STARTGAME
    }

    window.addEventListener("load", sceneLoad);

    export let white: fc.Color = fc.Color.CSS("White");
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

    export let root: fc.Node;
    let camaraNode: fc.Node;
    let worldGenerator: WorldGenarator;
    let movableCamara: boolean = false;

    export let avatarProperties: AvatarProperties;
    export let enemyProperties: EnemyProperties;

    /*****************Anfang********************/
    // Die Spiel wichtigen Daten werden zum Begin geladen 
    
    async function sceneLoad(_event?: Event): Promise<void> {

        await loaddata("../Data/data.json");
        await createEnemyAssets();
        await createAvatarAssets();

        /*****************Anfang********************/
        // Das Dokument kann nicht mehr Makiert werden 

        var element: Document = document;
        element.onselectstart = function (): boolean { return false; };
        element.onmousedown = function (): boolean { return false; };
        /****************Ende******************/

        const canvas: HTMLCanvasElement = document.querySelector("canvas");

        sounds = new Sound();
        root = new fc.Node("root");
        items = new fc.Node("items");
        camaraNode = new fc.Node("camara");
        gameWorld = new fc.Node("GameWorld");
        avatar = new Avatar("Avatar", new fc.Vector3(2 * unit, 2 * unit, 1), fc.Vector3.ZERO());
        enemies = new fc.Node("Enemies");
        worldGenerator = new WorldGenarator("world");

        root.addChild(camaraNode);
        root.addChild(gameWorld);
        root.addChild(items);
        root.addChild(avatar);
        root.addChild(enemies);
        root.addChild(new Background("Background", new fc.Vector3(worldLength, worldhight, unit), fc.Vector3.X(0)));

        gameCondition = GamesConditions.STARTGAME;
        gameState.health = avatarProperties.startLife;

        gameWorld.addChild(worldGenerator.genarateWorld(worldNumber, fc.Vector3.X(worldNumber)));
        hndGameConditiones();

        enemies.addChild(worldGenerator.createEnemie(worldNumber));
        (<Enemy>enemies.getChild(0)).activ = true;

        camaraNode.addComponent(new fc.ComponentTransform());

        let cmpCamera: fc.ComponentCamera = new fc.ComponentCamera();
        cmpCamera.mtxPivot.translateZ(worldLength);
        cmpCamera.mtxPivot.rotateY(180);
        camaraNode.addComponent(cmpCamera);

        document.addEventListener("keypress", avatar.hndJump);
        document.addEventListener("keypress", avatar.hadKeyboard);
        document.addEventListener("click", avatar.strike);
        document.addEventListener("click", function (): void {
            if (document.activeElement.toString() == "[objnect HTMLButtonElement]") { (<HTMLButtonElement>document.activeElement).blur(); } // Verhindert Das Der Butten Im Focus Bleibt so das Er Bie Trücken der Spacetaste Ausgelöst wird 
        });

        //canvas.addEventListener("click", canvas.requestPointerLock);
        //canvas.addEventListener("mousemove", avatar.hndMouse);


        Hud.start();
        Hud.setHubhealth();

        viewport = new fc.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
        viewport.camera.clrBackground = fc.Color.CSS("Blue");

        fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);

        viewport.draw();

    }

    /*****************Anfang********************/
    // aktualisieren des Spieles 

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
    /******************Ende******************/

    /******************Start****************/
    // Laden der Externen Daten und Bildern 

    async function createAvatarAssets(): Promise<void> {
        let txtAvatar: fc.TextureImage = new fc.TextureImage();
        await txtAvatar.load("../GameAssets/AvatarAssets.png");
        let coatSprite: fc.CoatTextured = new fc.CoatTextured(white, txtAvatar);
        Avatar.generateSprites(coatSprite);

    }
    async function createEnemyAssets(): Promise<void> {
        let txtEnemy: fc.TextureImage = new fc.TextureImage();
        await txtEnemy.load("../GameAssets/Skeleton.png");
        let coatSprite: fc.CoatTextured = new fc.CoatTextured(white, txtEnemy);
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
    /******************Ende****************/


    /*****************Anfang***************/
    // Butten für das Menü um das Spiel zu pausieren/Starten und Neu Starten 
    // GameOver state 

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
                    sounds.stepSound(false);
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
                    sounds.stepSound(false);
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
        let textDiv: HTMLDivElement = (<HTMLDivElement>document.getElementById("GameOverText"));
        let gameOverText: HTMLParagraphElement = document.createElement("p");
        gameOverText.id = "gameover";
        gameOverText.innerHTML = "Game Over";
        textDiv.appendChild(gameOverText);
    }
    /***************Ende***************/
}