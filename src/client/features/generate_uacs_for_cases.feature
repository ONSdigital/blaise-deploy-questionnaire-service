Feature: DQS - Generate Unique Access Codes for cases
  As a BDSS user
  I want to generate Unique Access Codes for cases in a specific CAWI questionnaire
  So that a Unique Access Code is applied against each case in the specific CAWI questionnaire

  # Scenario 1
  Scenario: Generate button exists for questionnaires with CAWI mode and cases
    Given the questionnaire 'TST2106A' is installed
    And 'TST2106A' has the modes 'CATI,CAWI'
    And 'TST2106A' has 5000 cases
    When I go to the questionnaire details page for 'TST2106A'
    Then A generate Unique Access Codes button is available

  # Scenario 2
  Scenario: Generate button does not exist for questionnaires in CAWI mode without cases
    Given the questionnaire 'TST2106B' is installed
    And 'TST2106B' has the modes 'CATI,CAWI'
    And 'TST2106B' has 0 cases
    When I go to the questionnaire details page for 'TST2106B'
    Then A generate Unique Access Codes button is not available

  # Scenario 3
  Scenario: Generate button does not exist for questionnaires in CATI mode without cases
    Given the questionnaire 'TST2106C' is installed
    And 'TST2106C' has the modes 'CATI'
    And 'TST2106C' has 0 cases
    When I go to the questionnaire details page for 'TST2106C'
    Then A generate Unique Access Codes button is not available

  # Scenario 4
  Scenario: Generate button does not exist for questionnaires in CATI mode with cases
    Given the questionnaire 'TST2106D' is installed
    And 'TST2106D' has the modes 'CATI'
    And 'TST2106D' has 5000 cases
    When I go to the questionnaire details page for 'TST2106D'
    Then A generate Unique Access Codes button is not available

  # Scenario 5
  Scenario: I get a confirmation message when generating Unique Access Codes
    Given the questionnaire 'TST2106E' is installed
    And 'TST2106E' has the modes 'CATI,CAWI'
    And 'TST2106E' has 5000 cases
    When I go to the questionnaire details page for 'TST2106E'
    And I click generate cases
    Then Unique Access Codes are generated for 'TST2106E'
  # TODO: Improve generate Unique Access Codes successful response in UI
  # So the UI doesn't actually come back with a success response message, It just reloads the Unique Access Code count.
  # This test is just checking that the POST request has been made.
  # I know it's not great but ¯\_(ツ)_/¯.
  # And I receive the confirmation message:
  #   """
  #   Success! Questionaire TST2101A has 5000 Unique Access Codes populated
  #   """

  # Scenario 6
  Scenario: I get a error message when generating Unique Access Codes
    Given the questionnaire 'TST2106F' is installed
    And 'TST2106F' has the modes 'CATI,CAWI'
    And 'TST2106F' has 5000 cases
    And Unique Access Code generation is broken for 'TST2106F'
    When I go to the questionnaire details page for 'TST2106F'
    And I click generate cases
    # We really should question whether the error being returned is appropriate
    Then I receive an appropriate error describing suitable user actions

  # Scenario 7
  Scenario: I can see how many Unique Access Codes have been generated for a particular questionnaire in the details page
    Given the questionnaire 'TST2106G' is installed
    And 'TST2106G' has the modes 'CATI,CAWI'
    And 'TST2106G' has 5000 cases
    And 'TST2106G' has 5000 Unique Access Codes
    When I go to the questionnaire details page for 'TST2106G'
    Then I can see that that the questionnaire has 5000 cases
    And A generate Unique Access Codes button is available
