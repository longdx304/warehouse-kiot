'use client';
import { Button } from '@/components/Button';
import { Text } from '@/components/Typography';
import { Modal, ModalProps } from 'antd';
import clsx from 'clsx';
import { Undo2, X } from 'lucide-react';
import React, {
	createContext,
	ReactNode,
	useContext,
	useMemo,
	useReducer,
} from 'react';

enum LayeredModalActions {
	PUSH,
	POP,
	RESET,
}

export type LayeredModalScreen = {
	title: string | ReactNode;
	subtitle?: string;
	onBack: () => void;
	onConfirm?: () => void;
	footer?: ReactNode;
	view: ReactNode;
};

export type ILayeredModalContext = {
	screens: LayeredModalScreen[];
	push: (screen: LayeredModalScreen) => void;
	pop: () => void;
	reset: () => void;
};

const defaultContext: ILayeredModalContext = {
	screens: [],
	push: (screen) => {},
	pop: () => {},
	reset: () => {},
};

export const LayeredModalContext = createContext(defaultContext);

const reducer = (state: any, action: any) => {
	switch (action.type) {
		case LayeredModalActions.PUSH: {
			return { ...state, screens: [...state.screens, action.payload] };
		}
		case LayeredModalActions.POP: {
			return { ...state, screens: state.screens.slice(0, -1) };
		}
		case LayeredModalActions.RESET: {
			return { ...state, screens: [] };
		}
	}
};

export const LayeredModalProvider = ({ children }: any) => {
	const [state, dispatch] = useReducer(reducer, defaultContext);

	const contextValue = useMemo(
		() => ({
			...state,
			push: (screen: LayeredModalScreen) => {
				dispatch({ type: LayeredModalActions.PUSH, payload: screen });
			},

			pop: () => {
				dispatch({ type: LayeredModalActions.POP });
			},

			reset: () => {
				dispatch({ type: LayeredModalActions.RESET });
			},
		}),
		[state, dispatch]
	);

	return (
		<LayeredModalContext.Provider value={contextValue}>
			{children}
		</LayeredModalContext.Provider>
	);
};

export const useLayeredModal = () => {
	const context = useContext(LayeredModalContext);
	if (context === null) {
		throw new Error(
			'useLayeredModal must be used within a LayeredModalProvider'
		);
	}
	return context;
};

type LayeredModalProps = {
	context: ILayeredModalContext;
	onCancel: () => void;
	title?: ReactNode | string;
	footer?: ReactNode;
} & ModalProps;

const LayeredModal = ({
	context,
	children,
	onCancel,
	open,
	title,
	footer,
	...props
}: LayeredModalProps) => {
	const emptyScreensAndClose = () => {
		context.reset();
		onCancel();
	};
	const screen = context.screens[context.screens.length - 1];

	const renderTitle = useMemo(() => {
		if (screen) {
			return (
				<div className="flex items-center">
					<Button
						type="text"
						size="small"
						className="text-gray-500 h-10 w-10 border"
						onClick={screen?.onBack}
					>
						<Undo2 size={40} strokeWidth={2} />
					</Button>
					<div className="gap-4 flex items-center">
						<Text strong className="text-[20px] font-normal ml-4">
							{screen?.title}
						</Text>
						{screen?.subtitle && (
							<span className="font-medium text-gray-500">
								({screen?.subtitle})
							</span>
						)}
					</div>
				</div>
			);
		}
		return title;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [screen]);

	const renderFooter = useMemo(
		() => {
			if (screen) {
				return screen.footer;
			}
			return footer;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[screen]
	);

	return (
		<Modal
			open={open}
			onCancel={emptyScreensAndClose}
			okText="Đồng ý"
			cancelText="Hủy"
			footer={renderFooter}
			styles={{
				header: { borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' },
				footer: { borderTop: '1px solid #e5e7eb', paddingTop: '16px' },
				body: { padding: '0px 16px' },
			}}
			title={renderTitle}
			{...props}
		>
			<div
				className={clsx(
					'flex flex-col justify-between transition-transform duration-200',
					{
						'translate-x-0 opacity-1': typeof screen !== 'undefined',
						'translate-x-full opacity-0': typeof screen === 'undefined',
					}
				)}
			>
				{screen ? screen.view : <></>}
			</div>
			<div
				className={clsx('transition-transform duration-200', {
					'-translate-x-full opacity-1': typeof screen !== 'undefined',
				})}
			>
				<div
					className={clsx('transition-display', {
						'hidden opacity-0 delay-500': typeof screen !== 'undefined',
					})}
				>
					{children}
				</div>
			</div>
		</Modal>
	);
};

export default LayeredModal;
