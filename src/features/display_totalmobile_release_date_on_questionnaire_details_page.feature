Feature: Display Totalmobile release date on the DQS questionnaire details page
  As a Survey Research Officer
  I want to see the Totalmobile release date on the questionnaire details page
  So that I know when the release date is

  # Scenario 1
  Scenario: View saved Totalmobile release date in questionnaire details
    Given I have deployed a questionnaire using DQS
    And specified a Total Mobile release date
#    When I view the questionnaire details page for that questionnaire in DQS
#    Then I will see an entry displayed for Totalmobile release date
#    And have the option to change or delete the date (see attachment)
#
#  # Scenario 2
  Scenario: Add Totalmobile release date in questionnaire details
    Given I have deployed a questionnaire using DQS
    And have not specified a Total Mobile release date
#    When I view the questionnaire details page for that questionnaire in DQS
#    Then I will see an entry displayed for Total Mobile release date
#    And have the option to add the date
