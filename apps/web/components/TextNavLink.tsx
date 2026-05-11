import { Text } from "@mantine/core";
import Link from "next/link";
import type { ReactNode } from "react";

export type TextNavLinkProps = {
    href: string;
    children: ReactNode;
    /** Defaults to 600; use `"inherit"` inside paragraphs so weight matches surrounding copy. */
    fw?: number | "inherit";
    /** Mantine `Text` size (e.g. `sm`). */
    size?: React.ComponentProps<typeof Text>["size"];
};

/**
 * RSC-safe navigation: do not pass `next/link` into Mantine `Anchor component={Link}` — Mantine lives on the
 * client and Next forbids passing function props across the server→client boundary.
 */
export function TextNavLink({ href, children, fw = 600, size }: TextNavLinkProps) {
    const spanProps =
        fw === "inherit"
            ? ({ inherit: true as const, size } as const)
            : ({ fw, size } as const);

    return (
        <Link href={href} prefetch style={{ textDecoration: "none" }}>
            <Text component="span" c="blue" {...spanProps} style={{ cursor: "pointer" }}>
                {children}
            </Text>
        </Link>
    );
}
