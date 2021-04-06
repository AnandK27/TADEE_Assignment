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
        console.log('hi')
    };

    this.capcitancePerL = function(){
        var logVal = math.log(this.mgmd/this.CSgmd);
        this.CPerLength=math.chain('2').multiply(Math.PI).multiply('8.854e-12').divide(logVal);
    }

   
};

