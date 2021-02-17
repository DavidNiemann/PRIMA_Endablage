namespace Endabgabe {
    import fcui = FudgeUserInterface;
    import fc = FudgeCore;

    export class GameState extends fc.Mutable {
        public health: number = 0;
        public score: number = 0;
        public enemyHealth: number = 1;
        public currentEnemyHealth: number = 1;
        protected reduceMutator(_mutator: fc.Mutator): void {/* */ }
    }

    export let gameState: GameState = new GameState();

    export class Hud {
        private static controller: fcui.Controller;

        public static start(): void {

            let gameHud: HTMLDivElement = document.querySelector("div#hud");
            Hud.controller = new fcui.Controller(gameState, gameHud);
            Hud.controller.updateUserInterface();


        }
        /****************Anfang********************/
        //Lebensbalgen für die Gegner wereden Erstellt 
        public static hndHealthBar(): void {
            let currentHealth: HTMLDivElement = (<HTMLDivElement>document.getElementById("healthEnemy"));
            currentHealth.style.width = 160 * gameState.currentEnemyHealth / gameState.enemyHealth + "px";
        }

        public static setHubhealth(): void {
            let health: number = 0;
            for (let enemy of enemies.getChildren() as Enemy[]) {

                health += enemy.health;

            }

            gameState.enemyHealth = health;
            gameState.currentEnemyHealth = health;
            Hud.hndHealthBar();
        }
        /****************Ende*********************/
    }



}