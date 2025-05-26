import React from 'react';

import styles from './UserGuide.module.css';

interface ImageProps {
  alt: string;
  src: string;
}

function UserGuideImage({ src, alt }: ImageProps): React.ReactElement {
  return (
    <div>
      <img src={src} alt={alt} loading='lazy' />
      <p className={styles['image-text']}>{alt}</p>
    </div>
  );
}

export default UserGuideImage;
