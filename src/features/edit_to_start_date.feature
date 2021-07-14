# Created by ThornE1 at 08/07/2021
Feature: Add option to DQS to edit a TO Start Date for an existing instrument
  As a Survey Research Officer
  I want to edit a TO Start Date in DQS
  So that the correct date is applied or I can remove the date

  # Scenario 1:
  Scenario: View TO Start Date if specified
    Given a questionnaire is deployed
    And a TO Start date has been specified
    When I select the questionnaire
    Then I can view the TO Start Date that was specified

  # Scenario 2:
  Scenario: Change TO Start Date if specified
    Given a questionnaire is deployed
    And a TO Start date has been specified
    When I select the questionnaire
    Then I have the option to change or delete the TO Start date

  # Scenario 3:
  Scenario: Add TO Start Date if not previously specified
    Given a questionnaire is deployed
    And no TO Start date has been specified
    When I select the questionnaire
    Then I have the option to add a TO Start date

  # Scenario 4:
  Scenario: Change an existing TO Start Date for a deployed questionnaire
    Given I have selected to change or delete a TO Start Date for a deployed questionnaire
    And I specify a TO Start Date
    When I select the continue button
    Then the TO Start Date is stored against the questionnaire

  # Scenario 5:
  Scenario: Delete a TO Start Date from a deployed questionnaire
    Given I have selected to change or delete a TO Start Date for a deployed questionnaire
    And I delete the TO Start Date
    When I select the continue button
    Then the TO Start Date is deleted from the questionnaire

  # Scenario 6:
  Scenario: Add a TO Start Date to a deployed questionnaire
    Given I have selected to add a TO Start Date for a deployed questionnaire
    And I specify a TO Start Date
    When I select the continue button
    Then the TO Start Date is stored against the questionnaire
