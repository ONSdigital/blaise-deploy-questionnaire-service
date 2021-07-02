Feature: DQS - Set a TO Start Date during deployment
  As a Survey Research Officer
  I want to set a Telephone Operations start date in the Deploy Questionnaire Service
  So that Telephone Interviewers can't access the questionnaire in TOBI until the survey is ready for telephone interviewers

  #  Scenario 1:
  Scenario: Present TO Start Date option
    Given a questionnaire is deployed using DQS
    When I select a file to deploy
    Then I am presented with an option to specify a TO Start Date

  #  Scenario 2:
  Scenario: Enter TO Start Date
    Given I am presented with an option to specify a TO Start Date
    When I enter a date
    Then the date is stored against the questionnaire
    And displayed in DQS against the questionnaire information

  #  Scenario 3:
  Scenario: Do not enter TO Start Date
    Given I am presented with an option to specify a live date
    When I select to not provide a TO Start Date
    Then the questionnaire is deployed without a TO Start Date

#  Non Functional Requirements:

  #  Scenario 4:
  Scenario: Setting the TO Start Date fails during deployment
    Given I have selected the questionnaire package I wish to deploy
    And set a TO Start Date
    When I confirm my selection
    And the set TO Start Date fails
    Then I am presented with an information banner with an error message

  #  Scenario 5:
  # This logic is handled in the Node.js Sever so tests are there in :
  # TODO: ADD Filename here
  @server
  Scenario: Overwrite questionnaire and previous TO Start Date with new
    Given a pre-deployed questionnaire that already has a TO Start Date stored against it
    When a TO Start Date is specified
    Then the new TO Start Date will overwrite the previous

  #  Scenario 6:
  # This logic is handled in the Node.js Sever so tests are there in :
  # TODO: ADD Filename here
  @server
  Scenario: Overwrite questionnaire and remove previous TO Start Date
    Given a pre-deployed questionnaire that already has a TO Start Date stored against it
    When a TO Start Date is not specified
    Then the original TO Start Date is removed from data store
