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
    console.log(inputs);
    return false
});




var mainClass = {
    inputs,
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

mainClass.capacitancePerL();
console.log(mainClass);