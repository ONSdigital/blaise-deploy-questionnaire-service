Feature: Overwrite an existing questionnaire file when survey is NOT live
  As a Survey Research Officer
  I want to be able to overwrite an existing questionnaire deployed in Blaise
  So that I can deploy a new version of the questionnaire

  # Scenario 1:
  Scenario: Select a new questionnaire package file
    Given I have selected the questionnaire package I wish to deploy
    When I confirm my selection and the name/ref of the questionnaire package is the same as one already deployed in Blaise
    Then I am presented with the options to cancel or overwrite the questionnaire

  # Scenario 2:
  Scenario 2: Select to overwrite existing questionnaire when it is live
    Given I have been presented with the options to cancel or overwrite the questionnaire
    When I select to 'overwrite' and the survey is live (within the specified survey days)
    Then I am presented with a warning banner that I cannot overwrite the survey
    And can only return to the landing page

  # Scenario 3:
  Scenario: Select to overwrite existing questionnaire where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)
    Given I have been presented with the options to cancel or overwrite the questionnaire
    When I select to 'overwrite' and there is no sample or respondent data captured for the questionnaire
    Then I am presented with a warning, to confirm overwrite

  # Scenario 3a:
  Scenario: Confirm overwrite of existing questionnaire package where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)
    Given I have been asked to confirm I want to overwrite an existing questionnaire in Blaise
    When I confirm I want to do this
    Then the questionnaire package is deployed and overwrites the existing questionnaire in the SQL database on the Blaise Tel server
    And I am presented with a successful deployment banner on the landing page

  # Scenario 4:
  Scenario: Cancel overwrite of existing questionnaire package
    Given I have been presented with an overwrite warning
    When I confirm that I do NOT want to continue
    Then I am returned to the landing page
