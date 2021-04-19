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
    var model = inputs.model;
    var config = inputs.config;
    inputs = data;
    inputs.model = model;
    inputs.config = config;
    var object = new mainObject();
    object.findMGMD();
    object.findSGMD();
    object.inductancePerL();
    object.capcitancePerL();
    object.TotalResistance();
    object.capReactance();
    object.indReactance();
    object.abcdParams();
    object.sendingParams();
    object.percVoltReg();
    object.efficiency();
    return false
});



function mainObject(){
    this.inputs = inputs;
    this.radius = this.inputs.radius;
    this.LPerLength = null;
    this.CPerLength= null;
    this.cReactance = null;
    this.lReactance = null;
    this.mgmd = null;
    this.LSgmd = null;
    this.CSgmd = null;
    this.totalResistance = null;
    this.A = null;
    this.B = null;
    this.C = null;
    this.D = null;
    this.Vr = this.inputs.rVoltage;
    this.Ir = null;
    this.Vs = null;
    this.Is = null;
    this.Ps = null;
    this.rPower = this.inputs.rPower;
    this.rPF = this.inputs.rPf;
    this.omega = 2*Math.PI*this.inputs.frequency;
    this.gamma = null;
    this.transLength = this.inputs.lineLength;
    this.perVoltReg = null;
    this.sendPower = null;
    this.transEff = null;
    console.log('omega', this.omega);
    console.log('length', this.transLength);
    console.log('Vr', this.Vr);
    console.log('rPower', this.rPower);
    console.log('rPF', this.rPF);

    this.findMGMD = function(){
        if(this.inputs.config){ //symm
            this.mgmd = (math.cube(this.inputs.ABLength)) ^ (1/3);
            
        } else { //non-symm
            //enada difference uh :( 
            this.mgmd = (this.inputs.ABLength*this.inputs.BCLength*this.inputs.ACLength) ^ (1/3);
            
        }
        console.log('mgmd', this.mgmd);
    };

    this.findSGMD = function(){
        this.LSgmd = 4
        this.CSgmd = 5
        console.log('lsgmd', this.LSgmd);
        console.log('csgmd', this.CSgmd);
    };
    
    this.inductancePerL = function(){
        var logVal = math.log(this.mgmd/this.LSgmd);
        this.LPerLength = 2e-7*(logVal);
        console.log('inductancePerL',this.LPerLength);
    };

    this.capcitancePerL = function(){
        var logVal = math.log(this.mgmd/this.CSgmd);
        this.CPerLength = (2*Math.PI*8.854e-12) / logVal;
        console.log('capcitancePerL', this.CPerLength);
    };

    this.capReactance = function(){
        var totCap =  this.CPerLength*this.transLength;
        this.cReactance = 1 / (this.omega*totCap);
        console.log('capReactance', this.cReactance);
    };

    this.indReactance = function(){
        var totInd = math.chain(this.LPerLength).multiply(this.transLength);
        this.lReactance = (this.omega*totInd);
        console.log('indReactance', this.lReactance);
    };

    this.TotalResistance = function(){
        var R = this.inputs.rperKm*this.transLength;
        this.totalResistance = R;
        console.log('TotalResistance', this.totalResistance)
    };

    this.abcdParams = function(){
        var R = this.totalResistance;
        var Xc = this.cReactance;
        var Xl = this.lReactance;
        var Zm = math.complex(R, Xl);
        var Ym = math.complex(0, 1/Xc);
        var gamma = math.sqrt(math.multiply(Ym, Xl));
        var zc = math.sqrt(math.divide(Zm, Ym));

        if (this.inputs.model == 1){
            this.A = 1;
            this.B = Zm;
            this.C = 0;
            this.D = this.A;
        }
    
        else if (this.inputs.model == 2){
            this.A = math.add(1, math.multiply(0.5, math.multiply(Ym, Zm)));
            this.B = Zm;
            this.C = math.multiply(Ym, math.multiply(0.25, math.multiply(Zm, (math.multiply(Ym, Ym)))));
            this.D = this.A;
        }
        else if (this.inputs.model == 3){
            this.A = math.cosh(math.multiply(gamma, this.transLength));
            this.B = math.multiply(zc, math.sinh(math.multiply(gamma, this.transLength)));
            this.C = math.divide(this.B, math.multiply(Zm, Zm));
            this.D = this.A;
        }
        console.log('A', math.re(this.A));
        console.log('B',this.B);
        console.log('C', this.C);
        console.log('D', this.D);
    };

    this.sendingParams = function(){
        var vr = this.Vr;
        var rpower = this.rPower;
        var Vph = math.divide(vr, (math.sqrt(3)));
        this.Ir = math.divide(rpower, math.multiply(3, math.multiply(Vph, this.rPF)));

        this.Vs = math.add(math.multiply(this.A, this.Vr) , math.multiply(this.B, this.Ir));
        this.Is = math.add(math.multiply(this.C, this.Vr) , math.multiply(this.D, this.Ir));

        console.log('Vr', vr);
        console.log('Vph', Vph);
        console.log('Ir', this.Ir);
        console.log('Vs', this.Vs);
        console.log('Is', this.Is);
    };

    this.circleSending = function(){//desmos api
        
    };

    this.percVoltReg = function(){
        var magA = math.sqrt(math.add(math.multiply(math.re(this.A), math.re(this.A)), math.multiply(math.im(this.A), math.im(this.A))));
        var magVs = math.sqrt(math.add(math.multiply(math.re(this.Vs), math.re(this.Vs)), math.multiply(math.im(this.Vs), math.im(this.Vs))));
        var Vr_fl = math.divide(this.Vr, (math.sqrt(3)));
        var Vr_nl = math.divide(magVs, magA);
        console.log('Vr_nl', Vr_nl);

        this.perVoltReg = math.abs(math.divide(Vr_nl - Vr_fl, Vr_fl));
        console.log('perVoltReg', this.perVoltReg);
    };

    this.efficiency = function(){
        var Vs_phase = (math.atan2(math.im(this.Vs), math.re(this.Vs)) * 180) / Math.PI;
        var Is_phase = (math.atan2(math.im(this.Is), math.re(this.Is)) * 180) / Math.PI;
        console.log('Vs_phase', Vs_phase);
        console.log('Is_phase', Is_phase);
        
        var magVs = math.sqrt(math.add(math.multiply(math.re(this.Vs), math.re(this.Vs)), math.multiply(math.im(this.Vs), math.im(this.Vs))));
        var magIs = math.sqrt(math.add(math.multiply(math.re(this.Is), math.re(this.Is)), math.multiply(math.im(this.Is), math.im(this.Is))));
        var sendPhase = Vs_phase - Is_phase;
        this.sendPower = 3*magVs*magIs*math.cos(sendPhase);
        console.log('sendPower', this.sendPower);

        this.transEff = (this.rPower / this.sendPower) * 100;
        console.log('transEff', this.transEff);
    };

    this.powerLoss = function(){

    };
   
};

//Function to calculate the ABCD parameters of a Transmission Model as per the input.
// function abcdModel(inputs){   
//     this.model = inputs.model;
//     var object = new mainObject(inputs);
//     this.R = object.TotalResistance();
//     this.C = object.TotalCapacitance();
//     this.L = object.TotalInductance();
//     this.Xc = math.divide(1,math.chain('2').multiply(math.PI).multiply(inputs.frequency).multiply(this.C));
//     this.Xl = math.chain('2').multiply(math.PI).multiply(inputs.frequency).multiply(this.L);
//     this.Zm = math.complex(this.R, this.Xl);
//     this.Ym = math.complex(0,1/(this.Xc));
//     this.gam = math.sqrt(math.multiply(this.Ym).multiply(this.Xl));
//     this.zc = math.sqrt(math.divide(this.Zm,this.Ym));
    
//     if (this.model == 1){
//         this.A = 1;
//         this.B = this.Zm;
//         this.C = 0;
//         this.D = this.A;
//     }

//     else if (this.model == 2){
//         this.A = math.multiply(1,math.chain('0.5').multiply(this.Ym).multiply(this.Zm));
//         this.B = math.multiply(this.Zm, math.chain('0.25').multiply(this.Ym).multiply(this.Zm).multiply(this.Zm));
//         this.C = Ym;
//         this.D = this.A;
//     }
//     else if (this.model == 3){
//         this.A = math.cosh(math.multiply(this.gam,inputs.strandLength));
//         this.B = math.multiply(this.zc, math.sinh(this.gam,inputs.strandLength));
//         this.C = math.multiply(1/this.zc,math.sinh(this.gam,inputs.strandLength));
//         this.D = this.A;
//     }
// };

