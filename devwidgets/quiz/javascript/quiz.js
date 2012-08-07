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

// load the master sakai object to access all Sakai OAE API methods and the quiz plugin
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
     * @param {Object} widgetData Save the data for the current tuid
     */
    sakai_global.quiz = function(tuid, showSettings, widgetData) {

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

        var rootel = '#' + tuid;

        //Node
        var $quizNewQuestionAddButton = $('#quiz_newquestion_add_button', rootel);
        var $quizNewQuestionRemoveButton = $('#quiz_newquestion_remove_button', rootel);
        var $quizNewQuestionAddToList = $('#quiz_newquestion_addtolist', rootel);
        var $quizNewQuestionRaquoRight = $('#quiz_newquestion_raquo_right', rootel);
        var $quizQuestionsListCreatedItems = $('#quiz_questionslist_createditems', rootel);

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
        var quizQuestionDetailsClose = '#quiz_questiondetails_close';
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
        var quizSettingsView = '#quiz_settings';
        var quizDisplayingView = '#quiz_displaying';
        
        //Template
        var quizNewQuestionAddNewAnswerTableTemplate = 'quiz_newquestion_add_newanswer_table_template';
        var quizQuestionsDetailsAddNewAnswerTableTemplate = 'quiz_questiondetails_add_newanswer_table_template';
        var quizQuestionsListTemplate = 'quiz_questionslist_template';
        var quizQuestionDetailsTemplate = 'quiz_questiondetails_template';

        //Container's name
        var newQuestionContainer = 'newquestion';
        var questionDetailsContainer = 'questiondetails';


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
        var checkIfQuestionInputValid = function(isModified) {
            var container;

            if (isModified) {
                container = '#quiz_' + questionDetailsContainer;
            } else {
                container = '#quiz_' + newQuestionContainer;
            }

            var question = $(container + '_question', rootel).val();
            var answer0 = $($(container + '_answer_0', rootel).find('input[type=text]')[0]).val();
            var answer1 = $($(container + '_answer_1', rootel).find('input[type=text]')[0]).val();

            // check if the user didn't just fill in some spaces
            return (question.replace(/ /g, '') !== '' && answer0.replace(/ /g, '') !== '' && answer1.replace(/ /g, '') !== '' && checkIfOneAnswerChecked(container));
        };
        
        
        /**
         * Check if there is at least one correct answer in all the possible ones.
         * It means that there is at least one possible answer checked.
         * @param {Boolean} container To know in which container we have to check.
         * @return {Boolean} True if at least one possible answer has been checked.
         */
        var checkIfOneAnswerChecked = function(container) {
            var rows = $(container + '_table', rootel).find('tr');

            for (var i = 1; i < rows.length; i++) {
                var answerInputs = $(rows[i], rootel).find('td');
                var answerTextInput = $($(answerInputs[0], rootel).find('input')).val();

                if (checkIfAnswerValid(answerTextInput)) {
                    if ($($(answerInputs[1], rootel).find('input')).is(':checked')) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        
        /**
         * Check if the main informations about a quiz are valid.
         * It's valid if all the inputs have been filled by the user and are valid.
         * @return {Boolean} True if the main informations are valid.
         */
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
            return (name.replace(/ /g, '') !== '' && description.replace(/ /g, '') !== '' && comment.replace(/ /g, '') !== '' && level1.replace(/ /g, '') !== '' && level2.replace(/ /g, '') !== '' && level3.replace(/ /g, '') !== '' && level4.replace(/ /g, '') !== '' && level5.replace(/ /g, '') !== '');
        };
        
        
        /**
         * Check if an answer input is valid.
         * @param {Boolean} answer The answer to check.
         * @return {Boolean} True if the answer is valid.
         */
        var checkIfAnswerValid = function(answer) {
            // check if the user didn't just fill in some spaces
            return (answer.replace(/ /g, '') !== '');
        };
        
        
        /**
         * Build the JSON object for a question and add it in the array's questions.
         * @param {int} index If an index is specified, the question will be stored at this index and replace question currently stored at this index. If not, the question will be stored at the end of the array.
         */
        var constructQuestionToAdd = function(index) {
            var answersTable = [];
            var answerInputs;
            var answerTextInput;
            var answerCheckboxInput = false;
            var container;

            if (index) {
                container = '#quiz_' + questionDetailsContainer;
            } else {
                container = '#quiz_' + newQuestionContainer;
            }
            
            questionsNumber++;
            var rows = $(container + '_table', rootel).find('tr');
            var availableAnswers = 0;

            // build the JSON for the possible answers' list
            for (var i = 1; i < rows.length; i++) {
                answerCheckboxInput = false;
                answerInputs = $(rows[i], rootel).find('td');
                answerTextInput = $($(answerInputs[0], rootel).find('input')).val();

                if (checkIfAnswerValid(answerTextInput)) {
                    if ($($(answerInputs[1], rootel).find('input')).is(':checked')) {
                        answerCheckboxInput = true;
                    }
                    answersTable[availableAnswers++] = {
                        'option' : answerTextInput,
                        'correct' : answerCheckboxInput
                    }
                }
            }

            var correctComment = $(container + '_correctcomment', rootel).val();
            var incorrectComment = $(container + '_incorrectcomment', rootel).val();
            
            // if any correct or incorrect comment have been filled, default ones are added
            if (correctComment == '') {
                correctComment = sakai.api.i18n.getValueForKey('DEFAULT_CORRECT_COMMENT', 'quiz');
            }
            if (incorrectComment == '') {
                incorrectComment = sakai.api.i18n.getValueForKey('DEFAULT_INCORRECT_COMMENT', 'quiz');
            }

            // the entire question is built
            var contentQuestion = {
                'q' : $(container + '_question', rootel).val(),
                'a' : answersTable,
                'correct' : correctComment,
                'incorrect' : incorrectComment
            };

            // store the question in the array
            if (index) {
                questionsList[index] = contentQuestion;
            } else {
                questionsList.push(contentQuestion);
            }
        };
        
        
        /**
         * Check if a quiz is valid before to be added into a document.
         * A quiz is valid if the main informations are valid and if there is at least one question into the list.
         * If a quiz is valid, the add button is enable, else it remains disabled
         */
        var checkIfQuizValid = function() {
            if (checkIfMainInformationsInputValid() && questionsList.length) {
                enableElements($(quizSettingsCreateButton, rootel));
                quizCanBeAdded = true;
            } else {
                if (quizCanBeAdded) {
                    disableElements($(quizSettingsCreateButton, rootel));
                    quizCanBeAdded = false;
                }
            }
        };
        
        
        /**
         * Inform the container that the settings modifications are finished. 
         */
        var finish = function() {
            sakai.api.Widgets.Container.informFinish(tuid, 'quiz');
        };
        
        
        /**
         * If a question can be add to the quiz, the JSON is built and the questions' list is up to date. 
         */
        var addQuestionToList = function() {
            if (questionCanBeSaved) {
                constructQuestionToAdd();
                renderQuestionsList();
            }
        };
        
        
        /**
         * The html of the questions's list is up to date by TemplateRender. 
         */
        var renderQuestionsList = function() {
            var templateData = {
                'questions' : questionsList
            };

            $quizQuestionsListCreatedItems.html(sakai.api.Util.TemplateRenderer(quizQuestionsListTemplate, templateData));

            // listeners are deleted and then created to avoid multiple event catching 
            removeQuestionsListBinding();
            addQuestionsListBinding();

            // the elements into the questions' list can be sort by the user 
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
        
        
        /**
         * After that an element has been moved into the questions' list, the array is up to date in order to keep the new list order.
         */
        var actualizeQuestionList = function() {
            var tempList = [];
            var i = 0;
            $(quizQuestionsListSortableList, rootel).find('li').each(function() {
                var index = $(this).attr('id').split(quizQuestionsListItem)[1];
                tempList[i++] = questionsList[index];
            });
            questionsList = tempList;
        };
        
        
        /**
         * Build the quiz JSON which can be understood by the SlickQuiz plugin. 
         */
        var saveQuizToJSON = function() {
            var mainInformations = {
                'name' : $(quizMainInformationsName, rootel).val(),
                'main' : $(quizMainInformationsDescription, rootel).val(),
                'results' : $(quizMainInformationsComment, rootel).val(),
                'level1' : $(quizMainInformationsLevel1, rootel).val(),
                'level2' : $(quizMainInformationsLevel2, rootel).val(),
                'level3' : $(quizMainInformationsLevel3, rootel).val(),
                'level4' : $(quizMainInformationsLevel4, rootel).val(),
                'level5' : $(quizMainInformationsLevel5, rootel).val(),
            };

            var quizJSON = {
                'info' : mainInformations,
                'questions' : questionsList,
                'random' : $(quizQuestionsListCheckbox, rootel).is(':checked')
            };
            return quizJSON;
        };
        
        
        /**
         * The question form is reset after that a question has been saved. 
         */
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
                } else {
                    $($(quizNewQuestionAnswer_0, rootel).find('input[type=text]')[0]).val('');
                    $($(quizNewQuestionAnswer_1, rootel).find('input[type=text]')[0]).val('');
                    $($(this).find('input[type=checkbox]')[0]).attr('checked', false);
                }
            });
            answersNumber = minAnswersNumber;
        };
        
        
        /**
         * The widget data are loaded. If settings are dispayed, all forms and list are filled ; else, the quiz is displaying. 
         * @param {Boolean} settings True if the settings view is displaying.
         */
        var getFromJCR = function(settings) {
            if (widgetData && widgetData.quiz) {
                if (settings) {
                    fillSettings(true, widgetData.quiz);
                } else {
                    renderQuiz(true, widgetData.quiz);
                }
            } else {
                sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                    if (settings) {
                        fillSettings(success, data);
                    } else {
                        renderQuiz(success, data);
                    }
                });
            }
        };
        
        
        /**
         * The quiz is interpreted and then displayed thanks to the SlickQuiz plugin.
         * @param {Boolean} success True if the data have been successfully loaded.
         * @param {Object} data The widget data. 
         */
        var renderQuiz = function(success, data) {
            if (success) {
                json = data;
                var jsonTmp = {
                    'info' : json.info,
                    'questions' : json.questions
                };

                // the quiz is displayed thanks to the SlickQuiz plugin with some specified options
                $(rootel + ' #quiz_displaying').slickQuiz({
                    'json' : jsonTmp,
                    'checkAnswerText' : sakai.api.i18n.getValueForKey('CHECK_ANSWER_TEXT', 'quiz'),
                    'nextQuestionText' : sakai.api.i18n.getValueForKey('NEXT_QUESTION_TEXT', 'quiz'),
                    'backButtonText' : sakai.api.i18n.getValueForKey('BACK_BUTTON_TEXT', 'quiz'),
                    'randomSort' : json.random
                });
            }
        };


        /**
         * Forms and list into the settings view are filled with the widget data loaded.
         * @param {Boolean} success True if the data have been successfully loaded.
         * @param {Object} data The widget data. 
         */
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
        
        
        /**
         * Add binding for the required inputs in the question form.
         */
        var addNewQuestionRequiredBinding = function() {
            $(newQuestionRequired, rootel).bind('keyup', newQuestionRequiredEvent);
            $(quizNewQuestionCheckbox, rootel).bind('click', newQuestionRequiredEvent);
        };
        
        /**
         * Remove binding for the required inputs in the question form.
         */
        var removeNewQuestionRequiredBinding = function() {
            $(newQuestionRequired, rootel).unbind('keyup', newQuestionRequiredEvent);
            $(quizNewQuestionCheckbox, rootel).unbind('click', newQuestionRequiredEvent);
        };
        
        /**
         * Add binding for the questions' list.
         */
        var addQuestionsListBinding = function() {
            $(quizQuestionsListDetailsButton, rootel).bind('click', showQuestionDetailsEvent);
            $(quizQuestionsListRemoveButton, rootel).bind('click', removeQuestionEvent);
        };
        
        /**
         * Remove binding for the questions' list.
         */
        var removeQuestionsListBinding = function() {
            $(quizQuestionsListDetailsButton, rootel).unbind('click', showQuestionDetailsEvent);
            $(quizQuestionsListRemoveButton, rootel).unbind('click', removeQuestionEvent);
        };
        
        /**
         * Add binding for the the general elements into the question's details view.
         */
        var addQuestionDetailsGeneralBinding = function() {
            $(quizQuestionDetailsClose, rootel).bind('click', questionDetailsCloseEvent);
            $(quizQuestionDetailsModify, rootel).bind('click', modifyEvent);
            $(quizQuestionDetailsSaveModification, rootel).bind('click', saveModificationEvent);
            $(quizQuestionDetailsCancelModification, rootel).bind('click', cancelModificationEvent);
            $(quizQuestionDetailsAddButton, rootel).bind('click', questionDetailsAddAnswerEvent);
            $(quizQuestionDetailsRemoveButton, rootel).bind('click', questionDetailsRemoveAnswerEvent);
        };
        
        /**
         * Remove binding for the the general elements into the question's details view.
         */
        var removeQuestionDetailsGeneralBinding = function() {
            $(quizQuestionDetailsClose, rootel).unbind('click', questionDetailsCloseEvent);
            $(quizQuestionDetailsModify, rootel).unbind('click', modifyEvent);
            $(quizQuestionDetailsSaveModification, rootel).unbind('click', saveModificationEvent);
            $(quizQuestionDetailsCancelModification, rootel).unbind('click', cancelModificationEvent);
            $(quizQuestionDetailsAddButton, rootel).unbind('click', questionDetailsAddAnswerEvent);
            $(quizQuestionDetailsRemoveButton, rootel).unbind('click', questionDetailsRemoveAnswerEvent);
        };
        
        /**
         * Add binding for the the specific elements into the question's details view.
         */
        var addQuestionDetailsSpecificBinding = function() {
            $(questionDetailsRequired, rootel).bind('keyup', modifyQuestionRequiredEvent);
            $(quizQuestionDetailsCheckbox, rootel).bind('click', modifyQuestionRequiredEvent);
        };
        
        /**
         * Remove binding for the the specific elements into the question's details view.
         */
        var removeQuestionDetailsSpecificBinding = function() {
            $(questionDetailsRequired, rootel).unbind('keyup', modifyQuestionRequiredEvent);
            $(quizQuestionDetailsCheckbox, rootel).unbind('click', modifyQuestionRequiredEvent);
        };
        
        /**
         * Add binding for the static elements into the settings view.
         */
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
        
        /**
         * Remove binding for the static elements into the settings view.
         */
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
        
        /**
         *  After a keyup, the validity of the quiz is checked.
         */
        var mainInformationsRequiredEvent = function() {
            checkIfQuizValid();
        };
        
        /**
         * After a keyup, the validity of a question is checked.
         * If the question is valid, the add buttons are enabled, else it remain disabled.
         */
        var newQuestionRequiredEvent = function() {
            if (checkIfQuestionInputValid(false)) {
                enableElements($quizNewQuestionAddToList);
                enableElements($quizNewQuestionRaquoRight);
                questionCanBeSaved = true;
            } else {
                if (questionCanBeSaved) {
                    disableElements($quizNewQuestionAddToList);
                    disableElements($quizNewQuestionRaquoRight);
                    questionCanBeSaved = false;
                }
            }
        };
        
        /**
         * After a click, a row in possible answers table is added and the listeners on the inputs are up to date.
         */
        var addAnswerEvent = function() {
            answersNumber++;
            var templateData = {
                'answersNumber' : answersNumber
            };
            $(quizNewQuestionTableBody, rootel).append(sakai.api.Util.TemplateRenderer(quizNewQuestionAddNewAnswerTableTemplate, templateData));

            removeNewQuestionRequiredBinding();
            addNewQuestionRequiredBinding();
        };
        
        /**
         * After a click, the last row in possible answers table is removed.
         */
        var removeAnswerEvent = function() {
            if (answersNumber > minAnswersNumber) {
                answersNumber--;
                var rows = $(quizNewQuestionTableBody, rootel).find('tr');
                $(rows[rows.length - 1], rootel).remove();
            }
        };
        
        /**
         * After a click, the question is added into the list, the question form is reset and we check if the quiz can be created.
         */
        var addToListEvent = function() {
            addQuestionToList();
            checkIfQuizValid();
            resetQuestionInputs();
        };
        
        /**
         * After a click, the question's details view is displayed by TamplateRender and listeners are up to date
         */
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
        
        /**
         * After a click, the selected question is removed.
         */
        var removeQuestionEvent = function() {
            var index = $(this).parent()[0].id.split(quizQuestionsListItem)[1];
            questionsList.splice(index, 1);
            questionsNumber--;
            renderQuestionsList();
            checkIfQuizValid();
        };
        
        /**
         * After a click, the question's details view is closed.
         */
        var questionDetailsCloseEvent = function() {
            $(quizSettingsQuestionDetails, rootel).hide();
        };
        
        /**
         * After a click, the form inputs into the question's details view are enabled and the question can be mofidy. 
         * Listeners are up to date.
         */
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
        
        /**
         * After a click, if the modifications are valid, it can be saved. Then the question's details view is closed.
         */
        var saveModificationEvent = function() {
            if (questionCanBeModified) {
                constructQuestionToAdd(questionInModification);
                renderQuestionsList();
                $(quizSettingsQuestionDetails, rootel).hide();
            }
        };
        
        /**
         * After a click, the question's details view is closed without saving the modifications.
         */
        var cancelModificationEvent = function() {
            $(quizSettingsQuestionDetails, rootel).hide();
        };
        
        /**
         * After a click, a row is added in the possible answers table
         */
        var questionDetailsAddAnswerEvent = function() {
            answersNumberQuestionDetails++;
            var templateData = {
                'answersNumber' : answersNumberQuestionDetails
            };
            $(quizQuestionDetailsTableBody, rootel).append(sakai.api.Util.TemplateRenderer(quizQuestionsDetailsAddNewAnswerTableTemplate, templateData));

            removeQuestionDetailsSpecificBinding();
            addQuestionDetailsSpecificBinding();
        };
        
        /**
         * After a click, the last row in the possible answers table is removed.
         */
        var questionDetailsRemoveAnswerEvent = function() {
            if (answersNumberQuestionDetails > minAnswersNumber) {
                answersNumberQuestionDetails--;
                var rows = $(quizQuestionDetailsTableBody, rootel).find('tr');
                $(rows[rows.length - 1], rootel).remove();
            }
        };
        
        /**
         * After a keyup, the validity of the modification is checked.
         * If the question is still valid, the save buttons remains enabled, else it is disabled.
         */
        var modifyQuestionRequiredEvent = function() {
            if (checkIfQuestionInputValid(true)) {
                enableElements($(quizQuestionDetailsSaveModification, rootel));
                questionCanBeModified = true;
            } else {
                if (questionCanBeModified) {
                    disableElements($(quizQuestionDetailsSaveModification, rootel));
                    questionCanBeModified = false;
                }
            }
        };
        
        /**
         * After a click, the settings view is closed and the quiz is not added into the document.
         */
        var cancelButtonEvent = function() {
            sakai.api.Widgets.Container.informCancel(tuid, 'quiz');
        };
        
        /**
         * After a click, the widget data are saved and the quiz is added into the document.
         */
        var createButtonEvent = function() {
            json = saveQuizToJSON();
            sakai.api.Widgets.saveWidgetData(tuid, json, finish);
        };
        
        
        var doInit = function(show) {
            if (show) {
                // up to date the listeners to avoid multiple event catching
                removeGeneralBinding();
                addGeneralBinding();
                // if data have already been saved, they are loaded and diplayed
                getFromJCR(true);
                renderQuestionsList();
                // settings view is displayed
                $(quizSettingsView, rootel).show();
                $(quizDisplayingView, rootel).hide();
            } else {
                // the quiz is displayed
                $(quizSettingsView, rootel).hide();
                $(quizDisplayingView, rootel).show();
                // the quiz is built with the saved data
                getFromJCR(false);
            }
        };
        
        // run the initialization function when the widget object loads
        doInit(showSettings);
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('quiz');
});
