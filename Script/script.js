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
    location.href = '#top';
    ans = document.getElementById('answers');
    ans.style.display = 'none';
    document.getElementById('onlyForShort').style.display = 'none';
    document.getElementById('sendGraph').innerHTML = '';
    document.getElementById('recGraph').innerHTML = '';
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
    inputs.subCondDistVal = stringSeparator();
    inputs.model = model;
    inputs.config = config;
    var object = new mainObject();
    console.log(inputs);
    object.findDia();
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
    object.powerLossCalc();
    object.compensationCalc();
    object.chargingCurrCalc();
    object.sendingAndReceivingCentres();
    console.log(object.Qr)
    placeAnswers(object);
    return false
});


function placeAnswers(object){
    document.getElementById('onlyForShort').style.display = 'none';
    document.getElementById('sendGraph').innerHTML = '';
    document.getElementById('recGraph').innerHTML = '';
    ans = document.getElementById('answers');
    spanArr = ans.querySelectorAll('span');
    switch(object.inputs.model){
        case 1:
            modelName = 'Short'
            break;
        case 2:
            modelName = 'Medium'
            break;
        case 3:
            modelName = 'Long'
            break;
    }
    var d = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    spanArr[0].innerHTML = modelName;
    spanArr[1].innerHTML = d.toLocaleDateString(undefined,options);
    spanArr[2].innerHTML = object.LPerLength*1000;
    spanArr[3].innerHTML = object.CPerLength*1000;
    spanArr[4].innerHTML = object.lReactance;
    spanArr[5].innerHTML = object.cReactance;
    spanArr[6].innerHTML = object.Ic
    spanArr[7].innerHTML = object.A
    spanArr[8].innerHTML = object.B
    spanArr[9].innerHTML = object.C
    spanArr[10].innerHTML = object.D
    spanArr[11].innerHTML = math.abs(object.Vs)/1000
    spanArr[12].innerHTML = math.abs(object.Is)
    spanArr[13].innerHTML = object.perVoltReg*100
    spanArr[14].innerHTML = object.powerLoss/1000000
    spanArr[15].innerHTML = object.transEff
    

    let graph1 = Desmos.GraphingCalculator(document.getElementById('sendGraph'),{keypad:false , expressionsCollapsed:true});
    let graph2 = Desmos.GraphingCalculator(document.getElementById('recGraph'),{keypad:false, expressionsCollapsed:true});
    graph1.updateSettings({ xAxisLabel: 'Ps (MW)' });
    graph1.updateSettings({ yAxisLabel: 'Qs (MVar)' });
    graph2.updateSettings({ xAxisLabel: 'Pr (MW)' });
    graph2.updateSettings({ yAxisLabel: 'Qr (MVar)' });
    let r = math.abs(object.Vs)*object.Vph/math.abs(object.B);
    r/=Math.pow(10,6);
    graph1.setExpression({ id: "graph1", latex: `(x-${object.Cs[0]/Math.pow(10,6)})^2+(y-${object.Cs[1]/Math.pow(10,6)})^2=${r*r}` });
    graph2.setExpression({ id: "graph2", latex: `(x+${object.Cr[0]/Math.pow(10,6)})^2+(y+${object.Cr[1]/Math.pow(10,6)})^2=${r*r}` });
    
    
    
    if(object.inputs.model==1){
        document.getElementById('onlyForShort').style.display = 'block';
        spanArr[16].innerHTML = object.compensation
        if(object.compensation>0){
            spanArr[17].innerHTML = "shunt reactor";
            spanArr[18].innerHTML = 'overvoltage'
        }
        else{
            spanArr[17].innerHTML = "shunt capacitive"
            spanArr[18].innerHTML = 'undervoltage'
        }
    }

    ans.style.display = 'block';
    location.href = '#answers';
}

function stringSeparator(){
    let w = inputs.subCondDist;
    s_w = w.split(',')
    let i=0;
    let s=[]
    s_w.forEach(ele => {
     s.push(parseFloat(ele)) 
     i++  
    });
    return s;
}


function mainObject(){
    this.inputs = inputs;
    this.radius = parseFloat(this.inputs.radius);
    this.inputs.numberOfSubCond = parseFloat(this.inputs.numberOfSubCond);
    this.Vr = parseFloat(this.inputs.rVoltage);
    this.rPower = parseFloat(this.inputs.rPower)*1000000;
    this.recPF = parseFloat(this.inputs.rPf);
    this.rPFsign = (this.recPF>=0)?1:-1;
    this.rPF = math.abs(this.recPF);
    this.omega = 2*Math.PI*parseFloat(this.inputs.frequency);
    this.transLength = parseFloat(this.inputs.lineLength)*1000;
    console.log('omega', this.omega);
    console.log('length', this.transLength);
    console.log('Vr', this.Vr);
    console.log('rPower', this.rPower);
    console.log('rPF', this.rPF);

    this.findDia = function(){
        let m = (3+math.sqrt(12*this.inputs.numberOfStrands-3))/6; //number of layers
        this.diameter = (2*m-1)*parseFloat(this.inputs.strandDia)/(1000); //diameter of subconductor
    }
    
    this.findMGMD = function(){
        if(this.inputs.config){ //symm
            this.mgmd = parseFloat(this.inputs.ABLength);    
        } else { //non-symm
            //enada difference uh :( 
            this.mgmd = Math.cbrt(parseFloat(this.inputs.ABLength)*parseFloat(this.inputs.BCLength)*parseFloat(this.inputs.ACLength));   
        }
        console.log('mgmd', this.mgmd);
    };

    this.findSGMD = function(){
        this.radius = this.diameter/2
        product = 1;
        this.inputs.subCondDistVal.forEach(function(x){
            product *= x;
        })
        console.log(product)
        product = Math.pow(product,2)
        product*=Math.pow(this.radius,this.inputs.numberOfSubCond)
        this.CSgmd = Math.pow(product,1/(this.inputs.numberOfSubCond*this.inputs.numberOfSubCond));
        product*=Math.pow(0.7788,this.inputs.numberOfSubCond);
        this.LSgmd = Math.pow(product,1/(this.inputs.numberOfSubCond*this.inputs.numberOfSubCond));
        console.log('lsgmd', this.LSgmd);
        console.log('csgmd', this.CSgmd);
    };
    
    this.inductancePerL = function(){
        var logVal = math.log(this.mgmd/this.LSgmd);
        this.LPerLength = 2e-7*(logVal);
        console.log('inductancePerL',this.LPerLength*1000);
    };

    this.capcitancePerL = function(){
        var logVal = math.log(this.mgmd/this.CSgmd);
        this.CPerLength = (2*Math.PI*8.854e-12) / logVal;
        console.log('capcitancePerL', this.CPerLength*1000);
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
        var R = parseFloat(this.inputs.rperKm)*this.transLength/1000;
        this.totalResistance = R;
        console.log('TotalResistance', this.totalResistance)
    };

    this.abcdParams = function(){
        var R = this.totalResistance;
        var Xc = this.cReactance;
        var Xl = this.lReactance;
        var Zm = math.complex(R, Xl);
        var Ym = math.complex(0, 1/Xc);
        var gamma = math.sqrt(math.multiply(Ym, Zm));
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
            this.A = math.cosh(gamma);
            this.B = math.multiply(zc, math.sinh(gamma));
            this.C = math.divide(math.sinh(gamma),zc);
            this.D = this.A;
        }
        console.log('A', this.A);
        console.log('B',this.B);
        console.log('C', this.C);
        console.log('D', this.D);
    };

    this.sendingParams = function(){
        var vr = this.Vr;
        var rpower = this.rPower;
        console.log(this.rPF);
        this.Vph = math.divide(vr, (math.sqrt(3)));
        this.Irmag = math.abs(math.divide(rpower, math.multiply(3,this.Vph, this.rPF)));
        if(this.rPFsign>=0){
            this.Irang = math.acos(this.rPF)
        }
        else{
            this.Irang = -math.acos(this.rPF)
        }
       
        this.Ir = math.complex({r:this.Irmag,phi:this.Irang})

        this.Vs = math.add(math.multiply(this.A, this.Vph) , math.multiply(this.B, this.Ir));
        this.Is = math.add(math.multiply(this.C, this.Vph) , math.multiply(this.D, this.Ir));

        console.log('Vr', vr);
        console.log('Vph', this.Vph);
        console.log('Ir', this.Ir);
        console.log('Vs', this.Vs);
        console.log('Is', this.Is);
    };

    this.sendingAndReceivingCentres = function(){
        this.Cs = []
        this.Cr = []//desmos api
        this.Cs.push((math.abs(this.D)*Math.pow(math.abs(this.Vs),2)*math.cos(math.atan(this.B.im/this.B.re)))/math.abs(this.B))
        this.Cs.push((math.abs(this.D)*Math.pow(math.abs(this.Vs),2)*math.sin(math.atan(this.B.im/this.B.re)))/math.abs(this.B))
        this.Cr.push((math.abs(this.A)*Math.pow(this.Vph,2)*math.cos(math.atan(this.B.im/this.B.re)))/math.abs(this.B))
        this.Cr.push((math.abs(this.A)*Math.pow(this.Vph,2)*math.sin(math.atan(this.B.im/this.B.re)))/math.abs(this.B))
    };

    this.percVoltReg = function(){
        var magA = math.abs(this.A);
        var magVs = math.abs(this.Vs);
        var Vr_fl = math.divide(this.Vr, (math.sqrt(3)));
        var Vr_nl = math.divide(magVs, magA);
        console.log('Vr_nl', Vr_nl);

        this.perVoltReg = math.abs(math.divide((Vr_nl - Vr_fl), Vr_fl));
        console.log('perVoltReg', this.perVoltReg);
    };

    this.efficiency = function(){
        this.sendPower = 3*math.abs(this.Vs)*math.abs(this.Is)*math.cos(math.atan(this.Vs.im/this.Vs.re)-math.atan(this.Is.im/this.Is.re));
        console.log('sendPower', this.sendPower);

        this.transEff = (this.rPower / this.sendPower) * 100;
        console.log('transEff', this.transEff);
    };

    this.powerLossCalc = function(){
        this.powerLoss = (this.sendPower-this.rPower);
    };

    this.chargingCurrCalc = function(){
        this.Ic = math.abs(this.Is - this.Ir)
    }

    this.compensationCalc = function(){
        if(this.inputs.model==1){
        let c1 = (math.abs(this.A)*Math.pow(this.Vph,2)*math.cos(math.atan(this.B.im/this.B.re)))/math.abs(this.B)
        let c2 = (math.abs(this.A)*Math.pow(this.Vph,2)*math.sin(math.atan(this.B.im/this.B.re)))/math.abs(this.B)
        let r = math.multiply(this.Vph,this.Vph)/math.abs(this.B);
        r/=math.pow(10,6)
        console.log(r)
        this.Qr= Math.sqrt(Math.pow(r,2)-Math.pow((this.rPower/(3*Math.pow(10,6))+c1/Math.pow(10,6)),2)) - c2/Math.pow(10,6);
        this.Q = -this.rPFsign*math.tan(math.acos(this.rPF))*this.rPower/(Math.pow(10,6))/3;
        this.compensation = this.Qr-this.Q;
        }
    }
   
};

function printPdf() {
    ans = document.getElementById('answers');
    html2pdf(ans, { 
        filename:     'TADEE.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 1, logging: true, dpi: 192, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }});
  }