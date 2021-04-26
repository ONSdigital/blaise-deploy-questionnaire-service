Feature: DQS - Attempt to delete a survey and the survey becomes erroneous
  As a Survey Team Research Officer
  I want to delete a questionnaire from a Blaise server in the production environment
  So that questionnaire is no longer visible or accessible

  # Scenario 1:
  Scenario: Attempt to delete an questionnaire with an erroneous status
    Given I can see the questionnaire I want to delete in the questionnaire list
    When I select a link to delete that questionnaire
    Then I am presented with a warning banner that I cannot delete the questionnaire and a service desk must be raised
    And I am unable to delete the questionnaire

  # Scenario 2:
  Scenario: Select to deploy a new questionnaire
    Given I have been presented with a warning that I am about to delete a questionnaire from Blaise
    When I confirm that I want to proceed
    And it failed to delete and becomes erroneous
    Then I am presented with a warning banner informing me that the questionnaire cannot be deleted
