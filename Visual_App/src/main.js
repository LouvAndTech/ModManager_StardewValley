const { ipcMain } = require("electron");
const fs = require('fs');
const { version } = require("os");
const unzipper = require("unzipper")
const durableJsonLint = require('durable-json-lint');

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
            this.recreateCollections()
        } 
        recreateCollections(){
            this.events()
            this.refresh()
            this.update()
            this.refresh()
            win.webContents.send('data',this.lstMod)
        }
        refresh(){
            let lstZipProv = fs.readdirSync(ZIP_PATH);
            let lstModProv = this.lstModCreat();
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
                    meta : this.metaData(MOD_PATH+lstModProv[i],lstModProv[i]),
                    enable : lstActiveProv.includes(lstModProv[i]) ? true : false 
                }))
            }
        }
        update(){
            for (let i=0;i<this.lstZip.length;i++){
                if (!this.lstMod.includes(this.lstZip[i])){

                    fs.createReadStream(this.lstZip[i].path)
                        .pipe(unzipper.Extract({ path :MOD_PATH+this.lstZip[i].name }));
                }
            } 
            // console.log(this.lstMod)
        }
        lstModCreat(){
            let totalMod=[]
            let actualDirFolder = MOD_PATH
            let actualDirFile = fs.rreaddirSync(actualDirFolder)
            if (actualDirFile.includes('manifest.json')){
                actualDirFolder
            }
            for(let i1 = 0; i1<fs.readdirSync(MOD_PATH);i++){
                if ()
                actualDir = ()
            }
            return ()
        }
        metaData(modPath,badName){
            let dpname = badName
            let ver = "0.0"
            let path = modPath
            let itemList = []
            for (let i=0;i<4;i++){
                itemList = fs.readdirSync(path)
                if (itemList.includes('manifest.json')){break}
                else{path=path+'/'+itemList[0]}
            }
            let RAW = fs.readFileSync(path+'/manifest.json', {encoding:'ascii'})
            let manifest = durableJsonLint(RAW)

            try {
                manifest = JSON.parse(manifest.json)
                dpname = manifest.Name.split(']')
                dpname = dpname[dpname.length-1]
                ver=manifest.Version
            } catch (error) {
                console.log(badName);
                console.error(error)
            }

            return({
                displayName : dpname ,
                vers : 'v'+ver
            })
        }
        events(){
            ipcMain.on("updateModStatus",(e, data)=>{

                for(let i=0; i < this.lstMod.length; i++){
                    if(this.lstMod[i].name === data.name){
                        this.lstMod[i].toggleMod(data.enable)
                        return
                    }
                }
            })
        }
    }
    class Mod{
        constructor(obj){
            this.name = obj.name;   //Mod name
            this.path = obj.path;   //Usable ModFolder path 
            this.configPath = obj.configPath;   //Path to the "config" file into the mod folder
            this.meta = {
                displayName : obj.meta.displayName,
                vers : obj.meta.vers
             }
            this.enable = obj.enable; //is the mod enable or not
        }
        toggleMod(state){
            this.enable = state
            //console.log(this.enable)
            if (state){
                console.log(this.name," // Copy to active folder")
                //fs.copyFile(this.path,ACTIVE_PATH)
            }
            else{
                console.log(this.name," // Remove from active folder")
            }
            
            

        }
    }
    class ZipFile{
        constructor(obj){
            this.name = obj.name;//name of the file
            this.path = obj.path;   //Path of the zip file 
        } 
    }

    let modFolder=new ModFolder()
    // console.log(modFolder)

}