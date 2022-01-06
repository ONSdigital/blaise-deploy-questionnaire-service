Feature: DQS - Questionnaire search
  As a Survey Research Officer
  I want to be able to search for a questionnaire in DQS
  So that I can carry out further actions on it

  # Scenario 1
  Scenario: Search for a questionnaire
    Given the questionnaire 'DST2108A' is installed
    And the questionnaire 'DST2108B' is installed
    And the questionnaire 'DST2108C' is installed
    And the questionnaire 'TST9999A' is installed
    And the questionnaire 'TST8888B' is installed
    And the questionnaire 'FOO1234Z' is installed
    When I load the homepage
    And I enter the 'DST2108C' in the search box
    Then I am presented with a list of the deployed questionnaires:
      | Questionnaire |
      | DST2108C      |

  # Scenario 2
  Scenario: Questionnaire not found
    And the questionnaire 'DST2108D' is installed
    When I load the homepage
    And I enter the 'BAR1234K' in the search box
    Then I am presented with the following message: 'No questionnaires containing BAR1234K found'
