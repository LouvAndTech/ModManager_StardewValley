const { ipcRenderer } = require("electron");

console.log("Browser.js loaded");
const ipc =  require('electron').ipcRenderer

/*===Class===*/
class ZipFile{
    constructor(name,path,unziped){
        this.name = name;//name of the file
        this.path = path;   //Path of the zip file 
        this.unziped = unziped

    } 

    refresh(){
        ipc.send('command',["refresh", this])
    }
}

class Mod{
    constructor(name,path,enable,configPath){
        this.name = name;   //Mod name
        this.path = path;   //Usable ModFolder path 
        this.configPath = configPath;   //Path to the "config" file into the mod folder
        this.enable = enable; //is the mod enable or not 
    }
}

/*===Fonctions===*/


/*===MAIN===*/


//Initialise a new mod added as a zip file
let zip1 = new ZipFile("test1",'test/try.zip',false);
//transforme the Zip file into a usable mod folder



console.log(zip1);
