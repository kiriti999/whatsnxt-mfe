import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SectionsAPI, Section, SectionCreateInput, SectionUpdateInput } from '../../apis/v1/sidebar/sectionsApi';
import { IconsAPI, Icon } from '../../apis/v1/sidebar/iconsApi';

// TypeScript interfaces
export interface NestedSidebarState {
  sections: Section[];
  icons: Icon[];
  tree: Section[];
  currentSection: Section | null;
  expandedSections: string[];
  loading: boolean;
  error: string | null;
  contentType: 'blog' | 'tutorial';
  variant: 'accordion' | 'navlink';
}

const initialState: NestedSidebarState = {
  sections: [],
  icons: [],
  tree: [],
  currentSection: null,
  expandedSections: [],
  loading: false,
  error: null,
  contentType: 'blog',
  variant: 'accordion',
};

// Load expanded sections from localStorage
const loadExpandedSections = (): string[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('nestedSidebar.expandedSections');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load expanded sections from localStorage:', error);
      return [];
    }
  }
  return [];
};

// Save expanded sections to localStorage
const saveExpandedSections = (sections: string[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('nestedSidebar.expandedSections', JSON.stringify(sections));
    } catch (error) {
      console.error('Failed to save expanded sections to localStorage:', error);
    }
  }
};

// Async thunks
export const fetchSections = createAsyncThunk(
  'nestedSidebar/fetchSections',
  async (contentType: 'blog' | 'tutorial') => {
    const sections = await SectionsAPI.listSections({ contentType, isVisible: true });
    return sections;
  }
);

export const fetchSectionTree = createAsyncThunk(
  'nestedSidebar/fetchSectionTree',
  async (contentType: 'blog' | 'tutorial') => {
    const tree = await SectionsAPI.getTree(contentType);
    return tree;
  }
);

export const fetchIcons = createAsyncThunk(
  'nestedSidebar/fetchIcons',
  async () => {
    const icons = await IconsAPI.listIcons();
    return icons;
  }
);

export const fetchSectionById = createAsyncThunk(
  'nestedSidebar/fetchSectionById',
  async (sectionId: string) => {
    const section = await SectionsAPI.getById(sectionId);
    return section;
  }
);

export const fetchSectionBySlug = createAsyncThunk(
  'nestedSidebar/fetchSectionBySlug',
  async ({ slug, contentType }: { slug: string; contentType: 'blog' | 'tutorial' }) => {
    const section = await SectionsAPI.getBySlug(slug, contentType);
    return section;
  }
);

export const createSection = createAsyncThunk(
  'nestedSidebar/createSection',
  async (input: SectionCreateInput) => {
    const section = await SectionsAPI.createSection(input);
    return section;
  }
);

export const updateSection = createAsyncThunk(
  'nestedSidebar/updateSection',
  async ({ id, input }: { id: string; input: SectionUpdateInput }) => {
    const section = await SectionsAPI.updateSection(id, input);
    return section;
  }
);

export const deleteSection = createAsyncThunk(
  'nestedSidebar/deleteSection',
  async (id: string) => {
    await SectionsAPI.deleteSection(id);
    return id;
  }
);

export const reorderSections = createAsyncThunk(
  'nestedSidebar/reorderSections',
  async (updates: Array<{ _id: string; order: number }>) => {
    await SectionsAPI.reorderSections(updates);
    return updates;
  }
);

// Helper function to find section and its ancestors for auto-expand
const findSectionAncestors = (tree: Section[], targetId: string, ancestors: string[] = []): string[] | null => {
  for (const section of tree) {
    if (section._id === targetId) {
      return ancestors;
    }
    if (section.children && section.children.length > 0) {
      const found = findSectionAncestors(section.children, targetId, [...ancestors, section._id]);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// Slice
const nestedSidebarSlice = createSlice({
  name: 'nestedSidebar',
  initialState,
  reducers: {
    // Toggle section expansion
    toggleSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      const index = state.expandedSections.indexOf(sectionId);
      
      if (index === -1) {
        state.expandedSections.push(sectionId);
      } else {
        state.expandedSections.splice(index, 1);
      }
      
      saveExpandedSections(state.expandedSections);
    },

    // Expand specific section
    expandSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      if (!state.expandedSections.includes(sectionId)) {
        state.expandedSections.push(sectionId);
        saveExpandedSections(state.expandedSections);
      }
    },

    // Collapse specific section
    collapseSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      state.expandedSections = state.expandedSections.filter(id => id !== sectionId);
      saveExpandedSections(state.expandedSections);
    },

    // Expand all sections
    expandAll: (state) => {
      const getAllSectionIds = (sections: Section[]): string[] => {
        return sections.reduce((ids, section) => {
          ids.push(section._id);
          if (section.children && section.children.length > 0) {
            ids.push(...getAllSectionIds(section.children));
          }
          return ids;
        }, [] as string[]);
      };

      state.expandedSections = getAllSectionIds(state.tree);
      saveExpandedSections(state.expandedSections);
    },

    // Collapse all sections
    collapseAll: (state) => {
      state.expandedSections = [];
      saveExpandedSections(state.expandedSections);
    },

    // Auto-expand parent sections when navigating to nested post
    autoExpandToSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      const ancestors = findSectionAncestors(state.tree, sectionId);
      
      if (ancestors) {
        // Add all ancestors to expanded sections
        ancestors.forEach(ancestorId => {
          if (!state.expandedSections.includes(ancestorId)) {
            state.expandedSections.push(ancestorId);
          }
        });
        
        // Also expand the target section itself
        if (!state.expandedSections.includes(sectionId)) {
          state.expandedSections.push(sectionId);
        }
        
        saveExpandedSections(state.expandedSections);
      }
    },

    // Set current section
    setCurrentSection: (state, action: PayloadAction<Section | null>) => {
      state.currentSection = action.payload;
    },

    // Set content type
    setContentType: (state, action: PayloadAction<'blog' | 'tutorial'>) => {
      state.contentType = action.payload;
    },

    // Set variant (accordion or navlink)
    setVariant: (state, action: PayloadAction<'accordion' | 'navlink'>) => {
      state.variant = action.payload;
    },

    // Load expanded sections from localStorage
    loadExpandedSectionsFromStorage: (state) => {
      state.expandedSections = loadExpandedSections();
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch sections
    builder
      .addCase(fetchSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.sections = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sections';
      });

    // Fetch section tree
    builder
      .addCase(fetchSectionTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSectionTree.fulfilled, (state, action) => {
        state.tree = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchSectionTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch section tree';
      });

    // Fetch icons
    builder
      .addCase(fetchIcons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIcons.fulfilled, (state, action) => {
        state.icons = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchIcons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch icons';
      });

    // Fetch section by ID
    builder
      .addCase(fetchSectionById.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentSection = action.payload;
        }
      });

    // Fetch section by slug
    builder
      .addCase(fetchSectionBySlug.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentSection = action.payload;
        }
      });

    // Create section
    builder
      .addCase(createSection.fulfilled, (state, action) => {
        state.sections.push(action.payload);
        // Refresh tree after creation (will be done by parent component)
      });

    // Update section
    builder
      .addCase(updateSection.fulfilled, (state, action) => {
        const index = state.sections.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.sections[index] = action.payload;
        }
        // Update current section if it's the one being updated
        if (state.currentSection && state.currentSection._id === action.payload._id) {
          state.currentSection = action.payload;
        }
      });

    // Delete section
    builder
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.sections = state.sections.filter(s => s._id !== action.payload);
        // Remove from expanded sections
        state.expandedSections = state.expandedSections.filter(id => id !== action.payload);
        saveExpandedSections(state.expandedSections);
        // Clear current section if it's the one being deleted
        if (state.currentSection && state.currentSection._id === action.payload) {
          state.currentSection = null;
        }
      });

    // Reorder sections
    builder
      .addCase(reorderSections.fulfilled, (state, action) => {
        // Update order in sections array
        action.payload.forEach(update => {
          const section = state.sections.find(s => s._id === update._id);
          if (section) {
            section.order = update.order;
          }
        });
        
        // Re-sort sections by order
        state.sections.sort((a, b) => a.order - b.order);
      });
  },
});

// Export actions
export const {
  toggleSection,
  expandSection,
  collapseSection,
  expandAll,
  collapseAll,
  autoExpandToSection,
  setCurrentSection,
  setContentType,
  setVariant,
  loadExpandedSectionsFromStorage,
  clearError,
} = nestedSidebarSlice.actions;

// Export reducer
export default nestedSidebarSlice.reducer;
export const nestedSidebarReducer = nestedSidebarSlice.reducer;
