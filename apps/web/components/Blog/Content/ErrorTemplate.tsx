import React from 'react';
import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Group,
  ThemeIcon,
  Box
} from '@mantine/core';
import { IconHome, IconArrowLeft, IconSearchOff } from '@tabler/icons-react';

function ErrorTemplate() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl" align="center" ta="center" mih="60vh" justify="center">

        {/* Large 404 Display */}
        <Box
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}
        >
          <Title
            order={1}
            style={{
              fontSize: 'clamp(8rem, 20vw, 15rem)',
              fontWeight: 900,
              color: 'transparent',
              background: 'linear-gradient(135deg, #228be6 0%, #15aabf 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              textShadow: '0 4px 20px rgba(34, 139, 230, 0.3)',
              letterSpacing: '-0.02em'
            }}
          >
            404
          </Title>

          {/* Decorative Icon */}
          <ThemeIcon
            size={80}
            radius="xl"
            variant="light"
            color="blue"
            style={{
              position: 'absolute',
              top: '20%',
              right: '-10%',
              opacity: 0.7,
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            <IconSearchOff size={40} />
          </ThemeIcon>
        </Box>

        {/* Error Message */}
        <Stack gap="md" align="center" maw="500px">
          <Title
            order={2}
            size="h2"
            fw={700}
            ta="center"
            c="dark"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: '0.5rem'
            }}
          >
            Look like you are lost
          </Title>

          <Text
            size="lg"
            c="dimmed"
            ta="center"
            lh={1.6}
            maw="400px"
            style={{
              fontSize: '1.125rem'
            }}
          >
            The page you are looking for is not available!
          </Text>
        </Stack>

        {/* Action Buttons */}
        <Group gap="md" mt="xl">
          <Button
            component={Link}
            href="/"
            size="lg"
            leftSection={<IconHome size={20} />}
            variant="filled"
            color="blue"
            radius="md"
            style={{
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem'
            }}
          >
            Go Home
          </Button>

          <Button
            onClick={() => window.history.back()}
            size="lg"
            leftSection={<IconArrowLeft size={20} />}
            variant="light"
            color="blue"
            radius="md"
            style={{
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem'
            }}
          >
            Go Back
          </Button>
        </Group>

        {/* Additional Help Text */}
        <Text
          size="sm"
          c="dimmed"
          ta="center"
          mt="xl"
          style={{
            maxWidth: '400px',
            lineHeight: 1.5
          }}
        >
          If you think this is a mistake, please contact our support team or
          try searching for what you need from our homepage.
        </Text>

      </Stack>

      {/* Floating Animation CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Container>
  );
}

export default ErrorTemplate;