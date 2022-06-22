Feature: Add option to DQS to edit/change a Tm Release Date for an existing questionnaire
  As a survey research officer
  I want to be able to change a previously save Totalmobile release date via DQS
  So that I can amend mistakes or make changes in line with survey decisions

  Background:
    Given the questionnaire 'LMS2101_AA1' is installed

  # Scenario 1:
  Scenario: View the Totalmobile release date if specified and return to the questionnaire details page
    Given 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I go to the questionnaire details page for 'LMS2101_AA1'
    And I choose to change or delete the Totalmobile release date
    Then I am able to view the date selection form

    And the previously selected date '01/12/2021' is pre-populated
    And I can select 'continue' or 'cancel'
#    And I am returned to the questionnaire details page

  # Scenario 2:
  Scenario: Select a new release date and return to the questionnaire details page
    Given 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I go to the questionnaire details page for 'LMS2101_AA1'
    And I choose to change or delete the Totalmobile release date
    Then I am able to view the date selection form

#    When I select a new date
#    Then the date field is populated
#    And I can continue to the questionnaire details page
#    Then I will see the new date displayed against the Totamobile release date heading

  # Scenario 3:
  Scenario: Select a new release date but cancel the transaction before returning to the questionnaire details page
    Given 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I go to the questionnaire details page for 'LMS2101_AA1'
    And I choose to change or delete the Totalmobile release date
    Then I am able to view the date selection form

#    When I select a new date
#    And then select 'Cancel'
#    Then I am returned to the questionnaire details page
#    And the original date (prior to new selection) is displayed

   # Scenario 4:
  Scenario: Delete Totalmobile release date and return to questionnaire details
    Given 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I go to the questionnaire details page for 'LMS2101_AA1'
    And I choose to change or delete the Totalmobile release date
    Then I am able to view the date selection form

#    When I select 'No release date'
#    Then I am returned to the questionnaire details page
#    And the original date has been deleted
