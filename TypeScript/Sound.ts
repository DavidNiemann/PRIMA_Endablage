namespace Endabgabe {
    import fc = FudgeCore;
    // import fcaid = FudgeAid;

    export enum Sounds {
        step, avatarHit, Shword, Jump, Land, collect, enemyHit
    }

    export class Sound {
        private audioSword: fc.Audio;
        private audioAvatarHit: fc.Audio;
        private audioStep: fc.Audio;
        private audioBackground: fc.Audio;
        private audioJump: fc.Audio;
        private audioLand: fc.Audio;
        private audioCollect: fc.Audio;
        private audioEnemyHit: fc.Audio;

        private cmpSwordAudio: fc.ComponentAudio;
        private cmpAvatarHitAudio: fc.ComponentAudio;
        private cmpStepAudio: fc.ComponentAudio;
        private cmpAudioBackground: fc.ComponentAudio;
        private cmpAudioJump: fc.ComponentAudio;
        private cmpAudioCollect: fc.ComponentAudio;
        private cmpEnemyHitAudio: fc.ComponentAudio;
        private cmpAudioLand: fc.ComponentAudio;
     

        public constructor() {

            this.audioSword = new fc.Audio("../GameSounds/mixkit_fast_sword.wav");
            this.cmpSwordAudio = new fc.ComponentAudio(this.audioSword, false, false);
            this.cmpSwordAudio.connect(true);
            this.cmpSwordAudio.volume = 0.5;

            this.audioAvatarHit = new fc.Audio("../GameSounds/mixkit_Hit.mp3");
            this.cmpAvatarHitAudio = new fc.ComponentAudio(this.audioAvatarHit, false, false);
            this.cmpAvatarHitAudio.connect(true);
            this.cmpAvatarHitAudio.volume = 0.5;

            this.audioStep = new fc.Audio("../GameSounds/mixkit_step.wav");
            this.cmpStepAudio = new fc.ComponentAudio(this.audioStep, true, false);
            this.cmpStepAudio.connect(true);
            this.cmpStepAudio.volume = 0.5;

            this.audioBackground = new fc.Audio("../GameSounds/MedivalBeep.mp3");
            this.cmpAudioBackground = new fc.ComponentAudio(this.audioBackground, true, false);
            this.cmpAudioBackground.connect(true);
            this.cmpAudioBackground.volume = 0.5;

            this.audioJump = new fc.Audio("../GameSounds/Jump.mp3");
            this.cmpAudioJump = new fc.ComponentAudio(this.audioJump, false, false);
            this.cmpAudioJump.connect(true);
            this.cmpAudioJump.volume = 0.5;

            this.audioLand = new fc.Audio("../GameSounds/land.mp3");
            this.cmpAudioLand = new fc.ComponentAudio(this.audioLand, false, false);
            this.cmpAudioLand.connect(true);
            this.cmpAudioLand.volume = 0.5;

            this.audioCollect = new fc.Audio("../GameSounds/einsammeln.mp3");
            this.cmpAudioCollect = new fc.ComponentAudio(this.audioCollect, false, false);
            this.cmpAudioCollect.connect(true);
            this.cmpAudioCollect.volume = 0.5;

            
            this.audioEnemyHit = new fc.Audio("../GameSounds/EnemyHit.mp3");
            this.cmpEnemyHitAudio = new fc.ComponentAudio(this.audioEnemyHit, false, false);
            this.cmpEnemyHitAudio.connect(true);
            this.cmpEnemyHitAudio.volume = 0.5;

        }

        /*Sound die einmalig abgespeilt werden*/
        public playSound(_sound: Sounds): void {
            switch (_sound) {

                case Sounds.avatarHit:
                    this.cmpAvatarHitAudio.play(true);
                    break;

                case Sounds.Shword:
                    this.cmpSwordAudio.play(true);
                    break;

                case Sounds.Jump:
                    this.cmpAudioJump.play(true);
                    break;

                case Sounds.Land:
                    this.cmpAudioLand.play(true);
                    break;

                case Sounds.collect:
                    this.cmpAudioCollect.play(true);
                    break;
                   
                case Sounds.enemyHit:
                    this.cmpEnemyHitAudio.play(true);
                    break;

                default:
                    break;
            }


        }

        /**********Anfang************/
        // Sounds die in schleife laufen und Gestartet und Beedetwerden können 
        public hndBackroundSound(_OnOff: boolean): void {

            if (this.cmpAudioBackground.isPlaying && _OnOff == false) {
                this.cmpAudioBackground.play(_OnOff);
            } else if (this.cmpAudioBackground.isPlaying == false && _OnOff) {
                this.cmpAudioBackground.play(_OnOff);
            }

          
        }

        public stepSound(_OnOff: boolean): void {
            if (this.cmpStepAudio.isPlaying && _OnOff == false) {
                this.cmpStepAudio.play(_OnOff);
            } else if (this.cmpStepAudio.isPlaying == false && _OnOff) {
                this.cmpStepAudio.play(_OnOff);
            }
          
         
        }
        /************Ende***************/
    }
}