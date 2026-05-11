import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Logo.module.css';
import logoSrc from './whatsnxt-mobile-logo.svg';

interface LogoProps {
  color?: 'white' | 'black';
  className?: string;
  width?: number | string;
  height?: number | string;
  variant?: 'navbar' | 'footer';
}

export const MobileLogo = ({
  color = 'black',
  className = '',
  width = 300,
  height = 75,
  variant = 'navbar',
}: LogoProps) => {
  const widthNum = typeof width === 'number' ? width : parseInt(width as string) || 300;
  const heightNum = typeof height === 'number' ? height : parseInt(height as string) || 75;

  const imageClassName =
    variant === 'footer'
      ? `${styles['navbar-brand']} ${styles.logoFooter}`
      : styles['navbar-brand'];

  return (
    <Link href="/" className={`${className}`}>
      <Image
        src={logoSrc}
        width={widthNum}
        height={heightNum}
        alt="Whatsnxt Logo"
        className={imageClassName}
        style={{
          filter: color === 'white' ? 'brightness(0) invert(1)' : 'none',
          objectFit: 'contain',
          width: width,
          height: height
        }}
        priority
      />
    </Link>
  );
};
