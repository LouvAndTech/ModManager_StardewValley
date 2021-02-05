
console.log("Browser.js loaded");
const ipc =  require('electron').ipcRenderer

/*===Class===*/
class ZipFile{
    constructor(name,path,unziped){
        this.name = name;//name of the file
        this.path = path;   //Path of the zip file 
    } 

    refresh(){
        ipc.send('command',["refresh", this])
    }
    
}

class Mod{
    constructor(obj){
        this.name = obj.name;   //Mod name
        this.path = obj.path;   //Usable ModFolder path 
        this.configPath = obj.configPath;   //Path to the "config" file into the mod folder
        /*this.meta = {
            displayName : obj.info.displayName,
            vers : obj.info.vers
        }*/
        this.enable = obj.enable; //is the mod enable or not 
    }
}

/*===Fonctions===*/


/*===MAIN===*/

ipc.on("data", (e, data)=>{
    let lstModB = [] 
    for(let i=0;i<data.length;i++){
        lstModB.push(new Mod(data[i]))
    }
    var app = new Vue({
        el: '#mod-list',
        data: {
            lstModB: lstModB
        }
      })
})

ipc.send("initialized", true)
