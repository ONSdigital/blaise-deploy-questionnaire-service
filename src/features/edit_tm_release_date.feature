Feature: Add option to DQS to edit/change a Tm Release Date for an existing questionnaire
  As a survey research officer
  I want to be able to change a previously save Totalmobile release date via DQS
  So that I can amend mistakes or make changes in line with survey decisions

  Background:
    Given the questionnaire 'LMS2101_AA1' is installed

  # Scenario 1:
  Scenario: View the Totalmobile release date if specified
    Given 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I go to the questionnaire details page for 'LMS2101_AA1'
    And I select to change or delete the Totalmobile release date
    Then I am able to view the date selection form
#    And the previously selected date '01/12/2021' is pre-populated

  # Scenario 2:
  Scenario: Make no change to previously selected release date
#    Given I have been presented with the date selection form with previously selected date displayed
#    When I do not select a new date
#    And do not remove the pre selected date
#    Then I can continue or cancel
#    And return to the questionnaire details page
#
#  # Scenario 3:
#  Scenario: Select a new release date
#    Given I have been presented with the date selection form
#    When I select a new date
#    Then the date field is populated
#    And I can continue to the questionnaire details page
#
#  # Scenario 4:
#  Scenario: New date is displayed on questionnaire details page
#    Given I have changed the Totalmobile release date
#    When I continue to the questionnaire details page
#    Then I will see the new date displayed against the Totamobile release date heading
#
#  # Scenario 5:
#  Scenario: New date selected but transaction cancelled
#    Given I have been presented with the date selection form
#    When I select a new date
#    And then select 'Cancel'
#    Then I am returned to the questionnaire details page
#    And the original date (prior to new selection) is displayed
#
#  # Scenario 6:
#  Scenario: Delete Totalmobile release date in questionnaire details
#    Given I have been presented with the date selection form
#    When I select 'No release date'
#    Then I am returned to the questionnaire details page
#    And the original date has been deleted
