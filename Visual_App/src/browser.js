
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
        this.childrens = obj.childrens
        this.path = obj.path;   //Usable ModFolder path 
        this.configPath = obj.configPath;   //Path to the "config" file into the mod folder
        this.meta = {
            displayName : obj.meta.displayName,
            vers : obj.meta.vers
        }
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
    lstModB.forEach(parent => {
        exploreChildrens(parent.childrens)
    });

    new Vue({
        el: '#app',
        data: {
            modList: lstModB,
            updateMods: updateMods
        }
      })
})
 
ipc.send("initialized", true)

function updateMods(mod){
    ipc.send("updateModStatus", mod)
}

function exploreChildrens(parent){
    parent.forEach(el => {
        //console.log(el.name)
        if (el.childrens.length) {
            exploreChildrens(el.childrens)
        }
    });
}

Vue.component('tree-menu', { 
    template: '#tree-menu',
    props: [ 'nodes', 'label', 'depth', 'version', 'showUi', 'mod' ],
    data() {
       return {
         showChildren: false,
         updateMods: updateMods
       }
    },
    computed: {
      iconClasses() {
        return {
          'fa-plus-square-o': !this.showChildren,
          'fa-minus-square-o': this.showChildren
        }
      },
      labelClasses() {
        return { 'has-children': this.nodes }
      },
      indent() {
        return { width: `calc(60% - ${this.depth * 25}px)`,  transform: `translate(${this.depth * 25}px)` }
      }
    },
    methods: {
      toggleChildren() {
         this.showChildren = !this.showChildren;
      }
    }
  });