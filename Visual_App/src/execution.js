module.exports = () => {
    class ZipFile{
        constructor(name,path,unziped){
            this.name = name;//name of the file
            this.path = path;   //Path of the zip file 
            this.unziped = unziped
    
        } 
    
        unzip(File){
            //create the path of the new mod Folder
            let newPath = '?'
            //exctract
            fs.createReadStream(File.path)
                .pipe(unzipper.Extract({ path: newPath }));
            //change the zip statue to Done 
            File.unziped = true;
            //create an object ModFolder to store data about the new mod
            let newModFolder = new ModFolder (File.name,newPath,false,'none');
            return newModFolder;

        }
    }
}