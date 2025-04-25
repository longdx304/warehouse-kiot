import { useState } from 'react';

export type StateType = [boolean, () => void, () => void, () => void] & {
	state: boolean;
	onOpen: () => void;
	onClose: () => void;
	onToggle: () => void;
};

/**
 *
 * @param initialState - boolean
 * @returns An array like object with `state`, `open`, `close`, and `toggle` properties
 *  to allow both object and array destructuring
 *
 * ```
 *  const [showModal, openModal, closeModal, toggleModal] = useToggleState()
 *  // or
 *  const { state, open, close, toggle } = useToggleState()
 * ```
 */

const useToggleState = (initialState = false) => {
	const [state, setState] = useState<boolean>(initialState);

	const onClose = () => {
		setState(false);
	};

	const onOpen = () => {
		setState(true);
	};

	const onToggle = () => {
		setState((state) => !state);
	};

	const hookData = [state, onOpen, onClose, onToggle] as StateType;
	hookData.state = state;
	hookData.onOpen = onOpen;
	hookData.onClose = onClose;
	hookData.onToggle = onToggle;
	return hookData;
};

export default useToggleState;
