import React from 'react';

interface ImageProps {
  alt: string;
  src: string;
}

function UserGuideImage({ src, alt }: ImageProps): React.ReactElement {
  return (
    <p>
      <img src={src} alt={alt} />
      <i>{alt}</i>
    </p>
  );
}

export default UserGuideImage;
