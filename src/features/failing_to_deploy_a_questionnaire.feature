Feature: DQS - Handling of a failure to deploy a questionnaire
  As a Survey Research Officer
  I want to know when a questionnaire has failed to deploy
  So that I can take steps to resolve the issue

  # Scenario 1:
  Scenario: Deployment of selected file failure
    Given I have selected the questionnaire package I wish to deploy
    When I confirm my selection and the questionnaire fails to deploy
    Then I am presented with an information banner with an error message

  # Scenario 2:
  Scenario: Deploy selected file, retry following failure
    Given I have selected to deploy a questionnaire package
    When the package fails to deploy and I'm presented with a failure message
    Then I am able to return to the select survey package screen
