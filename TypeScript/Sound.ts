namespace Endabgabe {
    import fc = FudgeCore;
    // import fcaid = FudgeAid;

    export enum Sounds {
        Step, AvatarHit, Shword, Jump, Land, collect, EnemyHit
    }

    export class Sound {
        private audioShword: fc.Audio;
        private audioAvatarHit: fc.Audio;
        private audioStep: fc.Audio;
        private audioBackround: fc.Audio;
        private audioJump: fc.Audio;
        private audioLand: fc.Audio;
        private audiocollect: fc.Audio;
        private audioEnemyHit: fc.Audio;

        private cmpShwordAudio: fc.ComponentAudio;
        private cmpAvatarHitAudio: fc.ComponentAudio;
        private cmpStepAudio: fc.ComponentAudio;
        private cmpAudioBackround: fc.ComponentAudio;
        private cmpAudioJump: fc.ComponentAudio;
        private cmpAudioCollect: fc.ComponentAudio;
        private cmpEnemyHitAudio: fc.ComponentAudio;
        private cmpAudioLand: fc.ComponentAudio;
     

        public constructor() {

            this.audioShword = new fc.Audio("../GameSounds/mixkit_fast_sword.wav");
            this.cmpShwordAudio = new fc.ComponentAudio(this.audioShword, false, false);
            this.cmpShwordAudio.connect(true);
            this.cmpShwordAudio.volume = 0.5;

            this.audioAvatarHit = new fc.Audio("../GameSounds/mixkit_Hit.mp3");
            this.cmpAvatarHitAudio = new fc.ComponentAudio(this.audioAvatarHit, false, false);
            this.cmpAvatarHitAudio.connect(true);
            this.cmpAvatarHitAudio.volume = 0.5;

            this.audioStep = new fc.Audio("../GameSounds/mixkit_step.wav");
            this.cmpStepAudio = new fc.ComponentAudio(this.audioStep, true, false);
            this.cmpStepAudio.connect(true);
            this.cmpStepAudio.volume = 0.5;

            this.audioBackround = new fc.Audio("../GameSounds/MedivalBeep.mp3");
            this.cmpAudioBackround = new fc.ComponentAudio(this.audioBackround, true, false);
            this.cmpAudioBackround.connect(true);
            this.cmpAudioBackround.volume = 0.5;

            this.audioJump = new fc.Audio("../GameSounds/Jump.mp3");
            this.cmpAudioJump = new fc.ComponentAudio(this.audioJump, false, false);
            this.cmpAudioJump.connect(true);
            this.cmpAudioJump.volume = 0.5;

            this.audioLand = new fc.Audio("../GameSounds/land.mp3");
            this.cmpAudioLand = new fc.ComponentAudio(this.audioLand, false, false);
            this.cmpAudioLand.connect(true);
            this.cmpAudioLand.volume = 0.5;

            this.audiocollect = new fc.Audio("../GameSounds/einsammeln.mp3");
            this.cmpAudioCollect = new fc.ComponentAudio(this.audiocollect, false, false);
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

                case Sounds.AvatarHit:
                    this.cmpAvatarHitAudio.play(true);
                    break;

                case Sounds.Shword:
                    this.cmpShwordAudio.play(true);
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
                   
                case Sounds.EnemyHit:
                    this.cmpEnemyHitAudio.play(true);
                    break;

                default:
                    break;
            }


        }

        /**********Anfang************/
        // Sounds die in schleife laufen und Gestartet und Beedetwerden können 
        public hndBackroundSound(_OnOff: boolean): void {

            if (this.cmpAudioBackround.isPlaying && _OnOff == false) {
                this.cmpAudioBackround.play(_OnOff);
            } else if (this.cmpAudioBackround.isPlaying == false && _OnOff) {
                this.cmpAudioBackround.play(_OnOff);
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