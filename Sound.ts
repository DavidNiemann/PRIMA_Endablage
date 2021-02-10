namespace Endabgabe {
    import fc = FudgeCore;
    // import fcaid = FudgeAid;

    export enum Sounds {
        Step, Hit, Shword
    }

    export class Sound {
        private audioShword: fc.Audio;
        private audioHit: fc.Audio;
        private audioStep: fc.Audio;
        private audioBackround: fc.Audio;

        private cmpShwordAudio: fc.ComponentAudio;
        private cmpHitAudio: fc.ComponentAudio;
        private cmpStepAudio: fc.ComponentAudio;
        private cmpAudioBackround: fc.ComponentAudio;

       private backRound0n: boolean = false;
        public constructor() {

            this.audioShword = new fc.Audio("../GameSounds/mixkit_fast_sword.wav");
            this.cmpShwordAudio = new fc.ComponentAudio(this.audioShword, false, false);
            this.cmpShwordAudio.connect(true);
            this.cmpShwordAudio.volume = 1;

            this.audioHit = new fc.Audio("../GameSounds/mixkit_Hit.mp3");
            this.cmpHitAudio = new fc.ComponentAudio(this.audioHit, false, false);
            this.cmpHitAudio.connect(true);
            this.cmpHitAudio.volume = 1;

            this.audioStep = new fc.Audio("../GameSounds/mixkit_step.wav");
            this.cmpStepAudio = new fc.ComponentAudio(this.audioStep, true, false);
            this.cmpStepAudio.connect(true);
            this.cmpStepAudio.volume = 1;

            this.audioBackround = new fc.Audio("../GameSounds/background.mp3");
            this.cmpAudioBackround = new fc.ComponentAudio(this.audioBackround, true, false);
            this.cmpAudioBackround.connect(true);
            this.cmpAudioBackround.volume = 1;
        }


        public playSound(_sound: Sounds): void {
            switch (_sound) {

                case Sounds.Hit:
                    this.cmpHitAudio.play(true);
                    break;

                case Sounds.Shword:
                    this.cmpShwordAudio.play(true);
                    break;

                case Sounds.Step:
                    this.cmpStepAudio.play(true);
                    break;

                default:
                    break;
            }   


        }


        public hndBackroundSound(_play: boolean): void {
            
            if (_play !=  this.backRound0n) {
                this.cmpAudioBackround.play(_play);
            }
            
            this.backRound0n = _play;

        }
    }
}