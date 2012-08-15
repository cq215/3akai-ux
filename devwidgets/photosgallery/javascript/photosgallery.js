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
     * @name sakai_global.photosgallery
     *
     * @class photosgallery
     *
     * @description
     * Create a photo gallery into a Sakai document.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     * @param {Object} widgetData Save the data for the current tuid
     */
    sakai_global.photosgallery = function(tuid, showSettings, widgetData) {

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
        var photosGalleryDisplayingItemLink = '.photosgallery_displaying_itemlink';
        var photosGalleryDisplayingItemClass = '.photosgallery_displaying_item';
        
        //Id
        var photosGallerySettings = '#photosgallery_settings';
        var photosGalleryDisplaying = '#photosgallery_displaying';
        var photosGallerySettingsCancelButton = '#photosgallery_settings_cancelbutton';
        var photosGallerySettingsCreateButton = '#photosgallery_settings_createbutton';
        var photosGalleryMainInformationsIdDiv = '#photosgallery_maininformations_iddiv';
        var photosGalleryMainInformationsSearch = '#photosgallery_maininformations_search';
        var photosGalleryMainInformationsName = '#photosgallery_maininformations_name';
        var photosGalleryAlbumsTitle = '#photosgallery_albums_title';
        var photosGallerySettingsMsgSelectAlbum = '#photosgallery_settings_msg_selectalbum';
        var photosGalleryAlbumsTitleOption = 'photosgallery_albums_title_option_';
        var photosGalleryAlbumsInformations = '#photosgallery_albums_informations';
        var photosGalleryDisplayingList = '#photosgallery_displaying_list';
        var photosGalleryDisplayingItem = 'photosgallery_displaying_item_';
        var photosGalleryDisplayingDivImg = '#photosgallery_displaying_divimg';
        var photosGalleryDisplayingPreviousButton = '#photosgallery_displaying_previousbutton';
        var photosGalleryDisplayingPlayStopButton = '#photosgallery_displaying_playstopbutton';
        var photosGalleryDisplayingNextButton = '#photosgallery_displaying_nextbutton';
        var photosGalleryDisplayingImg = 'photosgallery_displaying_img_';
        var photosGalleryDisplayingMsgNotFound = '#photosgallery_displaying_msg_notfound';
        var photosGalleryDisplayingPlayDiv = '#photosgallery_displaying_playdiv';
        var photosGalleryDisplayingStopDiv = '#photosgallery_displaying_stopdiv';
        var photosGalleryDisplayingUpButton = '#photosgallery_displaying_upbutton';
        var photosGalleryDisplayingDownButton = '#photosgallery_displaying_downbutton';
        
        //Template
        var photosGallerySettingsFillSelectTemplate = 'photosgallery_settings_fillselect_template';
        var photosGallerySettingsFillTableTemplate = 'photosgallery_settings_filltable_template';
        var photosGallerySettingsDisplayErrorTemplate = 'photosgallery_settings_displayerror_template';
        var photosGalleryDisplayingFillListTemplate = 'photosgallery_displaying_filllist_template';
        var photosGalleryDisplayingFillSlideshowTemplate = 'photosgallery_displaying_fillslideshow_template';
        
        
        /**
         * Send a request by the proxy to get the albums list for the specified user ID. 
         * If the userId doesn't exist, an error message will be displayed.
         * If there is a response from the server, the albums list is displayed with some information about each one.
         * Only public albums will be included into the response.
         * @param {String} userId The user ID of a Picasa Web account.
         */
        var getAlbumsList = function(userId) {
            $($(photosGalleryMainInformationsIdDiv, rootel).find('span')[0]).remove();
            $(photosGalleryMainInformationsName, rootel).removeClass(' s3d-error');
            var albumsURL = 'http://localhost:8080/var/proxy/photosgallery/albumsPicasa.json?userID=' + userId;
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
                    var entries = $(response).find('entry');
                    var firstTime = true; 
                    albumsList = [];
                    if ($(entries).length > 0) { 
                        entries.each(function(){
                            var namespacePhoto = 'gphoto\\:';
                            var namespaceMedia = 'media\\:';
                            var idElement = $(this).find( namespacePhoto + 'id' )[0];
                            
                            if (idElement === undefined) {
                                namespacePhoto = '';
                                namespaceMedia = '';
                                idElement = $(this).find( namespacePhoto + 'id' )[0];
                            }
                            var idAlbumTab = $(idElement).text().split('/');
                            var locationElement = $(this).find( namespacePhoto + 'location' )[0];
                            var numphotosElement = $(this).find( namespacePhoto + 'numphotos' )[0];
                            var imgurlElement = $($(this).find(namespaceMedia + 'group')[0]).find(namespaceMedia + 'content')[0];
                            
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
                            
                            albumsList.push(album);
                            if (firstTime) {
                                selectedAlbum = album;
                                firstTime = false;
                            }
                        });
                        fillAlbumsList();
                   }
                },
                statusCode: { 
                    404: function() {
                        //If the user ID is not found by Picasa server, the user is prevented
                        $(photosGalleryMainInformationsIdDiv, rootel).prepend(sakai.api.Util.TemplateRenderer(photosGallerySettingsDisplayErrorTemplate, {}));
                        $(photosGalleryMainInformationsName, rootel).addClass('s3d-error');
                        $(photosGalleryAlbumsTitle, rootel).html('');
                        $(photosGalleryAlbumsInformations, rootel).hide();
                        $(photosGallerySettingsMsgSelectAlbum, rootel).show();
                        disableElements($(photosGalleryMainInformationsSearch, rootel));
                        disableElements($(photosGallerySettingsCreateButton, rootel));
                    }
                }
            });
        };
        
        
        /**
         * Send a request by the proxy to get the content of a given album owned by the specified user ID. 
         * If the album doesn't exist, an error message will be displayed.
         * If there is a response from the server, the album's content is displayed into a list
         * @param {String} userId The user Id of a Picasa Web account
         * @param {String} albumId The album Id of the displayed album
         */
        var getPhotosList = function(userId, albumId) {
            var albumsURL = 'http://localhost:8080/var/proxy/photosgallery/photosPicasa.json?userID=' + userId + '&albumID=' + albumId;
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
                    var entries = $(response).find('entry');
                    photosList = [];
                    if($(entries).length > 0) {
                        entries.each(function() {
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
                            var photo = {
                                'id' : $(idElement).text(),
                                'title' : $(this).find('title').text().split('.')[0],
                                'updated' : $(this).find('updated').text().split('T')[0],
                                'iconurl' : $(iconurlElement).attr('url'),
                                'imgurl' : $(imgurlElement).attr('url'),
                                'width' : $(imgurlElement).attr('width'),
                                'height' : $(imgurlElement).attr('height')
                            }
                            photosList.push(photo);
                        });
                        fillPhotosList();
                    }
                },
                statusCode : {
                    404 : function() {
                        $(photosGalleryDisplayingMsgNotFound, rootel).show();
                    }
                }
            });
        };
        
        
        var fillAlbumsList = function() {
            var templateData = {
                'options' : albumsList
            };
            $(photosGalleryAlbumsTitle, rootel).html(sakai.api.Util.TemplateRenderer(photosGallerySettingsFillSelectTemplate, templateData));
            getAlbumInformationEvent();
        };
        
        
        var fillPhotosList = function() {
            var templateData = {
                'album' : selectedAlbum,
                'photos' : photosList
            };
            $(photosGalleryDisplayingList, rootel).html(sakai.api.Util.TemplateRenderer(photosGalleryDisplayingFillListTemplate, templateData));
            addMainViewBinding();
            photoRender(0);
        };
        
  
        var setMarginMax = function() {
            $(photosGalleryDisplayingList, rootel).find('li').each(function() {
                marginMax = marginMax + $($(this).find('img')[0]).height();
            });
        };
        
        var photoRender = function(index) {
            $(photosGalleryDisplayingDivImg, rootel).slideUp(500).fadeOut(1000, function() {
                var templateData = {
                    'photo' : photosList[index],
                    'index' : index
                };
                $(photosGalleryDisplayingDivImg, rootel).html(sakai.api.Util.TemplateRenderer(photosGalleryDisplayingFillSlideshowTemplate, templateData));
                photoCssUpdate(index);
                $(photosGalleryDisplayingDivImg, rootel).slideUp(1000).delay(300).fadeIn(1500);
            });
        };

        var photoCssUpdate = function(index) {
             var photo = photosList[index];
             var width =  photo.width;
             var height =  photo.height;
             var maxWidth = 780;
             var maxHeight = 342;
             if(width > maxWidth) {
                 height = height * (maxWidth/Width);
                 width = maxWidth;
                 $(photosGalleryDisplayingDivImg + ' img', rootel).css('width', width + 'px');
             }
             if(height > maxHeight) {
                 width = width * (maxHeight/height);
                 height = maxHeight;
                 $(photosGalleryDisplayingDivImg + ' img', rootel).css('height', height + 'px');
             }
             $(photosGalleryDisplayingDivImg, rootel).css('width', width-2 + 'px');
             $(photosGalleryDisplayingDivImg, rootel).css('height', height-2 + 'px');
             $(photosGalleryDisplayingDivImg, rootel).css('line-height', height-2 + 'px');
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
         * Check if the question is valid before to be saved.
         * A question is valid if at least the question input and two answer inputs have been filled by the user and are valid.
         * @param {Boolean} isModified To know in which container we have to check. If true, in the questiondetails one. 
         * @return {Boolean} True if the question can be saved.
         */
        var checkIfInputValid = function(input) {
            // check if the user didn't just fill in some spaces
            return (input.replace(/ /g, '') !== '');
        };
        
        
        /**
         * Inform the container that the settings modifications are finished. 
         */
        var finish = function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'photosgallery');
        };
        
        
        var saveToJSON =  function() {
            return selectedAlbum;
        };
        
        
        /**
         * The widget data are loaded. If settings are dispayed, all forms and list are filled ; else, the quiz is displaying. 
         * @param {Boolean} settings True if the settings view is displaying.
         */
        var getFromJCR = function(settings) {
            if (widgetData && widgetData.photosgallery) {
                if (settings) {
                    renderSettings(true, widgetData.photosgallery);
                } else {
                    renderGallery(true, widgetData.photosgallery);
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
        
        var renderGallery = function(success, data) {
            if (success) {
                selectedAlbum = data;
                getPhotosList(selectedAlbum.iduser, selectedAlbum.idalbum);
            }
        };
        
        var renderSettings = function(success, data) {
            if (success) {
                selectedAlbum = data;
                $(photosGalleryMainInformationsName, rootel).val(selectedAlbum.iduser);
                getAlbumsList(selectedAlbum.iduser);
            }
        };
        
        
        var addMainViewBinding = function() {
            $(photosGalleryDisplayingItemClass, rootel).hover(hoverInEvent, hoverOutEvent);
            $(photosGalleryDisplayingItemLink, rootel).on('click', displayPhotoEvent);
            $(photosGalleryDisplayingUpButton, rootel).on('mousedown', goUpEvent);
            $(photosGalleryDisplayingUpButton, rootel).on('mouseup', stopGoUpEvent);
            $(photosGalleryDisplayingDownButton, rootel).on('mousedown', goDownEvent);
            $(photosGalleryDisplayingDownButton, rootel).on('mouseup',stopGoDownEvent);
            $(photosGalleryDisplayingPreviousButton, rootel).on('click', previousPhotoEvent);
            $(photosGalleryDisplayingPlayStopButton, rootel).on('click', playStopEvent);
            $(photosGalleryDisplayingNextButton, rootel).on('click', nextPhotoEvent);
        };
        
        
        /**
         * Add binding for the static elements into the settings view.
         */
        var addGeneralBinding = function() {
            $(photosGalleryMainInformationsName, rootel).on('keyup', checkIdInput);
            $(photosGalleryMainInformationsSearch, rootel).on('click', searchButtonEvent);
            $(photosGalleryAlbumsTitle, rootel).on('change', getAlbumInformationEvent);
            $(photosGallerySettingsCancelButton, rootel).on('click', cancelButtonEvent);
            $(photosGallerySettingsCreateButton, rootel).on('click', createButtonEvent);
        };
        
        var checkIdInput = function() {
            if(checkIfInputValid($(photosGalleryMainInformationsName, rootel).val())) {
                enableElements($(photosGalleryMainInformationsSearch, rootel));
            } else {
                disableElements($(photosGalleryMainInformationsSearch, rootel));
            }
        };
        
        var searchButtonEvent = function() {
            var id = $(photosGalleryMainInformationsName, rootel).val();
            if (checkIfInputValid(id)) {
                getAlbumsList(id);
            }    
        };
        
        var getAlbumInformationEvent = function() {
            $(photosGalleryAlbumsInformations, rootel).show();
            $(photosGallerySettingsMsgSelectAlbum, rootel).hide();
            var nodeValue = $(photosGalleryAlbumsTitle, rootel).attr('value');
            var index = nodeValue.split(photosGalleryAlbumsTitleOption)[1];
            selectedAlbum = albumsList[index];
            var templateData = {
                'album' : selectedAlbum
            };
            
            $(photosGalleryAlbumsInformations, rootel).html(sakai.api.Util.TemplateRenderer(photosGallerySettingsFillTableTemplate, templateData));
            enableElements($(photosGallerySettingsCreateButton, rootel));
        };
        
        var displayPhotoEvent = function() {
            var parentId = $(this).parent()[0].id;
            var index = parentId.split(photosGalleryDisplayingItem)[1];
            photoRender(index);
        };
        
        var previousPhotoEvent = function() {
            var photoId = $(photosGalleryDisplayingDivImg, rootel).find('img')[0].id;
            var indexStr = photoId.split(photosGalleryDisplayingImg)[1];
            var index = parseInt(indexStr);
            if (index > 0) {
                photoRender(index-1);
            }
            else {
                photoRender(photosList.length-1);
            }
        };
        
        var playStopEvent = function() {
            if ($(photosGalleryDisplayingPlayStopButton, rootel).find(photosGalleryDisplayingPlayDiv).css("display")==="none") {
                $(photosGalleryDisplayingStopDiv, rootel).hide();
                $(photosGalleryDisplayingPlayDiv, rootel).show();
                clearInterval(diaporama);
                diaporama = undefined;
            } else {
                $(photosGalleryDisplayingPlayDiv, rootel).hide();
                $(photosGalleryDisplayingStopDiv, rootel).show();
                diaporama = setInterval(function(){nextPhotoEvent()}, 5000);
            }
            
        };
        
        var nextPhotoEvent = function() {
            var photoId = $(photosGalleryDisplayingDivImg, rootel).find('img')[0].id;
            var indexStr = photoId.split(photosGalleryDisplayingImg)[1];
            var index = parseInt(indexStr);
            if (index < photosList.length-1) {
                photoRender(index+1);
            } else {
                photoRender(0);
            }
        };
        
        var goUpEvent = function() {
            if(updownAnim !== undefined) {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
            updownAnim = setInterval(function(){goUp()}, 1); 
        };
        
        var goUp = function() {
            var previousMargin = parseInt($('#' + photosGalleryDisplayingItem + '0', rootel).css('margin-top').split('px')[0]);
            if (previousMargin < 0) {
                $('#' + photosGalleryDisplayingItem + '0', rootel).css('margin-top', previousMargin + 7 + 'px');
            }
            else{
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
        };
        
        var stopGoUpEvent = function() {
            if (updownAnim !== undefined) {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
        };
        
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
        
        var goDown = function() {
            var previousMargin = parseInt($('#' + photosGalleryDisplayingItem + '0', rootel).css('margin-top').split('px')[0]);
            if ((previousMargin * (-1)) < marginMax) {
                 $('#' + photosGalleryDisplayingItem + '0', rootel).css('margin-top', previousMargin - 7 + 'px'); 
            }
            else {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
        };
        
        var stopGoDownEvent = function() {
            if (updownAnim !== undefined) {
                clearInterval(updownAnim);
                updownAnim = undefined;
            }
        };
        
        var hoverInEvent = function() {
            var currentLink = $(this).find('a');
            $(this).css('width', '86px');
            $(this).css('height', currentLink.height() + 'px');
            previousWidth = currentLink.width();
            currentLink.css('height', currentLink.height());
            currentLink.css('width', previousWidth + previousWidth*0.12 + 'px');
        }; 
        
        var hoverOutEvent = function() {
            $(this).css('width', '72px');
            $(this).find('a').css('width', previousWidth + 'px');
        };
         
        /**
         * After a click, the settings view is closed and the quiz is not added into the document.
         */
        var cancelButtonEvent = function() {
            sakai.api.Widgets.Container.informCancel(tuid, 'photosgallery');
        };
        
        /**
         * After a click, the widget data are saved and the quiz is added into the document.
         */
        var createButtonEvent = function() {
            var json = saveToJSON();
            sakai.api.Widgets.saveWidgetData(tuid, json, finish);
        };
        
        
        
        var doInit = function(show) {
            if (show) {
                // up to date the listeners to avoid multiple event catching
                addGeneralBinding();
                // if data have already been saved, they are loaded and diplayed
                getFromJCR(true);
                // settings view is displayed
                $(photosGallerySettings, rootel).show();
                $(photosGalleryDisplaying, rootel).hide();
            } else {
                // the quiz is displayed
                $(photosGallerySettings, rootel).hide();
                $(photosGalleryDisplaying, rootel).show();
                // the quiz is built with the saved data
                getFromJCR(false);
            }
        };
        
        // run the initialization function when the widget object loads
        doInit(showSettings);
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('photosgallery');
});
