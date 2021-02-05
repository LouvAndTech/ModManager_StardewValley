const { ipcMain } = require("electron");
const fs = require('fs');
const unzipper = require("unzipper")

const ACTIVE_PATH = 'Mods/Active/'
const ZIP_PATH = 'Mods/Zip/'
const MOD_PATH = 'Mods/Mod/'

module.exports = (win) => {
    ipcMain.on('command', (e, data) => {
        console.log(data)
        if(data[0] = "refresh"){
            let zip = new ZipFile(data[1])
            zip.refresh();
        }
    })
    
    class ModFolder{
        constructor(){
            this.refresh()
        } 
        refresh(){
            let lstZipProv = fs.readdirSync('Mods/Zip');
            let lstModProv = fs.readdirSync('Mods/Mod');
            let lstActiveProv = fs.readdirSync(ACTIVE_PATH)
            /*console.log(lstZipProv)
            console.log(lstModProv)
            console.log(lstActiveProv)*/
            this.lstZip = []
            this.lstMod = []
            for (let i=0;i<lstZipProv.length;i++){
                this.lstZip.push(new ZipFile({
                    name : lstZipProv[i].replace('.zip', ''),
                    path : ZIP_PATH+lstZipProv[i]
                }))
            }
            for (let i=0;i<lstModProv.length;i++){
                this.lstMod.push(new Mod({
                    name : lstModProv[i],
                    path : MOD_PATH+lstModProv[i],
                    configPath : 'NONE',
                    enable : lstActiveProv.includes(lstModProv[i]) ? true : false 
                }))
            }
            this.update()
            win.webContents.send('data',this.lstMod)
        }
        update(){
            for (let i=0;i<this.lstZip.length;i++){
                if (!this.lstMod.includes(this.lstZip[i])){

                    fs.createReadStream(this.lstZip[i].path)
                        .pipe(unzipper.Extract({ path :MOD_PATH+this.lstZip[i].name }));
                }
            } 
            console.log(this.lstMod)
        }
    }
    class Mod{
        constructor(obj){
            this.name = obj.name;   //Mod name
            this.path = obj.path;   //Usable ModFolder path 
            this.configPath = obj.configPath;   //Path to the "config" file into the mod folder
            this.enable = obj.enable; //is the mod enable or not 
        }
    }
    class ZipFile{
        constructor(obj){
            this.name = obj.name;//name of the file
            this.path = obj.path;   //Path of the zip file 
        } 

        
    }

    let modFolder=new ModFolder()
    console.log(modFolder)
}