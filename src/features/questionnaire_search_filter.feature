Feature: DQS - Questionnaire search
  As a Survey Research Officer
  I want to be able to search for a questionnaire in DQS
  So that I can carry out further actions on it

  # Scenario 1
  Scenario: Search for a questionnaire
    Given I have launched the DQS
    When I enter the name of the survey I need to work on
    Then I am presented with that survey at the top of the list

  # Scenario 2
  Scenario: Questionnaire not found
    Given I have entered a questionnaire name and asked to search
    When that questionnaire is not found
    Then I am presented with the following message: Questionnaire not found
