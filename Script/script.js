var form = document.forms[0];
var submit = document.getElementById('submit');
var configSym = form[0];
var configNonSym = form[1];
var disb = document.getElementById('nonSym');
var modelSelection = document.getElementById('modelSelection');
var inputs = {
    config: false,
    model: 1
};

form.addEventListener('reset', function(e){
    disb.childNodes[1].childNodes[1].disabled = false;
    disb.childNodes[3].childNodes[1].disabled = false;
})

configSym.addEventListener('click', function(e){
    disb.childNodes[1].childNodes[1].value = "";
    disb.childNodes[3].childNodes[1].value = "";
    disb.childNodes[1].childNodes[1].disabled = true;
    disb.childNodes[3].childNodes[1].disabled = true;
    inputs.config = true; 
      
})

configNonSym.addEventListener('click', function(e){
    disb.childNodes[1].childNodes[1].disabled = false;
    disb.childNodes[3].childNodes[1].disabled = false;
    inputs.config = false;
      
})

modelSelection.addEventListener('click', function(e){
    if(document.querySelector('#short').checked){
        inputs.model = 1;
    }
    else if(document.querySelector('#nominal').checked){
        inputs.model = 2;
    }
    else {
        inputs.model = 3;
    }
})


$('form.ajax').on('submit',function(){
    var that = $(this);
        data = {};

    that.find('[id]').each(function(index,value) {
        var that = $(this),
            name = that.attr('id'),
            value = that.val();
        
        data[name] = value;
        
    });
    model = inputs.model;
    config = inputs.config;
    inputs = data;
    inputs.model =model;
    inputs.config = config;
    var object = new mainObject(inputs);
    object.inductancePerL();
    console.log(object.LPerLength);
    return false
});



function mainObject(inputs){
    this.inputs = inputs;
    this.radius = 3;
    this.LPerLength = null;
    this.CPerLength= null;
    this.mgmd = 2.5;
    this.LSgmd = 0.2;
    this.CSgmd = 0.006;
    this.inductancePerL = function(){
        var logVal = math.log(this.mgmd/this.LSgmd);
        this.LPerLength=math.chain('2e-7').multiply(logVal);
        console.log('hi');
        return this.LPerLength;
    };

    this.capcitancePerL = function(){
        var logVal = math.log(this.mgmd/this.CSgmd);
        this.CPerLength=math.chain('2').multiply(Math.PI).multiply('8.854e-12').divide(logVal);
        return this.CPerLength;
    }

    this.TotalResistance = function(){
        this.resistance = math.multiply(this.inputs.rperKm).multiply(inputs.strandLength);
        return this.resistance;
    } //Added a function Total Resistance.

    this.TotalInductance = function(){
        this.inductance = math.multiply(this.capacitancePerL(),inputs.rperKm);
        return this.inductance; 
    } //Added a function Total Inductance

    this.TotalCapacitance = function(){
        this.capacitance = math.multiply(this.LPerLength,inputs.rperKm);
        return this.capacitance;
    } //Added a function Total Capacitance

   
};

//Function to calculate the ABCD parameters of a Transmission Model as per the input.
function abcdModel(inputs){   
    this.model = inputs.model;
    var object = new mainObject(inputs);
    this.R = object.TotalResistance();
    this.C = object.TotalCapacitance();
    this.L = object.TotalInductance();
    this.Xc = math.divide(1,math.chain('2').multiply(math.PI).multiply(inputs.frequency).multiply(this.C));
    this.Xl = math.chain('2').multiply(math.PI).multiply(inputs.frequency).multiply(this.L);
    this.Zm = math.complex(this.R, this.Xl);
    this.Ym = math.complex(0,1/(this.Xc));
    this.gam = math.sqrt(math.multiply(this.Ym).multiply(this.Xl));
    this.zc = math.sqrt(math.divide(this.Zm,this.Ym));
    
    if (this.model == 1){
        this.A = 1;
        this.B = this.Zm;
        this.C = 0;
        this.D = this.A;
    }

    else if (this.model == 2){
        this.A = math.multiply(1,math.chain('0.5').multiply(this.Ym).multiply(this.Zm));
        this.B = math.multiply(this.Zm, math.chain('0.25').multiply(this.Ym).multiply(this.Zm).multiply(this.Zm));
        this.C = Ym;
        this.D = this.A;
    }
    else if (this.model == 3){
        this.A = math.cosh(math.multiply(this.gam,inputs.strandLength));
        this.B = math.multiply(this.zc, math.sinh(this.gam,inputs.strandLength));
        this.C = math.multiply(1/this.zc,math.sinh(this.gam,inputs.strandLength));
        this.D = this.A;
    }
};

