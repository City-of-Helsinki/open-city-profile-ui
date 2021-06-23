import { useRef, useState } from 'react';

import { Props as ModalComponentProps } from '../components/modals/confirmationModal/ConfirmationModal';

type AsyncModalProps = Pick<
  ModalComponentProps,
  'title' | 'content' | 'actionButtonText'
>;

type AsyncModalPromiseControls = {
  resolve?: (result: boolean) => void;
  reject?: (result: boolean) => void;
};

type AsyncModalReturnType = {
  showModal: (props: AsyncModalProps) => Promise<boolean>;
  modalProps: ModalComponentProps;
};

export function useConfirmationModal(): AsyncModalReturnType {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const componentPropsRef = useRef<ModalComponentProps>({
    isOpen,
    actionButtonText: '',
    onClose: () => false,
    onConfirm: () => false,
  });
  const controlsRef = useRef<AsyncModalPromiseControls>({});

  const closeModal = () => {
    controlsRef.current = {};
    componentPropsRef.current.isOpen = false;
    setIsOpen(componentPropsRef.current.isOpen);
  };

  const showModal: AsyncModalReturnType['showModal'] = props => {
    const currentControls = controlsRef.current;
    if (currentControls.reject) {
      currentControls.reject(true);
    }
    const newControls: AsyncModalPromiseControls = {};
    const promise: Promise<boolean> = new Promise((resolve, reject) => {
      newControls.resolve = resolve;
      newControls.reject = reject;
    });
    controlsRef.current = newControls;
    const newComponentProps = {
      ...props,
      isOpen: true,
      onClose: () => {
        newControls.reject && newControls.reject(true);
        closeModal();
      },
      onConfirm: () => {
        newControls.resolve && newControls.resolve(true);
        closeModal();
      },
    };
    Object.assign(componentPropsRef.current, newComponentProps);

    controlsRef.current = newControls;
    setIsOpen(true);
    return promise;
  };

  return {
    showModal,
    modalProps: componentPropsRef.current,
  };
}
