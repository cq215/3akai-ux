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
require(['jquery', 'sakai/sakai.api.core', 'jquery-ui'], function($, sakai) {

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
        var questionCanBeSaved = false;
        
        //Node
        var $quizNewQuestionForm = $('#quiz_newquestion_form');
        var $quizNewQuestionAddButton = $('#quiz_newquestion_add_button');
        var $quizNewQuestionRemoveButton = $('#quiz_newquestion_remove_button');
        var $quizNewQuestionTable = $('#quiz_newquestion_table');
        var $quizNewQuestionAddToList = $('#quiz_newquestion_addtolist');
        var $quizNewQuestionRaquoRight = $('#quiz_newquestion_raquo_right');
        var quizNewQuestionCorrectComment = $('#quiz_newquestion_correctcomment');
        var quizNewQuestionIncorrectComment = $('#quiz_newquestion_incorrectcomment');
      	var $quizQuestionsListCreatedItems = $('#quiz_questionslist_createditems');
        var $quizQuestionsListRemoveButton = $('.quiz_questionslist_remove_button');
        var $quizQuestionsListDetailsButton = $('.quiz_questionslist_details_button');
        var $quizContainerQuestionDetails = $('#quiz_container_questiondetails'); 
        var $quizQuestionDetailsClose = $('#quiz_questiondetails_close');
        
        //Class
        var newQuestionRequired = '.newquestion_required';
        var buttonDisabled = 's3d-disabled';
        var quizQuestionsListSortableList = 'quiz_questionslist_sortablelist';
        var cantBeDeleted = 'cant_be_deleted';
        
        //Id 
        var quizNewQuestionTable = '#quiz_newquestion_table';
        var quizNewQuestionQuestion = '#quiz_newquestion_question';
        var quizNewQuestionAnswer_0 = '#quiz_newquestion_answer_0';
        var quizNewQuestionAnswer_1 = '#quiz_newquestion_answer_1';
        var quizQuestionsListItem = 'quiz_questionslist_item_';
        var quizQuestionDetailsModify = '#quiz_questiondetails_modify';
        var quizQuestionDetailsSaveModification = '#quiz_questiondetails_savemodification';
        var quizQuestionDetailsRemoveButton = '#quiz_questiondetails_remove_button';
        var quizQuestionDetailsAddButton = '#quiz_questiondetails_add_button';

        
        //Template 
        var quizNewQuestionAddNewAnswerTableTemplate = 'quiz_newquestion_add_newanswer_table_template';
        var quizQuestionsDetailsAddNewAnswerTableTemplate = 'quiz_questiondetails_add_newanswer_table_template';
        var quizQuestionsListTemplate = 'quiz_questionslist_template';
        var quizQuestionDetailsTemplate = 'quiz_questiondetails_template';
        
        
        
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
            var question = $(quizNewQuestionQuestion).val();
            var answer0 = $($(quizNewQuestionAnswer_0).find('input[type=text]')[0]).val();
            var answer1 = $($(quizNewQuestionAnswer_1).find('input[type=text]')[0]).val();

            // check if the user didn't just fill in some spaces
            return (question.replace(/ /g, "") !== "" && answer0.replace(/ /g, "") !== "" && answer1.replace(/ /g, "") !== "");
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
        	var rows = $(quizNewQuestionTable).find('tr');
        	
        	questionsNumber++;
        	
        	for (var i = 1 ; i < rows.length ; i++) {
        		answerCheckboxInput = false;
        		answerInputs = $(rows[i]).find('td');
				answerTextInput = $($(answerInputs[0]).find('input')).val();
        		if (checkIfAnswerValid(answerTextInput)) {
        			if($($(answerInputs[1]).find('input')).is(':checked')) {
        				answerCheckboxInput = true;
        			}
        			answersTable[i] = {
        				"option": answerTextInput,
        				"correct" : answerCheckboxInput
        			}
        		}
        	}
        	
        	var contentQuestion = {
        		"q" : $(quizNewQuestionQuestion).val(),
        		"a" : answersTable,
        		"correct" : $(quizNewQuestionCorrectComment).val(),
        		"incorrect" : $(quizNewQuestionIncorrectComment).val()
        	};
        	
        	if (index) {
        		questionsList[index] = contentQuestion;
        	}
        	else {
        		questionsList.push(contentQuestion);
        	}	
        };

        /** Binds all the regional settings select box change **/
        $(newQuestionRequired, $quizNewQuestionForm).keyup(function(e) {
            // enable the save button
            if (checkIfInputValid()) {
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
        });
        
        $quizNewQuestionAddButton.on('click', function() {
        		answersNumber++;
	            $quizNewQuestionTable.append(
                    sakai.api.Util.TemplateRenderer(quizNewQuestionAddNewAnswerTableTemplate, templateData)
                );
        });
        
        $quizNewQuestionRemoveButton.on('click', function() {
        		if (answersNumber > minAnswersNumber) {
        			answersNumber--;
        			var rows = $(quizNewQuestionTable).find('tr');
        			$(rows[rows.length-1]).remove();
        		}
        });  
        
        $quizNewQuestionRaquoRight.live('click', function() {
        	addQuestionToList();
        	resetQuestionInputs();
        });
        
        $quizNewQuestionAddToList.on('click', function() {
        	addQuestionToList();
        	resetQuestionInputs();
        });
        
        $quizQuestionsListDetailsButton.live('click', function() {
        		var parentId = $(this).parent()[0].id;
        		var index = parentId.split(quizQuestionsListItem)[1];
	        	var templateData = questionsList[index];
	        	questionInModification = index;
	        	answersNumberQuestionDetails = templateData["a"].length-2;
				$quizContainerQuestionDetails.show();
				$quizContainerQuestionDetails.html(sakai.api.Util.TemplateRenderer(quizQuestionDetailsTemplate, templateData));

             	/*bug......*/
        });
        
        $quizQuestionsListRemoveButton.live('click', function() {
        	var index = $(this).parent()[0].id.split(quizQuestionsListItem)[1];
        	questionsList.splice(index,1);
        	questionsNumber--;
        	renderQuestionsList();
        });
        
        $quizQuestionDetailsClose.live('click', function() {
        	$quizContainerQuestionDetails.hide();
        });
        
        $(quizQuestionDetailsModify).live('click', function() {
        	$(this).parent().parent().find('input').each(function() {
        		enableElements($(this));
        	});
        	$(this).parent().parent().find('textarea').each(function() {
        		enableElements($(this));
        	});
        	$(this).parent().parent().find('button').each(function() {
        		enableElements($(this));
        	});
        	disableElements($(this));
        });
        
        $(quizQuestionDetailsSaveModification).live('click', function() {
        	constructQuestionToAdd(questionInModification);
        	renderQuestionsList();
        });
        
		$(quizQuestionDetailsAddButton).live('click', function() {
			answersNumberQuestionDetails++;
			var templateData = {
				'answersNumber' : answersNumber
			};
			$(this).parent().parent().parent().find('#quiz_questiondetails_table').append(sakai.api.Util.TemplateRenderer(quizQuestionsDetailsAddNewAnswerTableTemplate, templateData));
		});
		
		$(quizQuestionDetailsRemoveButton).live('click', function() {
			if(answersNumberQuestionDetails > minAnswersNumber) {
				answersNumberQuestionDetails--;
				var rows = $(this).parent().parent().parent().find('#quiz_questiondetails_table').find('tr');
				$(rows[rows.length - 1]).remove();
			}
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
		
        	$quizQuestionsListCreatedItems.html(
                    sakai.api.Util.TemplateRenderer(quizQuestionsListTemplate, templateData)
             );
             
            $(quizQuestionsListSortableList).sortable({
            	connectWith: quizQuestionsListSortableList,
                revert: true,
                opacity: 0.5,
                tolerance: 'intersect'
            });
        }
        
        var resetQuestionInputs = function() {
        	$(quizNewQuestionQuestion).val('');
        	$(quizNewQuestionCorrectComment).val('');
        	$(quizNewQuestionIncorrectComment).val('');
        	
        	disableElements($quizNewQuestionAddToList);
        	disableElements($quizNewQuestionRaquoRight);
            questionCanBeSaved = false;
        	$(quizNewQuestionTable).find('tr').each(function() {
        		if ($(this).attr('class') != cantBeDeleted) {
        			$(this).remove();
        		}
        		else {
            		$($(quizNewQuestionAnswer_0).find('input[type=text]')[0]).val('');
           			$($(quizNewQuestionAnswer_1).find('input[type=text]')[0]).val('');
        			$($(this).find('input[type=checkbox]')[0]).attr('checked', false);
        		}
        	});
        	answersNumber = minAnswersNumber;
        }
        
        var doInit = function () {
        	renderQuestionsList();
        };

        // run the initialization function when the widget object loads
        doInit();
	}
	
	sakai.api.Widgets.widgetLoader.informOnLoad('quiz');
});
