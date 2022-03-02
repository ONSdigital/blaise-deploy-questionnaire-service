Feature: DQS - Questionnaire search
  As a Survey Research Officer
  I want to be able to search for a questionnaire in DQS
  So that I can carry out further actions on it

  # Scenario 1
  Scenario: Search for a questionnaire
    Given the questionnaire 'TST2108A' is installed
    And the questionnaire 'TST2108B' is installed
    And the questionnaire 'TST2108C' is installed
    And the questionnaire 'DST9999A' is installed
    And the questionnaire 'DST8888B' is installed
    And the questionnaire 'FOO1234Z' is installed
    When I load the homepage
    And I enter the 'TST2108C' in the search box
    Then I am presented with a list of the deployed questionnaires:
      | Questionnaire |
      | TST2108C      |

  # Scenario 2
  Scenario: DST questionnaires do not show up by default
    Given the questionnaire 'TST2108A' is installed
    And the questionnaire 'TST2108B' is installed
    And the questionnaire 'TST2108C' is installed
    And the questionnaire 'DST9999A' is installed
    And the questionnaire 'DST8888B' is installed
    And the questionnaire 'FOO1234Z' is installed
    When I load the homepage
    And I enter the '' in the search box
    Then I am presented with a list of the deployed questionnaires:
      | Questionnaire |
      | TST2108A      |
      | TST2108B      |
      | TST2108C      |
      | FOO1234Z      |

  # Scenario 3
  Scenario: I can search for DST questinnaires
    Given the questionnaire 'TST2108A' is installed
    And the questionnaire 'TST2108B' is installed
    And the questionnaire 'TST2108C' is installed
    And the questionnaire 'DST9999A' is installed
    And the questionnaire 'DST8888B' is installed
    And the questionnaire 'FOO1234Z' is installed
    When I load the homepage
    And I enter the 'DST' in the search box
    Then I am presented with a list of the deployed questionnaires:
      | Questionnaire |
      | DST9999A      |
      | DST8888B      |

  # Scenario 4
  Scenario: Questionnaire not found
    Given the questionnaire 'TST2108A' is installed
    And the questionnaire 'TST2108B' is installed
    And the questionnaire 'TST2108C' is installed
    And the questionnaire 'DST9999A' is installed
    And the questionnaire 'DST8888B' is installed
    And the questionnaire 'FOO1234Z' is installed
    When I load the homepage
    And I enter the 'BAR1234K' in the search box
    Then I am presented with the following message: 'No questionnaires containing BAR1234K found'
