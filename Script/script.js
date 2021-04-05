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