/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
import '@testing-library/cypress/add-commands';

//Login
Cypress.Commands.add(
	'login',
	(
		email = Cypress.env('test_email'),
		password = Cypress.env('test_password')
	) => {
		cy.visit('/');

		cy.findByTestId('email').type(email);
		cy.findByTestId('password').type(password);

		cy.findByTestId('submitBtn').click();

		cy.url().should('include', '/');
	}
);

//Logout
// Cypress.Commands.add('logout', () => {
// 	cy.findByTestId('logout').click();

// 	cy.findByText('Submit').click();

// 	cy.url().should('include', '/auth');
// });

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
	namespace Cypress {
		interface Chainable {
			login(email?: string, password?: string): Chainable<void>;
			logout(): Chainable<void>;
			openModalEditUser: () => Chainable<void>;
			//   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
			//   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
			//   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
		}
	}
}

export {};
