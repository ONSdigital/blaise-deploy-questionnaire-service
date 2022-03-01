Feature: DQS - Provide a warning and option to override OR de-activate the questionnaire when settings are not as expected
  As a Research Officer
  I want to be made aware when the questionnaire I am deploying does not have the recommended setting rules for the survey type, i.e. CATI only or mixed mode
  So that I can make a decision on whether I continue to deploy or uninstall and amend the setting rules

  # Scenario 1
  Scenario: Display warning when settings are incorrect
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'TST2301A' to deploy
    And 'TST2301A' installs successfully
    And 'TST2301A' has the modes 'CATI,CAWI'
    And 'TST2301A' has the settings:
      | type               | saveSessionOnTimeout | saveSessionOnQuit | deleteSessionOnTimeout | deleteSessionOnQuit | sessionTimeout | applyRecordLocking |
      | StrictInterviewing | true                 | false             | false                  | false               | 15             | false              |
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    Then the questionnaire package 'TST2301A' is deactivated
    And a warning is displayed with the message
      """
      This questionnaire does not conform to the standard settings.
      """
    And I get the option to continue loading or cancel the deployment

  # Scenario 2
  Scenario: Choose to continue with incorrect settings
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'TST2301B' to deploy
    And 'TST2301B' installs successfully
    And 'TST2301B' has the modes 'CATI,CAWI'
    And 'TST2301B' has the settings:
      | type               | saveSessionOnTimeout | saveSessionOnQuit | deleteSessionOnTimeout | deleteSessionOnQuit | sessionTimeout | applyRecordLocking |
      | StrictInterviewing | true                 | false             | false                  | false               | 15             | false              |
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    And I choose to deploy anyway
    Then the questionnaire package 'TST2301B' is deployed
    And the questionnaire package 'TST2301B' is activated
    And I am presented with a successful deployment banner on the landing page

  # Scenario 3
  Scenario: Choose cancel and rectify settings issue
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'TST2301C' to deploy
    And 'TST2301C' installs successfully
    And 'TST2301C' has the modes 'CATI,CAWI'
    And 'TST2301C' has the settings:
      | type               | saveSessionOnTimeout | saveSessionOnQuit | deleteSessionOnTimeout | deleteSessionOnQuit | sessionTimeout | applyRecordLocking |
      | StrictInterviewing | true                 | false             | false                  | false               | 15             | false              |
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    And I choose to cancel
    Then the questionnaire and data is deleted from Blaise for 'TST2301C'
    And I am returned to the landing page

  # Scenario 4
  Scenario: Install with correct settings
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'TST2301D' to deploy
    And 'TST2301D' installs successfully
    And 'TST2301D' has the modes 'CATI,CAWI'
    And 'TST2301D' has the settings:
      | type               | saveSessionOnTimeout | saveSessionOnQuit | deleteSessionOnTimeout | deleteSessionOnQuit | sessionTimeout | applyRecordLocking |
      | StrictInterviewing | true                 | true              | true                   | true                | 15             | true               |
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    Then the questionnaire package 'TST2301D' is deployed
    And I am presented with a successful deployment banner on the landing page
