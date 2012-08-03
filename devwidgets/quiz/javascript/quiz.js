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
require(['jquery', 'sakai/sakai.api.core', '../../devwidgets/quiz/javascript/slickQuiz', 'jquery-ui'], function($, sakai) {

    /**
     * @name sakai_global.quiz
     *
     * @class quiz
     *
     * @description
     * Create a quiz to display in a document.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.quiz = function (tuid, showSettings, widgetData) {
    	/**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
        var questionsNumber = -1;
        var questionsList = [];
        var minAnswersNumber = 1; 
        var answersNumber = minAnswersNumber;
        var answersNumberQuestionDetails = minAnswersNumber;
        var questionInModification = 0;
        var quizCanBeAdded = false;
        var questionCanBeSaved = false;
        var questionCanBeModified = true;  
        var json = false;   
          
        var rootel = "#" + tuid;   
        //Node
        var $quizNewQuestionForm = $('#quiz_newquestion_form', rootel);
        var $quizNewQuestionAddButton = $('#quiz_newquestion_add_button', rootel);
        var $quizNewQuestionRemoveButton = $('#quiz_newquestion_remove_button', rootel);
        var $quizNewQuestionAddToList = $('#quiz_newquestion_addtolist', rootel);
        var $quizNewQuestionRaquoRight = $('#quiz_newquestion_raquo_right', rootel);
      	var $quizQuestionsListCreatedItems = $('#quiz_questionslist_createditems', rootel);
        var $quizQuestionsListRemoveButton = $('.quiz_questionslist_remove_button', rootel);
        var $quizSettingsQuestionDetails = $('#quiz_settings_questiondetails', rootel); 
        var $quizQuestionDetailsClose = $('#quiz_questiondetails_close', rootel);
        
        //Class
        var mainInformationsRequired = '.main_informations_required';
        var newQuestionRequired = '.newquestion_required';
        var questionDetailsRequired = '.questiondetails_required';
        var buttonDisabled = 's3d-disabled';
        var quizQuestionsListSortableList = '.quiz_questionslist_sortablelist';
        var cantBeDeleted = 'cant_be_deleted';
        var quizQuestionDetailsCheckbox = '.quiz_questiondetails_checkbox';
        var quizNewQuestionCheckbox = '.quiz_newquestion_checkbox';
        var quizQuestionsListDetailsButton = '.quiz_questionslist_details_button';
        var quizQuestionsListRemoveButton = '.quiz_questionslist_remove_button';
        
        //Id 
        var quizMainInformationsForm = '#quiz_main_informations_form';
        var quizMainInformationsName = '#quiz_main_informations_name';
        var quizMainInformationsDescription = '#quiz_main_informations_description';
        var quizMainInformationsComment = '#quiz_main_informations_comment';
        var quizMainInformationsLevel1 = '#quiz_main_informations_level1';
        var quizMainInformationsLevel2 = '#quiz_main_informations_level2';
        var quizMainInformationsLevel3 = '#quiz_main_informations_level3';
        var quizMainInformationsLevel4 = '#quiz_main_informations_level4';
        var quizMainInformationsLevel5 = '#quiz_main_informations_level5';
        var quizNewQuestionTableBody = '#quiz_newquestion_tablebody';
        var quizNewQuestionQuestion = '#quiz_newquestion_question';
        var quizNewQuestionCorrectComment = '#quiz_newquestion_correctcomment';
        var quizNewQuestionIncorrectComment = '#quiz_newquestion_incorrectcomment';
        var quizNewQuestionAnswer_0 = '#quiz_newquestion_answer_0';
        var quizNewQuestionAnswer_1 = '#quiz_newquestion_answer_1';
        var quizQuestionsListCheckbox = '#quiz_questionslist_checkbox';
        var quizQuestionsListItem = 'quiz_questionslist_item_';
        var quizSettingsQuestionDetails = '#quiz_settings_questiondetails'; 
        var quizQuestionDetailsContainer = '#quiz_questiondetails_container';
        var quizQuestionDetailsClose = '#quiz_questiondetails_close';
        var quizQuestionDetailsForm = '#quiz_questiondetails_form';
        var quizQuestionDetailsModify = '#quiz_questiondetails_modify';
        var quizQuestionDetailsTableBody = '#quiz_questiondetails_tablebody';
        var quizQuestionDetailsSaveModification = '#quiz_questiondetails_savemodification';
        var quizQuestionDetailsCancelModification = '#quiz_questiondetails_cancelmodification';
        var quizQuestionDetailsRemoveButton = '#quiz_questiondetails_remove_button';
        var quizQuestionDetailsAddButton = '#quiz_questiondetails_add_button';
        var quizQuestionDetailsModifyDiv = '#quiz_questiondetails_modifydiv';
        var quizQuestionDetailsSaveDiv = '#quiz_questiondetails_savediv';
        var quizSettingsCreateButton = '#quiz_settings_create_button';
        var quizSettingsCancelButton = '#quiz_settings_cancel_button';
        
        //Template 
        var quizNewQuestionAddNewAnswerTableTemplate = 'quiz_newquestion_add_newanswer_table_template';
        var quizQuestionsDetailsAddNewAnswerTableTemplate = 'quiz_questiondetails_add_newanswer_table_template';
        var quizQuestionsListTemplate = 'quiz_questionslist_template';
        var quizQuestionDetailsTemplate = 'quiz_questiondetails_template';
        
        //Container 
        var newQuestionContainer = 'newquestion';
        var questionDetailsContainer = 'questiondetails';
        
        
        /**
         * Disable or enable elements
         * can take a single or multivalue jQuery obj
         */
        var enableElements = function(jQueryObj) {
            jQueryObj.removeAttr('disabled');
            jQueryObj.removeClass(buttonDisabled);
        };

        var disableElements = function(jQueryObj) {
            jQueryObj.attr('disabled', 'disabled');
            jQueryObj.addClass(buttonDisabled);
        };
        
        /**
         * Check if there is at least the question input and two answer inputs given by the user and check if they are valid
         * @return {Boolean} true if there is at least the question input and two answer inputs given by the user and if they are valid
         */
        var checkIfQuestionInputValid = function(isModified) {
            var container;
            
            if (isModified) {
                container = '#quiz_' + questionDetailsContainer;
            }
            else {
                container = '#quiz_' + newQuestionContainer;
            }
            
            var question = $(container + '_question', rootel).val();
            var answer0 = $($(container + '_answer_0', rootel).find('input[type=text]')[0]).val();
            var answer1 = $($(container + '_answer_1', rootel).find('input[type=text]')[0]).val();
            
            // check if the user didn't just fill in some spaces
            return (question.replace(/ /g, "") !== "" && answer0.replace(/ /g, "") !== "" && answer1.replace(/ /g, "") !== "" && checkIfOneAnswerChecked(container));
        };
        
        var checkIfOneAnswerChecked = function(container) {
            var rows = $(container + '_table', rootel).find('tr');
            
            for (var i = 1 ; i < rows.length ; i++) {
                var answerInputs = $(rows[i], rootel).find('td');
                var answerTextInput = $($(answerInputs[0], rootel).find('input')).val();
                
                if (checkIfAnswerValid(answerTextInput)) {
                    if($($(answerInputs[1], rootel).find('input')).is(':checked')) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        var checkIfMainInformationsInputValid = function() {
            var name = $(quizMainInformationsName, rootel).val();
            var description = $(quizMainInformationsDescription, rootel).val();
            var comment = $(quizMainInformationsComment, rootel).val();
            var level1 = $(quizMainInformationsLevel1, rootel).val();
            var level2 = $(quizMainInformationsLevel2, rootel).val();
            var level3 = $(quizMainInformationsLevel3, rootel).val();
            var level4 = $(quizMainInformationsLevel4, rootel).val();
            var level5 = $(quizMainInformationsLevel5, rootel).val();
            
            // check if the user didn't just fill in some spaces
            return (name.replace(/ /g, "") !== "" 
                    && description.replace(/ /g, "") !== ""     
                    && comment.replace(/ /g, "") !== "" 
                    && level1.replace(/ /g, "") !== "" 
                    && level2.replace(/ /g, "") !== "" 
                    && level3.replace(/ /g, "") !== "" 
                    && level4.replace(/ /g, "") !== "" 
                    && level5.replace(/ /g, "") !== "");
        };
               
        var checkIfAnswerValid = function(answer) {
            // check if the user didn't just fill in some spaces
            return (answer.replace(/ /g, "") !== "");
        };
        
        var constructQuestionToAdd = function(index) {
            var answersTable = [];
            var answerInputs;
            var answerTextInput;
            var answerCheckboxInput = false;
            var container;
            
            if (index) {
        	    container = '#quiz_' + questionDetailsContainer;
            }
            else {
                container = '#quiz_' + newQuestionContainer;
            }
            
            questionsNumber++;
            var rows = $(container + '_table', rootel).find('tr');
            var availableAnswers = 0;
            
            for (var i = 1 ; i < rows.length ; i++) {
                answerCheckboxInput = false;
                answerInputs = $(rows[i], rootel).find('td');
                answerTextInput = $($(answerInputs[0], rootel).find('input')).val();
                
                if (checkIfAnswerValid(answerTextInput)) {
                    if($($(answerInputs[1], rootel).find('input')).is(':checked')) {
                        answerCheckboxInput = true;
                    }
                    answersTable[availableAnswers++] = {
                        "option": answerTextInput,
                        "correct" : answerCheckboxInput
                    }
                }
            }
            
            var correctComment = $(container + '_correctcomment', rootel).val();
            var incorrectComment = $(container + '_incorrectcomment', rootel).val();
            
            if (correctComment == '') {
                correctComment = sakai.api.i18n.getValueForKey("DEFAULT_CORRECT_COMMENT", "quiz");
            }
            if (incorrectComment == '') {
                incorrectComment = sakai.api.i18n.getValueForKey("DEFAULT_INCORRECT_COMMENT", "quiz");
            }
            
            var contentQuestion = {
                "q" : $(container + '_question', rootel).val(),
                "a" : answersTable,
                "correct" : correctComment,
                "incorrect" : incorrectComment
            };

            if (index) {
                questionsList[index] = contentQuestion;
            }
            else {
                questionsList.push(contentQuestion);
            }
        };
       
        var checkIfQuizValid = function() {
            if (checkIfMainInformationsInputValid() && questionsList.length) {
                enableElements($(quizSettingsCreateButton, rootel));
                quizCanBeAdded = true;
            } 
            else {
                if(quizCanBeAdded) {
                    disableElements($(quizSettingsCreateButton, rootel));
                    quizCanBeAdded = false;
                }
            }
        };
		
        var finish = function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'quiz');
        };
        
        var addQuestionToList = function() {
            if (questionCanBeSaved) {
                constructQuestionToAdd();
                renderQuestionsList();
            }
        };
        
        var renderQuestionsList = function() {
            var templateData = {
                'questions' : questionsList
            };

            $quizQuestionsListCreatedItems.html(sakai.api.Util.TemplateRenderer(quizQuestionsListTemplate, templateData));

            removeQuestionsListBinding();
            addQuestionsListBinding();

            $(quizQuestionsListSortableList, rootel).sortable({
                connectWith : quizQuestionsListSortableList,
                revert : true,
                opacity : 0.5,
                tolerance : 'intersect',
                stop : function(event, ui) {
                    actualizeQuestionList();
                }
            });
        };
          
        var actualizeQuestionList = function() {
            var tempList = [];
            var i = 0;
            $(quizQuestionsListSortableList, rootel).find('li').each(function() {
                var index = $(this).attr('id').split(quizQuestionsListItem)[1];
                tempList[i++] = questionsList[index];
            });
            questionsList = tempList;
        };  
        
        var saveQuizToJSON = function() {
            var mainInformations = {
                "name" : $(quizMainInformationsName, rootel).val(),
                "main" : $(quizMainInformationsDescription, rootel).val(),
                "results" : $(quizMainInformationsComment, rootel).val(),
                "level1" : $(quizMainInformationsLevel1, rootel).val(),
                "level2" : $(quizMainInformationsLevel2, rootel).val(),
                "level3" : $(quizMainInformationsLevel3, rootel).val(),
                "level4" : $(quizMainInformationsLevel4, rootel).val(),
                "level5" : $(quizMainInformationsLevel5, rootel).val(),
            };

            var quizJSON = {
                "info" : mainInformations,
                "questions" : questionsList,
                "random" : $(quizQuestionsListCheckbox, rootel).is(':checked')
            };
            return quizJSON;
        };
        
        var resetQuestionInputs = function() {
            $(quizNewQuestionQuestion, rootel).val('');
            $(quizNewQuestionCorrectComment, rootel).val('');
            $(quizNewQuestionIncorrectComment, rootel).val('');

            disableElements($quizNewQuestionAddToList);
            disableElements($quizNewQuestionRaquoRight);
            questionCanBeSaved = false;
            $(quizNewQuestionTableBody, rootel).find('tr').each(function() {
                if ($(this).attr('class') != cantBeDeleted) {
                    $(this).remove();
                } 
                else {
                    $($(quizNewQuestionAnswer_0, rootel).find('input[type=text]')[0]).val('');
                    $($(quizNewQuestionAnswer_1, rootel).find('input[type=text]')[0]).val('');
                    $($(this).find('input[type=checkbox]')[0]).attr('checked', false);
                }
            });
            answersNumber = minAnswersNumber;
        };

        var getFromJCR = function(settings) {
            if (widgetData && widgetData.quiz) {
                if (settings) {
                    fillSettings(true, widgetData.quiz);
                } 
                else {
                    renderQuiz(true, widgetData.quiz);
                }
            } 
            else {
                sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                    if (settings) {
                        fillSettings(success, data);
                    } 
                    else {
                        renderQuiz(success, data);
                    }
                });
            }
        };

        var renderQuiz = function(success, data) {
            if (success) {
                json = data;
                setQuiz();
            }
        };
        
        var setQuiz = function() {
            var jsonTmp = {
                "info" : json.info,
                "questions" : json.questions
            };
            
            $(rootel + ' #quiz_displaying').slickQuiz({"json": jsonTmp, 
                                             "checkAnswerText": sakai.api.i18n.getValueForKey("CHECK_ANSWER_TEXT", "quiz"), 
                                             "nextQuestionText": sakai.api.i18n.getValueForKey("NEXT_QUESTION_TEXT", "quiz"),
                                             "backButtonText": sakai.api.i18n.getValueForKey("BACK_BUTTON_TEXT", "quiz"),
                                             "randomSort": json.random});
        };

        var fillSettings = function(success, data) {
            if (success) {
                json = data;
                $(quizMainInformationsName, rootel).val(json.info.name);
                $(quizMainInformationsDescription, rootel).val(json.info.main);
                $(quizMainInformationsComment, rootel).val(json.info.results);
                $(quizMainInformationsLevel1, rootel).val(json.info.level1);
                $(quizMainInformationsLevel2, rootel).val(json.info.level2);
                $(quizMainInformationsLevel3, rootel).val(json.info.level3);
                $(quizMainInformationsLevel4, rootel).val(json.info.level4);
                $(quizMainInformationsLevel5, rootel).val(json.info.level5);
                questionsList = json.questions;
                if (json.random) {
                    $(quizQuestionsListCheckbox, rootel).attr('checked', true);
                }
                renderQuestionsList();
                enableElements($(quizSettingsCreateButton, rootel));
                quizCanBeAdded = true;
            }
        };

        var addNewQuestionRequiredBinding = function() {
            $(newQuestionRequired, rootel).bind('keyup', newQuestionRequiredEvent);
            $(quizNewQuestionCheckbox, rootel).bind('click', newQuestionRequiredEvent);
        };
        
        var removeNewQuestionRequiredBinding = function() {
            $(newQuestionRequired, rootel).unbind('keyup', newQuestionRequiredEvent);
            $(quizNewQuestionCheckbox, rootel).unbind('click', newQuestionRequiredEvent);
        };
        
        var addQuestionsListBinding = function() {
           $(quizQuestionsListDetailsButton, rootel).bind('click', showQuestionDetailsEvent);
           $(quizQuestionsListRemoveButton, rootel).bind('click', removeQuestionEvent);
        };
        
        var removeQuestionsListBinding = function() {
           $(quizQuestionsListDetailsButton, rootel).unbind('click', showQuestionDetailsEvent);
           $(quizQuestionsListRemoveButton, rootel).unbind('click', removeQuestionEvent);
        };
        
        var addQuestionDetailsGeneralBinding = function() {
            $(quizQuestionDetailsClose, rootel).bind('click', questionDetailsCloseEvent);
            $(quizQuestionDetailsModify, rootel).bind('click', modifyEvent); 
            $(quizQuestionDetailsSaveModification, rootel).bind('click', saveModificationEvent); 
            $(quizQuestionDetailsCancelModification, rootel).bind('click', cancelModificationEvent); 
            $(quizQuestionDetailsAddButton, rootel).bind('click', questionDetailsAddAnswerEvent);
            $(quizQuestionDetailsRemoveButton, rootel).bind('click', questionDetailsRemoveAnswerEvent);
        };
        
        var removeQuestionDetailsGeneralBinding = function() {
            $(quizQuestionDetailsClose, rootel).unbind('click', questionDetailsCloseEvent);
            $(quizQuestionDetailsModify, rootel).unbind('click', modifyEvent); 
            $(quizQuestionDetailsSaveModification, rootel).unbind('click', saveModificationEvent); 
            $(quizQuestionDetailsCancelModification, rootel).unbind('click', cancelModificationEvent); 
            $(quizQuestionDetailsAddButton, rootel).unbind('click', questionDetailsAddAnswerEvent);
            $(quizQuestionDetailsRemoveButton, rootel).unbind('click', questionDetailsRemoveAnswerEvent);
        };
        
        var addQuestionDetailsSpecificBinding = function() {
            $(questionDetailsRequired, rootel).bind('keyup', modifyQuestionRequiredEvent);
            $(quizQuestionDetailsCheckbox, rootel).bind('click', modifyQuestionRequiredEvent);
        };
        
        var removeQuestionDetailsSpecificBinding = function() {
            $(questionDetailsRequired, rootel).unbind('keyup', modifyQuestionRequiredEvent);
            $(quizQuestionDetailsCheckbox, rootel).unbind('click', modifyQuestionRequiredEvent);
        };
        
        var addGeneralBinding = function() {
            $(mainInformationsRequired, rootel).bind('keyup', mainInformationsRequiredEvent); 
            addNewQuestionRequiredBinding();
            $quizNewQuestionAddButton.bind('click', addAnswerEvent);
            $quizNewQuestionRemoveButton.bind('click', removeAnswerEvent);
            $quizNewQuestionRaquoRight.bind('click', addToListEvent);
            $quizNewQuestionAddToList.bind('click', addToListEvent);
            $(quizSettingsCancelButton, rootel).bind('click', cancelButtonEvent);
            $(quizSettingsCreateButton, rootel).bind('click', createButtonEvent);
        };
        
        var removeGeneralBinding = function() {
            $(mainInformationsRequired, rootel).unbind('keyup', mainInformationsRequiredEvent);
            removeNewQuestionRequiredBinding();
            $quizNewQuestionAddButton.unbind('click', addAnswerEvent);
            $quizNewQuestionRemoveButton.unbind('click', removeAnswerEvent);
            $quizNewQuestionRaquoRight.unbind('click', addToListEvent);
            $quizNewQuestionAddToList.unbind('click', addToListEvent);
            $(quizSettingsCancelButton, rootel).unbind('click', cancelButtonEvent);
            $(quizSettingsCreateButton, rootel).unbind('click', createButtonEvent);
        };
        
        var mainInformationsRequiredEvent = function() {
            checkIfQuizValid();
        };
        
        var newQuestionRequiredEvent = function() {
            if (checkIfQuestionInputValid(false)) {
                enableElements($quizNewQuestionAddToList);
                enableElements($quizNewQuestionRaquoRight);
                questionCanBeSaved = true;
            } 
            else {
                if (questionCanBeSaved) {
                    disableElements($quizNewQuestionAddToList);
                    disableElements($quizNewQuestionRaquoRight);
                    questionCanBeSaved = false;
                }
            }
        };
        
        var addAnswerEvent = function() {
            answersNumber++;
            var templateData = {
                'answersNumber' : answersNumber
            };
            $(quizNewQuestionTableBody, rootel).append(sakai.api.Util.TemplateRenderer(quizNewQuestionAddNewAnswerTableTemplate, templateData));
            
            removeNewQuestionRequiredBinding();
            addNewQuestionRequiredBinding();
        };
        
        var removeAnswerEvent = function() {
            if (answersNumber > minAnswersNumber) {
                answersNumber--;
                var rows = $(quizNewQuestionTableBody, rootel).find('tr');
                $(rows[rows.length - 1], rootel).remove();
            }
        };
        
        var addToListEvent = function() {
            addQuestionToList();
            checkIfQuizValid();
            resetQuestionInputs();
        };
          
        var showQuestionDetailsEvent = function() {
            var parentId = $(this).parent()[0].id;
            var index = parentId.split(quizQuestionsListItem)[1];
            var templateData = questionsList[index];
            questionInModification = index;
            answersNumberQuestionDetails = templateData.a.length - 1;
            $(quizSettingsQuestionDetails, rootel).show();
            $(quizSettingsQuestionDetails, rootel).html(sakai.api.Util.TemplateRenderer(quizQuestionDetailsTemplate, templateData));
            
            removeQuestionDetailsGeneralBinding();
            removeQuestionDetailsSpecificBinding();
            addQuestionDetailsGeneralBinding();
            addQuestionDetailsSpecificBinding();
        };
       
        var removeQuestionEvent = function() {
            var index = $(this).parent()[0].id.split(quizQuestionsListItem)[1];
            questionsList.splice(index, 1);
            questionsNumber--;
            renderQuestionsList();
            checkIfQuizValid();
        };
       
        var questionDetailsCloseEvent = function() {
            $(quizSettingsQuestionDetails, rootel).hide();
        };

        var modifyEvent = function() {
            $(this).parent().parent().find('input').each(function() {
                enableElements($(this));
            });
            $(this).parent().parent().find('textarea').each(function() {
                enableElements($(this));
            });
            enableElements($(quizQuestionDetailsRemoveButton, rootel));
            enableElements($(quizQuestionDetailsAddButton, rootel));
            $(quizQuestionDetailsModifyDiv, rootel).hide();
            $(quizQuestionDetailsSaveDiv, rootel).show();
        };

        var saveModificationEvent = function() {
            if (questionCanBeModified) {
                constructQuestionToAdd(questionInModification);
                renderQuestionsList();
                $(quizSettingsQuestionDetails, rootel).hide();
            }
        };
            
        var cancelModificationEvent = function() {
            $(quizSettingsQuestionDetails, rootel).hide();
        };
        
        var questionDetailsAddAnswerEvent = function() {
            answersNumberQuestionDetails++;
            var templateData = {
                'answersNumber' : answersNumberQuestionDetails
            };
            $(quizQuestionDetailsTableBody, rootel).append(sakai.api.Util.TemplateRenderer(quizQuestionsDetailsAddNewAnswerTableTemplate, templateData));
            
            removeQuestionDetailsSpecificBinding();
            addQuestionDetailsSpecificBinding();
        };
        
        var questionDetailsRemoveAnswerEvent = function() {
            if (answersNumberQuestionDetails > minAnswersNumber) {
                answersNumberQuestionDetails--;
                var rows = $(quizQuestionDetailsTableBody, rootel).find('tr');
                $(rows[rows.length - 1], rootel).remove();
            }
        };
        
        var modifyQuestionRequiredEvent = function() {
            // enable the save button
            if (checkIfQuestionInputValid(true)) {
                enableElements($(quizQuestionDetailsSaveModification, rootel));
                questionCanBeModified = true;
            } 
            else {
                if (questionCanBeModified) {
                    disableElements($(quizQuestionDetailsSaveModification, rootel));
                    questionCanBeModified = false;
                }
            }
        };
        
        var cancelButtonEvent = function() {
            sakai.api.Widgets.Container.informCancel(tuid, 'quiz');
        };
        
        var createButtonEvent = function() {
            json = saveQuizToJSON();
            sakai.api.Widgets.saveWidgetData(tuid, json, finish);
        };

        var doInit = function(show) {
            if (show) {
                removeGeneralBinding();
                addGeneralBinding();
                getFromJCR(true);
        	    renderQuestionsList();
                // Show the search input textfield and save, search, cancel buttons
                $('#quiz_settings', rootel).show();
                $('#quiz_displaying', rootel).hide();
            }
            else {
                $('#quiz_settings', rootel).hide();
                $('#quiz_displaying', rootel).show();
                getFromJCR(false);
            }
        };

        // run the initialization function when the widget object loads
        doInit(showSettings);
	};
	
	sakai.api.Widgets.widgetLoader.informOnLoad('quiz');
});
