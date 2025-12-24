import { Box, Title, Text } from '@mantine/core'

export const ImageRequirements = () => {
    return (
        <Box mt="lg" style={{ textAlign: 'left' }}>
            <Title order={5}>Image Requirements</Title>
            <Text size="sm" mt="xs">
                <strong>Image formats:</strong> The file format must be .jpg, .jpeg, or .png.
            </Text>
            <Text size="sm" mt="xs">
                <strong>Image dimensions:</strong> Always design your tutorial image at the following pixel dimensions. The image design needs to be within the content safe area for maximum visibility.
            </Text>
            <Text size="sm" mt="xs">
                <strong>Minimum required dimensions:</strong> 750 × 422 pixels
            </Text>
            <Text size="sm" mt="xs">
                <strong>Maximum required dimensions:</strong> 6000 × 6000 pixels
            </Text>
            <Text size="sm" mt="xs">
                <strong>File size:</strong> Maximum 2MB
            </Text>
            <Text size="sm" mt="xs" c="blue">
                <strong>AI Safety:</strong> All images are automatically scanned for inappropriate content before upload.
            </Text>
        </Box>
    )
}