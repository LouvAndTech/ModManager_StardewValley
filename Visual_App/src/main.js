const { ipcMain } = require("electron");
const fs = require('fs');
const { version } = require("os");
const unzipper = require("unzipper")
const durableJsonLint = require('durable-json-lint');
const encoding = require('encoding-japanese');
const copydir = require('copy-dir');

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
            let lstModProv = fs.readdirSync(MOD_PATH);
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
            this.childrens = [] //Children(s) Mod(s)
            this.path = obj.path;   //Usable ModFolder path 
            this.configPath = obj.configPath;   //Path to the "config" file into the mod folder
            this.meta = this.metaData(this.path,this.name)
            this.enable = obj.enable; //is the mod enable or not
            this.findChildrens()
        }
        toggleMod(state){
            //console.log('Avant : ',this.enable)
            this.enable = state
            if (state){
                if (!fs.readdirSync(ACTIVE_PATH).includes(this.name)){
                    //console.log("Le Mod selectionne est :",this.name)
                    //console.log(this.path," // Copy to active folder")
                    fs.mkdir((ACTIVE_PATH+'/'+this.name), (err) => { 
                        if (err) {return console.error(err);} 
                        //console.log('Directory created successfully!'); 
                    })
                    copydir.sync(this.path,ACTIVE_PATH+'/'+this.name)
                }
            }
            else{
                //console.log("Le Mod selectionne est :",this.name)
                //console.log(this.path," // Remove from active folder")
                fs.rmdir(ACTIVE_PATH+'/'+this.name, { recursive: true }, (err) => {
                    if (err) {throw err;}
                    //console.log(`${ACTIVE_PATH+'/'+this.name} is deleted!`);
                });
            }
            //console.log('Apres : ',this.enable)
        }
        findChildrens(){
            let folderContent = fs.readdirSync(this.path)
            if (folderContent.includes('manifest.json')){
                return (null)
            }
            else{
                for(let i = 0; i<folderContent.length;i++){
                    this.childrens.push(new Mod({
                        name : folderContent[i],
                        path : this.path+'/'+folderContent[i],
                        configPath : 'NONE',
                        enable : false
                    }))
                }
            }
        }
        metaData(modPath,badName){
            let dpname = badName
            let ver = "0.0"
            let path = modPath
            let itemList = []
            for (let i=0;i<4;i++){
                itemList = fs.readdirSync(path)
                if (itemList.includes('manifest.json')){
                    let RAW = fs.readFileSync(path+'/manifest.json')
                    let manifest = RAW.toString().replace(/^\uFEFF/gm, "").replace(/^\u00BB\u00BF/gm,"")
                    manifest = durableJsonLint(manifest)

                    try {
                        manifest = JSON.parse(manifest.json)
                        dpname = manifest.Name.split(']')
                        dpname = dpname[dpname.length-1]
                        ver=manifest.Version
                        
                    } catch (error) {
                        console.log(badName);
                        console.error(error)
                    }
                    break
                }
                else{
                    path=path+'/'+itemList[0]
                }
            }   
            return({
                displayName : dpname ,
                vers : 'v'+ver
            })
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