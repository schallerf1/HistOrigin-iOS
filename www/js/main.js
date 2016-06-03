var Historigin = {
	initialize: function() {
		var lat = null;
		var lng = null;
		var laststorylat = 0.0;
		var laststorylng = 0.0;
		var force_refresh_call = false;
		
		if(!localStorage.getItem('intro')){
			$('#intro-1').show();
		}
		$('#close-intro').tap(function(){
			$('#intro-1').hide();
			localStorage.setItem('intro', 1);
		});
		//gimme console!
		hconsole = new Console('.console');
		hconsole.enable(true);
		//hconsole.show();


		hconsole.log("Loading Geolocation Object");
		geo = new Geolocation();

		hconsole.log("Loading Map");
		map = new Map('map');

		hconsole.log("Loading Currently Playing Queue");
		queued = new Collection('queued');
		queued.removeAllItems();
		
		//for (x in queued.getAllItems()) {
		//	map.addMarker(x, queued.getItem(x));
		//}

		hconsole.log("Loading Past Queue");
		past = new Collection('past');
		//for (x in past.getAllItems()) {
		//	map.addMarker(x, past.getItem(x));
		//}
		hconsole.log("Loading Past Queue");
		qpast = new Collection();
		qpast.removeAllItems();

		hconsole.log("Loading Playing Queue");
		playing = new Collection('playing');
		playing.removeAllItems();

		hconsole.log("Loading Collection");
		myCollection = new Collection('myCollection');
		for (x in myCollection.getAllItems()) {
			map.addMarker(x, myCollection.getItem(x));
		}


		hconsole.log("Loading UI Event Handlers");
		//backclicks
		document.addEventListener("backbutton", function(e){
			if($('.story-longclick').is(':visible')){
				$('.long-clicked').removeClass('long-clicked');
				$('.story-longclick').remove();
			} else if($('.settings-menu-screen:visible').is(':visible')){
				$('.settings-menu-screen').hide();
				$('.menu').not('.settings-breadcrumb').hide();
				$('#home').show();
			} else if($('.menu:visible').not('.settings-breadcrumb').is(':visible')){
				$('.menu').not('.settings-breadcrumb').hide();
			} else {
				r = confirm("Are you sure you want to exit?");
				if(r){
					window.plugins.statusBarNotification.clear();
					navigator.app.exitApp();
				}
			}
		}, false);
		//ui event handlers
		map.addDragEvent(function() {
			map.setLock(false);
		});
		//$('#splash-screen').hide();
		/*$('.skip-login').click(function() {
		 $('#login-sign-up').hide();
		 $('#home').show();
		 map.resize();
		 });*/
		$('.folder').tap(function(e) {
			e.stopPropagation();
			$('.settings-menu').hide();
			$('.folder-menu').show();
		});
		$('.settings').tap(function(e) {
			e.stopPropagation();
			$('.folder-menu').hide();
			$('.settings-menu').show();
		});
		$(document).tap(function() {
			$('.folder-menu').hide();
			$('.settings-menu').hide();
		});
		
		$('body').on('tapend', 'a.suppress-load', function(){
			res = window.open($(this).attr('href'), '_system');
			return false;
		});
		$('.menu li, .menu div').tap(function() {
			if($(this).attr('link') == 'suppress-load'){
				res = window.open($(this).attr('href'), '_system');
			} else if($(this).attr('link') == 'settings-help'){
				$('#intro-1').show();
			} else {
				$('#home').hide();
				$('.settings-menu-screen').hide();
				if ($(this).attr('link') == "queue") {
					$('#queue .settings-section').remove();
					if (!queued.empty()) {
						q = queued.getAllItems();
						for (x in q) {
							$('#queue .settings-container').append(
									'<div class="settings-section story-section" story="' + x + '"> <input type="checkbox" value="' + x + '"/>' + q[x].ctv + ', ' + q[x].state + '</div><div story= "' + x + '" class="settings-section droppable">' + q[x].story + '</div>'
									);
						}
					} else {
						$('#queue .settings-container').append('<div class="settings-section">No Items in Queue</div>');
					}
				}
				if ($(this).attr('link') == "history") {
					$('#history .settings-section').remove();
					if (!past.empty()) {
						q = past.getAllItems();
						//console.debug(q);
						for (x in q) {
							$('#history .settings-container').append(
									'<div class="settings-section story-section" story="' + x + '"> <input type="checkbox" value="' + x + '"/>' + q[x].ctv + ', '  + q[x].state + '</div><div story= "' + x + '" class="settings-section droppable">' + q[x].story + '</div>'
									);
						}
					} else {
						$('#history .settings-container').append('<div class="settings-section">No Items in History</div>');
					}
				}
				if ($(this).attr('link') == "my-collection") {
					$('#my-collection .settings-section').remove();
					//console.debug(myCollection);
					if (!myCollection.empty()) {
						q = myCollection.getAllItems();
						for (x in q) {
							$('#my-collection .settings-container').append(
									'<div class="settings-section story-section" story="' + x + '"> <input type="checkbox" value="' + x + '"/>' + q[x].ctv + ', '  + q[x].state + '</div><div story= "' + x + '" class="settings-section droppable">' + q[x].story + '</div>'
									);
						}
					} else {
						$('#my-collection .settings-container').append('<div class="settings-section">No Items in My Collection.</div>');
					}
				}
				$('#' + $(this).attr('link')).show();
			}
		});
		$('.home-icon').tap(function() {
			$('.settings-menu-screen').hide();
			$('#home').show();
			map.resize();
		});
		$('.overlay-lock-position').tap(function() {
			map.setLock(true);
			map.setCenterToHeading();
		});
		$('.settings-container').on('tapend', '.story-section', function(e) {
			section = this;
			type = $('.settings-menu-screen:visible').attr('id');
			longclicked = false;
			e.stopPropagation();
			$('.long-clicked').removeClass('long-clicked');
			$('.story-longclick').remove();
			$(section).addClass('long-clicked');
			if (type == "history") {
				$(section).append('<ul type="' + type + '" class="story-longclick"><li class="story-action" action="view-story">View Story</li><li class="story-action" action="play">Add to Play Queue</li><li class="story-action" action="view-on-map">View on Map</li><li class="story-action" action="add-to-collection">Add To My Collection</li><li class="story-action" action="delete">Delete</li></ul>');
			} else if (type == "my-collection") {
				$(section).append('<ul type="' + type + '" class="story-longclick"><li class="story-action" action="view-story">View Story</li><li class="story-action" action="play">Add to Play Queue</li><li class="story-action" action="view-on-map">View on Map</li><li class="story-action" action="delete">Delete</li></ul>');
			} else if (type == "queue") {
				$(section).append('<ul type="' + type + '" class="story-longclick"><li class="story-action" action="view-story">View Story</li><li class="story-action" action="view-on-map">View on Map</li><li class="story-action" action="delete">Delete</li></ul>');
			} else if (type == "search-results") {
				$(section).append('<ul type="' + type + '" class="story-longclick"><li class="story-action" action="view-story">View Story</li><li class="story-action" action="play">Add to Play Queue</li><li class="story-action" action="add-to-collection">Add To My Collection</li><li class="story-action" action="view-on-map">View on Map</li></ul>');
			}
			return false;
		});
		//$(document).tapend(function() {
			//clearTimeout(longclicktimer);
		//	return false;
		//});
		$('.settings-container').on('tapend', '.story-action', function(e) {
			e.stopPropagation();
			type = $(this).closest('ul').attr('type');
			story = $(this).closest('.story-section').attr('story');
			action = $(this).attr('action');

			if (type == 'history') {
				if (action == 'play') {
					queued.addItem(story, past.getItem(story));
					past.removeItem(story);
					qpast.removeItem(story);
					$('.long-clicked').removeClass('long-clicked');
					$('.story-longclick').remove();
					$(this).closest('.story-section').remove();
				} else if (action == 'delete') {
					past.removeItem(story);
					$(this).closest('.story-section').remove();
				} else if (action == 'add-to-collection') {
					myCollection.addItem(story, past.getItem(story));
					$('.long-clicked').removeClass('long-clicked');
					$('.story-longclick').remove();
				} else if (action == 'view-on-map'){
					$('.settings-menu-screen').hide();
					$('.menu').not('.settings-breadcrumb').hide();
					$('#home').show(function(){
						trigger = map.addMarker(story, past.getItem(story));
						map.setLock(false);
						map.setCenter(past.getItem(story).lat, past.getItem(story).lng);
						map.triggerEvent(trigger, 'click');
					});
				}
			} else if (type == 'queue') {
				if (action == 'delete') {
					queued.removeItem(story);
					$(this).closest('.story-section').remove();
				} else if (action == 'add-to-collection') {
					myCollection.addItem(story, queued.getItem(story));
				} else if (action == 'view-on-map'){
					$('.settings-menu-screen').hide();
					$('.menu').not('.settings-breadcrumb').hide();
					$('#home').show(function(){
						trigger = map.addMarker(story, queued.getItem(story));
						map.setLock(false);
						map.setCenter(queued.getItem(story).lat, queued.getItem(story).lng);
						map.triggerEvent(trigger, 'click');
					});
				}
			} else if (type == 'my-collection') {
				if (action == 'delete') {
					myCollection.removeItem(story);
					$(this).closest('.story-section').remove();
				} else if (action == 'play') {
					queued.addItem(story, myCollection.getItem(story));
					$('.long-clicked').removeClass('long-clicked');
					$('.story-longclick').remove();
				} else if (action == 'view-on-map'){
					$('.settings-menu-screen').hide();
					$('.menu').not('.settings-breadcrumb').hide();
					$('#home').show(function(){
						trigger = map.addMarker(story, myCollection.getItem(story));
						map.setLock(false);
						map.setCenter(myCollection.getItem(story).lat, myCollection.getItem(story).lng);
						map.triggerEvent(trigger, 'click');
					});
				}
			} else if (type == 'search-results') {
				if (action == 'play') {
					queued.addItem(story, searchResults.getItem(story));
					$('.long-clicked').removeClass('long-clicked');
					$('.story-longclick').remove();
				} else if (action == 'add-to-collection') {
					myCollection.addItem(story, searchResults.getItem(story));
					$('.long-clicked').removeClass('long-clicked');
					$('.story-longclick').remove();
				} else if (action == 'view-on-map'){
					$('.settings-menu-screen').hide();
					$('.menu').not('.settings-breadcrumb').hide();
					$('#home').show(function(){
						map.resize();
						trigger = map.addMarker(story, searchResults.getItem(story));
						map.setLock(false);
						map.setCenter(searchResults.getItem(story).lat, searchResults.getItem(story).lng);
						map.triggerEvent(trigger, 'click');
					});
				}
			}
			if (action == 'view-story') {
				$(this).closest('.settings-container').find('.droppable[story="' + story + '"]').slideDown();
				$('.long-clicked').removeClass('long-clicked');
				$('.story-longclick').remove();
			}
		});
		/*
		 $('.settings-container').on("tapend", ".story-section", function() {
		 if (!longclicked) {
		 if (!$(this).hasClass('long-clicked')) {
		 $('.long-clicked').removeClass('long-clicked');
		 $('.story-longclick').remove();
		 }
		 $(this).closest('.settings-container').find('.droppable:visible').slideUp();
		 if ($(this).closest('.settings-container').find('.droppable:visible').attr('story') != $(this).attr('story')) {
		 $(this).closest('.settings-container').find('.droppable[story="' + $(this).attr('story') + '"]').slideDown();
		 }
		 }
		 });*/
		$('.settings-container').on("singletap", '.story-section input', function(e) {
			e.stopPropagation();
		});
		$('#search').submit(function() {
			$('#search-results .settings-section').remove();
			$.get(TYPEF_HOST + "/app/search?q=" + encodeURIComponent($('.search-box').val()) + ((lat && lng) ? '&lat=' + encodeURIComponent(lat) + '&lng=' + encodeURIComponent(lng) : ''), function(data) {
				//console.debug(data)
				if (!empty(data)) {
					data = $.parseJSON(data);
					searchResults = new Collection();
					searchResults.setCollection(data);
					if (!searchResults.empty()) {
						q = searchResults.getAllItems();
						for (x in q) {
							$('#search-results .settings-container').append(
									'<div class="settings-section story-section" story="' + x + '"> <input type="checkbox" value="' + x + '"/>' + q[x].ctv + ', ' + q[x].state + '</div><div story= "' + x + '" class="settings-section droppable">' + q[x].story + '</div>'
									);
						}
					} else {
						$('#search-results .settings-container').append('<div class="settings-section">No Results.  Have a story to submit for ' + $('.search-box').val() + '? <a onclick="window.open(\'http://historigin.com/#add-record\', \'_system\');" style="text-decoration:underline;">Click here to add the story</a></div>');
					}
					$('#home').hide();
					$('.settings-menu-screen').hide();
					$('#search-results').show();
				}
			});
			return false;
		});
		$('.search-icon').tap(function() {
			$('#search').submit();
		});
		$('#local_storage').tap(function(e) {
			r = confirm("Clearing the local storage will clear your collections and settings.  Are you sure?");
			if (r) {
				localStorage.clear();
			}
		});
		$('.multi-select-drop-down').tap(function(){
			$(this).find('.multi-select-drop').show();
		});
		$('.multi-select-drop li').tap(function(e){
			e.stopPropagation();
			action = $(this).attr('action');
			if(action == 'select-all'){
				$(this).closest('.settings-menu-screen').find('input[type="checkbox"]').prop('checked', 'checked');
			} else {
				$(this).closest('.settings-menu-screen').find('input[type="checkbox"]').prop('checked', '');
			}
			$(this).closest('.multi-select-drop').hide();
		});
		$('.bulk-action-select').change(function(){
			action = $(this).val();
			//hconsole.log(action);
			type = $(this).closest('.settings-menu-screen').attr('id');
			
			$(this).closest('.settings-menu-screen').find('input[type="checkbox"]:checked').each(function(){
				story = $(this).val();
				if(action =="add-to-my-collection"){
					if(type == 'queue'){
						myCollection.addItem(story, queued.getItem(story));
					} else if (type == 'history'){
						myCollection.addItem(story, past.getItem(story));
					} else if (type == 'search-results'){
						console.debug(searchResults.getItem(story));
						myCollection.addItem(story, searchResults.getItem(story));
					}
				} else if (action =="delete"){
					if(type == 'queue'){
						queued.removeItem(story);
					} else if (type == 'history'){
						past.removeItem(story);
					} else if (type == 'my-collection'){
						myCollection.removeItem(story);
					}
					$(this).closest('.story-section').remove();
					force_refresh_call = true;
				} else if (action =="play"){
					if(type == 'search-results'){
						queued.addItem(story, searchResults.getItem(story));
					} else if (type == 'history'){
						queued.addItem(story, past.getItem(story));
					} else if (type == 'my-collection'){
						queued.addItem(story, myCollection.getItem(story));
					}
				}
			});
			$('.bulk-action-select option').removeAttr('selected');
		});
		
		$('#now-playing').tap(function(){
			if($('#now-playing').hasClass('toggled')){
				$('#now-playing').animate({height:'50px'}, 200);
				$('#now-playing').removeClass('toggled');
			} else {
				$('#now-playing').animate({height:'80%'}, 200);
				$('#now-playing').addClass('toggled');
			}
		});
		
		//PLAY STORY PLAYED FROM POP UP BOX
		$('#map').on('tapend', '.play-story', function(){
			geo.getStory($(this).attr('story'), function(storydata){
				storykey = storydata.base64id;
				if(!playing.empty()){
					for (var playingkey in playing.getAllItems())
						break;

					past.addItem(playingkey, playing.getItem(playingkey));
					qpast.addItem(playingkey, playing.getItem(playingkey));
					playing.removeItem(playingkey);
				}
				playing.addItem(storykey, storydata);
				//console.debug(playing.getItem(storykey));
				
				$('#now-playing').html('<div class="grip"></div>' + playing.getItem(storykey).ctv + ', ' + playing.getItem(storykey).state + '<div style="padding:5%; font-size:12pt; line-height:normal;">' + playing.getItem(storykey).story + '</div><div><a class="suppress-load" href="' + playing.getItem(storykey).source + '">Source</a></div>');
				//window.plugins.statusBarNotification.notify("Historigin", "Playing story for " + playing.getItem(storykey).ctv + ', ' + playing.getItem(storykey).state, Flag.FLAG_NO_CLEAR);
                         
                         speachstring = playing.getItem(storykey).ctv + ' ' + playing.getItem(storykey).state + '... ' +  playing.getItem(storykey).story;
                         
                         TTS.speak({text: speachstring,
                                locale: 'en-US',
                                rate: 1.60
                                }, function () {
                                   hconsole.log('Story: ' + playing.getItem(storykey).ctv + ' done. Add ' + playing.getItem(storykey).ctv + ' to past');
                                   past.addItem(storykey, playing.getItem(storykey));
                                   qpast.addItem(storykey, playing.getItem(storykey));
                                   playing.removeItem(storykey);
                                   $('#now-playing').html('<div class="grip"></div>Waiting for next story ...');
                                }, function (error) {
                                hconsole.log('Unable to play story: ' + error);
                                });
			});
		});
		//VIEW STORY VIEWED FROM POP UP BOX
		$('#map').on('tapend', '.view-story', function(){
			storyid = $(this).attr('story');
			geo.getStory(storyid, function(storydata){
				$('.overlay-container').html(
					'<div>' + storydata.ctv + ', '  + storydata.state + '</div>' +
					'<div style="margin-top:10px;">' + storydata.story + '</div>' +
					'<div><a class="suppress-load" href="' + storydata.source + '"><font color="FFFFFF">Source</font></a></div>'
				);
				$('.overlay').show();
			});
		});
		$('.close-overlay').tap(function(){
			$('.overlay').hide();
		});
		hconsole.log('Loading Utility Functions');
		function updatePosition(position) {
			if (position.coords.latitude == 'undefined' || position.coords.longitude == 'undefined') {
				hconsole.log('Position Coordinates returned as undefined, ignoring request for position update.');
			} else {
				lat = position.coords.latitude;
				lng = position.coords.longitude;
				//hconsole.log('Updating position to ' + lat + ' ' + lng);
				if (position.coords.heading != null && position.coords.heading != NaN) {
                  //hconsole.log('HEADING VALUE: ' + position.coords.heading);
                  //heading = position.coords.heading;
                    heading = 0;
				} else {
					heading = 0;
				}

				map.setHeadingPinPosition(lat, lng, heading);
                //hconsole.log('heading direction: ' + heading);
				if (map.locked) {
					map.setCenter(lat, lng);
				}
			}
		}
		function updateQueue(position) {
			if (position.coords.latitude == 'undefined' || position.coords.longitude == 'undefined') {
				hconsole.log('Position Coordinates returned as undefined, ignoring request for queue update.');
			} else {
				hconsole.log('Updating Queue');
				lat = position.coords.latitude;
				lng = position.coords.longitude;
				latd = lat - laststorylat;
				lngd = lng - laststorylng;
				//hconsole.log('Latitude Delta: ' + latd);
				//hconsole.log('Longitude Delta: ' + lngd);

				if ((Math.abs(latd) < 0.004 && Math.abs(lngd) < 0.004) && !force_refresh_call) {
					//hconsole.log('Change in distance below change threshhold. Deferring call to Historigin Server');
				} else {
					force_refresh_call = false;
					laststorylat = lat;
					laststorylng = lng;
					geo.getCollection(lat, lng, function(data) {
						if (!data.empty()) {
							//hconsole.log('Data return for: ' + lat + ' ' + lng);
							//hconsole.log(JSON.stringify(data));
							//queued.removeAllItems();
                            //hconsole.log("removing everything from queue");
							
							for (x in data.getAllItems()) {
								map.addMarker(x, data.getItem(x));
							}
							//remove duplicates
							diff = array_diff_key(data.getAllItems(), qpast.getAllItems());
							diff = array_diff_key(diff, playing.getAllItems());
							diff = array_diff_key(diff, queued.getAllItems());
							queued.merge(diff);
							//hconsole.log('Current queue:' + JSON.stringify(queued.getAllItems()));
						} else {
							hconsole.log('Nothing returned from server for: ' + lat + ' ' + lng);
						}
					});
				}
			}
		}

		function createWatch() {
			//watchPosition fires whenever the device's position has changed
			watchid = navigator.geolocation.watchPosition(function(position) {
				//hconsole.log('watchPosition callback successfully fired:');
				//hconsole.log(JSON.stringify(position));
				updatePosition(position);
				updateQueue(position);
			}, function(error) {
				hconsole.log('Unable to ascertain position: ' + error.message);
			}, {frequency: 3000, enableHighAccuracy: true});
			return watchid;
		}

		hconsole.log('Loading settings');
		settings = {};
		if (localStorage.getItem('settings')) {
			//looks like we've got some settings
			hconsole.log("loading local settings");
			settings = $.parseJSON(localStorage.getItem('settings'));
            settings['TTS_ENABLED'] = true;
		} else {
			//default settings
			settings['console'] = false;
			settings['tts_enabled'] = true;
			settings['radius'] = 5;
			settings['gps_enabled'] = true;
			settings['filter_incorporated_data'] = true;
			settings['filter_hmdb_data'] = false;
			settings['filter_museum_data'] = false;
			settings['filter_site_data'] = false;
			settings['filter_visitor_data'] = false;
		}
		//LOADING SETTNGS FROM PREVIOUS SESSION
		for (x in settings) {
			if (typeof settings[x] == 'boolean') {
				if (settings[x]) {
					$('.settings-container input[name="settings.' + x + '"]').prop('checked', 'checked');
					force_refresh_call = true;
					if(x == 'filter_hmdb_data'){
						geo.setFilter('15');
					}
					if(x == 'filter_incorporated_data'){
						geo.setFilter('1');
					}
					if(x == 'filter_museum_data'){
						geo.setFilter('16');
					}
					if(x == 'filter_site_data'){
						geo.setFilter('17');
					}
					if(x == 'filter_visitor_data'){
						geo.setFilter('18');
					}
				}
			} else {
				$('.settings-container select[name="settings.' + x + '"]').val(settings[x]);
				//
                //hconsole.log("do we ever get here");
			}
			if (x == 'console') {
				hconsole.enable(settings[x]);
				if (settings[x]) {
					hconsole.show();
				}
			}
			if (x == 'radius') {
				geo.setRadius(settings[x]);
			}
			if (x == 'tts_enabled') {
				TTS_ENABLED = settings[x];
			}
			if (x == 'gps_enabled') {
				if (settings[x]) {
					hconsole.log("Initializing getCurrentPosition");

					navigator.geolocation.getCurrentPosition(function(position) {
						hconsole.log('getCurrentPosition callback successfully fired:');
						//hconsole.log(JSON.stringify(position));
						updatePosition(position);
						updateQueue(position);
					}, function() {
						hconsole.log("Unable to ascertain initial position... deferring to watchPosition");
						//hconsole.log("Unable to ascertain initial position... Guess you're going to have to wait for watchPosition to trigger");
					});

					hconsole.log("Initializing watchPosition");
					geo.enable(true, createWatch);
				}
			}
		}
		$('.settings-container input, .settings-container select').change(function() {
			setting_val = $(this).val();

			setting = $(this).attr('name').replace('settings.', '');
			if ($(this).is(':checkbox')) {
				if ($(this).prop('checked')) {
					setting_val = true;
					if(setting == 'filter_hmdb_data'){
						geo.setFilter('15');
					}
					if(setting == 'filter_incorporated_data'){
						geo.setFilter('1');
					}
					if(setting == 'filter_museum_data'){
						geo.setFilter('16');
					}
					if(setting == 'filter_site_data'){
						geo.setFilter('17');
					}
					if(setting == 'filter_visitor_data'){
						geo.setFilter('18');
					}
					force_refresh_call = true;
				} else {
					//hconsole.log(setting_val);
					if(setting == 'filter_hmdb_data'){
						geo.removeFilter('15');
						map.clearMarkers();
					}
					if(setting == 'filter_incorporated_data'){
						geo.removeFilter('1');
						map.clearMarkers();
					}
					if(setting == 'filter_museum_data'){
						geo.removeFilter('16');
						map.clearMarkers();
					}
					if(setting == 'filter_site_data'){
						geo.removeFilter('17');
						map.clearMarkers();
					}
					if(setting == 'filter_visitor_data'){
						geo.removeFilter('18');
						map.clearMarkers();
					}
					setting_val = false;
				}
			}
			settings[setting] = setting_val;

			localStorage.setItem('settings', JSON.stringify(settings));
			if (setting == 'console') {
				if (setting_val) {
					hconsole.enable(true);
					hconsole.show();
				} else {
					hconsole.enable(true);
					hconsole.hide();
				}
			}
			if (setting == 'radius') {
				geo.setRadius(setting_val);
				force_refresh_call = true;
			}
			if (setting == 'tts_enabled') {
				TTS_ENABLED = setting_val;
			}
			if (setting == 'gps_enabled') {
				geo.enable(setting_val, createWatch);
			}
		});
		function explorerMode(){
			bounds = map.getBounds();
			//console.debug(bounds);
			lat1 = bounds.getNorthEast().lat();
			lng1 = bounds.getNorthEast().lng();
			lat2 = bounds.getSouthWest().lat();
			lng2 = bounds.getSouthWest().lng();
			latThresholdDelta = lat1 - lat2;
			lngThresholdDelta = lng1 - lng2;						
			centerlat = map.getCenter().lat();
			centerlng = map.getCenter().lng();
			
			//map.clearMarkers();
			//limiter = 0;	
			geo.getCollectionByScope(lat1, lng1, lat2, lng2, centerlat, centerlng, function(data){
				if (!data.empty()) {
					for (x in data.getAllItems()) {
						//if (limiter < 100) {
							map.addMarker(x, data.getItem(x));	
						//	limiter++;
						//}			
					}
				}
			});
		}

		$('.overlay-explorer-mode').tap(function(){
			if($(this).attr('mode') == 'disabled'){
				explorerMode();
				explorermodedraghandle = map.addDragEvent(explorerMode);
				explorermodezoomhandle = map.addZoomEvent(explorerMode)
				$(this).addClass('tapped');
				$(this).attr('mode', 'enabled');
				geo.enable(false);
				map.setCircleVisible(false);
			} else {
				map.removeListener(explorermodedraghandle);
				map.removeListener(explorermodezoomhandle);
				$(this).removeClass('tapped');
				$(this).attr('mode', 'disabled');
				map.clearMarkers();
				geo.enable(true, createWatch);
				map.setCircleVisible(true);
				map.setLock(true);
				map.setCenterToHeading();
				force_refresh_call = true;
			}
		});

		hconsole.log("Initializing playback setInterval");
		setInterval(function() {
			if (!queued.empty()) {
				if (playing.empty()) {
					hconsole.log('Playing Queue Empty, checking queue for next story.');
					q = queued.getAllItems();
					filterspeak = geo.getFilter();
                    hconsole.log('filterspeak: ' + filterspeak + 'length: ' + filterspeak.length);
					//console.debug(q);
					for (key in q)
						break;
					if (key) {
                        hconsole.log('Have Key: ' + queued.getItem(key).ctv);
						for (cnt = 0; cnt < filterspeak.length; cnt++) {
                            //hconsole.log('city: ' + queued.getItem(key).ctv);
                    hconsole.log('FILTER: ' + filterspeak[cnt] + ' QcatID: ' + queued.getItem(key).categoryid);
							if(queued.getItem(key).categoryid == filterspeak[cnt]) {
								hconsole.log('Selecting story for: ' + queued.getItem(key).ctv);
								playing.addItem(key, queued.getItem(key));
								$('#now-playing').html('<div class="grip"></div>' + playing.getItem(key).ctv + ', ' + playing.getItem(key).state + '<div style="padding:5%; font-size:12pt; line-height:normal;">' + playing.getItem(key).story + '</div><div><a class="suppress-load" href="' + playing.getItem(key).source + '">Source</a></div>');
								
								queued.removeItem(key);
								$('#queued .story-section[story="' + key + '"]').remove();
								//console.debug(playing.getAllItems());
							
                                if (TTS_ENABLED) {
                                    speachstring1 = playing.getItem(key).ctv + ' ' + playing.getItem(key).state + '... ' +  playing.getItem(key).story;
                    
                                        TTS.speak({text: speachstring1,
                                            locale: 'en-US',
                                            rate: 1.60
                                            }, function () {
                                                  hconsole.log('We should have spoken.');
                                            hconsole.log('Story: ' + playing.getItem(key).ctv + ' completed. Add ' + playing.getItem(key).ctv + ' to past');
                                                  past.addItem(key, playing.getItem(key));
                                                  qpast.addItem(key, playing.getItem(key));
                                                  playing.removeItem(key);
                                            $('#now-playing').html('<div class="grip"></div>Waiting for next story ...');
                                            }, function (error) {
                                                  hconsole.log('Unable to play story: ' +  JSON.stringify(error));
                                                  queued.addItem(key, playing.getItem(key));
                                                  qpast.removeItem(key);
                                                  past.removeItem(key);
                                                  playing.removeItem(key);
                                            });
								} else {
									hconsole.log('Story: ' + playing.getItem(key).ctv + ' over. ' + playing.getItem(key).ctv + ' to past');
									past.addItem(key, playing.getItem(key));
									qpast.addItem(key, playing.getItem(key));
									playing.removeItem(key);
									$('#now-playing').html('<div class="grip"></div>Waiting for next story ...');
								}
                            } else {
                                queued.removeItem(key);
                            }
						}
                    }
				}
			}
		}, 5000);
	}
};
