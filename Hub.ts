namespace Endabgabe {
    import fcui = FudgeUserInterface;
    import fc = FudgeCore;

    export class GameState extends fc.Mutable {
        public health: number = 0;
        public score: number = 0;

        protected reduceMutator(_mutator: fc.Mutator): void {/* */ }
    }

    export let gameState: GameState = new GameState();

    export class Hud {
        private static controller: fcui.Controller;

        public static start(): void {

            let gameHud: HTMLDivElement = document.querySelector("div#hud");
            Hud.controller = new fcui.Controller(gameState, gameHud);
            Hud.controller.updateUserInterface();
          
            /* let startButten: HTMLButtonElement = document.createElement("button");
            startButten.id = "start";
            startButten.innerHTML = "start";
            startButten.addEventListener("click", hndGameConditions);
            let breakButten: HTMLButtonElement = document.createElement("button");
            breakButten.id = "break";
            breakButten.innerHTML = "break";
            breakButten.addEventListener("click", hndGameConditions);
            let restartButten: HTMLButtonElement = document.createElement("button");
            restartButten.id = "restart";
            restartButten.innerHTML = "restart";
            restartButten.addEventListener("click", hndGameConditions);

            gameHud.appendChild(startButten);
            function hndGameConditions(_event: Event): void {
                let target: HTMLButtonElement = (<HTMLButtonElement>_event.currentTarget);

                switch (target.id) {
                    case "start":
                        gameCondition = GamesConditions.PLAY;
                        gameHud.removeChild(startButten);
                        gameHud.appendChild(breakButten);
                        //gameHud.removeChild(restartButten);
                        break;
                    case "break":
                        gameCondition = GamesConditions.BREAK;
                        gameHud.appendChild(startButten);
                        gameHud.removeChild(breakButten);
                        //gameHud.appendChild(restartButten);
                        break;
                    case "restart":
                        gameHud.removeChild(breakButten);
                        //gameHud.appendChild(restartButten);
                        sceneLoad();
                        break;
                    default:
                        break;
                }
            }
 */

        }
        /*  public static hndGameOver(): void {
             let gameHud: HTMLDivElement = document.querySelector("div#hud");
           let gameHud: HTMLDivElement = document.querySelector("div#hud");
             let gameOverText: HTMLParagraphElement = document.createElement("p");
             gameOverText.id = "gameOverText";
             gameOverText.innerHTML = "GAME OVER";
             gameHud.appendChild(gameOverText);
             gameHud.removeChild(breakButten);
             let restartButten: HTMLButtonElement = document.createElement("button");
             restartButten.id = "restart";
             restartButten.innerHTML = "restart";
             restartButten.addEventListener("click", sceneLoad;
             gameHud.appendChild(restartButten);
         }*/
    }

}