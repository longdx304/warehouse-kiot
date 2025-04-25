import { clear } from 'console';

describe('template spec', () => {
	const productName = 'product test 1';
	const productNameUpdated = 'product test 2';
	const color = 'red';
	const colorUpdated = 'blue';
	const quantity = '10';
	const quantityUpdated = '20';
	const price = '10000';
	const priceUpdated = '20000';
	const inventoryQuantity = '100';
	const inventoryQuantityUpdated = '200';
	const sizes = ['S', 'M'];
	const sizesUpdated = ['S'];

	beforeEach(() => {
		cy.login('admin@test.com', '123456'), cy.wait(1000), cy.visit('/products');
	});

	it('should show new product when successfully created product', () => {
		cy.findByTestId('btnCreateProduct').should('exist').click();
		cy.findByTestId('title').should('exist').type(productName);
		cy.findByTestId('categories').should('exist').click();
		cy.get('.ant-select-tree-checkbox').first().click();

		cy.findByTestId('sizes')
			.should('exist')
			.then(($select) => {
				// Find the input element within the TreeSelect component
				const $selectInput = $select.find('.ant-select-selector input');

				// Type into the input field
				cy.wrap($selectInput).type(sizes.join(','), { force: true });
			});

		cy.findByTestId('color').should('exist').type(color);
		cy.findByTestId('quantity').should('exist').type(quantity);
		cy.findByTestId('price').should('exist').type(price);
		cy.findByTestId('inventoryQuantity')
			.should('exist')
			.type(inventoryQuantity);
		cy.findByTestId('submitButton').should('exist').click();

		cy.wait(1000);
		cy.findByText('Thêm sản phẩm thành công').should('be.visible');
	});

	it('should show update product when successfully update product', () => {
		cy.contains('td', productName)
			.parent()
			.findByTestId('editProduct')
			.should('exist')
			.click();
		cy.findByTestId('title').should('exist').clear().type(productNameUpdated);

		cy.findByTestId('categories').should('exist').click();
		cy.get('.ant-select-tree-checkbox').last().click();

		cy.findByTestId('sizes')
			.should('exist')
			.then(($select) => {
				// Get the input within the Select
				const $selectInput = $select.find('.ant-select-selector input');

				// Clear the input by sending backspaces
				cy.wrap($selectInput).clear({ force: true });
			});

		// Choose the first option in the dropdown
		cy.get('.ant-select-item-option').first().click();

		// Get the input again and check the value
		cy.findByTestId('color')
			.should('have.value', color)
			.clear({ force: true })
			.type(colorUpdated);

		cy.findByTestId('quantity')
			.should('have.value', quantity)
			.clear({ force: true })
			.type(quantityUpdated);
		cy.findByTestId('price')
			.should('have.value', price)
			.clear({ force: true })
			.type(priceUpdated);
		cy.findByTestId('inventoryQuantity')
			.should('have.value', inventoryQuantity)
			.clear({ force: true })
			.type(inventoryQuantityUpdated);
		cy.findByTestId('submitButton').should('exist').click();

		cy.wait(1000);
		cy.findByText('Cập nhật sản phẩm thành công').should('be.visible');
	});

	it('should show remove product when successfully delete product', () => {
		cy.contains('td', productName)
			.parent()
			.findByTestId('deleteProduct')
			.should('exist')
			.click();

		cy.findByText('Đồng ý').should('exist').click();
		cy.wait(1000);
		cy.findByText('Xoá sản phẩm thành công!').should('be.visible');
	});
});
