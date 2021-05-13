const { ipcMain } = require("electron");
const fs = require('fs');
const { version } = require("os");
const unzipper = require("unzipper")
const durableJsonLint = require('durable-json-lint');
const encoding = require('encoding-japanese');
const copydir = require('copy-dir');
const { Console } = require("console");

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

    let Dependencies = {
        installed : [],
        activated :[],
        needed : [],
        missingNI :[],
        missingNA :[]
    }
    
    class ModFolder{
        constructor(){
            this.recreateCollections()
        } 
        recreateCollections(){
            this.events()
            this.refresh()
            this.update()
            this.refresh()
            updateDep()
            win.webContents.send('data',this.lstMod,Dependencies)
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
                        updateDep()
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
            this.addListDep()
            toggleDep(this)
        }
        toggleMod(state){
            //console.log('Avant : ',this.enable)
            this.enable = state
            if (state){ //Add mod
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
            else{ //Remove mod
                //console.log("Le Mod selectionne est :",this.name)
                //console.log(this.path," // Remove from active folder")
                fs.rmdir(ACTIVE_PATH+'/'+this.name, { recursive: true }, (err) => {
                    if (err) {throw err;}
                    //console.log(`${ACTIVE_PATH+'/'+this.name} is deleted!`);
                });
            }
            toggleDep(this)
            //console.log("Dependencies Activated : ",Dependencies.activated)
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
            let uid = 'NONE'
            let depandance = []
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
                        uid = manifest.UniqueID
                        depandance = manifest.Dependencies
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
                vers : 'v'+ver,
                uniqueID : uid,
                dep : depandance
            })
        }
        addListDep(){
            try {
                Dependencies.installed.push(this.meta.uniqueID)
            } catch (error) {
                //console.error(error)
            }
            try{
                for (let i=0;i<this.meta.dep.length;i++){
                    if (this.meta.dep[i].IsRequired){
                        Dependencies.needed.push(this.meta.dep[i].UniqueID)
                    }
                    
                }
            }catch(error){
                //console.log(error)
            }
            
        }
        
    }
    class ZipFile{
        constructor(obj){
            this.name = obj.name;//name of the file
            this.path = obj.path;   //Path of the zip file 
        } 
    }

    function updateDep(){
        //Test dep to create lists
        //console.log("Needed : ",Dependencies.needed)
        for (let i=0;i<Dependencies.needed.length;i++){
            //Dep installed or not
            //console.log("i : ",i," Needed[i] : ",Dependencies.needed[i])
            if (!Dependencies.installed.includes(Dependencies.needed[i])&&!Dependencies.missingNI.includes(Dependencies.needed[i])){
                Dependencies.missingNI.push(Dependencies.needed[i])
            }
            //Dep Activated or not
            if (!Dependencies.missingNI.includes(Dependencies.needed[i])&&(!Dependencies.activated.includes(Dependencies.needed[i]))&&(!Dependencies.missingNA.includes(Dependencies.needed[i]))){
                Dependencies.missingNA.push(Dependencies.needed[i])
            }
            //console.log('Missing NA : ',Dependencies.missingNA)
        }
        //console.log('Missing NA : ',Dependencies.missingNA)
        //console.log(Dependencies)
    }
    function toggleDep(mod){
        if (mod.enable){
            Dependencies.activated.push(mod.meta.uniqueID)
            if (typeof mod.childrens[0]!="undefined"){
                for (let i=0;i<mod.childrens.length;i++){
                    Dependencies.activated.push(mod.childrens[i].meta.uniqueID)
                    if(typeof mod.childrens[i].childrens[0]!= "undefined") {
                        for (let t=0;t<mod.childrens[i].childrens.length;t++){
                            Dependencies.activated.push(mod.childrens[i].childrens[t].meta.uniqueID)
                        }
                    }
                }
            }
        }else{
            delete Dependencies.activated[Dependencies.activated.indexOf(mod.meta.uniqueID)]
            if (typeof mod.childrens[0]!="undefined"){
                for (let i=0;i<mod.childrens.length;i++){
                    delete Dependencies.activated[Dependencies.activated.indexOf(mod.childrens[i].meta.uniqueID)]
                    if(typeof mod.childrens[i].childrens[0]!= "undefined") {
                        for (let t=0;t<mod.childrens[i].childrens.length;t++){
                            delete Dependencies.activated[Dependencies.activated.indexOf(mod.childrens[i].childrens[t].meta.uniqueID)]
                        }
                    }
                }
            }
            Dependencies.activated = Dependencies.activated.filter(function(x) {
                    return x !== undefined;
            })
        }
    }

    let modFolder=new ModFolder()
    //console.log("Dependencies Activated : ",Dependencies.activated)
    // console.log(modFolder)

}