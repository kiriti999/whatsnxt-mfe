import { Button } from '@mantine/core'
import Link from 'next/link'
import React from 'react'

function NotFound() {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: "100px",
                gap: "1.25rem"
            }}
        >
            <h4>Page Not Found</h4>
            <Link href={"/"}>
                <Button >Return Home</Button>
            </Link>
        </div>
    )
}

export default NotFound
