var form = document.forms[0];
var submit = document.getElementById('submit');
var configSym = form[0];
var configNonSym = form[1];
var disb = document.getElementById('nonSym');

configSym.addEventListener('click', function(e){
    disb.childNodes[1].childNodes[1].disabled = true;
    disb.childNodes[3].childNodes[1].disabled = true;
    
})

configNonSym.addEventListener('click', function(e){
    disb.childNodes[1].childNodes[1].disabled = false;
    disb.childNodes[3].childNodes[1].disabled = false;
})

submit.addEventListener('click', function(e){
  e.preventDefault();
})


var mainClass = {

    radius : 3,
    LPerLength: null,
    CPerLength: null,
    mgmd : 2.5,
    LSgmd : 0.2,
    CSgmd : 0.006,
    inductancePerL(){
        var logVal = math.log(this.mgmd/this.LSgmd);
        this.lPerLength=math.chain('2e-7').multiply(logVal);
    },

    capacitancePerL(){
        var logVal = math.log(this.mgmd/this.CSgmd);
        this.CPerLength=math.chain('2').multiply(Math.PI).multiply('8.854e-12').divide(logVal);
    }

   
}
var a = mainClass;
a.capacitancePerL();
console.log(a.CPerLength);