console.log("Browser.js loaded");

/*===Class===*/
class ZipFile{
    constructor(name,path,unzip){
        this.name = name;//name of the file
        this.path = path;   //Path of the zip file 
        this.unzip = unzip; //Is the file already unzip or not 
    } 
}

class ModFolder {
    constructor(name,path,enable,configPath){
        this.name = name;   //Mod name
        this.path = path;   //Usable ModFolder path 
        this.configPath = configPath;   //Path to the "config" file into the mod folder
        this.enable = enable; //is the mod enable or not 
    }
}

/*===Fonctions===*/
function unzip (File){
    //create the path of the new mod Folder
    let newPath = '?'
    //exctract
    fs.createReadStream(File.path)
        .pipe(unzipper.Extract({ path: newPath }));
    //change the zip statue to Done 
    File.unzip = true;
    //create an object ModFolder to store data about the new mod
    let newModFolder = new ModFolder (File.name,newPath,false,'none');
    return newModFolder;
}

/*===MAIN===*/


//Initialise a new mod added as a zip file
let zip1 = new ZipFile("test1",'test/try.zip',false);
//transforme the Zip file into a usable mod folder
let mod1 = unzip(zip1);


console.log(zip1);
console.log(mod1);