Feature: Add option to DQS to edit a Tm Release Date for an existing questionnaire
  As a Survey Research Officer
  I want to edit a Tm Release Date in DQS
  So that the correct date is applied or I can remove the date

  # Scenario 1:
  Scenario: View Totalmobile release date if specified
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
    Then I can view the Totalmobile release date is set to '01/12/2021'

  # Scenario 2:
  Scenario: Change Totalmobile release date if specified
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
    Then I have the option to change or delete the Totalmobile release date

  # Scenario 3:
  Scenario: Add Totalmobile release date if not previously specified
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has no Totalmobile release date
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
    Then I have the option to add a Totalmobile release date

  # Scenario 4:
  Scenario: Change an existing Totalmobile release date for a deployed questionnaire
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
    And I select to change or delete the Totalmobile release date
    And I specify the Totalmobile release date of '06/01/2022'
    And I select the continue button
    Then the Totalmobile release date of '06/01/2022' is stored against 'LMS2101_AA1'


  # Scenario 5:
  Scenario: Delete a Totalmobile release date from a deployed questionnaire
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has a Totalmobile release date of '01/12/2021'
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
    And I select to change or delete the Totalmobile release date
    And I delete the Totalmobile release date
    And I select the continue button
    Then the Totalmobile release date is deleted from 'LMS2101_AA1'

  # Scenario 6:
  Scenario: Add a Totalmobile release date to a deployed questionnaire
    Given the questionnaire 'LMS2101_AA1' is installed
    And 'LMS2101_AA1' has no Totalmobile release date
    When I load the homepage
    And I select the questionnaire 'LMS2101_AA1'
    And I have selected to add a Totalmobile release date
    And I specify the Totalmobile release date of '18/11/2021'
    And I select the continue button
    Then the Totalmobile release date of '18/11/2021' is stored against 'LMS2101_AA1'
