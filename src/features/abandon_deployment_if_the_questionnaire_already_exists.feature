Feature: Abandon deployment if the questionnaire already exists
  As a Survey Research Officer
  I want to know if a questionnaire with the same name/reference is already deployed in Blaise
  So that I do not deploy it again

  # Scenario 1:
  Scenario: Questionnaire package already in Blaise
    Given I have selected the questionnaire package I wish to deploy
    When I confirm my selection and the name/ref of the questionnaire package is the same as one already deployed in Blaise
    Then I am presented with the options to cancel or overwrite the questionnaire

  # Scenario 2
  Scenario: Back-out of deploying a questionnaire
    Given I have been presented with the options: Cancel or Overwrite
    When I select to 'cancel'
    Then I am returned to the landing page

