"use client"
import React, { useEffect, useRef } from 'react';
import { Box, Loader } from '@mantine/core';


export const InfiniteScrollComponent = ({ isLoading, onViewPortCallback, children, isScrollCompleted = false }: any) => {
    const observerRef: any = useRef(null);
    const targetRef = useRef(null);

    useEffect(() => {
        if (isScrollCompleted) return; // Don't observe if scrolling is completed

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    onViewPortCallback();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 1.0,
            }
        );

        if (targetRef.current) {
            observerRef.current.observe(targetRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [isScrollCompleted]);

    return (
        <div>
            {children}
            <Box ref={targetRef} display={'flex'} style={{ height: '30px', justifyContent: 'center', alignItems: 'center' }}>
                {!isScrollCompleted && isLoading ? <Loader color="blue" /> : null}
            </Box>
        </div>
    );
};

