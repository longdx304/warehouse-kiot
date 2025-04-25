// import LoginTemplate from '@/modules/account/components/login';
// import ErrorMessage from '@/modules/common/components/error-message';
// import { adminLogIn } from '@/services/accounts';
// import '@testing-library/jest-dom';
// import { cleanup, render, screen } from '@testing-library/react';
// import { getToken } from '@/actions/accounts';

// jest.mock('react-dom', () => ({
// 	useFormState: jest.fn(() => [null, jest.fn()]),
// 	useFormStatus: jest.fn(() => [null, jest.fn()]),
// }));

// jest.mock('../../src/actions/accounts.ts', () => ({
// 	getToken: jest.fn(),
// }));

// afterEach(cleanup);

// describe('Login Template', () => {
// 	it('should render login form', () => {
// 		render(<LoginTemplate />);

// 		expect(screen.getByTestId('email')).toBeInTheDocument();
// 		expect(screen.getByTestId('password')).toBeInTheDocument();
// 		expect(screen.getByTestId('submitBtn')).toBeInTheDocument();
// 	});

// 	it('should render error message when error is present', () => {
// 		render(<ErrorMessage error="Test error" data-testid="error" />);

// 		expect(screen.getByTestId('error')).toBeInTheDocument();
// 		expect(screen.getByTestId('error')).toHaveTextContent('Test error');
// 	});

// 	it('should return error for invalid email', async () => {
// 		const formData = new FormData();
// 		formData.append('email', 'testexample.com');
// 		formData.append('password', 'validpassword');

// 		try {
// 			await adminLogIn(null, formData);
// 		} catch (error) {
// 			expect(error).toEqual({ result: 'Email không đúng định dạng' });
// 		}
// 	});

// 	it('should return error for invalid email', async () => {
// 		const formData = new FormData();
// 		formData.append('email', 'test@example.com');
// 		formData.append('password', 'short');

// 		try {
// 			await adminLogIn(null, formData);
// 		} catch (error) {
// 			expect(error).toEqual({
// 				result: 'Mật khẩu phải ít nhất phải có 6 ký tự',
// 			});
// 		}
// 	});

// 	it('should return null result on successful login', async () => {
// 		getToken.mockResolvedValueOnce([]);

// 		const result = await getToken({
// 			email: 'test@example.com',
// 			password: 'validpassword',
// 		});
// 		expect(result).toEqual([]);
// 	});

// 	it('should return error message on failed login', async () => {
// 		getToken.mockResolvedValueOnce('Email hoặc mật khẩu không đúng!');

// 		const result = await getToken({
// 			email: 'test@example.com',
// 			password: 'invalidpassword',
// 		});
// 		expect(result).toEqual('Email hoặc mật khẩu không đúng!');
// 	});
// });
