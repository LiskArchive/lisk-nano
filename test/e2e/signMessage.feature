Feature: Sign message
  Scenario: should allow to sign message
    Given I'm logged in as "any account"
    When I click "sign message" in main menu
    And I fill in "Hello world" to "message" field
    And I click "primary button"
    Then I should see in "result" field:
         """
         -----BEGIN LISK SIGNED MESSAGE-----
         -----MESSAGE-----
         Hello world
         -----PUBLIC KEY-----
         c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f
         -----SIGNATURE-----
         c68adc13131696c35ac82b9bb6884ee4de66ff281b013fe4ded66a73243c860b6a74b759bfb8d25db507ea2bec4bb208f8bb514fa18380416e637db947f0ab06
         -----END LISK SIGNED MESSAGE-----
         """

  @integration
  Scenario: should allow to exit sign message dialog with "cancel button"
    Given I'm logged in as "any account"
    When I click "sign message" in main menu
    And I click "cancel button"
    Then I should see no "modal dialog"

  @integration
  Scenario: should allow to exit sign message dialog with "x button"
    Given I'm logged in as "any account"
    When I click "sign message" in main menu
    And I click "x button"
    Then I should see no "modal dialog"


