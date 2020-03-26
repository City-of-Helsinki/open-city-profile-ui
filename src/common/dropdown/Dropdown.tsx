import React, { useEffect, useRef, useState } from 'react';

import styles from './Dropdown.module.css';

interface DropdownOption {
  id: string;
  label: string;
  altText?: string;
  icon?: string;
  url?: string;
  onClick?: () => void;
}
type DropdownOptions = DropdownOption[];

type Props = {
  options: DropdownOptions;
};

function Dropdown(props: Props) {
  const [isOpen, toggleDropdown] = useState(false);

  const isDropdown = props.options.length > 1;
  const navBarItem = props.options[0];

  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (event: Event) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      toggleDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className={styles.dropdownWrapper} ref={ref}>
      {/* The button text is the first item in the option list */}
      {isDropdown && (
        <React.Fragment>
          <button
            aria-haspopup={true}
            aria-expanded={isOpen}
            className={styles.navButton}
            onClick={() => toggleDropdown(prevState => !prevState)}
          >
            <span className={styles.label}>{navBarItem.label}</span>
            {navBarItem.icon && (
              <img
                src={navBarItem.icon}
                alt={navBarItem.altText || ''}
                className={styles.icon}
              />
            )}
          </button>
          {isOpen && (
            <div className={styles.dropdownContent}>
              {props.options.slice(1).map((option, index) =>
                option.url ? (
                  <a
                    id={option.id}
                    href={option.url}
                    className={styles.linkButton}
                    key={index}
                  >
                    {option.label}
                  </a>
                ) : (
                  <button
                    id={option.id}
                    key={index}
                    onClick={() => {
                      toggleDropdown(prevState => !prevState);
                      option.onClick && option.onClick();
                    }}
                    className={styles.dropdownContentOption}
                  >
                    {option.label}
                  </button>
                )
              )}
            </div>
          )}
        </React.Fragment>
      )}
      {/* If we have only one option, show it as a simple button */}
      {!isDropdown && (
        <button
          aria-label={navBarItem.label}
          id={navBarItem.label}
          onClick={() => {
            navBarItem.onClick && navBarItem.onClick();
          }}
          className={styles.navButton}
        >
          <span>{navBarItem.label}</span>
        </button>
      )}
    </div>
  );
}

export default Dropdown;
