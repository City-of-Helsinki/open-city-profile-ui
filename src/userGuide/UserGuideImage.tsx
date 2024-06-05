import React from 'react';

interface ImageProps {
  alt: string;
  src: string;
}

function UserGuideImage({ src, alt }: ImageProps): React.ReactElement {
  return (
    <p>
      <img src={src} alt={alt} />
      <p>{alt}</p>
    </p>
  );
}

export default UserGuideImage;
