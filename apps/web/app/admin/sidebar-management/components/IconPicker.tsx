import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextInput, 
  Select, 
  ScrollArea, 
  Group, 
  Text, 
  UnstyledButton,
  Stack,
  Loader,
  Center
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store/store';
import { fetchIcons } from '../../../../store/slices/nestedSidebarSlice';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  error?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, error }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { icons, loading } = useSelector((state: RootState) => state.nestedSidebar);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Load icons on mount
  useEffect(() => {
    if (icons.length === 0) {
      dispatch(fetchIcons());
    }
  }, [dispatch, icons.length]);

  // Get unique categories
  const categories = Array.from(new Set(icons.map(icon => icon.category))).sort();

  // Filter icons based on search and category
  const filteredIcons = icons.filter(icon => {
    const matchesSearch = !search || 
      icon.name.toLowerCase().includes(search.toLowerCase()) ||
      icon.displayName.toLowerCase().includes(search.toLowerCase()) ||
      icon.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = !categoryFilter || icon.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const iconComponentName = `Icon${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;
    const IconComponent = (TablerIcons as any)[iconComponentName];
    return IconComponent || TablerIcons.IconQuestionMark;
  };

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
  };

  if (loading && icons.length === 0) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <Group grow>
        <TextInput
          placeholder="Search icons..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          error={error}
        />
        <Select
          placeholder="All categories"
          data={[
            { value: '', label: 'All categories' },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
          value={categoryFilter || ''}
          onChange={(val) => setCategoryFilter(val || null)}
          clearable
        />
      </Group>

      <ScrollArea h={300} type="auto">
        <Group gap="sm">
          {filteredIcons.length === 0 ? (
            <Text size="sm" c="dimmed" p="md">
              No icons found
            </Text>
          ) : (
            filteredIcons.map((icon) => {
              const IconComponent = getIconComponent(icon.name);
              const isSelected = value === icon.name;

              return (
                <UnstyledButton
                  key={icon._id}
                  onClick={() => handleIconSelect(icon.name)}
                  p="md"
                  style={{
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-gray-3)',
                    borderRadius: 'var(--mantine-radius-sm)',
                    backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  data-selected={isSelected}
                >
                  <Stack align="center" gap="xs">
                    <IconComponent size={24} stroke={1.5} />
                    <Text size="xs" ta="center" lineClamp={1}>
                      {icon.displayName}
                    </Text>
                  </Stack>
                </UnstyledButton>
              );
            })
          )}
        </Group>
      </ScrollArea>

      {value && (
        <Box p="sm" style={{ 
          border: '1px solid var(--mantine-color-gray-3)', 
          borderRadius: 'var(--mantine-radius-sm)',
          backgroundColor: 'var(--mantine-color-gray-0)'
        }}>
          <Group gap="sm">
            <Text size="sm" fw={500}>
              Selected:
            </Text>
            {React.createElement(getIconComponent(value), { size: 20, stroke: 1.5 })}
            <Text size="sm">
              {icons.find(i => i.name === value)?.displayName || value}
            </Text>
          </Group>
        </Box>
      )}
    </Stack>
  );
};

export default IconPicker;
