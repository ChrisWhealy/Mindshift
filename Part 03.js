// Here are the kids...
var kids = [{name:"Abigail", isNaughty:false},  
            {name:"Ben",     isNaughty:false},
            {name:"Clara",   isNaughty:true},
            {name:"David",   isNaughty:false},
            {name:"Emily",   isNaughty:true},
            {name:"Fred",    isNaughty:false},
            {name:"Gloria",  isNaughty:false},
            {name:"Harry",   isNaughty:false},
            {name:"Ingrid",  isNaughty:true},
            {name:"Jack",    isNaughty:false},

// Find the good ones without an arrow function
var good_kids = kids.filter(function(k) {  
  return !k.isNaughty;
})

// Find the good ones with an arrow function
var good_kids = kids.filter(k => !k.isNaughty).length;

