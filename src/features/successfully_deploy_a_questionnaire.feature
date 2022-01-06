Feature: DQS - Successfully deploy a questionnaire
  As a Survey Team Research Officer
  I want to deploy a questionnaire to a Blaise server in the production environment
  So that I can set up a new survey in Blaise 5 for Telephone Operations nudge/data collection

  # Scenario 1:
  Scenario: Successful log in to Questionnaire Deployment Service
    When I load the homepage
    Then I am presented with an option to deploy a new questionnaire

  # Scenario 2:
  Scenario: Select to deploy a new questionnaire
    When I load the homepage
    And I click deploy a questionnaire
    Then I am presented with an option to choose a file containing the questionnaire
    And I can select a questionnaire package for 'DST2201A' to install

  # Scenario 3:
  Scenario: Deploy questionnaire functions disabled
    When I load the homepage
    And I click deploy a questionnaire
    And I have selected a deploy package for '(.*)'
    And I confirm my selection
    Then I am unable to select another file or continue again until the deployment has finished

  # Scenario 3a:
  Scenario: Deploy selected file
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'DST2201B' to deploy
    And 'DST2201B' installs successfully
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    Then the questionnaire package 'DST2201B' is deployed
    Then I am presented with a successful deployment banner on the landing page
