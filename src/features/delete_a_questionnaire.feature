Feature: delete a questionnaire
  As a Survey Research Officer
  I want to be able to delete a questionnaire from Blaise via the questionnaire details
  So the chances of accidental deletion are mitigated

  Scenario: Delete an 'inactive' survey at any time
    Given the questionnaire 'TST2101X' is installed
    And 'TST2101X' is inactive
    And 'TST2101X' has active survey days
    When I go to the questionnaire details page for 'TST2101X'
    And I select a link to delete the 'TST2101X' questionnaire
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'TST2101X'
    And I am presented a success banner on the launch page for deleting 'TST2101X'

  Scenario: Confirm deletion
    Given the questionnaire 'TST2101A' is installed
    When I go to the questionnaire details page for 'TST2101A'
    And I select a link to delete the 'TST2101A' questionnaire
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'TST2101A'
    And I am presented a success banner on the launch page for deleting 'TST2101A'

  Scenario: Cancel deletion
    Given the questionnaire 'TST2101B' is installed
    When I go to the questionnaire details page for 'TST2101B'
    And I select a link to delete the 'TST2101B' questionnaire
    And I click cancel
    Then the questionnaire and data is not deleted from Blaise for 'TST2101B'
    And I am returned to the questionnaire details page

  Scenario: Delete a questionnaire not available from the homepage
    Given the questionnaire 'TST2101C' is installed
    When I load the homepage
    Then I will not have the option to 'delete' displayed for 'TST2101C'

  Scenario: Select to delete questionnaire that is active and live
    Given the questionnaire 'TST2101D' is installed
    And 'TST2101D' is active
    And 'TST2101D' has active survey days
    When I go to the questionnaire details page for 'TST2101D'
    And I select a link to delete the 'TST2101D' questionnaire
    Then I am presented with a warning that questionnaire has active survey days
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'TST2101D'
    And I am presented a success banner on the launch page for deleting 'TST2101D'

  Scenario: Select to delete questionnaire that is active and not live
    Given the questionnaire 'TST2101E' is installed
    And 'TST2101E' has active survey days
    When I go to the questionnaire details page for 'TST2101E'
    And I select a link to delete the 'TST2101E' questionnaire
    Then I am presented with a warning
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'TST2101E'
    And I am presented a success banner on the launch page for deleting 'TST2101E'

  Scenario: Select to delete questionnaire that is inactive
    Given the questionnaire 'TST2101F' is installed
    And 'TST2101F' is inactive
    When I go to the questionnaire details page for 'TST2101F'
    And I select a link to delete the 'TST2101F' questionnaire
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'TST2101F'
    And I am presented a success banner on the launch page for deleting 'TST2101F'

  Scenario: Select to delete questionnaire that is active and has mode set to CAWI
    Given the questionnaire 'TST2101G' is installed
    And 'TST2101G' is active
    And 'TST2101G' has the modes 'CAWI'
    When I go to the questionnaire details page for 'TST2101G'
    And I select a link to delete the 'TST2101G' questionnaire
    Then I am presented with a warning that questionnaire is active for web collection
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'TST2101G'
    And I am presented a success banner on the launch page for deleting 'TST2101G'
