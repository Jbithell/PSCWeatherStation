var pusher = new Pusher(pusherConnectionCode, {
    cluster: 'eu',
    encrypted: true
});

//Pusher Error handling
pusher.connection.bind( 'error', function( err ) {
    if( err.error.data.code === 4004 ) {
        console.log("Too many clients connected to device") //TODO Handle this
    }
});

//Pusher connection management
pusher.connection.bind('state_change', function(states) {
    // states = {previous: 'oldState', current: 'newState'}
    $('#connectionstatus').text(" | You are " + states.current);
});

//Connect to channel
var channel = pusher.subscribe('PSCWeatherDataLive');

//Initialize some vars
var gauges = [];


// On boot functions
$( document ).ready(function() {
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf(' electron/') > -1) {
        $(".hiddenElectron").hide();
    }
    loadingdialog = bootbox.dialog({
        size: "small",
        message: '<p class="text-center"><i class="fa fa-spinner fa-5x fa-pulse"></i><br/><br/><b>Awaiting Data</b><br/>If this message doesn\'t dissapear after a few seconds it\'s likely the station is offline for maintenance such as over the winter period or it has lost its internet connection</p>',
        closeButton: false,
    });
    drawCharts(function () {
        //How to handle new live Readings from this starting point onwards
        channel.bind('PSCWeatherDataLiveNEWReading', function(data) {
            loadingdialog.modal('hide');
            $(".datadisplay").show();
            displayData(data.message.reading);
            $(".datadisplay").show();
        });
    });
});