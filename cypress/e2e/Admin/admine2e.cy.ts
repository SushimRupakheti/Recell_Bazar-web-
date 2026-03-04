/// <reference types="cypress" />

/**
 * ReCell Bazar - Admin E2E tests
 *
 * How to run:
 * 1) Start the app: npm run dev
 * 2) Run Cypress:
 *    - npx cypress open
 *    - or npx cypress run --spec cypress/e2e/Admin/admine2e.cy.ts
 *
 * Notes:
 * - These tests exercise only /admin routes.
 * - Admin screens use a client-side guard inside AdminLayout that calls:
 *   GET /api/admin/users?page=1&limit=1
 *   If that call is not OK, it redirects to /login.
 *   We stub that endpoint to keep tests backend-independent.
 */

const baseUrl = String(Cypress.config("baseUrl") || "http://localhost:3000").replace(/\/$/, "");

const visit = (path: string) => {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return cy.visit(`${baseUrl}${normalized}`);
};

const seedAdminCookie = () => {
	// Need to be on the app origin before setting cookies
	visit("/login");
	cy.setCookie("auth_token", "e2e-admin-token");
	cy.setCookie("role", "admin");
};

const stubAdminGuards = () => {
	const demoUser = {
		_id: "u1",
		email: "admin@example.com",
		role: "admin",
		firstName: "Admin",
		lastName: "User",
		address: "",
		contactNo: "",
	};

	// Detail endpoint used by /admin/users/[id] and /admin/users/[id]/edit
	cy.intercept("GET", /\/api\/admin\/users\/[^/?]+(\?.*)?$/, {
		statusCode: 200,
		body: { success: true, data: demoUser },
	});

	// List endpoint used by AdminLayout guard + admin dashboard data fetch
	cy.intercept("GET", /\/api\/admin\/users(\?.*)?$/, {
		statusCode: 200,
		body: {
			success: true,
			data: [demoUser],
			meta: {
				total: 1,
				totalPages: 1,
				currentPage: 1,
				perPage: 10,
				roleCounts: { admin: 1, user: 0 },
			},
		},
	});

	// Admin dashboard also previews marketplace items via same-origin /api/items
	cy.intercept("GET", /\/api\/items(\?.*)?$/, {
		statusCode: 200,
		body: { success: true, data: [] },
	});
};

describe("Admin: routes + actions (e2e)", () => {
	beforeEach(() => {
		stubAdminGuards();
		seedAdminCookie();
	});

	it("loads /admin/dashboard", () => {
		visit("/admin/dashboard");
		cy.location("pathname").should("eq", "/admin/dashboard");
		cy.contains("h2", "Admin Panel").should("be.visible");
		cy.contains("h1", "Admin Dashboard").should("be.visible");
	});

	it("loads /admin/users", () => {
		visit("/admin/users");
		cy.location("pathname").should("eq", "/admin/users");
		cy.contains("h2", "Admin Panel").should("be.visible");
		cy.contains("h1", "Users").should("be.visible");
	});

	it("creates a user from /admin/users/create", () => {
		cy.intercept(
			{ method: "POST", url: "/api/admin/users", times: 1 },
			(req) => {
				expect(req.body).to.include({
					firstName: "Test",
					lastName: "User",
					email: "testuser@example.com",
					address: "Kathmandu",
					contactNo: "9812345678",
				});
				expect(req.body?.password).to.eq("123456");
				req.reply({ statusCode: 200, body: { success: true } });
			}
		).as("createUser");

		cy.on("window:alert", cy.stub().as("alert"));

		visit("/admin/users/create");
		cy.location("pathname").should("eq", "/admin/users/create");
		cy.contains("h2", "Admin Panel").should("be.visible");
		cy.contains("h2", "Create User").should("be.visible");

		cy.get('input[name="firstname"]').type("Test");
		cy.get('input[name="lastname"]').type("User");
		cy.get('input[name="email"]').type("testuser@example.com");
		cy.get('input[name="password"]').type("123456");
		cy.get('input[name="address"]').type("Kathmandu");
		cy.get('input[name="contactNo"]').type("9812345678");

		cy.contains("button", "Create User").click();
		cy.wait("@createUser");

		cy.get("@alert").should("have.been.calledWith", "User created successfully!");
		cy.get('input[name="firstname"]').should("have.value", "");
		cy.get('input[name="lastname"]').should("have.value", "");
		cy.get('input[name="email"]').should("have.value", "");
	});

	it("shows an error message when create user API fails", () => {
		cy.intercept(
			{ method: "POST", url: "/api/admin/users", times: 1 },
			{
				statusCode: 400,
				body: { message: "Email already exists" },
			}
		).as("createUserFail");

		visit("/admin/users/create");
		cy.contains("h2", "Create User").should("be.visible");

		cy.get('input[name="firstname"]').type("Test");
		cy.get('input[name="lastname"]').type("User");
		cy.get('input[name="email"]').type("testuser@example.com");
		cy.get('input[name="password"]').type("123456");

		cy.contains("button", "Create User").click();
		cy.wait("@createUserFail");
		cy.contains("Email already exists").should("be.visible");
	});

	it("edits a user from /admin/users/:id/edit", () => {
		cy.intercept(
			{ method: "PUT", url: "/api/admin/users/u1", times: 1 },
			(req) => {
				expect(req.body).to.include({
					firstName: "Edited",
					lastName: "User",
					email: "admin@example.com",
				});
				req.reply({ statusCode: 200, body: { success: true } });
			}
		).as("updateUser");

		visit("/admin/users/u1/edit");
		cy.location("pathname").should("eq", "/admin/users/u1/edit");
		cy.contains("h1", "Edit User").should("be.visible");

		cy.get('input[name="firstname"]').clear().type("Edited");
		cy.get('input[name="lastname"]').should("have.value", "User");
		cy.contains("button", "Save Changes").click();
		cy.wait("@updateUser");

		cy.location("pathname").should("eq", "/admin/users/u1");
		cy.contains("h1", "User Detail").should("be.visible");
	});

	it("deletes a user from /admin/users/:id", () => {
		cy.intercept(
			{ method: "DELETE", url: "/api/admin/users/u1", times: 1 },
			{ statusCode: 200, body: { success: true } }
		).as("deleteUser");

		cy.on("window:confirm", () => true);

		visit("/admin/users/u1");
		cy.location("pathname").should("eq", "/admin/users/u1");
		cy.contains("h1", "User Detail").should("be.visible");

		cy.contains("button", "Delete").click();
		cy.wait("@deleteUser");
		cy.location("pathname").should("eq", "/admin/users");
		cy.contains("h1", "Users").should("be.visible");
	});

	it("loads /admin/items", () => {
		visit("/admin/items");
		cy.location("pathname").should("eq", "/admin/items");
		cy.contains("h2", "Admin Panel").should("be.visible");
		cy.contains("h1", "Items").should("be.visible");
	});

	it("loads /admin/payments", () => {
		visit("/admin/payments");
		cy.location("pathname").should("eq", "/admin/payments");
		cy.contains("h2", "Admin Panel").should("be.visible");
		cy.contains("h1", "Payments").should("be.visible");
	});

	it("enables sending notifications when inputs are filled", () => {
		visit("/admin/notifications");
		cy.location("pathname").should("eq", "/admin/notifications");
		cy.contains("h2", "Admin Panel").should("be.visible");
		cy.contains("h1", "Send Notification").should("be.visible");

		cy.contains("button", "Send to all users").should("be.disabled");
		cy.get("#notif-title").type("System Update");
		cy.get("#notif-message").type("Maintenance at 10PM.");
		cy.contains("button", "Send to all users").should("not.be.disabled");
	});

	it("logs out and redirects to /login", () => {
		cy.intercept(
			{ method: "POST", url: "**/api/admin/users/logout", times: 1 },
			{ statusCode: 200, body: { success: true } }
		).as("adminLogout");

		visit("/admin/dashboard");
		cy.contains("button", "Logout").click();
		cy.wait("@adminLogout");
		cy.location("pathname", { timeout: 10_000 }).should("eq", "/login");
	});
});

export {};

