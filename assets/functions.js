function findBootstrapEnvironment() { //Work ou the current client size
    //from https://stackoverflow.com/a/15150381/3088158
    var envs = ['xs', 'sm', 'md', 'lg'];

    var $el = $('<div>');
    $el.appendTo($('body'));

    for (var i = envs.length - 1; i >= 0; i--) {
        var env = envs[i];

        $el.addClass('hidden-'+env);
        if ($el.is(':hidden')) {
            $el.remove();
            return env;
        }
    }
}
function sizeCharts() { //Calculate the size the charts should be
    var environemntSize = findBootstrapEnvironment();
    if (environemntSize == "lg" || environemntSize == "md") {
        var dimensions = (($('#maindisplayrow').width()))/6;
    } else if (environemntSize == "sm") {
        var dimensions = (($('#maindisplayrow').width()))/3;
    } else {
        var dimensions = (($('#maindisplayrow').width()));
    }

    $('canvas[data-type="radial-gauge"]').attr('data-width', dimensions);
    $('canvas[data-type="radial-gauge"]').attr('data-height', dimensions);
}
//How to handle window being resized
$( document ).ready(function() {
    sizeCharts();
});
$( window ).resize(function() {
    sizeCharts();
});

function drawCharts(callback) { //Draw the charts
    gauges["winddirectiongauge"] = document.gauges.get('winddirectiongauge');
    gauges["windgauge"] = document.gauges.get('windgauge');
    gauges["windaveragegauge"] = document.gauges.get('windaveragegauge');
    gauges["windgustgauge"] = document.gauges.get('windgustgauge');
    gauges["humiditygauge"] = document.gauges.get('humiditygauge');
    gauges["tempgauge"] = document.gauges.get('tempgauge');

    if( typeof callback == "function" ) {
        callback();
    } else {
        return true;
    }
}
function displayData(dataPacket) { //Update the data in the charts
    gauges["winddirectiongauge"].value = dataPacket['windDirection'];
    gauges["windgauge"].value = dataPacket['windSpeed'];
    gauges["windaveragegauge"].value = dataPacket['wind10MinAverage'];
    gauges["windgustgauge"].value = dataPacket['wind10MinGust'];
    gauges["tempgauge"].value = dataPacket['temperatureC'];
    gauges["humiditygauge"].value = dataPacket['humidity'];

    //Update page HTML as required
    $("#lastupdate").html("Last updated " + new Date(dataPacket['timestamp']*1000).toUTCString());

    $("#compassimage").attr("src", "assets/img/compass/" + (Math.round(dataPacket["windDirection"] / 10) * 10) + ".png");
    $(window).trigger('resize'); //To refresh the display handling
}