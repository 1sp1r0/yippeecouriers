function submitEstimate(){
    // get the form data
    // there are many ways to get this data using jQuery (you can use the class or id also)
    var formData = {
        'trip_date'              : $('input[name=trip_date]').val(),
        'pickup_address1'          : $('input[name=pickup_address1]').val(),
        'pickup_address2'          : $('input[name=pickup_address2]').val()
    };

    // process the form
    $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '/request-estimate', // the url where we want to POST
        data        : formData, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode          : true
    })
    // using the done promise callback
    .done(function(data) {
        // log data to the console so we can see
        // console.log(data); 
    });
}

function submitQuote(){
    // get the form data
    // there are many ways to get this data using jQuery (you can use the class or id also)
    var formData = {
        'trip_name'              : $('input[name=trip_name]').val(),
        'contact_name'             : $('input[name=contact_name]').val(),
        'pet_name'    : $('input[name=pet_name]').val()
    };

    // process the form
    $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '/request-estimate', // the url where we want to POST
        data        : formData, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
                    encode          : true
    })
    // using the done promise callback
    .done(function(data) {
        // log data to the console so we can see
        // console.log(data); 
    });
}