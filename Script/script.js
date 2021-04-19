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
    object.TotalInductance();
    object.capcitancePerL();
    object.TotalCapacitance();
    object.TotalResistance();
    object.abcdModel();
    console.log(object.B);
    return false;
});



function mainObject(inputs){
    this.inputs = inputs;
    this.radius = 3;
    this.LPerLength = null;
    this.CPerLength= null;
    this.mgmd = 2.5;
    this.LSgmd = 0.2;
    this.CSgmd = 0.006;
    this.omega = math.multiply('2',Math.PI,'50');

    this.inductancePerL = function(){
        var logVal = math.log(this.mgmd/this.LSgmd);
        this.LPerLength=math.multiply('2e-7',logVal);
    };

    this.capcitancePerL = function(){
        var logVal = math.log(this.mgmd/this.CSgmd);
        this.CPerLength = math.divide(math.multiply('2',Math.PI,'8.854e-12'),logVal);
    };

    this.TotalResistance = function(){
        this.resistance = math.multiply(this.inputs.rperKm,this.inputs.lineLength);
    }; //Added a function Total Resistance.

    this.TotalInductance = function(){
        this.inductance = math.multiply(this.LPerLength,this.inputs.lineLength);
        this.Xl = (this.omega*this.inductance);
    }; //Added a function Total Inductance

    this.TotalCapacitance = function(){
        this.capacitance =  math.multiply(this.CPerLength,this.inputs.lineLength);
        this.Xc = 1 / (this.omega*this.capacitance);
    }; //Added a function Total Capacitance

    this.abcdModel = function(){
        this.Zm = math.complex(this.resistance, this.Xl);
        this.Ym = math.complex(0,this.Xc);
        this.gam = math.sqrt(math.multiply(this.Ym,this.Xl));
        this.zc = math.sqrt(math.divide(this.Zm,this.Ym));

        if (this.inputs.model == 1){
            this.A = 1;
            this.B = this.Zm;
            this.C = 0;
            this.D = this.A;
        }
    
        else if (this.inputs.model == 2){
            this.A = math.add(1,math.multiply('0.5',this.Ym,this.Zm));
            this.B = this.Zm;
            this.C = math.add(this.Ym, math.multiply('0.25',this.Ym,this.Ym,this.Zm));
            this.D = this.A;
        }
        else if (this.inputs.model == 3){
            this.A = math.cosh(this.gam);
            this.B = math.multiply(this.zc, math.sinh(this.gam));
            this.C = math.multiply(1/this.zc,math.sinh(this.gam));
            this.D = this.A;
        }
    }
   
};

//Function to calculate the ABCD parameters of a Transmission Model as per the input.

