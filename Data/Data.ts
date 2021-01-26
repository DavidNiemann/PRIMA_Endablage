namespace Endabgabe {

    // let unit: number = 2;
    export interface Enemy {
        startLife: number;
        lifePerLevel: number;
        damage: number;
        damagePerLevel: number;
    }

    export interface Avatar {
        startLife: number;
        damage: number;
    }

    export interface World {
        unit: number;
        worldLength: number;
        worldhight: number;
    }

    export interface Data {
        avatar: Avatar;
        enemy: Enemy;
        world: World;
    }

    /*  let avatar: Avatar = {
         startLife: 5000,
         damage: 100
     };
 
 
     let enemy: Enemy = {
         startLife: 1000,
         lifePerLevel: 500,
         damage: 100,
         damagePerLevel: 100
     };
 
     let world: World = {
         unit: unit,
         worldLength: unit * 25,
         worldhight: unit * 20
     };
 
     let data: Data = {
         avatar: avatar,
         enemy: enemy,
         world: world
     }; */

    // console.log(JSON.stringify(data));
}