"use client";

import { EditorPanel } from "../components/editor/EditorPanel";
import { PreviewPanel } from "../components/preview/PreviewPanel";
import classes from "./BuilderPage.module.css";

export function BuilderPage() {
    return (
        <div className={classes.builderLayout}>
            <div className={classes.editorPanel}>
                <EditorPanel />
            </div>
            <div className={classes.previewPanel}>
                <PreviewPanel />
            </div>
        </div>
    );
}
