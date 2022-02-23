# Created by ThornE1 at 08/07/2021
Feature: Add option to DQS to edit a TO Start Date for an existing instrument
  As a Survey Research Officer
  I want to edit a TO Start Date in DQS
  So that the correct date is applied or I can remove the date

  # Scenario 1:
  Scenario: View TO Start Date if specified
    Given the questionnaire 'TST2102A' is installed
    And 'TST2102A' has a TO start date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'TST2102A'
    Then I can view the TO Start Date set too '01/12/2021'

  # Scenario 2:
  Scenario: Change TO Start Date if specified
    Given the questionnaire 'TST2102B' is installed
    And 'TST2102B' has a TO start date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'TST2102B'
    Then I have the option to change or delete the TO Start date

  # Scenario 3:
  Scenario: Add TO Start Date if not previously specified
    Given the questionnaire 'TST2102C' is installed
    And 'TST2102C' has no TO start date
    When I load the homepage
    And I select the questionnaire 'TST2102C'
    Then I have the option to add a TO Start date

  # Scenario 4:
  Scenario: Change an existing TO Start Date for a deployed questionnaire
    Given the questionnaire 'TST2102D' is installed
    And 'TST2102D' has a TO start date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'TST2102D'
    And I select to change or delete the TO Start Date
    And I specify the TO start date of '06/01/2022'
    And I select the continue button
    Then the TO start date of '06/01/2022' is stored against 'TST2102D'


  # Scenario 5:
  Scenario: Delete a TO Start Date from a deployed questionnaire
    Given the questionnaire 'TST2102F' is installed
    And 'TST2102F' has a TO start date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'TST2102F'
    And I select to change or delete the TO Start Date
    And I delete the TO Start Date
    And I select the continue button
    Then the TO Start Date is deleted from 'TST2102F'

  # Scenario 6:
  Scenario: Add a TO Start Date to a deployed questionnaire
    Given the questionnaire 'TST2102G' is installed
    And 'TST2102G' has no TO start date
    When I load the homepage
    And I select the questionnaire 'TST2102G'
    And I have slected to add a TO Start Date
    And I specify the TO start date of '18/11/2021'
    And I select the continue button
    Then the TO start date of '18/11/2021' is stored against 'TST2102G'
