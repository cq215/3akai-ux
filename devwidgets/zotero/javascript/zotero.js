/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core", "sakai/sakai.api.i18n"], function($, sakai) {

    /**
     * @name sakai_global.zotero
     *
     * @class zotero
     *
     * @description
     * Zotero is a dashboard widget that display the content of a Zotero's library for a given account
     * 
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.zotero = function (tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        var DEFAULT_INPUT = '';

        // DOM jQuery Objects
        var $rootel = $("#" + tuid);  // unique container for each widget instance
        var $mainContainer = $("#zotero_main", $rootel);
        var $itemsContainer = $("#zotero_items", $rootel);
        var $collectionsContainer = $("#zotero_collections", $rootel);
        var $settingsContainer = $("#zotero_settings", $rootel);
        var $settingsForm = $("#zotero_settings_form", $rootel);
        var $cancelSettings = $("#zotero_cancel_settings", $rootel);
        var $saveSettings = $("#zotero_save_settings", $rootel);
        var $userID = $("#zotero_user_id", $rootel);
        var $userKey = $("#zotero_user_key", $rootel);
        var $userIdText = $("#zotero_id_text", $rootel);
        var $userKeyText = $("#zotero_key_text", $rootel);
        var $showMoreButton = $("#zotero_show_more", $rootel);
        var $showMoreArrow = $("#zotero_show_more_arrow", $rootel);
        var $showLessArrow = $("#zotero_show_less_arrow", $rootel);
        var $msgEmptyCollection = $("#zotero_msg_empty_collection", $rootel);
        var $msgNoCollection = $("#zotero_msg_no_collection", $rootel);
        var $msgErrorCollections = $("#zotero_msg_error_collections", $rootel);
        var $msgErrorItems = $("#zotero_msg_error_items", $rootel);
		var $selectedCollection;
		var $initURL = "http://localhost:8080/var/proxy/zotero";
		var firstLoad = true;

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Checks if the provided input argument is non-empty and returns the input (user's ID or key)
         * if not empty; if empty, returns the DEFAULT_INPUT
         *
         * @param {String} input The input entered by the user
         */
        var checkInput = function (input) {
            // check if is not an empty string
            return (input && $.trim(input)) ? $.trim(input) : DEFAULT_INPUT;
        };
        

		/**
         * Clears all the password fields
         */
        var clearInputFields = function(){
            $userID.val("");
            $userKey.val("");
        };
        
		/**
         * Gets the userID and the userKey from the server using an asynchronous request
         *
         * @param {Object} callback Function to call when the request returns. This
         * function will be sent a String with the preferred profile.
         */
        var getPreferredInput = function(callback) {
            // get the data associated with this widget
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    // fetching the data succeeded, send it to the callback function
                    callback(checkInput(data.userID), checkInput(data.userKey));
                } else {
                    // fetching the data failed, we use the DEFAULT_INPUT
                    $settingsContainer.show();
                	$settingsContainer.focus();
                	callback(DEFAULT_INPUT, DEFAULT_INPUT);
                }
            });
        };
        
        
        /**
         * Feeds the items' list sending a request to the Zotero server throught a proxy.
         * Displays the list after building an HTML part for the server's response. 
         *
         * @param {String} itemsURL The url for getting the items' list of the collections chosen by a user.
         * @param {String} userKey The user's key of the Zotero account.
         */
        var showItemsList = function(itemsURL, userKey) {
        	// reset the html in the itemsContainer's node
        	$itemsContainer.html("");
			$msgErrorItems.css({"display":"none"});
			$msgEmptyCollection.css({"display":"none"});
			
			// sending the request to the server
			$.ajax({
				type: "POST",
				url: itemsURL,
				dataType: "xml",
				success : function(mainData, status, data) {
					// fetching the data contained in the server's response
					var response = data.responseXML;
					var entries = $(response).find('entry');
					// testing if there are items in the selected collection
					if($(entries).length > 0) {	
						$itemsContainer.append("<ul>");
					 	// fetching the entry tags to display the information it contains
						entries.each(function(){
							var title = $(this).find('title').text();
							var content = $(this).find('content').find('div');
							var link;
							var item_key;
							// fetching the link which allows users finding the item on a Zotero's webpage
							$(this).find('link').each(function(){
								// only the tag 'link' with an attribute 'rel' at 'self' is fetched
								if($(this).attr('rel') == 'self'){
									item_key = $(this).attr('href');
									// building the href to allow user to display the item into the browser
									if(userKey == "") {
										link = item_key + "?format=bib";
									}
									else {
										link = item_key + "?key="+userKey+"&format=bib";
									}
									// fetching the item's ID
									item_key = item_key.split("/");
									item_key = item_key[item_key.length-1];
								}
							});
							
							// removing the default style of the details' table
							$(content).find('table').find('tr').each(function(){
								$(this).find('th').removeAttr('style');
							});
							
							// adding the current item fetched into the list
							var initLi = "<li id=zotero_" + item_key + " class=\"zotero_item_li\">";
							var arrowButton = "<div class=\"zotero_see_more_button\" >" + 
													"<button type=\"button\" id=\"zotero_show_more\" class=\"s3d-button s3d-link-button s3d-action\">" +
			        									"<div class=\"zotero_useless\" id=\"zotero_see_more\"><span id=\"zotero_show_more_arrow\"></span></div>" +
			        	 								"<div class=\"zotero_useless\" id=\"zotero_see_less\"><span id=\"zotero_show_less_arrow\" style=\"display: none;\"></span></div>" +
			       									"</button>"+
			       								"</div>";
			       			var itemTitle = "<div class=\"zotero_content_title\">"+
			       								"<a id=\"zotero_title_link\" class=\"recentchangedcontent_item_link s3d-widget-links s3d-bold\" href = \"#\">" + title + "</a>"
			       							"</div>";
													
							$("#zotero_items ul").append(initLi + arrowButton + itemTitle + "</li>");
							
							// adding the item's content	
							$("#zotero_"+ item_key).append(content);
						});
						
						// adding a class attribute for all items' content to apply css	
						$itemsContainer.find('div').each(function(){
							if($(this).attr('class') == undefined) {
								$(this).addClass("zotero_content_item");
							}	
						});
							
						// creating event handlers on each item
			       		$itemsContainer.find('li').each(function(){
							$(this).bind('click',function(event){
								itemsBinding(event);
								return false;
			       			});
			       		});
			       	}
			        else {
			        	// informing the user that there is no content into the selected collection
						$msgEmptyCollection.css({"display":"block"});
			        }
				},
				statusCode: { // displaying a message for each kind of error
					400: function() {
     					appendErrorMessage($itemsContainer, $msgErrorItems, sakai.api.i18n.getValueForKey("ERROR_REQUEST", "zotero"));
     				},
     				403: function() {
     					appendErrorMessage($itemsContainer, $msgErrorItems, sakai.api.i18n.getValueForKey("ERROR_FORBIDDEN", "zotero"));
     				},
    				404: function() {
    					appendErrorMessage($itemsContainer, $msgErrorItems, sakai.api.i18n.getValueForKey("ERROR_NOT_FOUND", "zotero"));
     				},
     				405: function() {
     					appendErrorMessage($itemsContainer, $msgErrorItems, sakai.api.i18n.getValueForKey("ERROR_METHOD_NOT_ALLOWED", "zotero"));
     				},
     				417: function() {
     					appendErrorMessage($itemsContainer, $msgErrorItems, sakai.api.i18n.getValueForKey("ERROR_EXPECTATION_FAILED", "zotero"));
     				},
     				500: function() {
     					appendErrorMessage($itemsContainer, $msgErrorItems, sakai.api.i18n.getValueForKey("ERROR_INTERNAL_ERROR", "zotero"));
     				},
     				503: function() {
     					appendErrorMessage($itemsContainer, $msgErrorItems, sakai.api.i18n.getValueForKey("ERROR_SERVICE_UNAVAILABLE", "zotero"));
     				}
     			}});
        };
        
        
        /**
         * Feeds the collection's list sending a request to the Zotero's server throught a proxy.
         * Displays the list after building an HTML for the server's response. 
         *
         * @param {String} userId The user's ID of the Zotero account.
         * @param {String} userKey The user's key of the Zotero account.
         */
        var showCollectionsList = function(userId, userKey) {
        	var urlCollection;
        	var urlItems;
        	
        	// testing if the user want to display a Zotero library protected by a key or not  
        	if(userKey==""){
        		urlCollection = $initURL + "/collections.json?user="+userId;
        		urlItems = $initURL + "/items.json?user="+userId;
        	}
        	else {
        		urlCollection = $initURL + "/key_collections.json?user="+userId+"&key="+userKey;
        		urlItems = $initURL + "/key_items.json?user="+userId+"&key="+userKey;
        	}
        	
        	// sending the request to the server
			$.ajax({
				type: "POST",
				url: urlCollection,
				dataType: "xml",
				success : function(mainData, status, data) {
					$collectionsContainer.html(""); 
					// fetching the data contained in the server's response
					var response = data.responseXML;
					var entries = $(response).find('entry');
					
					// creating an item in the list for displaying all the content of the library
					var label = sakai.api.i18n.getValueForKey("ALL_CONTENT_ITEM", "zotero");
					$collectionsContainer.append("<a class=\"lhnavigation_subnav_item_content\" href=#><li class=\"is-selected\" id="+urlItems+">"+label+"</li></a>");
        			$selectedCollection = $(".is-selected");
					
					// testing if there are items in the selected collection
					if($(entries).length > 0) {	
						$msgErrorCollections.css({"display":"none"});
						$msgNoCollection.css({"display":"none"});
						
						// fetching the entry tags to display the information it contains
						entries.each(function() {
							var title = $(this).find('title').text();
							
							// fetching the id of the current collection
							var collectionString = $(this).find('id').text().split("/");
							var collectionKey = collectionString[collectionString.length-1];
						
							// fetching the link which allows getting the content of the chosen collection
							// testing if the library is protected by a key or not  
							var link;
							if(userKey=="") { 
								link = $initURL + "/collectionContent?user="+userId+"&collection="+collectionKey;
							}
							else {
								link = $initURL + "/key_collectionContent?user="+userId+"&key="+userKey+"&collection="+collectionKey;
							}
							
							// adding the collection into the list
							$collectionsContainer.append("<a class=\"lhnavigation_subnav_item_content\" href=#><li id="+link+">"+title+"</li></a>");							
						});
						
						// creating event handlers on each collection of the list
						$collectionsContainer.bind('click', function(event){
							// ups to date the class attribute for the selected collection
							collectionBinding(event);
							// ups to date the itemsContainer
							showItemsList($(event.target).attr('id'), userKey);
							// disables the redirection to the link
							return false;
						});
					}
					
					// Displaying the whole library for the specified account 
					showItemsList(urlItems,userKey);
				},
				
				statusCode: {
					400: function() { 
     					appendErrorMessage($collectionsContainer, $msgErrorCollections, sakai.api.i18n.getValueForKey("ERROR_REQUEST", "zotero"));
     				},
     				403: function() {
     					appendErrorMessage($collectionsContainer, $msgErrorCollections, sakai.api.i18n.getValueForKey("ERROR_FORBIDDEN", "zotero"));
     				},
    				404: function() {
    					appendErrorMessage($collectionsContainer, $msgErrorCollections, sakai.api.i18n.getValueForKey("ERROR_NOT_FOUND", "zotero"));
     				},
     				405: function() {
     					appendErrorMessage($collectionsContainer, $msgErrorCollections, sakai.api.i18n.getValueForKey("ERROR_METHOD_NOT_ALLOWED", "zotero"));
     				},
     				417: function() {
     					appendErrorMessage($collectionsContainer, $msgErrorCollections, sakai.api.i18n.getValueForKey("ERROR_EXPECTATION_FAILED", "zotero"));
     				},
     				500: function() {
     					appendErrorMessage($collectionsContainer, $msgErrorCollections, sakai.api.i18n.getValueForKey("ERROR_INTERNAL_ERROR", "zotero"));
     				},
     				503: function() {
     					appendErrorMessage($collectionsContainer, $msgErrorCollections, sakai.api.i18n.getValueForKey("ERROR_SERVICE_UNAVAILABLE", "zotero"));
     				}
  				}
  			});
        };
        
        
        /**
         * Displays a message about the error which occurred.
         *
         * @param {Object} brotherNode The brother node where html will be reset.
         * @param {Object} node The node where the message will be appended.
         * @param {String} error The error which occured.
         */
        var appendErrorMessage = function(brotherNode, node, error) {
        	brotherNode.html("");
        	node.css({"display":"block"});
        	var result = $(node).find('center');
        	if(result.length > 1) {
        		$(result[result.length-1]).remove();
        	}
        	node.append("<center><p>"+ error +" </p></center>");
        };
        
        	
       	/**
         * Ups do date the class of the selected collection for applying a specific css. 
         *
         * @param {Object} ev The event handled.
         */
       	var collectionBinding = function(ev) {
       		if($selectedCollection != undefined) {
				// removing the class attribute of the previous selected collection
				$selectedCollection.removeAttr('class');
			}
			// adding a specific class attribute for the selected collection
			$selectedCollection = $(ev.target);
			$(ev.target).addClass('is-selected');
       	};
       	
       	
       	/**
         * Ups do date the css properties according to the situation after that 
         * a click event on an item's arrow has been caught. 
         *
         * @param {Object} ev The event caught.
         */      
        var itemsBinding = function(ev) {
        	var classOrigin = $(ev.target).attr('class');
        	var idOrigin = $(ev.target).attr('id');
        	var tagOrigin = $(ev.target).get(0).tagName;
        	var liNode;

        	if(classOrigin == "zotero_item_li"){
        		liNode = $(ev.target);
        	}
        	else {
        		if((classOrigin == "zotero_see_more_button") || (classOrigin == "zotero_content_title") || (classOrigin == "zotero_content_item")){
        			liNode = $(ev.target).parent();
        		}
	        	if((idOrigin == "zotero_show_more") || (idOrigin == "zotero_title_link") || (tagOrigin == "TABLE")){
	        		liNode = $($(ev.target).parent()).parent();
	        	}
	        	if((idOrigin == "zotero_see_more") || (idOrigin == "zotero_see_less") || (tagOrigin == "TR")){
	        		liNode = $($($(ev.target).parent()).parent()).parent();
	        	}
	        	if((idOrigin == "zotero_show_more_arrow") || (idOrigin == "zotero_show_less_arrow") || (tagOrigin == "TH") || (tagOrigin == "TD")){
	        		liNode = $($($($(ev.target).parent()).parent()).parent()).parent();
	        	}
	        }
	        
        	if($(liNode).find('#zotero_show_less_arrow').css('display') == 'none') {
        		$("#"+ $(liNode).attr('id') + " #zotero_show_more_arrow").hide();
        		$("#"+ $(liNode).attr('id') + " #zotero_show_less_arrow").show();
        		$("#"+ $(liNode).attr('id') + " .zotero_content_item").show();
        	}
        	else {
        		$("#"+ $(liNode).attr('id') + " #zotero_show_more_arrow").show();
        		$("#"+ $(liNode).attr('id') + " #zotero_show_less_arrow").hide();
        		$("#"+ $(liNode).attr('id') + " .zotero_content_item").hide();
        	} 
        };
        
       	
        /////////////////////////
        // Main View functions //
        /////////////////////////

        /**
         * Shows the Main view that contains the collection and their content for the
         * provided account.
         *
         * @param {String} userId The user's ID of the Zotero account.
         * @param {String} userKey The user's key of the Zotero account.
         */
        var showMainView = function(userId, userKey) {
          	// displays all the collections for the current account
          	if(userId != DEFAULT_INPUT){
          		showCollectionsList(userId, userKey);
          		$mainContainer.show();
          	}
        }

        /////////////////////////////
        // Settings View functions //
        /////////////////////////////

        /**
         * Sets the Settings view to the right settings
         *
         * @param {String} userId The user's ID entered by the user
         * @param {String} userKey The user's key entered by the user
         */
        var renderSettings = function(userId, userKey) {
            $userID.val(checkInput(userId));
            $userKey.val(checkInput(userKey));
        };

		/**
         * Initialise form validation
         */
        var initValidation = function(){
            var validateOpts = {
                submitHandler: changeSettings
            };

            // Initialize the validate plug-in
            sakai.api.Util.Forms.validate($settingsForm, validateOpts);
        };
        
        
        ////////////////////
        // Event Handlers //
        ////////////////////
		
        /** Binds Settings form */
        $saveSettings.on("click", function (ev) {
           	if ($settingsForm.valid()) {
                $settingsForm.submit();
            }
            return false;
        });

		var changeSettings = function () {
			var userId = $userID.val();
            var userKey = $userKey.val();

           // save the userID and the userKey
           	sakai.api.Widgets.saveWidgetData(tuid, {
	       		userID: userId,
	            userKey: userKey
	        },
	        function (success, data) {
	        	if (success) {
	            	// Settings finished, switch to Main view
	             	sakai.api.Widgets.Container.informFinish(tuid, "zotero");
	           	}
	       	}
	       	);
		};
		
        $cancelSettings.on('click', function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'zotero');
        });

		$userIdText.on("click", function(ev) {
			$userID.val("");
			$userID.focus();
		});
		
        $userKeyText.on("click", function(ev) {
        	$userKey.val("");
        	$userKey.focus();
        });
       
        
        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var doInit = function () {
        	initValidation();
            if (showSettings) {
                // set up Settings view
                // get the previous settings
                getPreferredInput(renderSettings);
                $settingsContainer.show();
            } 
            else {
            	getPreferredInput(showMainView);
            }
        };
        
        // run the initialization function when the widget object loads
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("zotero");
});