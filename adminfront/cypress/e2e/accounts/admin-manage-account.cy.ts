import { EPermissions } from '@/types/account';
describe('Login spec', () => {
	const email = 'testcreateuser@test.com';
	const phone = '0102030405';
	const phoneUpdated = '0102030406';
	const fullName = 'Test create user';
	const fullNameUpdated = 'Test update user';
	const permissions = [
		EPermissions.Warehouse,
		EPermissions.Manager,
		EPermissions.Driver,
		EPermissions.Accountant,
	];

	beforeEach(() => {
		cy.login('admin@test.com', '123456');
		cy.wait(1000);
		cy.visit('/admin/accounts');

	});

	it('should show new user when successfully created user', () => {
		// cy.intercept('POST', '**/admin/users').as('addUser');
		cy.findByTestId('btnCreateAccount').should('exist').click();
		cy.findByTestId('email').should('exist').type(email);
		cy.findByTestId('fullName').should('exist').type(fullName);
		cy.findByTestId('phone').should('exist').type(phone);
		cy.findByTestId('submitButton').should('exist').click();
		cy.wait(1000);
		// cy.wait('@addUser').its('response.status').should('eq', 200);
		cy.findByText('Đăng ký nhân viên thành công').should('be.visible');
		// cy.get("#form-user :checkbox").uncheck(permissions);
	});

	it('should show update user when successfully update user', () => {
		cy.contains('td', fullName)
			.parent()
			.findByTestId('editUser')
			.should('exist')
			.click();

		cy.findByTestId('email').should('exist');
		cy.findByTestId('fullName')
			.should('exist')
			.should('have.value', fullName)
			.clear()
			.type(fullNameUpdated);
		cy.findByTestId('phone')
			.should('have.value', phone)
			.clear()
			.type(phoneUpdated);
		cy.findByTestId('submitButton').should('exist').click();
		cy.wait(1000);
		cy.findByText('Cập nhật nhân viên thành công').should('be.visible');
		// cy.get("#form-user :checkbox").uncheck(permissions);
	});

	it('should show remove user when successfully delete user', () => {
		cy.contains('td', fullNameUpdated)
			.parent()
			.findByTestId('deleteUser')
			.should('exist')
			.click();

		cy.findByText('Đồng ý').should('exist').click();
		cy.wait(1000);
		cy.findByText('Xoá nhân viên thành công!').should('be.visible');
		// cy.get("#form-user :checkbox").uncheck(permissions);
	});
});
