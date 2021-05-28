import { useEffect, useRef } from 'react';

type Props = {
  targetId: string;
};
type FocusSetterReturnType = [string, () => void];
export function useFocusSetter(props: Props): FocusSetterReturnType {
  const { targetId } = props;
  const shouldSetFocusRef = useRef<boolean>(false);
  const setFocusToTarget = () => (shouldSetFocusRef.current = true);
  useEffect(() => {
    if (shouldSetFocusRef.current) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        shouldSetFocusRef.current = false;
        targetElement.focus();
      }
    }
  });
  return [targetId, setFocusToTarget];
}
