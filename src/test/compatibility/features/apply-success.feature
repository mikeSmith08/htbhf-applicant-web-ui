Feature: Complete application journey
  In order to apply for the HTBHF programme
  As a potential claimant
  I want to enter my details and complete the application journey

  Scenario: Valid application details can be checked
    Given I am on the first page of the application
    When I complete the application with valid details for a pregnant woman
    Then I am shown the check details page with correct page content
    And I submit my application
    And I am shown a successful confirmation page
