Feature: delete a questionnaire
  As a Survey Research Officer
  I want to be able to delete a questionnaire from Blaise via the questionnaire list
  So that the system can be cleared of completed surveys

  Scenario: Delete questionnaire not available from the list, when survey is live
    Given I have the name of a questionnaire I want to delete and that survey is live
    When I locate that questionnaire in the list
    Then I will not have the option to 'delete' displayed
    And the landing screen displays a warning that live surveys cannot be deleted

  Scenario: Select to delete a questionnaire from the list, when survey is NOT live
    Given I can see the questionnaire I want to delete in the questionnaire list
    When I select a link to delete that questionnaire
    Then I am presented with a warning

  Scenario: Confirm deletion
    Given I have been presented with a warning that I am about to delete a questionnaire from Blaise
    When I confirm that I want to proceed
    Then the questionnaire and data is deleted from Blaise
    And I'm presented with a successful deletion banner on the launch page

  Scenario: Cancel deletion
    Given I have been presented with a warning that I am about to delete a questionnaire from Blaise
    When I confirm that I do NOT want to proceed
    Then I am returned to the landing page
