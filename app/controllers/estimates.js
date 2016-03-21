var retryLimit = 3;

// HTTP
var http = require('http');

// ASYNC
var async = require('async');

// REQUESTS
var request = require('request');

// MONGOOSE
var mongoose = require('mongoose');

// Estimate Mongoose Model
var Estimate = require('../models/estimate');

// CONFIG
var config = require('../config')['production'];


var acceptedAirports = ["ABR","ABI","CAK","ALS","ABY","ALB","ABQ","AEX","ABE", "AIA","APN","AOO","AMA","ANC","ATW","AVL","ASE","AHN", "ATL","ACY","AGS","AUG","AUS","BFL","BWI","BGR","BHB", "BRW","BTR","BPT","BKW","BED","BLI","BJI","BET","BTT", "BIL","BGM","BHM","BIS","BMI","BMG","BLF","BOI","BOS", "BZN","BKX","BRO","BQK","BUF","BUR","BRL","BBF","BTV", "BTM","CGI","CLD","CNM","CPR","CID","CMI","CHS","CRW", "CLT","CHO","CHA","CYS","CHI","MDW","CHI","ORD","CIC", "CVG","CKB","CLE","CVN","COD","CLL","COS","COU","CAE", "CSG","CLU","GTR","OLU","CMH","CDV","CRP","DAL","DFW", "DAY","DAB","DEC","DEN","DSM","DTW","DTT","DVL","DIK", "DLG","DDC","DHN","DUJ","DBQ","DLH","DRO","DUT","EAU", "EEK","IPL","ELD","ELP","EKO","ELM","WDG","ERI","ESC", "EUG","ACV","EVV","FAI","FAR","FMN","XNA","FAY","FLG", "FNT","FLO","FOD","FLL","TBN","RSW","FSM","VPS","FWA", "FYU","FAT","GNV","GCK","GCC","GDV","GFK","GRI","GJT", "GRR","GBD","GTF","GRB","LWB","GSO","GLH","PGV","GSP", "GPT","GUC","HGR","HNM","CMX","HRL","MDT","HRO","BDL", "HVR","HYS","HLN","HIB","Big","HHH","HOB","HOM","HNL", "MKK","EFD","HOU","IAH","EFD","HTS","HSV","HON","HYA", "IDA","IND","INL","IYK","IMT","IWD","ISP","ITH","JAC", "JAN","MKL","JAX","OAJ","JMS","JHW","JST","JPR","JLN", "JNU","OGG","AZO","LUP","FCA","MCI","JHM","EAR","ENA", "KTM","EYW","GRK","AKN","IGM","IRK","LMT","TYS","ADQ", "LSE","LFT","LCH","Hll","LNY","LNS","LAN","LAR","LRD", "LRU","LAS","LBE","PIB","LAW","LAB","LWS","LEW","LWT", "LEX","LBL","LIH","LNK","LIT","LGB","GGG","QLA","SDF", "LBB","LYH","MCN","MSN","MHT","MHK","MBL","MWA","MQT", "MVY","MCW","MSS","MFE","MCK","MFR","MLB","MEM","MEI", "MIA","MAF","MLS","MKE","MSP","MOT","MSO","MOB","MOD", "MLI","MLU","MRY","MGM","MTJ","MGW","MWH","MSL","MKG", "MRY","ACK","ABF","BNA","EWN","HVN","MSY","LGA","JFK", "NYC","EWR","SWF","PHF","OME","ORF","OTH","LBF","OAK", "OGS","OKC","OMA","ONT","SNA","MCO","OSH","OWB","OXR", "PAH","PGA","PSP","PFN","PKB","PSC","PLN","PDT","PNS", "PIA","PHL","PHX","PIR","SOP","PIT","PIH","PNC","PWM", "PDX","PSM","PRC","PQI","PVD","PVC","PUB","PUW","UIN", "RDU","RAP","RDD","RDM","RNO","RHI","RIC","RIW","ROA", "RST","ROC","RKS","RFD","RKD","ROW","RUT","SMF","MBS", "SLN","SPY","SLC","SJT","SAT","SAN","QSF","SFO","SJC", "SBP","SDP","SBA","SAF","SMX","STS","SLK","SRQ","CIU", "SAV","BFF","SEA","SHD","SHR","SHV","SDY","SVC","SUX", "FSD","SIT","SGY","SBN","GEG","SPI","CEF","SGF","VSF", "STC","SGU","STL","PIE","SCE","SBS","SUN","SRY","TLH", "TPA","TAX","TXK","TVF","OOK","TOL","TOP","TVC","TTN", "TUS","TUL","TUP","TWF","TYR","UNK","EGE","VDZ","VLD", "VCT","VIS","ACT","ALW","DCA","WAS","IAD","ALO","ART", "ATY","CWA","EAT","PBI","WYS","HPN","SPS","ICT","AVP", "IPT","ISN","ILG","ILM","OLF","WRL","WRG","YKM","YAK", "YUM","YXX","YAA","YEK","YBG","YYC","YBL","YGR","YCG", "YYG","YMT","YYQ","YXC","YDF","YHD","YEG","YEO","YMM", "YYE","YXJ","YSM","YFC","YQX","YGP","YQU","YHZ","YHM", "YFB","YKA","YLW","YQK","YGK","YQL","YXU","YXH","YQM", "YYY","YMQ","YUL","YCD","YYB","YOW","YYF","YZT","YPW", "YPR","YQB","YQZ","YRT","YRL","YQR","YRJ","YUY","YSJ", "YZP","YZR","YXE","YAM","YZV","YXL","YYD","YYT","YSB", "YQY","YXT","YTH","YQT","YTS","YYZ","YTO","YTZ","YVO", "YVR","YYJ","YWK","YXY","YWL","YQG","YWG","YZF","LAX"];


Array.prototype.contains = function(k, callback) {
    var self = this;
    return (function check(i) {
        if (i >= self.length) {
            return callback(false);
        }

        if (self[i] === k) {
            return callback(true);
        }

        return process.nextTick(check.bind(null, i+1));
    }(0));
}

exports.createEstimate = function (req, res){

//TWO TERMS: DEPARTURE & DESTINIATION 
    var deptCity = [];
    var destCity = [];
    var deptAirport = [];
    var destAirport = [];

     var controllerTry = 0;

    var estimate = new Estimate({
        trip_id:'0',
        trip_name: "Fly",
        trip_date: "2016",
        ride: {
            cost_to: 0,
            cost_from: 0
        },
        flight: {
            cost_range: {
                low: 0,
                high: 0
            },
            orig_url: '',
            miles: 1,
            orig_name: '',
            orig_coordinates: {
                lat:  0,
                lng: 0
            },
            orig_air_code: 'SFO',
            orig_carrier: '',
            orig_air_coordinates:{
                lat: 0,
                lng: 0
            },
            dest_url: '',
            dest_carrier: '',
            dest_name: '',
            dest_coordinates: {
                lat: 0,
                lng: 0
            },
            dest_air_code: 'SFO',
            dest_air_coordinates:{
                lat: 0,
                lng: 0
            },
        },
        hotel: {
            id: 0,
            url: '',
            name: '',
            cost_range: {
                low: 0,
                high: 0
            },
             hotel_coordinates:{
                lat: 0,
                lng: 0
            },
        },
        airline_pet_fee: 100,
        yippee_fee: 200,
        misc_fee: 25,
        total_fee: {
            low: 587,
            high: 1043
        },
    });


    var beartoken = "";
    var apiKey = config.expediaAuth;

    function send_data_get(url, callback){
       options = {url, json: true};
       console.log(url);
       
        request.get(options, function (error, response, body) {
          // console.log(body);

          if (!error && response.statusCode == 200) {
                callback(null, body);
            }else{
                console.log("Error: "+url);
                callback(new Error('Unable to connect!'));
                return;
            }
        });
    }

    function send_data_token(url, callback){
        console.log(url);

        var options = {
            url, 
            json: true,
            headers: {
                'Authorization': ' bearer '+beartoken
                }
        };
      
        request.get(options, function (error, response, body) {
          // console.log(body);

          if (!error && response.statusCode == 200) {
                callback(null, body);
            }else{
                console.log("Error: "+url);
                callback(new Error('Error: With request'));
                return;
            }
        });
    }

    function send_data_get_token(callback){

        var url = 'https://api.lyft.com/oauth/token';
        console.log(url);

        var options = {
            url, 
            method: "POST",
            body: JSON.stringify({"grant_type": "client_credentials", "scope": "public"}),
            headers: {
                'Authorization': 'Basic '+config.lyftAuth,
                "content-type": "application/json"
                }
        };
      
        request(options, function (error, response, body) {
          // console.log(body);

          if (!error && response.statusCode == 200) {
                console.log("Got Token!!!");
                beartoken = JSON.parse(body)["access_token"];
                // callback(null, body);
            }else{
                console.log("Error Getting Token");
                console.log(response.statusCode);
                // callback(new Error('Error: With getting token'));
                // return;
            }
        });
    }

    function process_data_city(url_data, callback){
        async.map(url_data, send_data_get, function(err, results){
            // results is now an array of stats for each file 
            var deptCityData = results[0];

            if(deptCityData){
                deptCity["name"] = deptCityData["results"][0]["formatted_address"];
                deptCity["lat"] = deptCityData["results"][0]["geometry"]["location"]["lat"];
                deptCity["lng"] = deptCityData["results"][0]["geometry"]["location"]["lng"];

                //Insert Model
                estimate['flight']['orig_name'] = deptCity["name"];
                estimate['flight']['orig_coordinates']['lat'] = deptCity["lat"];
                estimate['flight']['orig_coordinates']['lng']= deptCity["lng"];
            }

             var destCityData = results[1];

            if(destCityData){
                destCity["name"] = destCityData["results"][0]["formatted_address"];
                destCity["lat"] = destCityData["results"][0]["geometry"]["location"]["lat"];
                destCity["lng"] = destCityData["results"][0]["geometry"]["location"]["lng"];
                
                //Insert Model
                estimate['flight']['dest_name'] = destCity["name"];
                estimate['flight']['dest_coordinates']['lat'] = destCity["lat"];
                estimate['flight']['dest_coordinates']['lng'] = destCity["lng"];
            }

            
            if (deptCityData && destCityData) {
                callback(null);
            }else{
                console.log("Error: "+url);
                callback(new Error('Unable to locate City! (g.maps:name,cords)'));
                return;
            }
            // callback(null);
            //callback(null, results[0]["results"][0]["formatted_address"], results[1]["results"][0]["formatted_address"]);
        });
   

    }

    function process_lyft(url_data, callback){
         async.map(url_data, send_data_token, function(err, results){

            var lyftDeptArr = '';
            var lyftDestArr = '';

            // console.log(results[0]);
            lyftDeptArr = results[0];

            if(lyftDeptArr){
                estimate['ride']['cost_to'] = Math.round(parseInt(lyftDeptArr['cost_estimates'][0]['estimated_cost_cents_max'])/100);
            }

            lyftDestArr = results[1];
            if(lyftDestArr){
                estimate['ride']['cost_from'] = Math.round(parseInt(lyftDestArr['cost_estimates'][0]['estimated_cost_cents_max'])/100)
            }

            // estimate['ride']['cost_to']
            // estimate['ride']['cost_from']

           estimate['total_fee']['high'] = parseInt(estimate['total_fee']['high']) + parseInt(estimate['ride']['cost_to']) + parseInt(estimate['ride']['cost_from']);
            estimate['total_fee']['low'] = parseInt(estimate['total_fee']['low']) + parseInt(estimate['ride']['cost_to']) + parseInt(estimate['ride']['cost_from']);
         callback(null);
});
         
    }

    function process_data_airport(url_data, callback){
        /*
            name:
            lat:
            lng
        */
        // console.log("Return on: "+url_data);

        async.map(url_data, send_data_get, function(err, results){

            var deptAirportData = '';
            var destAirportData = '';

            deptAirportData = results[0];

            if(deptAirportData){
            // console.log(results[0].length);

                //Collect close Dept Airports
                for(var i = 0; i < results[0].length; i++){
                    deptAirportData = results[0][i];

                    var deptIATA = deptAirportData["tags"]["iata"]["airportCode"]["value"];

                    if(acceptedAirports.indexOf(deptIATA) >= 0) {

                        var data_insert = {
                        name: deptAirportData["tags"]["iata"]["airportCode"]["value"],
                         lat: deptAirportData["position"]["coordinates"][1],
                         lng: deptAirportData["position"]["coordinates"][0] };

                        deptAirport.push(data_insert);

                        console.log("Dept: "+deptIATA);
                        // console.log(deptAirport);

                    } else {
                        console.log("Not found: "+deptIATA);
                    }

                }
            }

            //Insert Model
            // estimate['flight']['orig_air_code'] = destAirport;
            // estimate['flight']['orig_air_coordinates'] = {
            //     lat: destAirportCord[0], 
            //     lng: destAirportCord[1]
            // };

            destAirportData = results[1];

            if(destAirportData){
            // console.log(results[1].length);

                //Collect Destination Aiports
                for(var i = 0; i < results[1].length; i++){
                    destAirportData = results[1][i];

                    var destIATA = destAirportData["tags"]["iata"]["airportCode"]["value"];   
                    if(acceptedAirports.indexOf(destIATA) >= 0) {

                        var data_insert = {
                        name: destAirportData["tags"]["iata"]["airportCode"]["value"],
                         lat: destAirportData["position"]["coordinates"][1],
                         lng: destAirportData["position"]["coordinates"][0] };

                        destAirport.push(data_insert);

                        console.log("Dest: "+destIATA);
                        // console.log(destAirport);

                    } else {
                        console.log("Not found: "+destIATA);
                    }

                }
            }
            // estimate['flight']['dest_air_code'] = arrvlAirport;
            // estimate['flight']['dest_air_coordinates'] = {
            //     lat: arrvlAirportCord[0], 
            //     lng: arrvlAirportCord[1]
            // };
            
            


            if (destAirport[1] && destAirport[1]) {
                callback(null);
            }else{
                console.log("Error: ");
                callback(new Error('Unable to locate Airports! (ex.pedia:name,cords)'));
                return;
            }
            
        });

    }

    function process_data_flights(url_data, callback){

        // console.log("Return on: "+url_data);
        async.map(url_data, send_data_get, function(err, results){

            // results is now an array of stats for each file 
            var deptFlightData = results[0];
            
            var deptFlight_legId = "";
            var deptFlight_totalFare = "";
            var deptFlight_detailsUrl = "";

           

                if(deptFlightData && deptFlightData["legs"]){

                    deptFlight_totalFare = deptFlightData["offers"][0]["totalFare"];
                    deptFlight_detailsUrl = deptFlightData["offers"][0]["detailsUrl"];
                    deptFlight_legId = deptFlightData["legs"][0]["legId"];

                    //Insert Model
                    estimate['flight']['orig_name'] = deptCity['name'];
                    estimate['flight']['orig_url'] = deptFlight_detailsUrl;
                    estimate['flight']['orig_id'] = deptFlight_legId;

                }else{
                    console.log("ERROR_FLIGHT");
                    callback(new Error('2'));
                    return;
                }

            //  if(destFlightData["offers"][0]["segments"][0].hasOwnProperty("distance")){
            //     destFlight_carrier = destFlightData["legs"][0]["segments"]["airlineName"];
            //     destFlight_miles = destFlightData["legs"][0]["segments"]["distance"];
            // }else{
            //     destFlight_carrier = destFlightData["legs"][0]["segments"][0]["airlineName"];
            //     destFlight_miles = destFlightData["legs"][0]["segments"][0]["distance"]; 
            // }

             
        

            var destFlightData = results[0];

            var destFlight_legId = "";
            var destFlight_totalFare = "";
            var destFlight_detailsUrl = "";
            
           if(destFlightData && destFlightData["legs"]){

                // console.log("GOODFLIGHT");
                    
                    destFlight_totalFare = destFlightData["offers"][0]["totalFare"];
                    destFlight_detailsUrl = destFlightData["offers"][0]["detailsUrl"];
                    destFlight_legId = destFlightData["legs"][0]["legId"];

                    //Insert Model
                    estimate['flight']['dest_name'] = destCity["name"];
                    estimate['flight']['dest_url'] = destFlight_detailsUrl;
                    estimate['flight']['dest_id'] = destFlight_legId;

                }else{
                    console.log("ERROR_FLIGHT");
                    callback(new Error('3'));
                    return;
            }
            
           

            // if(arrvlFlightData["offers"][0]["segments"].hasOwnProperty("distance")){
            //     arrvlFlight_miles = arrvlFlightData["offers"][0]["segments"]["distance"];
            //     arrvlFlight_carrier = arrvlFlightData["offers"][0]["segments"]["airlineName"];
            // }else{
            //     arrvlFlight_miles = arrvlFlightData["offers"][0]["segments"][0]["distance"];
            //     arrvlFlight_carrier = arrvlFlightData["offers"][0]["segments"][0]["airlineName"];
            // }

            
        
            // estimate['flight']['dest_name'] = arrvlFlight_carrier;


            estimate['flight']['cost_range']['low'] = parseInt(destFlight_totalFare) + parseInt(deptFlight_totalFare);
            estimate['flight']['cost_range']['high'] = parseInt(destFlight_totalFare) + parseInt(deptFlight_totalFare);
            // estimate['flight']['miles'] = parseInt(destFlight_miles) + parseInt(arrvlFlight_miles);
             
            var hotel_id = "";
            var arrvlCityCord = "";
           
            var arrvlCity = "";
            var arrvlCityCord = "";
            var hotelCost = 0;

            if((destFlightData) && (deptFlightData) && (results[2]["HotelInfoList"]["HotelInfo"])) {
            // console.log(results[2]["HotelInfoList"]["HotelInfo"][9]["HotelID"]);
            hotel_id = results[2]["HotelInfoList"]["HotelInfo"][9]["HotelID"];
            
            estimate['hotel']['id'] = hotel_id;

            // results is now an array of stats for each file 
            hotelCord = results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["GeoLocation"];
            hotelCost = results[2]["HotelInfoList"]["HotelInfo"][9]["Price"]["TotalRate"]["Value"];
            hotelURL = results[2]["HotelInfoList"]["HotelInfo"][9]["DetailsUrl"];
            hotelName = results[2]["HotelInfoList"]["HotelInfo"][9]["Name"];

            hotelLocation = results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["City"] + ", " + results[2]["HotelInfoList"]["HotelInfo"][9]["Location"]["Province"];

            estimate['hotel']['hotel_coordinates']  = {
                lat: hotelCord['Latitude'], 
                lng: hotelCord['Longitude']
            };

            estimate['hotel']['cost_range']['low'] = hotelCost;
            estimate['hotel']['cost_range']['high'] = hotelCost;

            estimate['hotel']['name'] = hotelName;
            estimate['hotel']['url'] = hotelURL;
            estimate['hotel']['location'] = hotelLocation;

            

            // console.log(results[2]["HotelInfoList"]["HotelInfo"][9]);


            // console.log(arrvlFlight_totalFare);
            // console.log(arrvlFlight_detailsUrl);
        }

        totalcost = parseInt(hotelCost) + parseInt(destFlight_totalFare) + parseInt(deptFlight_totalFare) + 325;
            estimate['total_fee']['low'] = totalcost;
            estimate['total_fee']['high'] = totalcost;

            // console.log("IT only costs: "+totalcost);

            
            console.log("Return ERR on with Airport: "+err);
            callback(null);
        });

    }

    var startDate = req.body.trip_date;
    var dropoff_postcode = req.body.dropoff_postcode;
    var pickup_postcode = req.body.pickup_postcode;

    var lyftTo = 0;

    send_data_get_token();
    async.waterfall([
        function(callback) {
        //CityArr
            /*
            name: "x"
            lat: "x"
            lng: "x"
            */
            var url_data = ['http://maps.googleapis.com/maps/api/geocode/json?address='+pickup_postcode+'&sensor=true', 'http://maps.googleapis.com/maps/api/geocode/json?address='+dropoff_postcode+'&sensor=true'];

            process_data_city(url_data, callback);
           
        },
        function(callback) {
        //AirportArr
            /*
            name: "x"
            lat: "x"
            lng: "x"
            */

            // Find closest Airport
            var url_data1 = "http://terminal2.expedia.com/x/geo/features?lat="+deptCity["lat"]+"&lng="+deptCity["lng"]+"&type=airport&verbose=3&limit=20&apikey="+apiKey;
            var url_data2 = "http://terminal2.expedia.com/x/geo/features?lat="+destCity["lat"]+"&lng="+destCity["lng"]+"&type=airport&verbose=3&limit=20&apikey="+apiKey;
            var url_data = [url_data1, url_data2];
            process_data_airport(url_data, callback);

        },
        function(callback) {
        //AirportArr
            /*
            name: "x"
            lat: "x"
            lng: "x"
            */
            // console.log(startDate);
            var d = new Date(startDate);
            // console.log(d);

            var day = (d.getDate()+2).toString();
            day = day.length > 1 ? day : '0' + day;

            var month = (d.getMonth()+1).toString();
            month = month.length > 1 ? month : '0' + month;

            var dateReturn = d.getFullYear()+'-'+month+'-'+day;
            console.log("Return Date "+dateReturn);

            var dateFly = startDate;
            console.log("Fly Date "+dateFly);

            var url_data1 = "http://terminal2.expedia.com:80/x/mflights/search?departureDate="+dateFly+"&departureAirport="+deptAirport[0]["name"]+"&arrivalAirport="+destAirport[0]["name"]+"&maxOfferCount=10&apikey="+apiKey;
            var url_data2 = "http://terminal2.expedia.com:80/x/mflights/search?departureDate="+dateReturn+"&departureAirport="+destAirport[0]["name"]+"&arrivalAirport="+deptAirport[0]["name"]+"&maxOfferCount=10&apikey="+apiKey;
            var url_data3 = "http://terminal2.expedia.com:80/x/hotels?maxhotels=10&radius=10km&location="+destAirport[0]['lat']+"%2C"+destAirport[0]['lng']+"&sort=price&checkInDate="+dateFly+"&checkOutDate="+dateReturn+"&apikey="+apiKey;
            var url_data = [url_data1, url_data2, url_data3];
            process_data_flights(url_data, callback);

        },
        function(callback){
        //CityArr
            /*
            name: "x"
            lat: "x"
            lng: "x"
            */

            var url_data1 = "https://api.lyft.com/v1/cost?start_lat="+deptCity["lat"]+"&start_lng="+deptCity["lng"]+"&end_lat="+deptAirport[0]["lat"]+"&end_lng="+deptAirport[0]["lng"];
            var url_data2 = "https://api.lyft.com/v1/cost?start_lat="+destAirport[0]["lat"]+"&start_lng="+destAirport[0]["lng"]+"&end_lat="+destCity["lat"]+"&end_lng="+destCity["lng"];
            var url_data = [url_data1, url_data2];
            process_lyft(url_data, callback);
            // callback(null);

        }
        
    ], function (err, result) {
        // result now equals 'done'
        // console.log("LYFT: "+estimate['flight']['miles']);
        res.json({
        'estimate_range': " $"+estimate['total_fee']['high'],
        'flight_cost': " $"+estimate['flight']['cost_range']['high'],
        'pet_fee': '$100',
        'hotel_cost': " $"+Math.round(estimate['hotel']['cost_range']['high']),
        'lyft_fee': " $"+estimate['ride']['cost_to'],
        'lyft2_fee': " $"+estimate['ride']['cost_from'],
        'yipee_fee': '$200',
        'other_fee': '$25'
    });
        // console.log(estimate);
        estimate.save(function(error, savedEstimate) {
            if(savedEstimate){
                console.log(savedEstimate);
            }else if(error){
                console.log("error: " + error);
            }

        
        });
    });

}
