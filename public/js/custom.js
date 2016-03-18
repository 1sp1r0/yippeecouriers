function transferFormEntries(){
    $('input[name=trip_date]').val($('input[name=estimate_trip_date]').val());
    $('input[name=pickup_address1]').val($('input[name=estimate_pickup_address1]').val());
    $('input[name=pickup_address2]').val($('input[name=estimate_pickup_address2]').val());
    $('input[name=pickup_city]').val($('input[name=estimate_pickup_city]').val());
    $('input[name=pickup_state]').val($('input[name=estimate_pickup_state]').val());
    $('input[name=pickup_postcode]').val($('input[name=estimate_pickup_postcode]').val());
    $('input[name=dropoff_address1]').val($('input[name=estimate_dropoff_address1]').val());
    $('input[name=dropoff_address2]').val($('input[name=estimate_dropoff_address2]').val());
    $('input[name=dropoff_city]').val($('input[name=estimate_dropoff_city]').val());
    $('input[name=dropoff_state]').val($('input[name=estimate_dropoff_state]').val());
    $('input[name=dropoff_postcode]').val($('input[name=estimate_dropoff_postcode]').val());
}

function modalSwap(){
    $('#estimate-modal').modal('hide');
    setTimeout(function(){
        $('#tripModal').modal('show');
    }, 450);
}

function modalHide(){
    $('#estimate-modal').modal('hide');
    $('#estimate-range').html('Please wait while your estimate is calculated.');
    $('#continue').html('Continue');
    $('#continue').attr('onClick', 'modalSwap()');
}

function requestEstimate(){
    transferFormEntries();
    // get the form data
    // there are many ways to get this data using jQuery (you can use the class or id also)
    var formData = {
        'trip_date'              : $('input[name=estimate_trip_date]').val(),
        'dropoff_postcode'       : $('input[name=estimate_dropoff_postcode]').val(),
        'pickup_postcode'        : $('input[name=estimate_pickup_postcode]').val()
    };

    // process the form
    $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '/create-estimate', // the url where we want to POST
        data        : formData, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
        encode      : true
    })
    // using the done promise callback
    .done(function(data) {
        // log data to the console so we can see
        $('#estimate-range').html(data.estimate_range);
        $('#flight-cost').html(data.flight_cost);
        $('#pet-fee').html(data.pet_fee);
        $('#hotel-cost').html(data.hotel_cost);
        $('#yipee-fee').html(data.yipee_fee);
        $('#other-fee').html(data.other_fee);
    })
    .fail(function(err) {
        console.log( "error: ", err );
        $('#estimate-heading').html('Sorry we couldn\'t find a matching flight, please request trip and we\'ll contact you with an estiamte.');
        $('#continue').html('Try Again');
        $('#continue').attr('onClick', 'modalHide()');
    });
}

function requestTrip(){
    console.log('requestTrip');
    // get the form data
    // there are many ways to get this data using jQuery (you can use the class or id also)
    var formData = {
        'main_contact' : $('input[name=main_contact]').val(),
        'sender_name' : $('input[name=sender_name]').val(),
        'sender_email' : $('input[name=sender_email]').val(),
        'sender_phone' : $('input[name=sender_phone]').val(),
        'receiver_name' : $('input[name=receiver_name]').val(),
        'receiver_email' : $('input[name=receiver_email]').val(),
        'receiver_phone' : $('input[name=receiver_phone]').val(),
        'trip_date' : $('input[name=trip_date]').val(),
        'pickup_address1' : $('input[name=pickup_address1]').val(),
        'pickup_address2' : $('input[name=pickup_address2]').val(),
        'pickup_city' : $('input[name=pickup_city]').val(),
        'pickup_state' : $('input[name=pickup_state]').val(),
        'pickup_postcode' : $('input[name=pickup_postcode]').val(),

        'trip_date' : $('input[name=trip_date]').val(),
        'pickup_address1' : $('input[name=pickup_address1]').val(),
        'pickup_address2' : $('input[name=pickup_address2]').val(),
        'pickup_city' : $('input[name=pickup_city]').val(),
        'pickup_state' : $('input[name=pickup_state]').val(),
        'pickup_postcode' : $('input[name=pickup_postcode]').val(),

        'origin_airport_code' : $('input[name=origin_airport_code]').val(),
        'destination_airport_code' : $('input[name=destination_airport_code]').val(),

        'dropoff_address1' : $('input[name=dropoff_address1]').val(),
        'dropoff_address2' : $('input[name=dropoff_address2]').val(),
        'dropoff_city' : $('input[name=dropoff_city]').val(),
        'dropoff_state' : $('input[name=dropoff_state]').val(),
        'dropoff_postcode' : $('input[name=dropoff_postcode]').val(),

        'trip_notes' : $('input[name=trip_notes]').val(),

        'estimateId' : $('input[name=estimateId]').val(),

        'pet_name' : $('input[name=pet_name]').val(),
        'pet_weight' : $('input[name=pet_weight]').val(),
        'pet_notes' : $('input[name=pet_notes]').val(),
        'pet_age' : $('input[name=pet_age]').val(),
        'pet_species' : $('input[name=pet_species]').val(),
        'pet_medical_notes' : $('input[name=pet_medical_notes]').val(),
        'pet_has_carrier' : $('input[name=pet_has_carrier]').val(),
        'pet_notes' : $('input[name=pet_notes]').val()
    };

    // process the form
    $.ajax({
        type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url         : '/create-trip', // the url where we want to POST
        data        : formData, // our data object
        dataType    : 'json', // what type of data do we expect back from the server
                    encode          : true
    })
    // using the done promise callback
    .done(function(data) {
        // log data to the console so we can see
        console.log(data); 
        console.log('done ran');
    });
}

function pageBootstrap() {

    // load Google Analytics
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-75289755-1', 'auto');
    ga('send', 'pageview');

    // attach GA to the modals
    $('#estimate-modal').on('show.bs.modal', function (e) {
      ga('send', 'estimate-modal');
    })

    // create datepicker
    $('#dp').datepicker({format: 'yyyy-mm-dd'});


}


