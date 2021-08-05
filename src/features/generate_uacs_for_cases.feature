Feature: DQS - Generate UACs for cases
  As a BDSS user
  I want to generate UACs for cases in a specific CAWI questionnaire
  So that a UAC is applied against each case in the specific CAWI questionnaire

  # Scenario 1
  Scenario: Generate button exists for questionnaires with CAWI mode and cases
    Given an instrument is installed in CAWI mode
    And it has 5000 cases
    When I go to the questionnaire details page
    Then A generate UAC button is available

  # Scenario 2
  Scenario: Generate button does not exist for questionnaires in CAWI mode without cases
    Given an instrument is installed in CAWI mode
    And it has no cases
    When I go to the questionnaire details page
    Then A generate UAC button is not available

  # Scenario 3
  Scenario: Generate button does not exist for questionnaires in CATI mode without cases
    Given an instrument is installed in CATI mode
    And it has no cases
    When I go to the questionnaire details page
    Then A generate UAC button is not available

  # Scenario 4
  Scenario: Generate button does not exist for questionnaires in CATI mode with cases
    Given an instrument is installed in CATI mode
    And it has 5000 cases
    When I go to the questionnaire details page
    Then A generate UAC button is not available

  # Scenario 5
  Scenario: I get a confirmation message when generating UACs
    Given an instrument is installed in CAWI mode
    And it has 5000 cases
    When I go to the questionnaire details page
    And I click generate cases
    Then I receive the confirmation message:
    """
    Success! Questionaire DST2101A has 5000 UACs populated
    """

  # Scenario 6
  Scenario: I get a error message when generating UACs
    Given an instrument is installed in CAWI mode
    And it has 5000 cases
    When I go to the questionnaire details page
    And I click generate cases
    And generating cases errors
    Then I receive an appropriate error describing suitable user actions

  # Scenario 7
  Scenario: I can see how many UACs have been generated for a particular questionnaire in the details page
    Given an instrument is installed in CAWI mode
    And it has 5000 cases
    And it has 5000 UACs
    When I go to the questionnaire details page
    Then I can see that that the questionnaire has 5000 cases
    And A generate UAC button is available
