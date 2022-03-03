Feature: DQS - Attempt to delete a survey and the survey becomes erroneous
  As a Survey Team Research Officer
  I want to delete a questionnaire from a Blaise server in the production environment
  So that questionnaire is no longer visible or accessible

  # Scenario 1:
  Scenario: Attempt to delete an questionnaire with an erroneous status
    Given the questionnaire 'TST2103A' is installed
    And 'TST2103A' is erroneous
    When I load the homepage
    And I select a link to delete the 'TST2103A' questionnaire
    Then I am presented with a warning banner that I cannot delete the questionnaire and a service desk must be raised
    And I am unable to delete the questionnaire
    And I can return to the questionnaire list

  # Scenario 2:
  Scenario: Select to deploy a new questionnaire
    Given the questionnaire 'TST2103B' is installed
    And 'TST2103B' cannot be deleted because it would go erroneous
    When I load the homepage
    And I select a link to delete the 'TST2103B' questionnaire
    And I confirm that I want to proceed
    Then I am presented with a warning banner informing me that the questionnaire cannot be deleted
