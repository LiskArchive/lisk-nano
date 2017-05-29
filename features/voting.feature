Feature: Voting tab
  Scenario: should allow to view delegates
    Given I'm logged in as "any account"
    When I click tab number 2
    Then I should see virtual repeat with at least 10 delegate rows

  Scenario: should allow to search delegates
    Given I'm logged in as "any account"
    When I click tab number 2
    And I fill in "genesis_42" to "search" field
    Then I should see virtual repeat with exactly 1 delegate rows

  Scenario: should allow to view my votes
    Given I'm logged in as "genesis"
    When I click tab number 2
    And I click "my votes button"
    Then I should see delegates list with 101 lines

  Scenario: should allow to select delegates in the "Voting" tab and vote for them
    Given I'm logged in as "delegate candidate"
    When I click tab number 2
    And I click checkbox on list item no. 3
    And I click checkbox on list item no. 2
    And I click checkbox on list item no. 1
    And I click "vote button"
    And I click "submit button"
    Then I should see toast saying "Voting successful"

  Scenario: should allow to select delegates in the "Vote" dialog and vote for them
    Given I'm logged in as "delegate candidate"
    When I click tab number 2
    And I click "vote button"
    And Search twice for "genesis_7" in vote dialog
    And I click "submit button"
    Then I should see toast saying "Voting successful"

  Scenario: should allow to remove votes form delegates
    Given I'm logged in as "genesis"
    When I click tab number 2
    And I click checkbox on list item no. 3
    And I click checkbox on list item no. 1
    And I click "vote button"
    And I click "submit button"
    Then I should see toast saying "Voting successful"
