Feature: Login page
  Scenario: should allow to login
    Given I'm on login page
    When I fill in "wagon stock borrow episode laundry kitten salute link globe zero feed marble" to "passphrase" field
    And I click "login button"
    Then I should be logged in

  Scenario: should allow to login to Mainnet 
    Given I'm on login page
    When I fill in "wagon stock borrow episode laundry kitten salute link globe zero feed marble" to "passphrase" field
    And I select option no. 1 from "network" select
    And I click "login button"
    Then I should be logged in
    And I should see text "Mainnet" in "peer network" element

  Scenario: should allow to login to Testnet
    Given I'm on login page
    When I fill in "wagon stock borrow episode laundry kitten salute link globe zero feed marble" to "passphrase" field
    And I select option no. 2 from "network" select
    And I click "login button"
    Then I should be logged in
    And I should see text "Testnet" in "peer network" element

  Scenario: should allow to login with abbreviated password
    Given I'm on login page
    When I fill in "wago stoc borr epis laun kitt salu link glob zero feed marb" to "passphrase" field
    And I click "login button"
    Then I should be logged in
    And I should see text "16313739661670634666L" in "address" element

  Scenario: should remember the selected network
    Given I'm on login page
    When I fill in "wagon stock borrow episode laundry kitten salute link globe zero feed marble" to "passphrase" field
    And I select option no. 2 from "network" select
    And I click "login button"
    And I refresh the page
    And I fill in "wagon stock borrow episode laundry kitten salute link globe zero feed marble" to "passphrase" field
    And I click "login button"
    Then I should be logged in
    And I should see text "Testnet" in "peer network" element

  Scenario: should allow to create a new account
    Given I'm on login page
    When I click "new account button"
    And I click "next button"
    And I 250 times move mouse randomly
    And I remember passphrase, click "next button", fill in missing word
    And I click "next button"
    Then I should be logged in
