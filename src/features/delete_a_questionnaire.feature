Feature: delete a questionnaire
  As a Survey Research Officer
  I want to be able to delete a questionnaire from Blaise via the questionnaire list
  So that the system can be cleared of completed surveys

  Scenario: Delete questionnaire not available from the list, when survey is live
    Given the questionnaire 'DST2101B' is installed
    And 'DST2101B' is live
    When I load the homepage
    Then I will not have the option to 'delete' displayed for 'DST2101B'
    And the landing screen displays a warning that live surveys cannot be deleted

  Scenario: Select to delete a questionnaire from the list, when survey is NOT live
    Given the questionnaire 'DST2101C' is installed
    When I load the homepage
    And I select a link to delete the 'DST2101C' questionnaire
    Then I am presented with a warning

  Scenario: Confirm deletion
    Given the questionnaire 'DST2101D' is installed
    When I load the homepage
    And I select a link to delete the 'DST2101D' questionnaire
    And I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise for 'DST2101D'
    And I am presented a success banner on the launch page for deleting 'DST2101D'

  Scenario: Cancel deletion
    Given the questionnaire 'DST2101F' is installed
    When I load the homepage
    And I select a link to delete the 'DST2101F' questionnaire
    And I click cancel
    Then the questionnaire and data is not deleted from Blaise for 'DST2101F'
    And I am returned to the landing page
