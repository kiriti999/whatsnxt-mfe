import React from 'react';
import Image from 'next/image';

function TrainerImage() {
  return (
    <Image
      src="/images/trainer.png"
      width={500}
      height={500}
      alt="search trainer"
    />
  );
}

export default TrainerImage;
