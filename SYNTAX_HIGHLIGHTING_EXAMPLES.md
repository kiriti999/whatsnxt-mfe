/**
 * IMPLEMENTATION EXAMPLES & CODE SAMPLES
 * 
 * Real-world examples of syntax highlighting in action across different languages
 */

// ============================================================================
// EXAMPLE 1: TypeScript React Component with Syntax Highlighting
// ============================================================================

/*
When you add this to the editor code block (marked as TypeScript):

```typescript
import React, { useState } from 'react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

export const BlogPostEditor: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = async () => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (response.ok) {
        setIsPublished(true);
      }
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  return (
    <div className="editor-container">
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={handlePublish}>Publish</button>
    </div>
  );
};
```

SYNTAX HIGHLIGHTING APPLIED:
- Keywords (import, interface, async, await, etc): #569CD6 Light Blue
- Strings ('react', '/api/posts', etc): #CE9178 Orange
- Types (React.FC, string, Date, etc): #4EC9B0 Cyan
- Comments: #6A9955 Green
- Functions (handlePublish, useState): #DCDCAA Yellow
- JSX Tags (<div>, <textarea>, etc): #569CD6 Light Blue
*/

// ============================================================================
// EXAMPLE 2: Python Function with Auto-Detection
// ============================================================================

/*
When you add this to the editor (NO language specified - auto-detected):

```
def process_user_data(users: list[dict]) -> dict:
    """
    Process user data and calculate statistics.
    
    Args:
        users: List of user dictionaries
        
    Returns:
        Dictionary with processed statistics
    """
    
    stats = {
        'total_users': len(users),
        'active_users': sum(1 for u in users if u.get('is_active')),
        'average_age': sum(u.get('age', 0) for u in users) / len(users),
    }
    
    # Filter users by age group
    adults = [u for u in users if u.get('age', 0) >= 18]
    minors = [u for u in users if u.get('age', 0) < 18]
    
    return {
        **stats,
        'adults': len(adults),
        'minors': len(minors),
    }
```

AUTO-DETECTION: Detects "def", imports pattern, and Python syntax
SYNTAX HIGHLIGHTING:
- Keywords (def, if, for, return): #569CD6 Light Blue
- Strings ('is_active', 'age'): #CE9178 Orange
- Numbers (18, 0): #B5CEA8 Light Green
- Comments (# Filter users): #6A9955 Green
- Built-in (len, sum): #DCDCAA Yellow
- Comments in docstring: Italic Green
*/

// ============================================================================
// EXAMPLE 3: SQL Query with Syntax Highlighting
// ============================================================================

/*
```sql
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(p.id) as total_posts,
    MAX(p.created_at) as last_post_date,
    AVG(DATEDIFF(p.created_at, NOW())) as days_since_last_post
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.is_active = true
    AND u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.name, u.email
HAVING COUNT(p.id) > 0
ORDER BY total_posts DESC
LIMIT 10;
```

AUTO-DETECTION: Detects SELECT, FROM, WHERE keywords (case-insensitive)
SYNTAX HIGHLIGHTING:
- Keywords (SELECT, FROM, WHERE, GROUP BY, HAVING): #569CD6 Light Blue
- Functions (COUNT, MAX, AVG, DATEDIFF): #DCDCAA Yellow
- Numbers (1, 30, 10): #B5CEA8 Light Green
- Strings ('posts', 'users'): #CE9178 Orange
- Operators (=, >, <=): #569CD6 Light Blue
*/

// ============================================================================
// EXAMPLE 4: HTML/CSS with Syntax Highlighting
// ============================================================================

/*
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Blog Post</title>
    <style>
        .blog-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
        }
        
        .blog-post h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        
        .code-block {
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="blog-container">
        <article class="blog-post">
            <h1>Getting Started with Syntax Highlighting</h1>
            <p>Code blocks now support automatic language detection...</p>
        </article>
    </div>
</body>
</html>
```

AUTO-DETECTION: Detects <!DOCTYPE html> and <html> tags
SYNTAX HIGHLIGHTING:
- HTML Tags (<div>, <h1>, etc): #569CD6 Light Blue
- Attributes (class, id, style): #9CDCFE Light Cyan
- Strings (values): #CE9178 Orange
- Comments (<!-- -->): #6A9955 Green
- CSS Keywords (color, padding): #569CD6 Light Blue
- CSS Values (#333, 20px): #B5CEA8 Light Green
*/

// ============================================================================
// EXAMPLE 5: Bash Script with Auto-Detection
// ============================================================================

/*
```bash
#!/bin/bash

# Deploy script for production environment
set -e  # Exit on error

PROJECT_ROOT="/var/www/whatsnxt"
BACKUP_DIR="/var/backups/whatsnxt"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "Starting deployment at $TIMESTAMP..."

# Create backup
if [ -d "$PROJECT_ROOT" ]; then
    cp -r "$PROJECT_ROOT" "$BACKUP_DIR/backup_$TIMESTAMP"
    echo "Backup created: $BACKUP_DIR/backup_$TIMESTAMP"
else
    echo "Error: Project directory not found"
    exit 1
fi

# Pull latest code
cd "$PROJECT_ROOT"
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Build the project
pnpm run build

# Deploy
pnpm run deploy

echo "Deployment completed successfully!"
```

AUTO-DETECTION: Detects #!/bin/bash shebang
SYNTAX HIGHLIGHTING:
- Keywords (set, if, then, else, fi): #569CD6 Light Blue
- Strings (single/double quoted): #CE9178 Orange
- Variables ($TIMESTAMP, $PROJECT_ROOT): #9CDCFE Light Cyan
- Comments (# comment): #6A9955 Green (italic)
- Commands (echo, cp, git, pnpm): #DCDCAA Yellow
- Built-in functions ([ ], [ -d ]): #569CD6 Light Blue
*/

// ============================================================================
// EXAMPLE 6: JSON Configuration with Syntax Highlighting
// ============================================================================

/*
```json
{
  "project": "whatsnxt",
  "version": "1.0.0",
  "description": "Blogging platform with rich text editor",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": "9.0.0"
  },
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build --turbopack",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "dependencies": {
    "@tiptap/core": "2.23.0",
    "@tiptap/extension-code-block-lowlight": "2.23.0",
    "highlight.js": "11.11.1",
    "lowlight": "3.3.0"
  },
  "devDependencies": {
    "typescript": "5.8.2",
    "eslint": "9.29.0"
  }
}
```

AUTO-DETECTION: Detects { and property: value pattern
SYNTAX HIGHLIGHTING:
- Property names ("project", "version"): #9CDCFE Light Cyan
- Strings (values): #CE9178 Orange
- Numbers (1.0.0, 2.23.0): #B5CEA8 Light Green
- Boolean values (true, false): #569CD6 Light Blue
- Null: #569CD6 Light Blue
- Braces and brackets: #d4d4d4 Default
*/

// ============================================================================
// EXAMPLE 7: YAML Configuration with Syntax Highlighting
// ============================================================================

/*
```yaml
# Blog Configuration
app:
  name: whatsnxt
  version: 1.0.0
  
editor:
  type: tiptap
  features:
    - richText
    - codeBlocks
    - syntaxHighlight
    - autoDetect
    
codeHighlight:
  enabled: true
  theme: vs-code-dark
  languages:
    - javascript
    - typescript
    - python
    - sql
    - html
    - css
  defaultLanguage: plaintext
  autoDetect: true

database:
  host: localhost
  port: 27017
  name: whatsnxt_db
  
cache:
  type: redis
  ttl: 3600
  prefix: "blog:"
```

AUTO-DETECTION: Detects --- prefix or key: value pattern
SYNTAX HIGHLIGHTING:
- Keys (name, version, enabled): #9CDCFE Light Cyan
- Strings: #CE9178 Orange
- Numbers: #B5CEA8 Light Green
- Boolean (true, false): #569CD6 Light Blue
- Comments (# comment): #6A9955 Green
- Dashes/arrays: #d4d4d4 Default
*/

// ============================================================================
// COMPARISON: BEFORE vs AFTER
// ============================================================================

/*
BEFORE Implementation:
- All code blocks: Plain text, monospace font
- No color coding
- Hard to distinguish syntax elements
- Same appearance regardless of language
- Difficult for beginners to learn code structure

[Gray background with white text - no highlighting]
const x = 5;
function test() { return x; }
// Comment

AFTER Implementation:
- Language-specific syntax highlighting
- Color-coded keywords, strings, functions, etc.
- Easy to identify different syntax elements
- Consistent with modern IDEs (VS Code, etc.)
- Better for learning and reading code

[Dark background with colored syntax]
const x = 5;                              [Light Blue keyword, Green number]
function test() { return x; }             [Yellow function, Light Blue keyword]
// Comment                                [Green italic comment]
*/

// ============================================================================
// KNOWN LIMITATIONS & FUTURE IMPROVEMENTS
// ============================================================================

/*
CURRENT LIMITATIONS:
  ⚠️ No line numbers (can be added)
  ⚠️ No code folding
  ⚠️ No copy-to-clipboard button (can be added)
  ⚠️ No line highlighting/line focus
  ⚠️ No diff highlighting

UPCOMING FEATURES:
  ✨ Line number display
  ✨ Copy to clipboard button
  ✨ Custom theme selector
  ✨ Dark/light mode toggle
  ✨ Line highlighting
  ✨ Diff syntax highlighting
  ✨ Code formatting
  ✨ Language suggestion on paste
*/

export {};
