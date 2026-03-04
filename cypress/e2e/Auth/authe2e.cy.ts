/// <reference types="cypress" />

/**
 * ReCell Bazar - Login E2E tests
 *
 * How to run:
 * 1) Start the app: npm run dev
 * 2) Run Cypress:
 *    - npx cypress open
 *    - or npx cypress run --spec cypress/e2e/Auth/authe2e.cy.ts
 *
 * Base URL:
 * - Defaults to http://localhost:3000
 * - Override by setting Cypress config `baseUrl`.
 */

const baseUrl = String(Cypress.config("baseUrl") || "http://localhost:3000").replace(/\/$/, "");

const visit = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return cy.visit(`${baseUrl}${normalized}`);
};

describe("Auth: Login (e2e)", () => {
  it("redirects unauthenticated users to /login when visiting /dashboard", () => {
    visit("/");
    cy.clearCookie("auth_token");

    visit("/dashboard");
    cy.location("pathname").should("eq", "/login");
    cy.contains("h1", "Login").should("be.visible");
  });

  it("renders the login form", () => {
    visit("/login");
    cy.contains("h1", "Login").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("button", "Log in").should("be.visible");
  });

  it("shows required field errors on empty submit", () => {
    visit("/login");
    cy.contains("button", "Log in").click();

    cy.contains("Email is required").should("be.visible");
    cy.contains("Password must be at least 6 characters").should("be.visible");
  });

  it("navigates to /register when clicking Sign Up", () => {
    visit("/login");
    cy.get('a[href="/register"]').first().click();
    cy.location("pathname").should("eq", "/register");
    cy.contains("h1", "Register").should("be.visible");
  });

  it("shows password length error for short password", () => {
    visit("/login");
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').type("123");
    cy.contains("button", "Log in").click();

    cy.contains("Password must be at least 6 characters").should("be.visible");
  });
});

describe("Auth: Sign Up (e2e)", () => {
  it("renders the register form", () => {
    visit("/register");
    cy.contains("h1", "Register").should("be.visible");

    cy.get('input[name="firstName"]').should("be.visible");
    cy.get('input[name="lastName"]').should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="address"]').should("be.visible");
    cy.get('input[name="contactNo"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.contains("button", "Sign Up").should("be.visible");
  });

  it("navigates to /login when clicking Login on the register page", () => {
    visit("/register");
    cy.get('a[href="/login"]').first().click();
    cy.location("pathname").should("eq", "/login");
    cy.contains("h1", "Login").should("be.visible");
  });

  it("shows required field errors on empty signup submit", () => {
    visit("/register");
    cy.contains("button", "Sign Up").click();

    cy.contains("First name is required").should("be.visible");
    cy.contains("Last name is required").should("be.visible");
    cy.contains("Email is required").should("be.visible");
    cy.contains("Address is required").should("be.visible");
    cy.contains("Contact number is too short").should("be.visible");
    cy.contains("Password must be at least 6 characters").should("be.visible");
  });

  it("navigates to /login when clicking Login", () => {
    visit("/register");
    cy.get('a[href="/login"]').first().click();
    cy.location("pathname").should("eq", "/login");
    cy.contains("h1", "Login").should("be.visible");
  });

  it("shows invalid contact number error when non-numeric", () => {
    visit("/register");
    cy.get('input[name="contactNo"]').type("abcdefg");
    cy.contains("button", "Sign Up").click();

    cy.contains("Invalid contact number").should("be.visible");
  });
});

export {};
