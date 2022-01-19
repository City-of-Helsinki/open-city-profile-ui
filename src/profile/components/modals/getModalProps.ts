import { Props as ModalComponentProps } from './confirmationModal/ConfirmationModal';

type Props = {
  id: string;
  closeButtonText?: string;
} & Pick<ModalComponentProps, 'onClose'>;

type ModalProps = {
  titleId: string;
  descriptionId: string;
  dialogTargetElement: HTMLElement;
  close: () => void;
  closeButtonLabelText?: string;
};

function getModalTargetElement(): HTMLElement {
  return document.getElementById('root') as HTMLElement;
}

export function getModalProps(props: Props): ModalProps {
  const { id, onClose, closeButtonText } = props;

  return {
    titleId: `${id}-title`,
    descriptionId: `${id}-description`,
    dialogTargetElement: getModalTargetElement(),
    close: () => onClose(),
    closeButtonLabelText: closeButtonText,
  };
}
