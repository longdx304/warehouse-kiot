describe('Categories spec', () => {
	const nameCategory = 'Test Create Product Category';
	const nameCategoryUpdate = 'Test Update Product Category';
	const nameSubCategory = 'Test Create Sub Product Category';
	const nameSubCategoryUpdate = 'Test Update Sub Product Category';
	const description = '';

	beforeEach(() => {
		cy.login('admin@test.com', '123456');
		cy.wait(1000);
		cy.visit('/admin/product-categories');
		cy.wait(1000);
	});

	it('should show new product category when successfully created category', () => {
		cy.findByTestId('btnAddCategories').should('exist').click();
		cy.findByTestId('name').should('exist').type(nameCategory);
		cy.findByTestId('submitButton').should('exist').click();
		cy.wait(1000);
		cy.findByText('Đăng ký danh mục sản phẩm thành công').should('be.visible');
	});

	it('should show update product category when successfully update category', () => {
		cy.contains('li', nameCategory)
			.findByTestId('dropdownCategory')
			.should('exist')
			.click();
		cy.findByText('Chỉnh sửa').should('exist').click();
		cy.findByTestId('name')
			.should('exist')
			.should('have.value', nameCategory)
			.clear()
			.type(nameCategoryUpdate);
		cy.findByTestId('submitButton').should('exist').click();
		cy.wait(1000);
		cy.findByText('Cập nhật danh mục sản phẩm thành công').should('be.visible');
	});

	it('should show new sub product category when successfully created sub category', () => {
		cy.contains('li', nameCategory)
			.findByTestId('addSubCategory')
			.should('exist')
			.click();
		cy.findByTestId('breadcrumbCategory').should('be.visible');
		cy.findByTestId('name').should('exist').type(nameSubCategory);
		cy.findByTestId('submitButton').should('exist').click();
		cy.wait(1000);
		cy.findByText('Đăng ký danh mục sản phẩm thành công').should('be.visible');
	});

	it('should show update sub product category when successfully update sub category', () => {
		cy.contains('li', nameCategory)
			.findByTestId('collapseIcon')
			.should('exist')
			.click();
		cy.contains('li', nameSubCategory)
			.findByTestId('dropdownCategory')
			.should('exist')
			.click();
		cy.findByText('Chỉnh sửa').should('exist').click();
		cy.findByTestId('breadcrumbCategory').should('be.visible');
		cy.findByTestId('name')
			.should('exist')
			.should('have.value', nameSubCategory)
			.clear()
			.type(nameSubCategoryUpdate);
		cy.findByTestId('submitButton').should('exist').click();
		cy.wait(1000);
		cy.findByText('Cập nhật danh mục sản phẩm thành công').should('be.visible');
	});

	it('should show error message when failing to delete a category but there are still subcategories remaining', () => {
		cy.contains('li', nameCategory)
			.findByTestId('dropdownCategory')
			.should('exist')
			.click();

		cy.findByText('Xoá').should('exist').click();
		cy.findByText('Đồng ý').should('exist').click();
		cy.wait(1000);
		cy.findByText('Xoá danh mục thất bại').should('be.visible');
	});

	it('should show remove category when successfully delete sub subcategory', () => {
		cy.contains('li', nameCategoryUpdate)
			.findByTestId('collapseIcon')
			.should('exist')
			.click();

		cy.contains('li', nameSubCategoryUpdate)
			.findByTestId('dropdownCategory')
			.should('exist')
			.click();
		cy.findByText('Xoá').should('exist').click();
		cy.findByText('Đồng ý').should('exist').click();
		cy.wait(1000);
		cy.findByText('Xoá danh mục thành công').should('be.visible');
	});

	it('should show remove category when successfully to delete a category', () => {
		cy.contains('li', nameCategoryUpdate)
			.findByTestId('dropdownCategory')
			.should('exist')
			.click();

		cy.findByText('Xoá').should('exist').click();
		cy.findByText('Đồng ý').should('exist').click();
		cy.wait(1000);
		cy.findByText('Xoá danh mục thành công').should('be.visible');
	});
});
