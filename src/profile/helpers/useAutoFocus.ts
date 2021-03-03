import { useEffect, useRef } from 'react';

type Props = {
  targetId: string;
};
type AutoFocusReturnType = {
  autoFocusTargetId: string;
  activateAutoFocusing: () => void;
  deactivateAutoFocusing: () => void;
};
export function useAutoFocus(props: Props): AutoFocusReturnType {
  const { targetId } = props;
  const activeRef = useRef<boolean>(false);
  const setFocus = activeRef.current;
  const activateAutoFocusing = () => (activeRef.current = true);
  const deactivateAutoFocusing = () => (activeRef.current = false);
  useEffect(() => {
    if (setFocus) {
      activeRef.current = false;
      const editButton = document.getElementById(targetId);
      if (editButton) {
        editButton.focus();
      }
    }
  }, [setFocus, targetId]);
  return {
    autoFocusTargetId: targetId,
    activateAutoFocusing,
    deactivateAutoFocusing,
  };
}
