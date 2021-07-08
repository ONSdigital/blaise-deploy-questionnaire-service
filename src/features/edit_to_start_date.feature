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
