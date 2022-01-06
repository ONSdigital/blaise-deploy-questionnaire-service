Feature: DQS - Generate UACs for cases
  As a BDSS user
  I want to generate UACs for cases in a specific CAWI questionnaire
  So that a UAC is applied against each case in the specific CAWI questionnaire

  # Scenario 1
  Scenario: Generate button exists for questionnaires with CAWI mode and cases
    Given the questionnaire 'DST2106A' is installed
    And 'DST2106A' has the modes 'CATI,CAWI'
    And 'DST2106A' has 5000 cases
    When I go to the questionnaire details page for 'DST2106A'
    Then A generate UAC button is available

  # Scenario 2
  Scenario: Generate button does not exist for questionnaires in CAWI mode without cases
    Given the questionnaire 'DST2106B' is installed
    And 'DST2106B' has the modes 'CATI,CAWI'
    And 'DST2106B' has 0 cases
    When I go to the questionnaire details page for 'DST2106B'
    Then A generate UAC button is not available

  # Scenario 3
  Scenario: Generate button does not exist for questionnaires in CATI mode without cases
    Given the questionnaire 'DST2106C' is installed
    And 'DST2106C' has the modes 'CATI'
    And 'DST2106C' has 0 cases
    When I go to the questionnaire details page for 'DST2106C'
    Then A generate UAC button is not available

  # Scenario 4
  Scenario: Generate button does not exist for questionnaires in CATI mode with cases
    Given the questionnaire 'DST2106D' is installed
    And 'DST2106D' has the modes 'CATI'
    And 'DST2106D' has 5000 cases
    When I go to the questionnaire details page for 'DST2106D'
    Then A generate UAC button is not available

  # Scenario 5
  Scenario: I get a confirmation message when generating UACs
    Given the questionnaire 'DST2106E' is installed
    And 'DST2106E' has the modes 'CATI,CAWI'
    And 'DST2106E' has 5000 cases
    When I go to the questionnaire details page for 'DST2106E'
    And I click generate cases
    Then UACs are generated for 'DST2106E'
  # TODO: Improve generate UAC codes successful response in UI
  # So the UI doesn't actually come back with a success response message, It just reloads the UAC count.
  # This test is just checking that the POST request has been made.
  # I know it's not great but ¯\_(ツ)_/¯.
  # And I receive the confirmation message:
  #   """
  #   Success! Questionaire DST2101A has 5000 UACs populated
  #   """

  # Scenario 6
  Scenario: I get a error message when generating UACs
    Given the questionnaire 'DST2106F' is installed
    And 'DST2106F' has the modes 'CATI,CAWI'
    And 'DST2106F' has 5000 cases
    And UAC generation is broken for 'DST2106F'
    When I go to the questionnaire details page for 'DST2106F'
    And I click generate cases
    # We really should question whether the error being returned is appropriate
    Then I receive an appropriate error describing suitable user actions

  # Scenario 7
  Scenario: I can see how many UACs have been generated for a particular questionnaire in the details page
    Given the questionnaire 'DST2106G' is installed
    And 'DST2106G' has the modes 'CATI,CAWI'
    And 'DST2106G' has 5000 cases
    And 'DST2106G' has 5000 UACs
    When I go to the questionnaire details page for 'DST2106G'
    Then I can see that that the questionnaire has 5000 cases
    And A generate UAC button is available
