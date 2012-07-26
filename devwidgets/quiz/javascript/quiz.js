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
        var $quizContainerAddNewQuestion = $('#quiz_container_add_newquestion');
        var $quizContainerAddNewAnswerButton = $('#quiz_container_add_newanswer_button');
        var $quizContainerRemoveLastAnswerButton = $('#quiz_container_remove_lastanswer_button');
        var $quizContainerAddNewQuestionTable = $('#quiz_container_add_newquestion_table');
        var quizContainerAddNewQuestionTable = '#quiz_container_add_newquestion_table';
        var quizAddNewQuestionTableTemplate = 'quiz_add_newquestion_table_template';
        var quizContainerAddNewQuestionQuestion = '#quiz_container_add_newquestion_question';
        var quizContainerAddNewQuestionAnswer_0 = '#quiz_container_add_newquestion_answer_0';
        var quizContainerAddNewQuestionAnswer_1 = '#quiz_container_add_newquestion_answer_1';
        var $quizContainerAddNewQuestionToList = $('.quiz_container_add_newquestion_to_list');
        var $quizContainerAddNewQuestionRaquoRight = $('#quiz_container_add_newquestion_raquo_right');
        var quizContainerAddNewQuestionCorrectComment = $('#quiz_container_add_newquestion_correctcomment');
        var quizContainerAddNewQuestionIncorrectComment = $('#quiz_container_add_newquestion_incorrectcomment');
        var $quizContainerQuestionListUl = $('#quiz_container_questionlist_ul');
        var quizContainerQuestionListTemplate = 'quiz_container_questionlist_template';
        var $quizContainerQuestionToRemove = $('.quiz_container_question_to_remove');
        var buttonDisabled = "s3d-disabled";
        var answersNumber = 1;
        var questionsNumber = -1;
        var questionsList = [];
        var minAnswersNumber = 1;
        var questionCanBeSaved = false;
        
        
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
        var checkIfInputValid = function() {
            var question = $(quizContainerAddNewQuestionQuestion).val();
            var answer0 = $(quizContainerAddNewQuestionAnswer_0).val();
            var answer1 = $(quizContainerAddNewQuestionAnswer_1).val();

            // check if the user didn't just fill in some spaces
            return (question.replace(/ /g, "") !== "" && answer0.replace(/ /g, "") !== "" && answer1.replace(/ /g, "") !== "");
        };
               
        var checkIfAnswerValid = function(answer) {
            // check if the user didn't just fill in some spaces
            return (answer.replace(/ /g, "") !== "");
        };
        
        var constructQuestionToAdd = function() {
        	var answersTable = [];
        	var answerInputs;
        	var answerTextInput;
        	var answerCheckboxInput = false;
        	var rows = $(quizContainerAddNewQuestionTable).find('tr');
        	
        	questionsNumber++;
        	
        	for (var i = 1 ; i < rows.length ; i++) {
        		answerInputs = $(rows[i]).find('td');
				answerTextInput = $($(answerInputs[0]).find('input')).val();
        		if (checkIfAnswerValid(answerTextInput)) {
        			if(($(answerInputs[1]).find('input')).checked) {
        				answerCheckboxInput = true;
        			}
        			answersTable[i] = {
        				"option": answerTextInput,
        				"correct" : answerCheckboxInput
        			}
        		}
        	}
        	
        	var contentQuestion = {
        		"id": questionsNumber,
        		"q" : $(quizContainerAddNewQuestionQuestion).val(),
        		"a" : answersTable,
        		"correct" : $(quizContainerAddNewQuestionCorrectComment).val(),
        		"incorrect" : $(quizContainerAddNewQuestionIncorrectComment).val()
        	};
        	questionsList.push(contentQuestion);
        };

        /** Binds all the regional settings select box change **/
        $('.question_required', $quizContainerAddNewQuestion).keyup(function(e) {
            // enable the save button
            if (checkIfInputValid()) {
            	enableElements($($quizContainerAddNewQuestionToList));
            	enableElements($($quizContainerAddNewQuestionRaquoRight));
            	questionCanBeSaved = true;
            }
            else {
           		if (questionCanBeSaved) {
            		disableElements($($quizContainerAddNewQuestionToList));
            		disableElements($($quizContainerAddNewQuestionRaquoRight));
            		questionCanBeSaved = false;
           	 	}
           	 }
        });
        
        $quizContainerAddNewAnswerButton.on('click', function() {
        		answersNumber++;
        		var templateData = {
	                'answersNumber': answersNumber
	            };
	            $quizContainerAddNewQuestionTable.append(
                    sakai.api.Util.TemplateRenderer(quizAddNewQuestionTableTemplate, templateData)
                );
        });
        
        $quizContainerRemoveLastAnswerButton.on('click', function() {
        		if (answersNumber > minAnswersNumber) {
        			answersNumber--;
        			var rows = $(quizContainerAddNewQuestionTable).find('tr');
        			$(rows[rows.length-1]).remove();
        		}
        });
        
        $quizContainerAddNewQuestionRaquoRight.live('click', function() {
        	addQuestionToList();
        	resetQuestionInputs();
        });
        
        $quizContainerAddNewQuestionToList.on('click', function() {
        	addQuestionToList();
        	resetQuestionInputs();
        });
        
        $quizContainerQuestionToRemove.live('click', function(){
        	var index = $(this).parent()[0].id.split('quiz_container_question_to_add_')[1];
        	questionsList.splice(index,1);
        	questionsNumber--;
        	renderQuestionsList();
        });
        
        var addQuestionToList = function() {
        	if(questionCanBeSaved) {
	        	constructQuestionToAdd();
	        	renderQuestionsList();
	        }
        }
        
        var renderQuestionsList = function() {
        	var templateData = {
        		'questions': questionsList
			};
		
        	$quizContainerQuestionListUl.html(
                    sakai.api.Util.TemplateRenderer(quizContainerQuestionListTemplate, templateData)
             );
        }
        
        var resetQuestionInputs = function() {
        	$(quizContainerAddNewQuestionQuestion).val('');
        	$(quizContainerAddNewQuestionCorrectComment).val('');
        	$(quizContainerAddNewQuestionIncorrectComment).val('');
        	$(quizContainerAddNewQuestionAnswer_0).val('');
        	$(quizContainerAddNewQuestionAnswer_1).val('');
        	disableElements($($quizContainerAddNewQuestionToList));
        	disableElements($($quizContainerAddNewQuestionRaquoRight));
            questionCanBeSaved = false;
        	$(quizContainerAddNewQuestionTable).find('tr').each(function() {
        		if ($(this).attr('class') != 'cant_be_deleted') {
        			$(this).remove();
        		}
        	});
        }
        
        var doInit = function () {
        	renderQuestionsList();
        };

        // run the initialization function when the widget object loads
        doInit();
	}
	
	sakai.api.Widgets.widgetLoader.informOnLoad('quiz');
});
