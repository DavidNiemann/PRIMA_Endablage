namespace Endabgabe {
    import fc = FudgeCore;
    // import fcaid = FudgeAid;

    export enum Sounds {
        Step, Hit, Shword, Jump, Land
    }

    export class Sound {
        private audioShword: fc.Audio;
        private audioHit: fc.Audio;
        private audioStep: fc.Audio;
        private audioBackround: fc.Audio;
        private audioJump: fc.Audio;
        private audioLand: fc.Audio;

        private cmpShwordAudio: fc.ComponentAudio;
        private cmpHitAudio: fc.ComponentAudio;
        private cmpStepAudio: fc.ComponentAudio;
        private cmpAudioBackround: fc.ComponentAudio;
        private cmpAudioJump: fc.ComponentAudio;

        private cmpAudioLand: fc.ComponentAudio;
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

            this.audioJump = new fc.Audio("../GameSounds/Jump.mp3");
            this.cmpAudioJump = new fc.ComponentAudio(this.audioJump, false, false);
            this.cmpAudioJump.connect(true);
            this.cmpAudioJump.volume = 1;

            this.audioLand = new fc.Audio("../GameSounds/land.mp3");
            this.cmpAudioLand = new fc.ComponentAudio(this.audioLand, false, false);
            this.cmpAudioLand.connect(true);
            this.cmpAudioLand.volume = 1;
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

                case Sounds.Jump:
                    this.cmpAudioJump.play(true);
                    break;

                case Sounds.Land:
                    this.cmpAudioLand.play(true);
                    break;
                    
                default:
                    break;
            }


        }


        public hndBackroundSound(_play: boolean): void {

            if (_play != this.backRound0n) {
                this.cmpAudioBackround.play(_play);
            }

            this.backRound0n = _play;

        }
    }
}