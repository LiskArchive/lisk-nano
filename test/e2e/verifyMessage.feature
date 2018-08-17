Feature: Verify message
  Scenario: should allow to verify message
    Given I'm logged in as "any account"
    When I click "verify message" in main menu
    And  I fill in "Hello world" to "message" field
    And  I fill in "c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f" to "public key" field
    And  I fill in "c68adc13131696c35ac82b9bb6884ee4de66ff281b013fe4ded66a73243c860b6a74b759bfb8d25db507ea2bec4bb208f8bb514fa18380416e637db947f0ab06" to "signature" field
    Then I should see "Message verified" in "result" field

  @integration
  Scenario: should allow to exit verify message dialog
    Given I'm logged in as "any account"
    When I click "verify message" in main menu
    And I click "x button"
    Then I should see no "modal dialog"

