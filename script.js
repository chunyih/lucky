$(document).ready(function () {
    initialize();
});

var map;
var app_key = 'NTFlY2Y1OGEtYjVjNC00NzNkLWE0NTUtN2FiYWU5OWViYjU2';
 
function initialize() {
  var marker;
  var infoWindow;
  if (navigator.geolocation) {
    var timeoutVal = 10 * 1000 * 1000;
    navigator.geolocation.watchPosition(
      displayPosition, //success callback
      displayError, //error callback
      { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 } //HTML5 geolocation options
  );
  }
  else { alert("Geolocation is not supported by this browser"); }
}

function displayPosition(position) {      
  //var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var pos = new google.maps.LatLng(37.393661, -122.078871); //manual location input
  var options = {
    zoom: 19,
  center: pos,
  mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"), options); //construct map
      
  if (typeof(marker) != "undefined") marker.setMap(null); //remove the current marker, if there is one
  
  marker = new google.maps.Marker({
  position: pos,
  map: map,
  title: "User location"
  });

  var contentString = "<div class=\"contentString\"><b>Timestamp:</b> " + parseTimestamp(position.timestamp) + "<br/><b>User location:</b> lat " + position.coords.latitude + ", long " + position.coords.longitude + ", accuracy " + position.coords.accuracy + "</div>";
    
  if (typeof(infoWindow) != "undefined") infoWindow.setMap(null); //remove the current infoWindow, if there is one
    
  infowindow = new google.maps.InfoWindow({
    content: contentString
  });
    
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });
    
  // ShowPlaces
  $.ajax({
    dataType : "jsonp",
    url : 'http://api.opencanvas.co/v1.0/routes/678/places?app_key=' + app_key,
    success: function(data) {
      $(data.places).each(function(index, place){
        var options = {map: map, position: new google.maps.LatLng(place.lat,place.lon)}; //marker settings
        var marker = new google.maps.Marker(options); //show map and positions
        $('.content').append('<div class="placeName"><a href="#">'+place.name+'&nbsp&nbsp<span class="badge">'+place.storyCount+'</span></a></div>');
      });
    },
    error: function() { alert("Sorry, The requested property could not be found."); }
  });
    
  // ShowRoute
  $.ajax({
    dataType : "jsonp",
    url : 'http://api.opencanvas.co/v1.0/routes/678?app_key=' + app_key,
    success: function(data) {
      console.log(data.lat,data.lon);
      //map.setCenter(new google.maps.LatLng(data.lat,data.lon));
      //map.setZoom(15);
      var paths = google.maps.geometry.encoding.decodePath(data.polyline);
      var poly = new google.maps.Polyline({
        path: paths,
        strokeColor: '#7fb82c',
        strokeOpacity: 0,
        strokeWeight: 6
      });
      poly.setMap(map);
    },
    error: function() { alert("Sorry, The requested property could not be found."); }
  });
}

function displayError(error) {
  var errors = { 
  1: 'Permission denied',
  2: 'Position unavailable',
  3: 'Request timeout'
  };
  alert("Error: " + errors[error.code]);
}

function parseTimestamp(timestamp) {
  var d = new Date(timestamp);
  var day = d.getDate();
  var month = d.getMonth() + 1;
  var year = d.getFullYear();
  var hour = d.getHours();
  var mins = d.getMinutes();
  var secs = d.getSeconds();
  var msec = d.getMilliseconds();
  return day + "." + month + "." + year + " " + hour + ":" + mins + ":" + secs + "," + msec;
}  
 