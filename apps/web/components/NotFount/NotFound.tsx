'use client'
import React, { Suspense } from 'react'
import styles from './not-found.module.css';
import { MantineLoader } from '@whatsnxt/core-ui';

export function NotFoundComponent() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <div className={styles.notFoundContainer}>
                <h1 className={styles.title}>404 Not Found</h1>
                <p className={styles.description}>
                    Sorry, the page you are looking for does not exist.
                </p>
                <a className={styles.link} href="/">
                    Go back to home
                </a>
            </div>
        </Suspense>
    )
}