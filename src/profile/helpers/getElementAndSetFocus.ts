export default function getElementAndSetFocus(
  selector: string,
  setFocusableAttributeIfNeeded = true
): boolean {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    if (document.activeElement === element) {
      return true;
    }
    element.focus();
    if (
      document.activeElement !== element &&
      element.getAttribute('tabindex') === null &&
      setFocusableAttributeIfNeeded
    ) {
      element.setAttribute('tabindex', '-1');
      element.focus();
    }
    return document.activeElement === element;
  }
  return false;
}
