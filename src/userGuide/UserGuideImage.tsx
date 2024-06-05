import React from 'react';

import styles from './UserGuide.module.css';

interface ImageProps {
  alt: string;
  src: string;
}

function UserGuideImage({ src, alt }: ImageProps): React.ReactElement {
  return (
    <p>
      <img src={src} alt={alt} />
      <p className={styles['image-text']}>{alt}</p>
    </p>
  );
}

export default UserGuideImage;
