describe('Customers spec', () => {
	const nameCustomerGroup = 'Test Customer Group Create';
	const nameCustomerGroupUpdate = 'Test Customer Group Update';
	beforeEach(() => {
		cy.login('admin@test.com', '123456');
		cy.wait(1000);
		cy.visit('/admin/customers');
		cy.wait(1000);
	});

	it('should show create group customer when successfully create group customer', () => {
		cy.findByText('Nhóm khách hàng').should('exist').click();
		cy.findByTestId('btn-add-customer-group').should('exist').click();
		cy.findByTestId('input-name').should('exist').type(nameCustomerGroup);
		cy.findByTestId('submitButton').should('exist').click();
		cy.wait(500);
		cy.findByText('Tạo nhóm khách hàng thành công.').should('be.visible');
	});

	it('should show update group customer when successfully update group customer', () => {
		cy.findByText('Nhóm khách hàng').should('exist').click();
		cy.contains('td', nameCustomerGroup)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Chỉnh sửa').should('exist').click();
		cy.findByTestId('input-name')
			.should('have.value', nameCustomerGroup)
			.clear()
			.type(nameCustomerGroupUpdate);
		cy.findByTestId('submitButton').should('exist').click();
		cy.wait(500);
		cy.findByText('Cập nhật thông tin thành công.').should('be.visible');
	});

	it('should show add member when successfully add member', () => {
		cy.findByText('Nhóm khách hàng').should('exist').click();
		cy.contains('td', nameCustomerGroupUpdate)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Quản lý thành viên').should('exist').click();
		cy.findByTestId('btn-add-member').should('exist').click();
		cy.get('tbody tr:nth-child(2) input[type="checkbox"]').check();
		cy.findByTestId('submit-button-edit-customer').should('exist').click();
		cy.wait(500);
		cy.findByText('Thêm khách hàng thành công').should('be.visible');
	});

	it('should show remove member when successfully remove member', () => {
		cy.findByText('Nhóm khách hàng').should('exist').click();
		cy.contains('td', nameCustomerGroupUpdate)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Quản lý thành viên').should('exist').click();
		cy.wait(500);
		cy.get('#table-customer-group tbody tr:nth-child(2) a[data-testid="action-ables"]').should('exist').click();
		cy.findByText('Xoá khách hàng').should('exist').click();
		cy.findByText('OK').should('exist').click();
		cy.findByText('Xóa khách hàng thành công').should('be.visible');
	})

	it('should show delete group member when successfully delete group member', () => {
		cy.findByText('Nhóm khách hàng').should('exist').click();
		cy.contains('td', nameCustomerGroupUpdate)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Xoá').should('exist').click();
		cy.findByText('OK').should('exist').click();
		cy.findByText('Xóa nhóm khách hàng thành công').should('be.visible');
	})
});
