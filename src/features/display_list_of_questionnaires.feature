Feature: Display list of questionnaires
  As a Survey Research Officer
  I want to see questionnaires I have deployed in Blaise
  So that I can carry out further actions on them if required

  # Scenario 1
  Scenario: List all questionnaires in Blaise
    Given the questionnaire 'DST2101G' is installed
    And the questionnaire 'DST2101H' is installed
    And the questionnaire 'DST2101I' is installed
    When I load the homepage
    Then I am presented with a list of the deployed questionnaires:
      | Questionnaire |
      | DST2101G      |
      | DST2101H      |
      | DST2101I      |
