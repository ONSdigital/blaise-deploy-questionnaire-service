Feature: Display Totalmobile release date on the DQS questionnaire details page
  As a Survey Research Officer
  I want to see the Totalmobile release date on the questionnaire details page
  So that I know when the release date is

  # Scenario 1
  Scenario: View saved Totalmobile release date in questionnaire details
    Given the questionnaire 'LMS2101_AA1' is installed
    And I have specified a Totalmobile release date
    When I go to the questionnaire details page for 'LMS2101_AA1'
    Then I will see an entry displayed for Totalmobile release date
    And I have the option to change or delete the Totalmobile release date

  # Scenario 2
  Scenario: Add Totalmobile release date in questionnaire details
    Given the questionnaire 'LMS2101_AA1' is installed
    And I have not specified a Totalmobile release date
    When I go to the questionnaire details page for 'LMS2101_AA1'
    Then I will see an entry displayed for Totalmobile release date
    And I have the option to add a Totalmobile release date
