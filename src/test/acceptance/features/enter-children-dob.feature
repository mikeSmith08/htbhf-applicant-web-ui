Feature: Enter your children’s dates of birth
  In order to apply for the HTBHF programme
  As a potential claimant
  I want to provide my children’s dates of birth

  Scenario: Children’s dates of birth is not navigable via the back button if I’ve said I have no children
    Given I have entered my details up to the do you have children three or younger page
    And I have said No to the do you have children three or younger question
    When I am shown the are you pregnant page
    Then The back link points to the Do you have children who are three years old or younger page

  Scenario: Children’s dates of birth is navigable via the back button if I’ve said I have children
    Given I have entered my details up to the enter your childrens dates of birth page
    And I submit the details of my child who is three or younger
    When I am shown the are you pregnant page
    Then The back link points to the Enter your children’s dates of birth page

  Scenario: Enter two children's details
    Given I have entered my details up to the enter your childrens dates of birth page
    When I submit the details of my two children who are three or younger
    Then I am shown the are you pregnant page

  Scenario: Enter ten children's details
    Given I have entered my details up to the enter your childrens dates of birth page
    When I submit the details of my ten children who are three or younger
    Then I am shown the are you pregnant page

  Scenario: Enter one child's details without a name, name is optional
    Given I have entered my details up to the enter your childrens dates of birth page
    When I submit the details of my child who is three or younger without a name
    Then I am shown the are you pregnant page

  Scenario: Invalid date entered for single child
    Given I have entered my details up to the enter your childrens dates of birth page
    When I do not enter my child's date of birth
    And I click continue
    Then I am informed that I need to enter the date of birth for the first child

  Scenario: Future date entered for single child
    Given I have entered my details up to the enter your childrens dates of birth page
    When I enter a future date as my child's date of birth
    And I click continue
    Then I am informed that I need to enter the date of birth for the first child

  Scenario: Invalid dates entered for two children
    Given I have entered my details up to the enter your childrens dates of birth page
    When I select to add another child
    And I click continue
    Then I am informed that I need to enter the date of birth for both children

  Scenario: Child's name is too long
    Given I have entered my details up to the enter your childrens dates of birth page
    When I submit the details of my child who is three or under with a very long name
    Then I am informed that I need to enter a shorter name

  Scenario: Both children's names are too long
    Given I have entered my details up to the enter your childrens dates of birth page
    When I submit the details of my two children who are three or under both with very long names
    Then I am informed that I need to enter a shorter name for both children