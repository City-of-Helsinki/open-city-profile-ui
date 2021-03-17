import { useRef, useState } from 'react';

import { Props as ModalComponentProps } from './ConfirmationModal';

type ModalProps = Pick<
  ModalComponentProps,
  'modalTitle' | 'modalText' | 'actionButtonText'
>;

type ModalPromiseControls = {
  resolve?: (result: boolean) => void;
  reject?: (result: boolean) => void;
};

type ModalControls = {
  showModal: (props: ModalProps) => Promise<boolean>;
  modalProps: ModalComponentProps;
};

export function useConfirmationModal(): ModalControls {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const componentPropsRef = useRef<ModalComponentProps>({
    isOpen,
    actionButtonText: '',
    onClose: () => false,
    onConfirm: () => false,
  });
  const stateRef = useRef<ModalPromiseControls>({});

  const closeModal = () => {
    stateRef.current = {};
    componentPropsRef.current.isOpen = false;
    setIsOpen(componentPropsRef.current.isOpen);
  };

  const showModal: ModalControls['showModal'] = props => {
    const currentState = stateRef.current;
    if (currentState.reject) {
      currentState.reject(true);
    }
    const newState: ModalPromiseControls = {};
    const promise: Promise<boolean> = new Promise((resolve, reject) => {
      newState.resolve = resolve;
      newState.reject = reject;
    });
    stateRef.current = newState;
    const newComponentProps = {
      ...props,
      isOpen: true,
      onClose: () => {
        newState.reject && newState.reject(true);
        closeModal();
      },
      onConfirm: () => {
        newState.resolve && newState.resolve(true);
        closeModal();
      },
    };
    Object.assign(componentPropsRef.current, newComponentProps);

    stateRef.current = newState;
    setIsOpen(true);
    return promise;
  };

  return {
    showModal,
    modalProps: componentPropsRef.current,
  };
}
