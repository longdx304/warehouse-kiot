'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Modal, Steps } from 'antd';
import { clsx } from 'clsx';
import React, {
	createContext,
	ReactNode,
	useContext,
	useMemo,
	useReducer,
} from 'react';

// Types
type StepModalScreen = {
	title: string;
	content: ReactNode;
};

interface StepModalProps {
	open: boolean;
	onCancel: () => void;
	title: string;
	steps: StepModalScreen[];
	onFinish: () => void;
	isMobile?: boolean;
	loading?: boolean;
}

// Step Context
enum StepActions {
	NEXT,
	PREV,
	RESET,
	SET_PAGE,
	ENABLE_NEXT,
	DISABLE_NEXT,
}

interface SteppedContextType {
	currentStep: number;
	nextEnabled: boolean;
	goToNext: () => void;
	goToPrev: () => void;
	reset: () => void;
	setStep: (step: number) => void;
	enableNext: () => void;
	disableNext: () => void;
}

export const SteppedContext = createContext<SteppedContextType | null>(null);

const stepReducer = (
	state: { currentStep: number; nextEnabled: boolean },
	action: { type: StepActions; payload?: any }
) => {
	switch (action.type) {
		case StepActions.NEXT:
			return { ...state, currentStep: state.currentStep + 1 };
		case StepActions.PREV:
			return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
		case StepActions.RESET:
			return { ...state, currentStep: 0, nextEnabled: true };
		case StepActions.SET_PAGE:
			return { ...state, currentStep: action.payload };
		case StepActions.ENABLE_NEXT:
			return { ...state, nextEnabled: true };
		case StepActions.DISABLE_NEXT:
			return { ...state, nextEnabled: false };
		default:
			return state;
	}
};

// Step Provider Component
export const StepModalProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(stepReducer, {
		currentStep: 0,
		nextEnabled: true,
	});

	const contextValue = useMemo(
		() => ({
			currentStep: state.currentStep,
			nextEnabled: state.nextEnabled,
			goToNext: () => dispatch({ type: StepActions.NEXT }),
			goToPrev: () => dispatch({ type: StepActions.PREV }),
			reset: () => dispatch({ type: StepActions.RESET }),
			setStep: (step: number) =>
				dispatch({ type: StepActions.SET_PAGE, payload: step }),
			enableNext: () => dispatch({ type: StepActions.ENABLE_NEXT }),
			disableNext: () => dispatch({ type: StepActions.DISABLE_NEXT }),
		}),
		[state]
	);

	return (
		<SteppedContext.Provider value={contextValue}>
			{children}
		</SteppedContext.Provider>
	);
};

// Hook for using step context
export const useStepModal = () => {
	const context = useContext(SteppedContext);
	if (!context) {
		throw new Error('useStepModal must be used within a StepModalProvider');
	}
	return context;
};

// Main StepModal Component
export const StepModal: React.FC<StepModalProps> = ({
	open,
	onCancel,
	title,
	steps,
	onFinish,
	isMobile = false,
	loading = false,
}) => {
	const SteppedContext = useStepModal();

	const handleClose = () => {
		SteppedContext.reset();
		onCancel();
	};

	const handleNext = () => {
		if (SteppedContext.currentStep === steps.length - 1) {
			onFinish();
		} else {
			SteppedContext.goToNext();
		}
	};

	const renderTitle = () => (
		<div className="flex items-center gap-4">
			{SteppedContext.currentStep > 0 && (
				<Button
					icon={<ArrowLeftOutlined />}
					type="text"
					onClick={SteppedContext.goToPrev}
				/>
			)}
			<span className="text-lg font-medium">{title}</span>
		</div>
	);

	return (
		<Modal
			open={open}
			onCancel={handleClose}
			title={renderTitle()}
			maskClosable={false}
			footer={[
				<Button
					key="back"
					onClick={SteppedContext.goToPrev}
					disabled={SteppedContext.currentStep === 0}
				>
					Quay lại
				</Button>,
				<Button
					key="next"
					type="primary"
					onClick={handleNext}
					disabled={!SteppedContext.nextEnabled}
				>
					{SteppedContext.currentStep === steps.length - 1 ? 'Tạo' : 'Tiếp tục'}
				</Button>,
			]}
			width={isMobile ? '95%' : 800}
			centered
			styles={{
				body: {
					maxHeight: isMobile ? '65vh' : '600px',
					overflowY: 'auto',
				},
			}}
			style={{
				top: isMobile ? 20 : undefined,
			}}
			className={isMobile ? 'mobile-step-modal' : ''}
			loading={loading}
		>
			<div className={`mb-6 ${isMobile ? 'px-2' : ''}`}>
				<Steps
					current={SteppedContext.currentStep}
					items={steps.map((step) => ({ title: step.title }))}
					size={isMobile ? 'small' : 'default'}
					direction="horizontal"
					className="flex-row"
				/>
			</div>
			<div
				className={clsx(
					'transition-all duration-200',
					'min-h-[200px]',
					isMobile ? 'p-2' : 'p-4'
				)}
			>
				{steps[SteppedContext.currentStep].content}
			</div>
		</Modal>
	);
};
