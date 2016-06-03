function Map(el){
	if($(el)){
		this.element = el;
		this.map = new google.maps.Map(document.getElementById(this.element), {
			center: new google.maps.LatLng(39.976068,-83.003297),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoom: 11,
			zoomControlOptions: {
				position : google.maps.ControlPosition.TOP_LEFT
			},
			panControl: false,
			streetViewControl: false,
		});
	} else {
		this.element = null;
	}
	this.markers = {};
	
	infowindow = new google.maps.InfoWindow({});
	
	this.headingPin = new google.maps.Marker({
		optimized: false,
		position: new google.maps.LatLng(39.976068,-83.003297),
		map: this.map,
		icon: {url: 'img/pins/heading/0.png'}
	});
	
	this.radiusCircle = new google.maps.Circle();
	this.locked = true;
	this.setHeadingPinPosition(39.976068,-83.003297);
}
Map.prototype.addMarker = function(key, story){
	mmap = this.map;
	markers = this.markers;
	filtercat = geo.getFilter();
	
	hconsole.log(story.categoryid + story.ctv);
	for (cnt = 0; cnt < filtercat.length; cnt++) {
		if(story.categoryid == filtercat[cnt]) {	
			if(!(key in this.markers)){
				if(story.categoryid == 1) {
					var iconimage = story.state;
				}
				if(story.categoryid == 16) {
					var iconimage = "museum";
				}
				if(story.categoryid == 15) {	
					var iconimage = "histmarker";
				}
				if(story.categoryid == 17) {	
					var iconimage = "site:";
				}
				if(story.categoryid == 18) {	
					var iconimage = "visitor";
				}
                
                var icon = {
                url: 'img/pins/other/' + iconimage + '.png',
                scaledSize: new google.maps.Size(76, 50),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(13, 50)
                };

                
			marker = new google.maps.Marker({
				optimized: false,
				position: new google.maps.LatLng(story.lat, story.lng),
				map: this.map,
				icon: icon
			});
			
		
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.close();
					infowindow = new google.maps.InfoWindow({				
					content : '<div style="color:#000">' + story.ctv + ', ' + story.state + '<div class="play-story" story="' + story.originid + '">Play Story</div><div class="view-story" story="' + story.originid + '">View Story</div></div>',
					pixelOffset: new google.maps.Size(-25, 38)
				});
				infowindow.open(mmap, markers[key]);
			});
			this.markers[key] = marker;
			return marker;
			} else {
				return this.markers[key];
			}
		}
	}
}
Map.prototype.removeMarker = function(markerid){
	this.markers[markerid].setMap(null);
	this.markers = this.markers.splice(markerid, 1);
}
Map.prototype.getMarkers = function(){
	return this.markers;
}
Map.prototype.clearMarkers = function(){
	for(x in this.markers){
		this.markers[x].setMap(null);
		delete this.markers[x];
	}
}
Map.prototype.setHeadingPin = function(lats, lngs, headings){
	//console.debug(this.headingPin.getIcon());
	 this.headingPin = new google.maps.Marker({
		optimized: false,
		position: new google.maps.LatLng(lats, lngs),
		map: this.map,
		icon: {url: 'img/pins/heading/' + headings + '.png'}
	});
}
Map.prototype.setHeadingPinPosition = function(lats, lngs, headings){
	if(!this.headingPin){
        hconsole.log("Heading Pin placement.DO WE GET HERE?");
		this.setHeadingPin(lats, lngs, headings);
	} else {
		//console.debug(this.headingPin.getIcon().url);
        //hconsole.log("Heading Pin NOT FOUND");
		this.headingPin.setPosition(new google.maps.LatLng(lats, lngs));
		if(headings){
			this.headingPin.setIcon('img/pins/heading/' + headings + '.png');
		}
	}
	this.radiusCircle.setVisible(false);
	this.radiusCircle.setOptions({
      strokeColor: '#7E829A',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#C2C4CE',
      fillOpacity: 0.2,
	  radius: geo.getRadius() * 1609.34,
      map: this.map,
      center: new google.maps.LatLng(lats, lngs)
    });
	
	this.radiusCircle.setVisible(true);
}
Map.prototype.setCenter = function(lat, lng){
	this.map.setCenter(new google.maps.LatLng(lat, lng));
}
Map.prototype.getBounds = function(){
	return this.map.getBounds();
}
Map.prototype.resize = function(){
	google.maps.event.trigger(this.map,'resize');
}
Map.prototype.setLock = function(bool){
	this.locked = bool;
}
Map.prototype.setCenterToHeading = function(){
	this.map.setCenter(this.headingPin.getPosition());
}
Map.prototype.addDragEvent = function(callback){
	return google.maps.event.addListener(this.map, 'dragend', callback);
}
Map.prototype.addBoundsChangedEvent = function(callback){
	return google.maps.event.addListener(this.map, 'bounds_changed', callback);
}
Map.prototype.addZoomEvent = function(callback){
	return google.maps.event.addListener(this.map, 'zoom_changed', callback);
}
Map.prototype.getZoom = function(){
	return this.map.getZoom();
}
Map.prototype.getCenter = function(){
	return this.map.getCenter();
}
Map.prototype.removeListener = function (handler){
	google.maps.event.removeListener(handler);
}
Map.prototype.triggerEvent = function(markerobject, action){
	google.maps.event.trigger(markerobject, action);
}
Map.prototype.setCircleVisible = function(bool){
	this.radiusCircle.setVisible(bool);
}
