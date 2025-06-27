import React, { useContext } from "react";
import { TiptapManageContext } from '../../../context/TiptapManageContext';
import { Progress } from '@mantine/core';

const colors = ['blue', 'green', 'pink', 'orange', 'purple', 'yellow'];

const AssetUploadProgress = () => {
    const { progressList, isAssetsUploading } = useContext(TiptapManageContext)

    return (
        <div>
            {progressList && progressList.length > 0 ? (
                <Progress.Root size="xl" transitionDuration={200}>
                    {progressList.map((e, index) => (
                        <Progress.Section
                            key={e?.fileName || index}
                            value={e.progress}
                            animated
                            color={colors[index % colors.length]}
                        >
                            <Progress.Label>{e?.fileName}</Progress.Label>
                        </Progress.Section>
                    ))}
                </Progress.Root>
            ) : null}
        </div>
    );
};

export default AssetUploadProgress;