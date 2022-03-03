Feature: Overwrite an existing questionnaire file when survey is NOT live
  As a Survey Research Officer
  I want to be able to overwrite an existing questionnaire deployed in Blaise
  So that I can deploy a new version of the questionnaire

  # Scenario 1:
  Scenario: Select a new questionnaire package file
    Given the questionnaire 'TST2107A' is installed
    And I have selected the questionnaire package for 'TST2107A' to deploy
    When I confirm my selection
    Then I am presented with the options to cancel or overwrite the questionnaire

  # Scenario 2:
  Scenario: Select to overwrite existing questionnaire when it is live
    Given the questionnaire 'TST2107B' is installed
    And I have selected the questionnaire package for 'TST2107B' to deploy
    And 'TST2107B' is live
    When I confirm my selection
    And I select to 'overwrite'
    Then I am presented with a warning banner that I cannot overwrite the survey
    And I can only return to the landing page

  # Scenario 3:
  Scenario: Select to overwrite existing questionnaire where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)
    Given the questionnaire 'TST2107C' is installed
    And I have selected the questionnaire package for 'TST2107C' to deploy
    When I confirm my selection
    And I select to 'overwrite'
    Then I am presented with a warning, to confirm overwrite

  # Scenario 3a:
  Scenario: Confirm overwrite of existing questionnaire package where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)
    Given the questionnaire 'TST2107D' is installed
    And I have selected the questionnaire package for 'TST2107D' to deploy
    When I confirm my selection
    And I select to 'overwrite'
    And I confirm 'overwrite'
    Then the questionnaire package 'TST2107D' is deployed
    And I am presented with a successful deployment banner on the landing page

  # Scenario 4:
  Scenario: Cancel overwrite of existing questionnaire package
    Given the questionnaire 'TST2107E' is installed
    And I have selected the questionnaire package for 'TST2107E' to deploy
    When I confirm my selection
    And I select to 'overwrite'
    And I confirm that I do NOT want to continue
    Then I am returned to the landing page
