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
        
        //Class
        var buttonDisabled = 's3d-disabled';
        var photosGalleryDisplayingItemLink = '.photosgallery_displaying_itemlink';
        var photosGalleryDisplayingItemClass = '.photosgallery_displaying_item';
        
        //Id
        var photosGallerySettings = '#photosgallery_settings';
        var photosGalleryDisplaying = '#photosgallery_displaying';
        var photosGallerySettingsCancelButton = '#photosgallery_settings_cancelbutton';
        var photosGallerySettingsCreateButton = '#photosgallery_settings_createbutton';
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
        var photosGalleryDisplayingPlayDiv = '#photosgallery_displaying_playdiv';
        var photosGalleryDisplayingStopDiv = '#photosgallery_displaying_stopdiv';
        var photosGalleryDisplayingUpButton = '#photosgallery_displaying_upbutton';
        var photosGalleryDisplayingDownButton = '#photosgallery_displaying_downbutton';
        
        //Template
        var photosGallerySettingsFillSelectTemplate = 'photosgallery_settings_fillselect_template';
        var photosGallerySettingsFillTableTemplate = 'photosgallery_settings_filltable_template';
        var photosGalleryDisplayingFillListTemplate = 'photosgallery_displaying_filllist_template';
        var photosGalleryDisplayingFillSlideshowTemplate = 'photosgallery_displaying_fillslideshow_template';
        
        var getAlbumsList = function(userId) {
            var albumsURL = 'http://localhost:8080/var/proxy/photosgallery/albumsPicasa.json?userID=' + userId;
            $.ajax({
                type : "GET",
                url : albumsURL,
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
                            var album = {
                                'idalbum' : $(this).find('gphoto\\:id').text(),
                                'iduser' : userId,
                                'title': $(this).find('title').text(),
                                'summary': $(this).find('summary').text(),
                                'location': $(this).find('gphoto\\:location').text(),
                                'numphotos': $(this).find('gphoto\\:numphotos').text(),
                                'updated': $(this).find('updated').text().split('T')[0],
                                'imgurl' : $(this).find('media\\:group').find('media\\:content').attr('url')
                            }
                            albumsList.push(album);
                            if (firstTime) {
                                selectedAlbum = album;
                                firstTime = false;
                            }
                        });
                    }
                    fillAlbumsList();
                },
                statusCode: { // displaying a message for each kind of error
                    404: function() {
                        alert(userId + ' n\'existe pas !');
                    }
                }
            });
        }
        
        
        var getPhotosList = function(userId, albumId) {
            var albumsURL = 'http://localhost:8080/var/proxy/photosgallery/photosPicasa.json?userID=' + userId + '&albumID=' + albumId;
            $.ajax({
                type : "GET",
                url : albumsURL,
                dataType : "xml",
                headers : {
                    'GData-Version': 2  
                },
                success : function(mainData, status, data) {
                    var response = data.responseXML;
                    var entries = $(response).find('entry');
                    photosList = [];
                    if ($(entries).length > 0) { 
                        entries.each(function() {
                            var photo = {
                                'id' : $(this).find('gphoto\\:id').text(),
                                'title': $(this).find('title').text().split('.')[0],
                                'updated': $(this).find('updated').text().split('T')[0],
                                'iconurl' : $(this).find('media\\:group').find('media\\:thumbnail[height=48]').attr('url'),
                                'imgurl' : $(this).find('media\\:group').find('media\\:content').attr('url')
                            }
                            photosList.push(photo);
                        });
                    }
                    fillPhotosList();
                },
                statusCode: { // displaying a message for each kind of error
                    404: function() {
                        alert(userId + ' n\'existe pas !');
                    }
                }
            });
        }
        
        
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
        
        var photoRender = function(index) {
            $(photosGalleryDisplayingDivImg, rootel).hide();
            var templateData = {
                'photo' : photosList[index],
                'index' : index
            };
            $(photosGalleryDisplayingDivImg, rootel).html(sakai.api.Util.TemplateRenderer(photosGalleryDisplayingFillSlideshowTemplate, templateData));
            $(photosGalleryDisplayingDivImg, rootel).fadeIn(2000);
        };

      
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
            $(photosGalleryDisplayingItemLink, rootel).on('click', displayPhotoEvent);
            $(photosGalleryDisplayingUpButton, rootel).on('click', goUpEvent);
            $(photosGalleryDisplayingDownButton, rootel).on('click', goDownEvent);
            $(photosGalleryDisplayingPreviousButton, rootel).on('click', previousPhotoEvent);
            $(photosGalleryDisplayingPlayStopButton, rootel).on('click', playStopEvent);
            $(photosGalleryDisplayingNextButton, rootel).on('click', nextPhotoEvent);
        };
        
        var removeMainViewBinding = function() {
            
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
        
        /**
         * Remove binding for the static elements into the settings view.
         */
        var removeGeneralBinding = function() {
        };
        
        var checkIdInput = function() {
            if(checkIfInputValid($(photosGalleryMainInformationsName, rootel).val())) {
                enableElements($(photosGalleryMainInformationsSearch, rootel));
            } else {
                disableElements($(photosGalleryMainInformationsSearch, rootel));
            }
        };
        
        var  searchButtonEvent = function() {
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
        };
        
        var playStopEvent = function() {
            if ($(photosGalleryDisplayingPlayStopButton).find(photosGalleryDisplayingPlayDiv).css("display")==="none") {
                $(photosGalleryDisplayingStopDiv).hide();
                $(photosGalleryDisplayingPlayDiv).show();
                clearInterval(diaporama);
                diaporama = undefined;
            } else {
                $(photosGalleryDisplayingPlayDiv).hide();
                $(photosGalleryDisplayingStopDiv).show();
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
                if(diaporama !== undefined) {
                    clearInterval(diaporama);
                    diaporama = undefined;
                }
            }
        };
        
        var goUpEvent = function() {
            var previousMargin = parseInt($('#' + photosGalleryDisplayingItem + '0').css('margin-top').split('px')[0]);
            if (previousMargin < 0) {
                $('#' + photosGalleryDisplayingItem + '0').css('margin-top', previousMargin + 10 + 'px');
            } 
        };
        
        var goDownEvent = function() {
            var previousMargin = parseInt($('#' + photosGalleryDisplayingItem + '0').css('margin-top').split('px')[0]);
            $('#' + photosGalleryDisplayingItem + '0').css('margin-top', previousMargin - 10 + 'px'); 
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
                removeGeneralBinding();
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
