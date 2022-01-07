Feature: DQS - Provide a warning and option to override OR de-activate the questionnaire when settings are not as expected
  As a Research Officer
  I want to be made aware when the questionnaire I am deploying does not have the recommended setting rules for the survey type, i.e. CATI only or mixed mode
  So that I can make a decision on whether I continue to deploy or uninstall and amend the setting rules

  # Scenario 1
  Scenario: Display warning when settings are incorrect
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'DST2301A' to deploy
    And 'DST2301A' installs successfully
    And 'DST2301A' has the modes 'CATI,CAWI'
    And 'DST2301A' has the settings:
      | type               | saveSessionOnTimeout | saveSessionOnQuit | deleteSessionOnTimeout | deleteSessionOnQuit | sessionTimeout | applyRecordLocking |
      | StrictInterviewing | true                 | false             | false                  | false               | 15             | false              |
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    Then the questionnaire package 'DST2301A' is deactivated
    And a warning is displayed with the message
      """
      You have loaded a questionnaire that does not conform to the standard default settings in the BLAX file,
      if this is intended please click the "Deploy anyway" button.
      If it was not your intention please correct the settings and reinstall the questionnaire
      """
    And I get the option to continue loading or cancel the deployment

  # Scenario 2
  Scenario: Choose to continue with incorrect settings
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'DST2301B' to deploy
    And 'DST2301B' installs successfully
    And 'DST2301B' has the modes 'CATI,CAWI'
    And 'DST2301B' has the settings:
      | type               | saveSessionOnTimeout | saveSessionOnQuit | deleteSessionOnTimeout | deleteSessionOnQuit | sessionTimeout | applyRecordLocking |
      | StrictInterviewing | true                 | false             | false                  | false               | 15             | false              |
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    And I choose to deploy anyway
    Then the questionnaire package 'DST2301B' is deployed
    And the questionnaire package 'DST2301B' is activated
    And I am presented with a successful deployment banner on the landing page

  # Scenario 3
  Scenario: Choose uninstall and rectify settings issue
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'DST2301C' to deploy
    And 'DST2301C' installs successfully
    And 'DST2301C' has the modes 'CATI,CAWI'
    And 'DST2301C' has the settings:
      | type               | saveSessionOnTimeout | saveSessionOnQuit | deleteSessionOnTimeout | deleteSessionOnQuit | sessionTimeout | applyRecordLocking |
      | StrictInterviewing | true                 | false             | false                  | false               | 15             | false              |
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    And I choose to reinstall
    Then the questionnaire and data is deleted from Blaise for 'DST2301C'
    And I am returned to the landing page

  # Scenario 4
  Scenario: Install with correct settings
    Given no questionnaires are installed
    And I have selected the questionnaire package for 'DST2301D' to deploy
    And 'DST2301D' installs successfully
    And 'DST2301D' has the modes 'CATI,CAWI'
    And 'DST2301D' has the settings:
      | type               | saveSessionOnTimeout | saveSessionOnQuit | deleteSessionOnTimeout | deleteSessionOnQuit | sessionTimeout | applyRecordLocking |
      | StrictInterviewing | true                 | true              | true                   | true                | 15             | true               |
    When I confirm my selection
    And I select to not provide a TO Start Date
    And I deploy the questionnaire
    Then the questionnaire package 'DST2301D' is deployed
    And I am presented with a successful deployment banner on the landing page
