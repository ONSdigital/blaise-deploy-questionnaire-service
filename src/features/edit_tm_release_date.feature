# Created by ThornE1 at 08/07/2021
Feature: Add option to DQS to edit a Tm Release Date for an existing questionnaire
  As a Survey Research Officer
  I want to edit a Tm Release Date in DQS
  So that the correct date is applied or I can remove the date

  # Scenario 1:
  Scenario: View Tm Release Date if specified
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has a Tm Release Date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
#    Then I can view the TM Release Date is set to '01/12/2021'

  # Scenario 2:
  Scenario: Change Tm Release Date if specified
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has a Tm Release Date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
#    Then I have the option to change or delete the Totalmobile release date

  # Scenario 3:
  Scenario: Add Tm Release Date if not previously specified
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has no Tm Release Date
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
#    Then I have the option to add a Tm Release Date

  # Scenario 4:
  Scenario: Change an existing Tm Release Date for a deployed questionnaire
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has a Tm Release Date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
#    And I select to change or delete the Tm Release Date
#    And I specify the Tm Release Date of '06/01/2022'
#    And I select the continue button
#    Then the Tm Release Date of '06/01/2022' is stored against 'TST2102D'


  # Scenario 5:
  Scenario: Delete a Tm Release Date from a deployed questionnaire
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has a Tm Release Date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
#    And I select to change or delete the Tm Release Date
#    And I delete the Tm Release Date
#    And I select the continue button
#    Then the Tm Release Date is deleted from 'LMS2101_AA1'

  # Scenario 6:
  Scenario: Add a Tm Release Date to a deployed questionnaire
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has no Tm Release Date
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
#    And I have selected to add a Tm Release Date
#    And I specify the Tm Release Date of '18/11/2021'
#    And I select the continue button
#    Then the Tm Release Date of '18/11/2021' is stored against 'LMS2101_AA1'
