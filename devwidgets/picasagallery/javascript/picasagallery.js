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
require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.picasagallery
     *
     * @class picasagallery
     *
     * @description
     * Create a photo gallery into a Sakai document with your Picasa album's photos.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     * @param {Object} widgetData Save the data for the current tuid
     */
    sakai_global.picasagallery = function(tuid, showSettings, widgetData) {

        var rootel = '#' + tuid;
        var albumsList = [];
        var photosList = [];
        var selectedAlbum;
        var diaporama;
        var updownAnim;
        var marginMax = 0;
        var previousWidth = 0;
        var firstClick = true;
        
        //Class
        var buttonDisabled = 's3d-disabled';
        var picasaGalleryDisplayingItemLink = '.picasagallery_displaying_itemlink';
        var picasaGalleryDisplayingItemClass = '.picasagallery_displaying_item';
        
        //Id
        var picasaGallerySettings = '#picasagallery_settings';
        var picasaGalleryDisplaying = '#picasagallery_displaying';
        var picasaGallerySettingsCancelButton = '#picasagallery_settings_cancelbutton';
        var picasaGallerySettingsCreateButton = '#picasagallery_settings_createbutton';
        var picasaGalleryMainInformationsIdDiv = '#picasagallery_maininformations_iddiv';
        var picasaGalleryMainInformationsSearch = '#picasagallery_maininformations_search';
        var picasaGalleryMainInformationsName = '#picasagallery_maininformations_name';
        var picasaGalleryAlbumsTitle = '#picasagallery_albums_title';
        var picasaGallerySettingsMsgSelectAlbum = '#picasagallery_settings_msg_selectalbum';
        var picasaGalleryAlbumsTitleOption = 'picasagallery_albums_title_option_';
        var picasaGalleryAlbumsInformations = '#picasagallery_albums_informations';
        var picasaGalleryDisplayingList = '#picasagallery_displaying_list';
        var picasaGalleryDisplayingItem = 'picasagallery_displaying_item_';
        var picasaGalleryDisplayingDivImg = '#picasagallery_displaying_divimg';
        var picasaGalleryDisplayingPreviousButton = '#picasagallery_displaying_previousbutton';
        var picasaGalleryDisplayingPlayStopButton = '#picasagallery_displaying_playstopbutton';
        var picasaGalleryDisplayingNextButton = '#picasagallery_displaying_nextbutton';
        var picasaGalleryDisplayingImg = 'picasagallery_displaying_img_';
        var picasaGalleryDisplayingMsgNotFound = '#picasagallery_displaying_msg_notfound';
        var picasaGalleryDisplayingPlayDiv = '#picasagallery_displaying_playdiv';
        var picasaGalleryDisplayingStopDiv = '#picasagallery_displaying_stopdiv';
        var picasaGalleryDisplayingUpButton = '#picasagallery_displaying_upbutton';
        var picasaGalleryDisplayingDownButton = '#picasagallery_displaying_downbutton';
        
        //Template
        var picasaGallerySettingsFillSelectTemplate = 'picasagallery_settings_fillselect_template';
        var picasaGallerySettingsFillTableTemplate = 'picasagallery_settings_filltable_template';
        var picasaGallerySettingsDisplayErrorTemplate = 'picasagallery_settings_displayerror_template';
        var picasaGalleryDisplayingFillListTemplate = 'picasagallery_displaying_filllist_template';
        var picasaGalleryDisplayingFillSlideshowTemplate = 'picasagallery_displaying_fillslideshow_template';
        
        
        /**
         * Send a request by the proxy to get the albums list for the specified user ID. 
         * If the userId doesn't exist, an error message will be displayed.
         * If there is a response from the server, the albums list is displayed with some information about each one.
         * Only public albums will be included into the response.
         * @param {String} userId The user ID of a Picasa Web account.
         */
        var getAlbumsList = function(userId) {
            // reset the interface
            $($(picasaGalleryMainInformationsIdDiv, rootel).find('span')[0]).remove();
            $(picasaGalleryMainInformationsName, rootel).removeClass(' s3d-error');
            
            // add userID parameter to the url of the JSON proxy file
            var albumsURL = 'http://localhost:8080/var/proxy/picasagallery/albumsPicasa.json?userID=' + userId;
            
            // send the request to Picasa web server
            $.ajax({
                type : "GET",
                url : albumsURL,
                cache : false,
                dataType : "xml",
                headers : {
                    'GData-Version': 2  
                },
                success : function(mainData, status, data) {
                    var response = data.responseXML;
                    // fetch the entry tag corresponding to the albums owned by the userId
                    var entries = $(response).find('entry');
                    var firstTime = true;
                    // reset the albums list 
                    albumsList = [];
                    if ($(entries).length > 0) { 
                        entries.each(function(){
                            // allow to parsing the xml's tag with namespace regardless the web browser
                            var namespacePhoto = 'gphoto\\:';
                            var namespaceMedia = 'media\\:';
                            var idElement = $(this).find(namespacePhoto + 'id')[0];
                            
                            if (idElement === undefined) {
                                namespacePhoto = '';
                                namespaceMedia = '';
                                idElement = $(this).find(namespacePhoto + 'id')[0];
                            }
                            var idAlbumTab = $(idElement).text().split('/');
                            var locationElement = $(this).find(namespacePhoto + 'location')[0];
                            var numphotosElement = $(this).find(namespacePhoto + 'numphotos')[0];
                            var imgurlElement = $($(this).find(namespaceMedia + 'group')[0]).find(namespaceMedia + 'content')[0];
                            
                            // construct the JSON variable for the current album
                            var album = {
                                'idalbum' : idAlbumTab[idAlbumTab.length-1],
                                'iduser' : userId,
                                'title': $($(this).find('title')[0]).text(),
                                'summary': $($(this).find('summary')[0]).text(),
                                'location': $(locationElement).text(),
                                'numphotos': $(numphotosElement).text(),
                                'updated': $($(this).find('updated')[0]).text().split('T')[0],
                                'imgurl' : $(imgurlElement).attr('url')
                            }
                            
                            // add the current album into the albums list
                            albumsList.push(album);
                            
                            if (firstTime) {
                                // the first parsed album is the one which will be selected into the select list 
                                selectedAlbum = album;
                                firstTime = false;
                            }
                        });
                        // build the html option for the select list
                        fillAlbumsList();
                   }
                },
                statusCode: { 
                    404: function() {
                        // If the user ID is unknown by Picasa server, the user is prevented
                        $(picasaGalleryMainInformationsIdDiv, rootel).prepend(sakai.api.Util.TemplateRenderer(picasaGallerySettingsDisplayErrorTemplate, {}));
                        $(picasaGalleryMainInformationsName, rootel).addClass('s3d-error');
                        // reset the album list and the album's information
                        $(picasaGalleryAlbumsTitle, rootel).html('');
                        $(picasaGalleryAlbumsInformations, rootel).html('');
                        $(picasaGallerySettingsMsgSelectAlbum, rootel).show();
                        disableElements($(picasaGalleryMainInformationsSearch, rootel));
                        disableElements($(picasaGallerySettingsCreateButton, rootel));
                    }
                }
            });
        };
        
        
        /**
         * Send a request by the proxy to get the content of a given album owned by the specified user ID. 
         * If the album doesn't exist, an error message will be displayed.
         * If there is a response from the server, the album's content is displayed into a list and in a slideshow
         * @param {String} userId The user Id of a Picasa Web account
         * @param {String} albumId The album Id of the displayed album
         */
        var getPhotosList = function(userId, albumId) {
            // add the userID and albumID parameters to the url of the JSON proxy file
            var albumsURL = 'http://localhost:8080/var/proxy/picasagallery/photosPicasa.json?userID=' + userId + '&albumID=' + albumId;
            
            // send the request to Picasa web server
            $.ajax({
                type : "GET",
                url : albumsURL,
                cache : false,
                dataType : "xml",
                headers : {
                    'GData-Version' : 2
                },
                success : function(mainData, status, data) {
                    var response = data.responseXML;
                    // fetch the entry tag corresponding to the photos contained in the selected album
                    var entries = $(response).find('entry');
                    // reset the photos list
                    photosList = [];
                    if ($(entries).length > 0) {
                        entries.each(function() {
                            // allow to parsing the xml's tag with namespace regardless the web browser
                            var namespacePhoto = 'gphoto\\:';
                            var namespaceMedia = 'media\\:';
                            var idElement = $(this).find(namespacePhoto + 'id')[0];
                            if(idElement === undefined) {
                                namespacePhoto = '';
                                namespaceMedia = '';
                                idElement = $(this).find(namespacePhoto + 'id')[0];
                            }
                            var iconurlElement = $($(this).find(namespaceMedia + 'group')[0]).find(namespaceMedia + 'thumbnail')[1];
                            var imgurlElement = $($(this).find(namespaceMedia + 'group')[0]).find(namespaceMedia + 'content')[0];
                            
                            // construct the JSON variable for the current photo
                            var photo = {
                                'id' : $(idElement).text(),
                                'title' : $(this).find('title').text().split('.')[0],
                                'updated' : $(this).find('updated').text().split('T')[0],
                                'iconurl' : $(iconurlElement).attr('url'),
                                'imgurl' : $(imgurlElement).attr('url'),
                                'width' : $(imgurlElement).attr('width'),
                                'height' : $(imgurlElement).attr('height')
                            }
                            // add the current photo to the photos list
                            photosList.push(photo);
                        });
                        // build the html list with the parsed content
                        fillPhotosList();
                    }
                },
                statusCode : {
                    404 : function() {
                        // if the album is unknowed or not accessible by the widget, an error message is displayed
                        $(picasaGalleryDisplayingMsgNotFound, rootel).show();
                    }
                }
            });
        };
        
        
        /**
         * Build the html option tag to display the albums list.
         */
        var fillAlbumsList = function() {
            var templateData = {
                'options' : albumsList
            };
            $(picasaGalleryAlbumsTitle, rootel).html(sakai.api.Util.TemplateRenderer(picasaGallerySettingsFillSelectTemplate, templateData));
            // display the information for the album at the top of the list
            getAlbumInformationEvent();
        };
        
        
        /**
         * Build the html item to display all the photos contained into the selected album. 
         */
        var fillPhotosList = function() {
            var templateData = {
                'album' : selectedAlbum,
                'photos' : photosList
            };
            $(picasaGalleryDisplayingList, rootel).html(sakai.api.Util.TemplateRenderer(picasaGalleryDisplayingFillListTemplate, templateData));
            // add binding for the new created element  
            addMainViewBindingForDynamic();
            // the first photo of the list is displayed in the slideshow
            photoRender(0);
        };
        
  
        /**
         * Count the photos list visual length.
         */
        var setMarginMax = function() {
            $(picasaGalleryDisplayingList, rootel).find('li').each(function() {
                marginMax = marginMax + $($(this).find('img')[0]).height();
            });
        };
        
        
        /**
         * Display the photo at a precise index in the slideshow with visual effects.
         * @param {int} index The position of the photo into the photos list
         */
        var photoRender = function(index) {
            // hide the current displayed photo
            $(picasaGalleryDisplayingDivImg, rootel).slideUp(500).fadeOut(1000, function() {
                var templateData = {
                    'photo' : photosList[index],
                    'index' : index
                };
                // update the slideshow content
                $(picasaGalleryDisplayingDivImg, rootel).html(sakai.api.Util.TemplateRenderer(picasaGalleryDisplayingFillSlideshowTemplate, templateData));
                // css is updated in order to center the slideshow regardless the photo's size
                photoCssUpdate(index);
                // show the new photo
                $(picasaGalleryDisplayingDivImg, rootel).slideUp(1000).delay(300).fadeIn(1500);
            });
        };

        /**
         * Update the slideshow's css according the displayed photo.
         * It usefull to center the photo in the slideshow regardless its size.
         * @param {int} index The position of the photo into the photos list
         */
        var photoCssUpdate = function(index) {
             var photo = photosList[index];
             var width =  photo.width;
             var height =  photo.height;
             var maxWidth = 780;
             var maxHeight = 342;
             // if the photo's width overpass the max width allowed, its width and height are proportionaly modified
             if(width > maxWidth) {
                 height = height * (maxWidth/Width);
                 width = maxWidth;
                 $(picasaGalleryDisplayingDivImg + ' img', rootel).css('width', width + 'px');
             }
             // if the photo's height overpass the max height allowed, its width and height are proportionaly modified
             if(height > maxHeight) {
                 width = width * (maxHeight/height);
                 height = maxHeight;
                 $(picasaGalleryDisplayingDivImg + ' img', rootel).css('height', height + 'px');
             }
             // the slideshow's size is up to date according to the new photo's size
             $(picasaGalleryDisplayingDivImg, rootel).css('width', width-2 + 'px');
             $(picasaGalleryDisplayingDivImg, rootel).css('height', height-2 + 'px');
             $(picasaGalleryDisplayingDivImg, rootel).css('line-height', height-2 + 'px');
        }
        
        
        /**
         * Enable an elements. It can take a single or multivalue jQuery obj.
         * @param {Object} jQueryObj The object to enable.
         */
        var enableElements = function(jQueryObj) {
            jQueryObj.removeAttr('disabled');
            jQueryObj.removeClass(buttonDisabled);
        };
        
        
        /**
         * Disable an elements. It can take a single or multivalue jQuery obj.
         * @param {Object} jQueryObj The object to disable.
         */
        var disableElements = function(jQueryObj) {
            jQueryObj.attr('disabled', 'disabled');
            jQueryObj.addClass(buttonDisabled);
        };
        
        
        /**
         * Check if the userId is valid before to be sent in the request.
         * @param {String} input The input to test. 
         */
        var checkIfInputValid = function(input) {
            // check if the user didn't just fill in some spaces
            return (input.replace(/ /g, '') !== '');
        };
        
        
        /**
         * Inform the container that the settings modifications are finished. 
         */
        var finish = function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'picasagallery');
        };
        
        
        /**
         * @return {Object} The album that will be displayed in the gallery.
         */
        var saveToJSON =  function() {
            return selectedAlbum;
        };
        
        
        /**
         * The widget data are loaded. If settings are dispayed, all forms and list are filled ; else, the gallery is displaying. 
         * @param {Boolean} settings True if the settings view is displaying.
         */
        var getFromJCR = function(settings) {
            if (widgetData && widgetData.picasagallery) {
                if (settings) {
                    renderSettings(true, widgetData.picasagallery);
                } else {
                    renderGallery(true, widgetData.picasagallery);
                }
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                    if (settings) {
                        renderSettings(success, data);
                    } else {
                        renderGallery(success, data);
                    }
                });
            }
        };
        
        
        /**
         * Display the gallery according to the saved data
         * @param {Boolean} success True if the data has been correctly loaded
         * @param {Object} data The saved widget data
         */
        var renderGallery = function(success, data) {
            if (success) {
                selectedAlbum = data;
                getPhotosList(selectedAlbum.iduser, selectedAlbum.idalbum);
            }
        };
        
        
        /**
         * Display the settings according to the saved data
         * @param {Boolean} success True if the data has been correctly loaded
         * @param {Object} data The saved widget data
         */
        var renderSettings = function(success, data) {
            if (success) {
                selectedAlbum = data;
                $(picasaGalleryMainInformationsName, rootel).val(selectedAlbum.iduser);
                getAlbumsList(selectedAlbum.iduser);
            }
        };
        
        
        /**
         * Add binding for the dynamic created elements in the displaying view
         */
        var addMainViewBindingForDynamic = function() {
            $(picasaGalleryDisplayingItemClass, rootel).hover(hoverInEvent, hoverOutEvent);
            $(picasaGalleryDisplayingItemLink, rootel).on('click', displayPhotoEvent);
            
        };
        
        
        /**
         * Add binding for the static created elements in the displaying view
         */
        var addMainViewBindingForStatic = function() {
            $(picasaGalleryDisplayingUpButton, rootel).on('mousedown', goUpEvent);
            $(picasaGalleryDisplayingUpButton, rootel).on('mouseup', stopGoUpEvent);
            $(picasaGalleryDisplayingDownButton, rootel).on('mousedown', goDownEvent);
            $(picasaGalleryDisplayingDownButton, rootel).on('mouseup',stopGoDownEvent);
            $(picasaGalleryDisplayingPreviousButton, rootel).on('click', previousPhotoEvent);
            $(picasaGalleryDisplayingPlayStopButton, rootel).on('click', playStopEvent);
            $(picasaGalleryDisplayingNextButton, rootel).on('click', nextPhotoEvent);
        };
        
        
        /**
         * Add binding for the static elements into the settings view.
         */
        var addSettingsBinding = function() {
            $(picasaGalleryMainInformationsName, rootel).on('keyup', checkIdInput);
            $(picasaGalleryMainInformationsSearch, rootel).on('click', searchButtonEvent);
            $(picasaGalleryAlbumsTitle, rootel).on('change', getAlbumInformationEvent);
            $(picasaGallerySettingsCancelButton, rootel).on('click', cancelButtonEvent);
            $(picasaGallerySettingsCreateButton, rootel).on('click', createButtonEvent);
        };
        
        
        /**
         * Check if the userID input is valid before to enable the search button.
         */
        var checkIdInput = function() {
            if(checkIfInputValid($(picasaGalleryMainInformationsName, rootel).val())) {
                enableElements($(picasaGalleryMainInformationsSearch, rootel));
            } else {
                disableElements($(picasaGalleryMainInformationsSearch, rootel));
            }
        };
        
        
        /**
         * After a click on the search button, the request to get the albums list is sent.
         */
        var searchButtonEvent = function() {
            var id = $(picasaGalleryMainInformationsName, rootel).val();
            if (checkIfInputValid(id)) {
                getAlbumsList(id);
            }    
        };
        
        
        /**
         * Display the information of the selected album in the list.
         */
        var getAlbumInformationEvent = function() {
            $(picasaGalleryAlbumsInformations, rootel).show();
            $(picasaGallerySettingsMsgSelectAlbum, rootel).hide();
            var nodeValue = $(picasaGalleryAlbumsTitle, rootel).attr('value');
            var index = nodeValue.split(picasaGalleryAlbumsTitleOption)[1];
            selectedAlbum = albumsList[index];
            var templateData = {
                'album' : selectedAlbum
            };
            
            $(picasaGalleryAlbumsInformations, rootel).html(sakai.api.Util.TemplateRenderer(picasaGallerySettingsFillTableTemplate, templateData));
            enableElements($(picasaGallerySettingsCreateButton, rootel));
        };
        
        
        /**
         * After a click on a photo item, it is displayed in the slideshow.
         */
        var displayPhotoEvent = function() {
            var parentId = $(this).parent()[0].id;
            var index = parentId.split(picasaGalleryDisplayingItem)[1];
            photoRender(index);
        };
        
        
        /**
         * After a click, the previous photo of the list is displayed in the slideshow.
         */
        var previousPhotoEvent = function() {
            var photoId = $(picasaGalleryDisplayingDivImg, rootel).find('img')[0].id;
            var indexStr = photoId.split(picasaGalleryDisplayingImg)[1];
            var index = parseInt(indexStr);
            if (index > 0) {
                photoRender(index-1);
            }
            else {
                // if it's the beginning of the list, the last photo is displayed
                photoRender(photosList.length-1);
            }
        };
        
        
        /**
         * According to the enable button, the automatic display is launched or stoped.
         */
        var playStopEvent = function() {
            if ($(picasaGalleryDisplayingPlayStopButton, rootel).find(picasaGalleryDisplayingPlayDiv).css("display")==="none") {
                $(picasaGalleryDisplayingStopDiv, rootel).hide();
                $(picasaGalleryDisplayingPlayDiv, rootel).show();
                clearInterval(diaporama);
                diaporama = undefined;
            } else {
                $(picasaGalleryDisplayingPlayDiv, rootel).hide();
                $(picasaGalleryDisplayingStopDiv, rootel).show();
                diaporama = setInterval(function(){nextPhotoEvent()}, 5000);
            }
            
        };
        
        
        /**
         * After a click, the next photo of the list is displayed in the slideshow.
         */
        var nextPhotoEvent = function() {
            var photoId = $(picasaGalleryDisplayingDivImg, rootel).find('img')[0].id;
            var indexStr = photoId.split(picasaGalleryDisplayingImg)[1];
            var index = parseInt(indexStr);
            if (index < photosList.length-1) {
                photoRender(index+1);
            } else {
                // if it's the end of the list, the first photo of the list is displayed
                photoRender(0);
            }
        };
        
        
        /**
         * The automatic scroll up is launched.
         */
        var goUpEvent = function() {
            if(updownAnim !== undefined) {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
            updownAnim = setInterval(function(){goUp()}, 1); 
        };
        
        
        /**
         * The margin-top property of the first element in the list is decreased to scroll the list.
         */
        var goUp = function() {
            var previousMargin = parseInt($('#' + picasaGalleryDisplayingItem + '0', rootel).css('margin-top').split('px')[0]);
            if (previousMargin < 0) {
                $('#' + picasaGalleryDisplayingItem + '0', rootel).css('margin-top', previousMargin + 7 + 'px');
            }
            else{
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
        };
        
        
        /**
         * The automatic scroll up is stoped.
         */
        var stopGoUpEvent = function() {
            if (updownAnim !== undefined) {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
        };
        
        
        /**
         * The automatic scroll down is launched.
         */
        var goDownEvent = function() {
            if (firstClick) {
                firstClick = false;
                setMarginMax();
            }
            if(updownAnim !== undefined) {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
            updownAnim = setInterval(function(){goDown()}, 1); 
        };
        
        
        /**
         * The margin-top property of the first element in the list is increased to scroll the list.
         */
        var goDown = function() {
            var previousMargin = parseInt($('#' + picasaGalleryDisplayingItem + '0', rootel).css('margin-top').split('px')[0]);
            if ((previousMargin * (-1)) < marginMax) {
                 $('#' + picasaGalleryDisplayingItem + '0', rootel).css('margin-top', previousMargin - 7 + 'px'); 
            }
            else {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
        };
        
        
        /**
         * The automatic scroll down is stoped.
         */
        var stopGoDownEvent = function() {
            if (updownAnim !== undefined) {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
        };
        
        
        /**
         * When the mouse pass hover an item, a kind of zoom is done on the photo.
         */
        var hoverInEvent = function() {
            var currentLink = $(this).find('a');
            $(this).css('width', '86px');
            $(this).css('height', currentLink.height() + 'px');
            previousWidth = currentLink.width();
            currentLink.css('height', currentLink.height());
            currentLink.css('width', previousWidth + previousWidth*0.12 + 'px');
        }; 
        
        
        /**
         * When hover event finish, the item recover its normal size.
         */
        var hoverOutEvent = function() {
            $(this).css('width', '72px');
            $(this).find('a').css('width', previousWidth + 'px');
        };
         
        /**
         * After a click, the settings view is closed and the gallery is not added into the document.
         */
        var cancelButtonEvent = function() {
            sakai.api.Widgets.Container.informCancel(tuid, 'picasagallery');
        };
        
        /**
         * After a click, the widget data are saved and the gallery is added into the document.
         */
        var createButtonEvent = function() {
            var json = saveToJSON();
            sakai.api.Widgets.saveWidgetData(tuid, json, finish);
        };
        
        
        
        var doInit = function(show) {
            if (show) {
                // add bindings for the DOM elementsin the settings view
                addSettingsBinding();
                // if data have already been saved, they are loaded and diplayed
                getFromJCR(true);
                // settings view is displayed
                $(picasaGallerySettings, rootel).show();
                $(picasaGalleryDisplaying, rootel).hide();
            } else {
                // the gallery is displayed
                $(picasaGallerySettings, rootel).hide();
                $(picasaGalleryDisplaying, rootel).show();
                // add bindings for the DOM elements in the gallery view 
                addMainViewBindingForStatic();
                // the gallery is built with the saved data
                getFromJCR(false);
            }
        };
        
        // run the initialization function when the widget object loads
        doInit(showSettings);
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('picasagallery');
});
