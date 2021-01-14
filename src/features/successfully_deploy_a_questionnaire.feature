Feature: DQS - Successfully deploy a questionnaire

  # Scenario 1:
  Scenario: Successful log in to Questionnaire Deployment Service
    Given I have launched the Questionnaire Deployment Service
    When I view the landing page
    Then I am presented with an option to deploy a new questionnaire

  # Scenario 2:
  Scenario: Select to deploy a new questionnaire
    Given I have selected to deploy a new questionnaire
    When I am presented with an option to choose a file containing the questionnaire
    Then I am able to select a pre-prepared questionnaire package from a folder/file share

  # Scenario 3:
  Scenario: Deploy questionnaire functions disabled
    Given I have selected the questionnaire package I wish to deploy
    When I confirm my selection
    Then I am unable to select another file or continue again until the deployment has finished

  # Scenario 3a:
  Scenario: Deploy selected file
    Given I have selected the questionnaire package I wish to deploy
    When I confirm my selection
    Then the questionnaire package is deployed and populates a SQL database on the Blaise Tel server
    And I am presented with a successful deployment information banner

