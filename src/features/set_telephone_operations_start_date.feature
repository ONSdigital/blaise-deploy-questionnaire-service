Feature: DQS - Set a TO Start Date during deployment
  As a Survey Research Officer
  I want to set a Telephone Operations start date in the Deploy Questionnaire Service
  So that Telephone Interviewers can't access the questionnaire in TOBI until the survey is ready for telephone interviewers

  #  Scenario 1:
  Scenario: Present TO Start Date option
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'DST2109A' to deploy
    When I confirm my selection
    Then I am presented with an option to specify a TO Start Date

  #  Scenario 2:
  Scenario: Enter TO Start Date
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'DST2109B' to deploy
    When I confirm my selection
    And I specify the TO start date of '05/06/2030'
    And I select the continue button
    And I can view the TO Start Date set too '05/06/2030'

  #  Scenario 3:
  Scenario: Do not enter TO Start Date
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'DST2109C' to deploy
    When I confirm my selection
    And I select to not provide a TO Start Date
    Then the questionnaire is deployed without a TO Start Date

  #  Non Functional Requirements:

  #  Scenario 4:
  Scenario: Setting the TO Start Date fails during deployment
    Given no questionnaires are installed
    And setting a TO start date for 'DST2109D' fails
    And I have selected the questionnaire package for 'DST2109D' to deploy
    When I confirm my selection
    And I specify the TO start date of '05/06/2030'
    And I select the continue button
    And I deploy the questionnaire
    Then I am presented with an information banner with an error message:
      """
    Failed to store telephone operations start date specified
      """

  #  Scenario 5:
  # This logic is handled in the Node.js Sever so tests are there in: ./server/BimsAPI/set_to_start_date_server.test.ts
  @server
  Scenario: Overwrite questionnaire and previous TO Start Date with new
    Given a pre-deployed questionnaire that already has a TO Start Date stored against it
    When a TO Start Date is specified
    Then the new TO Start Date will overwrite the previous

  #  Scenario 6:
  # This logic is handled in the Node.js Sever so tests are there in: ./server/BimsAPI/set_to_start_date_server.test.ts
  @server
  Scenario: Overwrite questionnaire and remove previous TO Start Date
    Given a pre-deployed questionnaire that already has a TO Start Date stored against it
    When a TO Start Date is not specified
    Then the original TO Start Date is removed from data store
