Feature: Abandon deployment if the questionnaire already exists
  As a Survey Research Officer
  I want to know if a questionnaire with the same name/reference is already deployed in Blaise
  So that I do not deploy it again

  # Scenario 1:
  Scenario: Questionnaire package already in Blaise
    Given the questionnaire 'TST2101A' is installed
    And I have selected the questionnaire package for 'TST2101A' to deploy
    When I confirm my selection
    Then I am presented with the options to cancel or overwrite the questionnaire

  # Scenario 2:
  Scenario: Back-out of deploying a questionnaire
    Given the questionnaire 'TST2101A' is installed
    And I have selected the questionnaire package for 'TST2101A' to deploy
    When I confirm my selection
    And I select to 'cancel'
    Then I am returned to the landing page
