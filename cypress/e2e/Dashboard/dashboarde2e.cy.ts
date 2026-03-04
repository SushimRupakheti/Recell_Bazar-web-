/// <reference types="cypress" />

/**
 * ReCell Bazar - Dashboard (non-admin) E2E tests
 *
 * How to run:
 * 1) Start the app: npm run dev
 * 2) Run Cypress:
 *    - npx cypress open
 *    - or npx cypress run --spec cypress/e2e/Dashboard/dashboarde2e.cy.ts
 *
 * Notes:
 * - These tests avoid /admin routes.
 * - We use a simple auth cookie to bypass the /dashboard layout redirect.
 *   (The app checks only for presence of `auth_token`.)
 */

const baseUrl = String(Cypress.config("baseUrl") || "http://localhost:3000").replace(/\/$/, "");

const visit = (path: string) => {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return cy.visit(`${baseUrl}${normalized}`);
};

const seedAuthCookie = () => {
	// Need to be on the app origin before setting cookies
	visit("/login");
	cy.setCookie("auth_token", "e2e-test-token");
};

const extractNumber = (text: string) => {
	const m = String(text).match(/(\d[\d,]*)/);
	if (!m) return NaN;
	return Number(m[1].replace(/,/g, ""));
};

describe("Dashboard: user routes (e2e)", () => {
	beforeEach(() => {
		seedAuthCookie();
	});

	it("loads /dashboard", () => {
		visit("/dashboard");
		cy.location("pathname").should("eq", "/dashboard");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("Explore the greatest phone marketplace").should("be.visible");
	});

	it("loads /dashboard/about", () => {
		visit("/dashboard/about");
		cy.location("pathname").should("eq", "/dashboard/about");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("h2", "Our Story").should("be.visible");
	});

	it("loads /dashboard/items", () => {
		visit("/dashboard/items");
		cy.location("pathname").should("eq", "/dashboard/items");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("h1", "All items").should("be.visible");
	});

	it("loads /dashboard/home", () => {
		visit("/dashboard/home");
		cy.location("pathname").should("eq", "/dashboard/home");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("Explore the greatest phone marketplace").should("be.visible");
	});

	it("loads /dashboard/cart", () => {
		visit("/dashboard/cart");
		cy.location("pathname").should("eq", "/dashboard/cart");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains(/Your cart is empty|Shopping Cart/).should("be.visible");
	});

	it("loads /dashboard/notifications", () => {
		visit("/dashboard/notifications");
		cy.location("pathname").should("eq", "/dashboard/notifications");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("h1", "Notifications").should("be.visible");
	});

	it("loads /dashboard/profile", () => {
		visit("/dashboard/profile");
		cy.location("pathname").should("eq", "/dashboard/profile");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("h2", "Profile", { timeout: 10_000 }).should("be.visible");
	});

	it("loads /dashboard/sell", () => {
		visit("/dashboard/sell");
		cy.location("pathname").should("eq", "/dashboard/sell");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("h1", "Sell").should("be.visible");
		cy.get('a[href="/dashboard/sell/add"]').should("be.visible");
	});

	it("loads /dashboard/sell/add", () => {
		visit("/dashboard/sell/add");
		cy.location("pathname").should("eq", "/dashboard/sell/add");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("h1", "Choose the brand of your phone").should("be.visible");
	});

	it("loads /dashboard/sell/add/details with brand + model", () => {
		visit("/dashboard/sell/add/details?brand=Samsung&model=Galaxy%20S23");
		cy.location("pathname").should("eq", "/dashboard/sell/add/details");
		cy.contains("span", "ReCell Bazar").should("be.visible");
		cy.contains("h1", "Answer the questions below:").should("be.visible");
	});

	it("uses navbar search to navigate to items results", () => {
		cy.viewport(1280, 720);
		visit("/dashboard");

		cy.get('input[placeholder="Search by phone model or brand..."]')
			.should("be.visible")
			.clear()
			.type("Galaxy{enter}");

		cy.location("pathname").should("eq", "/dashboard/items");
		cy.location("search").should("contain", "search=Galaxy");
		cy.contains('h1', 'Results for "Galaxy"').should("be.visible");
	});

	it("sell add: selecting brand+model enables Next and navigates to details", () => {
		visit("/dashboard/sell/add");
		cy.contains("h1", "Choose the brand of your phone").should("be.visible");

		cy.contains("button", /^Next$/).should("be.disabled");
		cy.get('img[alt="Samsung"]').should("be.visible").closest("button").click();
		cy.get("select").select("Galaxy S23");
		cy.contains("button", /^Next$/).should("not.be.disabled").click();

		cy.location("pathname").should("eq", "/dashboard/sell/add/details");
		cy.location("search").should("contain", "model=Galaxy%20S23");
		cy.contains("h1", "Answer the questions below:").should("be.visible");
	});

	it("sell details: price decreases when marking liquid damage", () => {
		visit("/dashboard/sell/add/details?brand=Samsung&model=Galaxy%20S23");
		cy.contains("span", "Estimated Value").should("be.visible");

		cy.contains("span", "Estimated Value")
			.parent()
			.find("p")
			.invoke("text")
			.then((beforeText) => {
				const before = extractNumber(beforeText);
				expect(before).to.be.greaterThan(0);

				cy.contains("div", "Has your phone ever been liquid damage?")
					.parent()
					.within(() => {
						cy.contains("label", "Yes").click();
					});

				cy.contains("span", "Estimated Value")
					.parent()
					.find("p")
					.invoke("text")
					.then((afterText) => {
						const after = extractNumber(afterText);
						expect(after).to.be.lessThan(before);
					});
			});
	});


	it("sell details: shows inline error when create fails (stubbed)", () => {
		cy.intercept("POST", "/api/items", {
			statusCode: 200,
			body: { success: false, message: "Create failed from test" },
		}).as("createItemFail");

		visit("/dashboard/sell/add/details?brand=Samsung&model=Galaxy%20S23");
		cy.contains("h1", "Answer the questions below:").should("be.visible");
		cy.contains("button", /^Next$/).click();
		cy.contains("button", /^Next$/).click();
		cy.contains("button", /^Next$/).click();
		cy.contains("button", /^Submit$/).click();
		cy.wait("@createItemFail");
		cy.contains("Create failed from test").should("be.visible");
		cy.location("pathname").should("eq", "/dashboard/sell/add/details");
	});
});

export {};
