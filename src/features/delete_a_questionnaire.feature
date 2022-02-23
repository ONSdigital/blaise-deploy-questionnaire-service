Feature: delete a questionnaire
  As a Survey Research Officer
  I want to be able to delete a questionnaire from Blaise via the questionnaire list
  So that the system can be cleared of completed surveys

  Scenario: Delete an 'inactive' survey at any time
    Given the questionnaire 'TST2101X' is installed
    And 'TST2101X' is inactive
    And 'TST2101X' has active survey days
    When I load the homepage
    And I select a link to delete the 'TST2101X' questionnaire
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'TST2101X'
    And I am presented a success banner on the launch page for deleting 'TST2101X'

  Scenario: Delete questionnaire not available from the list, when survey is live
    Given the questionnaire 'TST2101B' is installed
    And 'TST2101B' is live
    When I load the homepage
    Then I will not have the option to 'delete' displayed for 'TST2101B'
    And the landing screen displays a warning that live surveys cannot be deleted

  Scenario: Select to delete a questionnaire from the list, when survey is NOT live
    Given the questionnaire 'TST2101C' is installed
    When I load the homepage
    And I select a link to delete the 'TST2101C' questionnaire
    Then I am presented with a warning

  Scenario: Confirm deletion
    Given the questionnaire 'TST2101D' is installed
    When I load the homepage
    And I select a link to delete the 'TST2101D' questionnaire
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'TST2101D'
    And I am presented a success banner on the launch page for deleting 'TST2101D'

  Scenario: Cancel deletion
    Given the questionnaire 'TST2101F' is installed
    When I load the homepage
    And I select a link to delete the 'TST2101F' questionnaire
    And I click cancel
    Then the questionnaire and data is not deleted from Blaise for 'TST2101F'
    And I am returned to the landing page
