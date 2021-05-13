
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

/*===MAIN===*/

ipc.on("data", (e, data,dep)=>{
    let lstModB = [] 
    for(let i=0;i<data.length;i++){
        lstModB.push(new Mod(data[i]))
    }
    lstModB.forEach(parent => {
        exploreChildrens(parent.childrens)
    });
    updateDep(dep)

    new Vue({
      el: '#app',
      data: {
          modList: lstModB,
          updateMods: updateMods,
          modalState : false,
          depState : false
      }
    })
})

function updateDep(dep){
  let listMissingNA = ""
  if (dep.missingNA.length==0){
    document.getElementById('DepNotAct').innerHTML = "All the needed dependencies you have are activated."
  }else{
    for (let i =0; i<dep.missingNA.length;i++){
      listMissingNA += '\n'+dep.missingNA[i]
    }
    document.getElementById('DepNotAct').innerHTML = listMissingNA
  }

  let listMissingNI = ""
  if (dep.missingNI.length==0){
    document.getElementById('DepNotInst').innerHTML = "You've got all the dependencies."
  }else{
    for (let i =0; i<dep.missingNI.length;i++){
      listMissingNI += '\n'+dep.missingNI[i]
    }
    document.getElementById('DepNotInst').innerHTML = listMissingNI
  }
}

function updateMods(mod){
  ipc.send("updateModStatus", mod)
}

function addFile(){
  console.log("Ajout du fichier \n->START")
  var selectedFile = document.getElementById('input');
  console.log(selectedFile)
  console.log("->END")
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
      return { width: `calc(100% - ${this.depth * 25}px)`,  transform: `translate(${this.depth * 25}px)` }
    }
  },
  methods: {
    toggleChildren() {
        this.showChildren = !this.showChildren;
    }
  }
});



ipc.send("initialized", true)