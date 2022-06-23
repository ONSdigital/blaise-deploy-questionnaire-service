Feature: Add option to set a Totalmobile 'release date' in DQS
  As an LMS survey research officer
  I want to specify a date on which data must be sent to Totalmobile, when deploying a questionnaire
  So that allocation of field visits is done at the right time within the survey lifecycle

  # Scenario 1:
  Scenario: Present Totalmobile release date selector
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'LMS2109A' to deploy
    When I confirm my selection
    And I select to not provide a TO Start Date
    Then I am presented with an option to specify a Totalmobile release date

  # Scenario 1a:
  Scenario: Non LMS questionnaire does not see the release date selector
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'TST2109A' to deploy
    When I confirm my selection
    And I select to not provide a TO Start Date
    Then I am given a summary of the deployment

  # Scenario 2:
  Scenario: Totalmobile date selected
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'LMS2109A' to deploy
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I specify the Totalmobile release date of '05/06/2030'
    And I select the continue button
    Then I can view the Totalmobile release date is set to '05/06/2030'

  # Scenario 3:
  Scenario: If I select no date to be set
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'LMS2109A' to deploy
    When I confirm my selection
    And I select to not provide a TO Start Date
    When I select to not provide a TM Release Date
    Then the questionnaire is deployed without a TM Release Date

