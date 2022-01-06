Feature: DQS - Handling of a failure to deploy a questionnaire
  As a Survey Research Officer
  I want to know when a questionnaire has failed to deploy
  So that I can take steps to resolve the issue

  Background:
    Given All Questionnaire installs will fail for 'DST2105'

  # Scenario 1:
  Scenario: Deployment of selected file failure
    Given I have selected the questionnaire package for 'DST2105A' to deploy
    When I confirm my selection
    Then I am presented with an information banner with an error message

  # Scenario 2:
  Scenario: Deploy selected file, retry following failure
    Given I have selected the questionnaire package for 'DST2105B' to deploy
    When I confirm my selection
    Then I am presented with an information banner with an error message
    And I am able to return to the select survey package screen
