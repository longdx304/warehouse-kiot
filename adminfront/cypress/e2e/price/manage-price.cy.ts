describe('Customers spec', () => {
	const name = 'Test Create';
	const nameUpdate = 'Test Update';
	const description = 'Description';
	const descriptionUpdate = 'Description Update';
	beforeEach(() => {
		cy.login('admin@test.com', '123456');
		cy.wait(1000);
		cy.visit('/admin/pricing');
		cy.wait(1000);
	});

	it('should show create price list when successfully create price list', () => {
		cy.findByTestId('btn-add-customer-group').should('exist').click();
		cy.findByTestId('input-name').should('exist').type(name);
		cy.findByTestId('input-description').should('exist').type(description);
		cy.findByTestId('add-detail-form').should('exist').click();
		cy.wait(1000);
		cy.get(
			'#table-product tbody tr:nth-child(2) input[type="checkbox"]'
		).check();
		cy.findByTestId('add-product').should('exist').click();
		cy.findByTestId('discount-percent').type(10 as unknown as string);
		cy.findByTestId('submit-draft').click();
		cy.findByText('Đồng ý').click();
		cy.findByText('Tạo định giá cho các sản phẩm thành công').should(
			'be.visible'
		);
	});

	it('should show update status active price list when successfully update status', () => {
		cy.contains('td', name)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Xuất bản').should('exist').click();
		cy.wait(500);
		cy.findByText('Cập nhật trạng thái thành công').should('be.visible');
	});

	it('should show update price list when successfully update price list', () => {
		cy.contains('td', name)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Chỉnh sửa thông tin chung').should('exist').click();
		cy.findByTestId('input-name')
			.should('have.value', name)
			.clear()
			.type(nameUpdate);
		cy.findByTestId('input-description')
			.should('have.value', description)
			.clear()
			.type(descriptionUpdate);
		cy.findByTestId('submitButton').click();
		cy.findByText('Cập nhật định giá thành công').should('be.visible');
	});

	it('should show update price when successfully update price', () => {
		cy.contains('td', nameUpdate)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Danh sách sản phẩm').should('exist').click();
		cy.get('#action-product a[data-testid="action-ables"]')
			.should('exist')
			.click();
		cy.findByText('Chỉnh sửa tất cả giá').should('exist').click();
		cy.findByTestId('discount-percent').type(10 as unknown as string);
		cy.findByTestId('submit-all-price').should('exist').click();
		cy.wait(500);
		cy.findByText('Chỉnh sửa định giá thành công').should('be.visible');
	});

	it('should show add product when successfully add product', () => {
		cy.contains('td', nameUpdate)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Danh sách sản phẩm').should('exist').click();
		cy.get('#action-product a[data-testid="action-ables"]')
			.should('exist')
			.click();
		cy.findByText('Thêm sản phẩm').should('exist').click();
		cy.wait(500);
		cy.get(
			'#table-product tbody tr:nth-child(3) input[type="checkbox"]'
		).check();
		cy.findByTestId('add-product').should('exist').click();
		cy.findByTestId('discount-percent').type(10 as unknown as string);
		cy.findByTestId('submit-add-product').should('exist').click();
		cy.wait(500);
		cy.findByText('Thêm sản phẩm vào danh sách định giá thành công').should(
			'be.visible'
		);
	});

	// it('should show remove product when successfully remove product', () => {
	// 	cy.contains('td', nameUpdate)
	// 		.parent()
	// 		.findByTestId('action-ables')
	// 		.should('exist')
	// 		.click();
	// 	cy.findByText('Danh sách sản phẩm').should('exist').click();

	// 	cy.wait(500);
	// 	// cy.get('#table-product tbody tr:nth-child(1) a[data-testid="action-ables"]').should('exist').click();
	// 	cy.contains('#table-product td', 2)
	// 	.parent()
	// 	.findByTestId('action-ables')
	// 	.should('exist')
	// 	.click();
	// 	// cy.findByText('Xoá').should('exist').click();
	// 	// cy.wait(500);
	// 	// cy.findByText('Thêm sản phẩm vào danh sách định giá thành công').should('be.visible');
	// });

	it('should show delete price list when successfully delete price list', () => {
		cy.contains('td', nameUpdate)
			.parent()
			.findByTestId('action-ables')
			.should('exist')
			.click();
		cy.findByText('Xóa').should('exist').click();
		cy.findByText('Đồng ý').should('exist').click();
		cy.wait(500);
		cy.findByText('Xoá định giá thành công').should('be.visible');
	});
});
