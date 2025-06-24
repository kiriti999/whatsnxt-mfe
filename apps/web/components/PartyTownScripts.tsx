// place all script to be loaded by PartyTownAdd commentMore actions
import { Partytown } from "@qwik.dev/partytown/react";
import Script from 'next/script';
import React from 'react';

export default function PartyTownScripts() {
    return (
        <>
            <Partytown forward={['dataLayer.push']} />
            <Script
                type="text/partytown"
                src="https://www.googletagmanager.com/gtag/js?id=GT-K55MWM3"
                strategy="afterInteractive"
            />
            <Script
                type="text/partytown"
                id="GA"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GT-K55MWM3');
          `,
                }}
            />
        </>
    );
}