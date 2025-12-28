# EA Help Documentation - Complete Text Content

## Source Files (CSS Style Guide)

File names must be in PascalCase for CSS Files
File names must match the component name for which styles are going to be applied.

### Source File Structure

#### CSS Structures

1. ClassNames
2. Using @apply for Utility Classes
3. Kebab-Case
4. Empty line
5. Component(s) Prefix for className

The example below shows an example on how css should be organized within a css file.

**Example:** Let's assume you have a component named AccountSupportCard.tsx then the css file name should be AccountSupportCard.css

```css
/*Following kebab-case with component name as prefix */
.account-support-card-container {
  /* using @apply for applying utility classes */
  @apply mt-5 h-[144px] w-auto rounded border border-gray-300 lg:mt-0 lg:w-[181px]
}

.account-support-card-icon {
  @apply ml-4 mt-4;
}
```

## Commit Messages Guidelines

### Commit Message Format

A well-crafted Git commit message is the **best way to communicate context** about a change to fellow developers (and to their future selves).

A diff will tell you *what changed*, but only the commit message can properly tell you *why*.

*Re-establishing the context of a piece of code is wasteful. We can't avoid it completely, so our efforts should go to reducing it [as much] as possible. Commit messages can do exactly that and as a result, a commit message shows whether a developer is a good collaborator.*

Peter Hutterer on Commit Messages

All commits contributed to this project must follow the **seven rules of a great commit message**:

1. **Separate subject from body with a blank line**
2. **Limit the subject line to 50 characters** - Shoot for 50 characters, but **consider 72 the hard limit**
3. **Capitalize the subject line**
4. **Do not end the subject line with a period**
5. **Use the imperative mood in the subject line**
   - A subject line should always be able to complete the following sentence: *If applied, this commit will your subject line here*. For example: *If applied, this commit will **update getting started documentation***

### Commit types

`type` can have any of the following values:

- **chore**: We use this type when changing tasks in package.json. It should be used to update or add Git hooks configuration or any other local development configuration. It should also be used when removing deprecated code. It can be used when updating third-party libraries versions as long as they don't introduce a breaking change
- **ci**: We use this type mainly for changes to .gitlab.yml
- **build**: is used for changes to deployment images or build tasks (usually in Dockerfiles or package.json)
- **feat**: is used for code that adds new features
- **fix**: is for fixes that affect end-users. End users can be people, clients of a REST API or clients of a npm package
- **test**: is used when changing only test code
- **refactor**: is used when you change the implementation of production code, but you don't change its public behavior
- **style**: is used for changes related to code formatting
- **docs**: is used for documentation changes

Each commit should fall into a **one type only**. If your change falls into multiple types, please split your commit into multiple commits.

If you have 2 consecutive commits of the same type, please **squash them**.

For example:

```
chore: Add check for storybook errors in CI pipeline

Run storybook `build` command after running all quality checks in CI in order to prevent deploying a broken Storybook
```

### Commit scopes

We use **JIRA tasks** to keep track of the work done in this project. Tasks identifiers have the format **NXGEN-XXXX** where XXXX is the number of the task. Most tasks are usually either bug fixes or features.

Use the ID of the Jira task/issue as the scope for your commit. For example:

```
chore(NXGEN-3090): Add check for Storybook errors in CI pipeline

Run storybook `build` command after running all quality checks in CI in order to prevent deploying a broken Storybook
```

### Semantic versioning

Semantic versioning is a system where software **version numbers** and the way they change **convey meaning** about the underlying code and what has been modified from one version to the next.

Given a version number **MAJOR.MINOR.PATCH**, increment the:

- **MAJOR** version when you make incompatible API changes (**backward incompatible**)
- **MINOR** version when you add functionality in a backwards compatible manner, and
- **PATCH** version when you make backwards compatible bug fixes.

A change is backward compatible (BC) if it **doesn't break existing clients**. It is very important to recognize backward incompatible changes or BC breaks.

A change is a **BC break** if:

- A client needs to make changes in order to upgrade. For instance: types, function/class names, or parameters have changed
- A function or method works differently with the same input, i.e. your test suite no longer would pass
- Code was removed

### BC breaks in conventional commits

A commit message indicates a breaking change if it contains one or more footer lines starting with **BREAKING CHANGE:** as shown in the example below.

```
chore(NXGEN-3083): Remove NEXTGEN_HOME_PAGE feature flag

The legacy home page is no longer needed since next generation page features are now complete and stable

BREAKING CHANGE: Removed feature flag to switch old and new home page
```

Multiple **BREAKING CHANGE:** lines are allowed in a commit. Each breaking change should have its own footer.

## Source File Structure (React)

1. Imports
2. Type declarations
3. Empty line
4. Splitting component (if necessary)
5. Component(s)

The example below shows an example on how code should be organized within a component file.

```typescript
// Imports
import React, { FC, ReactNode } from "react";

// type declaration
type CardProps = {
  className: string;
  children: ReactNode;
}

// Splitting the component for better readability
const cardTitle = () => {
  return(
    <>
      <h1>This is card title</h1>
    </h1>
  )
}

// Components code
const Card: FC<CardProps> = ({ className, children }) => {
  return(
    <>
      cardTitle()
    </>
  )
}
```

### Testable Components

Add a testid to the parent-level component whenever you are testing.

```html
<div data-testid="parent-component">...</div>
```

If you are trying to use browser-specific elements, use them in useEffect to avoid server-side rendering errors

```typescript
import { useEffect, useState } from "react";

const MyComponent = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div>Window width: {width}</div>;
};
```

## Development Guide

### Steps need to be followed

- We should not add any local paths to the repository
- Do not check in commented code.
- All files must end with a newline.
- Remove unwanted empty lines.
- Let's abide with using pnpm as package manager throughout the app (The only exception is that we are using npm only for publishing the dev version of packages)
- Files using JSX: These have a **.tsx** extension.
  - Example: Component.tsx
- Files not using JSX: These have a **.ts** extension.
  - Example: index.ts

## Components

### Props

Do not use `{}` while passing constant props.

```typescript
<MyComponent className="active" /> // Good
<MyComponent className={"active"} /> // Bad
```

### Conditional rendering

Use conditional rendering for desktop mobile.

```typescript
const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
return isMobile ? <MobileComponent /> : <DesktopComponent />;
```

### Loops

Do not use the index alone as a key when iterating an array. Use a unique value or a combination.

```typescript
const items = ["item1", "item2", "item3"];
items.map((item, index) => <div key={item}>{item}</div>); //Bad
items.map((item, index) => <div key={`item-${index}`}>{item}</div>); // Good
```

## Code Reviews Guidelines

### How to do a code review?

- Code reviews are conversations
- This isn't just about what is wrong
- What should you be looking for?
  1. API Semantics
  2. Implementation semantics
  3. Documentation
  3. Code style
- Code reviews format
- Labels
- When to mark a review comment as solved
- Recommended Practices
- Merge Request Workflow
- Reviewing a rebased branch

Remember writers: **revision is crucial**.

For example, consider this rejected first draft by Guns n Roses

### What should you be looking for?

When it comes to code reviews, it's a **common phenomenon** that there is much focus around mundane aspects like code formatting and style, whereas important aspects (does the code change do what it is supposed to do, is it performant, is it backwards-compatible for existing clients, and many others) tend to get **less attention**.

The following sections point out what's **best use of your time and attention** when doing a code review. Sections are numbered from most important to least. Please use it as a **checklist**, although **not all** points apply to all reviews, its purpose is to serve as a reference for most reviews.

In the coming sections we refer to **API** as the interface that specifies how multiple software applications interact with one another. It could be the **public** methods/properties of a class, the **modules** or UI components a library exports, a REST endpoint from an API, etc.

#### 1. API Semantics

- API has a reasonable size?
- Is it doing too much? Could it be doing one thing instead of multiple?
- Is it consistent? Is it easy to misuse?
- Is it exposing internals?
- Are there breaking changes (classes, modules, functions, configuration HTTP responses, etc.)?
- If it's a breaking change:
  - Is it using a feature flag?
  - Is the change to the REST endpoint versioned?
  - Is the method/module/UI component deprecated before being removed?
- Is it too specific?
- Is there a spot that may cause friction with another system?
  - Do you need to loop someone else into the review?
  - Is a synchronous conversation needed (Zoom call)?

#### 2. Implementation semantics

## Test doubles

When writing **unit tests** we are focusing on **describing one unit of behaviour at a time**, and how **objects communicate** in order to achieve that behaviour.

By behaviour, at the unit level, we mean the **rules by which the object will convert input into output**. The way we describe that behaviour using tests will depend on what kind of behaviour happens within that method or function call. Thinking of behaviour in this way boils down to a very narrow list:

- Throw an exception or produce an error
- Modify the value of a property
- Return a value
- Call a method on a collaborator

Let's focus now on the trick part, or **calling a method on a collaborator**.

Below are some of the reasons we need test doubles, such as the fact that using real collaborators has some disadvantages:

- They are expensive to create
- They make the test slow
- They have internal behaviour that we cannot control
- They produce by-products that may interfere with other tests
- They need to return a specific value for us to describe the object under test

## Code reviews format

In order to prevent **miscommunication** and **under-communication**, all code comments in a Merge Request must adhere to the **Conventional Comments Standard**.

Conventional Comments is a standard for formatting comments of any kind of review/feedback process.

Adhering to a consistent format improves **reader's expectations** and machine readability. Here's the format proposed by conventional comments:

```
<label> [decorations]: <subject>

[discussion]
```

- **label** - This is a single label that signifies what kind of comment is being left.
- **subject** - This is the main message of the comment.
- **decorations** *(optional)* - These are extra decorating labels for the comment. They are surrounded by parentheses and comma-separated.
- **discussion** *(optional)* - This contains supporting statements, context, reasoning, and anything else to help communicate the "why" and "next steps" for resolving the comment.

**decorations** won't be used in this project.

### Labels

- **praise:** Praises highlight something positive. Try to leave at least one of these comments per review. **Do not leave false praise** (which can actually be damaging). Do look for something to sincerely praise.
- **nitpick:** Nitpicks are trivial preference-based requests.
- **suggestion:** Suggestions propose improvements to the current subject. It's important to be explicit and clear on **what is being suggested and why it is an improvement**. Consider using GitLab suggestions (code snippets) to further communicate your intent.
- **issue:** Issues highlight specific problems with the subject under review. These problems can be

## Merge Requests Guidelines

### Branching Model

This project follows a **feature branch workflow**. Every new **feature** will live in its own **Git branch**, named after a Jira ticket (**NXGEN-XXXX**). All commits to that branch will follow the commit message conventions described in the previous section.

For every feature you code, a **Merge Request** (MR) has to be created against this project's default branch (**main**).

### Merge Requests Format

Merge Request **titles** must start with the JaaS ticket identifier **NXGEN-XXXX** followed by a short sentence describing the change. By default, GitLab will use your **first** commit message **subject** and use it as **title**, and the commit **body** as **description** for new MRs.

Example of an MR title and description.

**Note:** If you are working on any UI ticket then when raising an MR you should attach screenshots of UI in desktop and mobile view to verify responsiveness and also attach code coverage and mutation test report screenshot

```
NXGEN-112 Gitlab pages setup
```

### Merge method

This repository is configured to perform merges using a **semi-liner Git history**.

*A merge commit is created for every merge, but the branch is only merged if a fast-forward merge is possible. This ensures that if the merge request build succeeded, the target branch build will also succeed after merging.*

We prefer this method since it facilitates code reviews, the diffs will be shorter and will never include code from a different branch.

When using this merge method, you must ensure that a fast-forward merge will be possible before pushing your changes. **Git rebase** is a very useful function to use to ensure a linear history. Some find the concept of rebasing awkward, but it can be explained as: **replay the changes (commits) in your branch on top of a new commit**.

```bash
git fetch -p                    # Pull the latest changes from GitLab
git rebase origin/main          # Rebase from the remote main branch
```

Since we're producing new commits when rebasing we'll need to force push the new commits.

```bash
git push --force-with-lease origin NXGEN-XXXX
```

Please read **this article** to understand better the `--force-with-lease` option.

### Draft Merge Requests

Our development workflow encourages short feedback loops. The sooner your code gets reviewed the better. We recommend you to open an MR even if you're not done yet and mark it as **Draft**. Checklist will inform the reviewer what's pending, and completed tasks can be reviewed. That way your code can be reviewed in smaller blocks.

### Merge Request Workflow

To review the merge request (MR) please clone it locally

```bash
git fetch -p                              # Pull the latest changes from GitLab
git checkout NXGEN-XXXX                   # check out the branch you're going to review
```

- Before merging, please **test the change manually**. *Reading the code is not enough.*
  - If it's a change to component, please browse Storybook and check the change
  - If it's a micro-frontend change, please run it locally and check the change
- Do not merge if you have questions or concerns about the code.
  - Use conventional comments as explained in the section above to ask for changes to the author
- If corrections or clarifications are needed, please continue the conversation in GitLab, Slack or Zoom as you see fit.
- If all changes look good you can, optionally, approve the Merge Request, and either merge it or ask the author to do it.
  - We should encourage the author to verify a change in the development environment before merging.

### Reviewing a rebased branch

Sometimes, you may have checked out a branch, and the original author may have **rebased it and force pushed more changes**. In order to avoid issues with duplicate or missing commits, please delete your local branch and checkout the remote one.

```bash
git fetch -p                              # Pull the latest changes from GitLab
git branch -D NXGEN-XX                    # Where XX is the JIRA ticket number of the branch that di
git checkout NXGEN-XX                     # Checkout the latest version from the remote
```

## Testing Guidelines

### Test doubles

When writing **unit tests** we are focusing on **describing one unit of behaviour at a time**, and how **objects communicate** in order to achieve that behaviour.

By behaviour, at the unit level, we mean the **rules by which the object will convert input into output**. The way we describe that behaviour using tests will depend on what kind of behaviour happens within that method or function call. Thinking of behaviour in this way boils down to a very narrow list:

- Throw an exception or produce an error
- Modify the value of a property
- Return a value
- Call a method on a collaborator

Let's focus now on the trick part, or **calling a method on a collaborator**.

Below are some of the reasons we need test doubles, such as the fact that using real collaborators has some disadvantages:

- They are expensive to create
- They make the test slow
- They have internal behaviour that we cannot control
- They produce by-products that may interfere with other tests
- They need to return a specific value for us to describe the object under test

### Button

✓ is a primary button with size medium by default
✓ can have an aria label
✓ executes it's click handler
✓ doesn't execute click handler if it's disabled
✓ shows a spinner when an operation is being executed
✓ supports dark mode
✓ is accessible

## React Style Guide

### Source Files

- File names must be in **PascalCase**.
- File names must be in **PascalCase** for classes.
- Files must end with a **newline**.
- Use camelCase instead of PascalCase for variables.
- Write your React components in TypeScript to prevent errors

### Source File Structure

1. Imports
2. Type declarations
3. Empty line
4. Splitting component (if necessary)
5. Component(s)

The example below shows an example on how code should be organized within a component file.

```typescript
// Imports
```







# EA Help Documentation - Complete Text Content

## Decision Outcome (Accessibility Testing)

2. **eslint-plugin-jsx-a11y** eslint-plugin-jsx-a11y

This plugin provides accessibility linting rules specifically for JSX/React code. It helps catch common accessibility issues and recommends best practices for improving accessibility.

### Decision Outcome

Jest-axe is a specific implementation of Axe-core that focuses on accessibility testing for React components using the Jest testing framework. We are already using jest for unit testing. Jest-axe can be an easier and more convenient option.

eslint-plugin-jsx-a11y we add this plugin to our es-lint config easily. No additional configuration needed.

We can use both jest-axe and eslint-plugin-jsx-a11y together for accessibility testing in our project

### Consequences

## Use Merge Requests and Conventional Comments to Review ADRs

### Deciders:
- Alone, Amit (@aalone)
- Gomez, Eduardo (@edugomez)
- Montealegre, Luis (@lmontealegpro)

The person in charge of doing initial research will open the MR with the ADR.

Once the MR is open we'll share it in Slack and mention it in our daily call so all developers are aware and can provide their feedback if they wish to.

MRs with ADRs would include a **Documentation** GitLab label, and we would assign the deciders as **reviewers** of the merge request, so they get notified.

Reviewers are **required** to ask questions and provide feedback in the Merge Request. We recommend to do it using **conventional comments** format to clearly signal intent and avoid any kind of miscommunication.

Reviewers would vote for their preferred option using a thumb up emoji or with a comment. The option with more votes gets chosen.

### Decision outcome

**Chosen option:** GitLab Merge Requests and ADR review using conventional comments

### Consequences

## When to mark a review comment as solved

Code reviews happen as part of a Merge Request workflow. Each comment using the format describe in the previous section will automatically start a thread in GitLab. Most of the time you will let your reviewer mark the thread with your changes as solved. If you prefer to mark the comments as solved yourself is OK as well, **with a few exceptions**.

| Label | Mark Resolved | Reason |
|-------|---------------|---------|
| question | ✗ | The reviewer is expecting some kind of clarification on your end |
| issue | ✗ | The reviewer will need to spend some time making sure the change is no longer an issue |
| todo | ✓ | The comment should explain what is the expected outcome and the change is most likely a familiar type of change |
| chore | ✓ | The comment should explain what is the expected outcome and the change is most likely a familiar type of change |
| typo | ✓ | Fixing a typo is relatively trivial |
| nitpick | ✓ | This kind of changes have no huge impact to the codebase |
| info | ✓ | This label requires no change |
| thought | ✓ | This kind of comments required no immediate action, but they usually end up producing new Jira tickets with some kind of improvement |
| praise | ✓ | This label requires no additional action |

Most of the time you will want to have a **conversation** (in Slack, Zoom, or GitLab threads) with your reviewer if a suggestion is not clear.

## Testing guidelines

Code tends to **deteriorate**. Each time you change something in a code base, the amount of **entropy** increases. If left without constant cleaning and refactoring, the system becomes increasingly complex and disorganized.

- What are good tests?
- What is a unit test
- Anatomy of a test
- Test naming guidelines
- Test doubles
  - Types of doubles

### What are good tests?

The goal of tests is to enable **sustainable growth** of a software project. To enable sustainable growth you have to **exclusively focus on high-quality** tests.

A **good test suite** has the following properties.

- It's integrated into the development cycle
- It targets only the most important parts of your code base
- It provides maximum value with minimum maintenance costs

A good test suite **minimizes** the time **spent** on the following activities.

- Refactoring the test when you refactor the underlying code (this shouldn't happen)
- Running the test on each code change
- Dealing with false alarms raised by the test
- Spending time reading the test when you're trying to understand how the underlying code behaves

### What is a unit test

A unit test is an automated test that

- Verifies a single **unit of behavior**
- Does it quickly
- And does it in **isolation from other tests**

Tests shouldn't verify units of code. Rather they should verify **units of behavior**. Tests are **examples** of something **meaningful** for the **problem domain** that a person with domain knowledge finds useful.

### Anatomy of a test

The **AAA** pattern, advocates for splitting each test into three parts: arrange, act, and assert.

- In the **arrange** section, you bring the System Under Test (SUT) and its dependencies to a desired state
- In the **act** section, you exercise the **behaviour** that you want to **explain** on the SUT, you pass the prepared dependencies, and capture the output value (if any).
- In the **assert** section you verify the **outcome**, represented by:
  - the return value,
  - the final state of the SUT and its collaborators, or
  - the interactions the SUT had with its collaborators

### Conventional Commits

6. **Wrap the body at 72 characters**
7. **Use the body to explain what and why instead of how**

For example:

```
Add check for Storybook errors in CI pipeline

Run storybook `build` command after running all quality checks in CI in order to prevent deploying a broken Storybook
```

### Conventional Commits

In order to describe the **intent** of a commit all commit messages must follow the **Conventional Commits** specification.

The Conventional Commits specification is a lightweight convention on top of commit messages. This convention dovetails with **SemVer**, by describing the **features**, **fixes**, and **breaking changes** made in commit messages.

The format for a conventional commit is as follows

```
<type>[scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit types

`type` can have any of the following values:

### Recommended Practices

Here are some recommended practices for writing helpful review feedback:

- **Mentoring pays off exponentially.** Adding suggestions and links to additional material or to existing documentation is extremely useful to your fellow developers.
- Leave actionable comments
- Combine similar comments
- Replace "you" with "we"
- Replace "should" with "could"

### Merge Request Workflow

To review the merge request (MR) please clone it locally

```bash
git fetch -p                              # Pull the latest changes from GitLab
git checkout NXGEN-XXXX                   # check out the branch you're going to review
```

- Before merging, please **test the change manually**. *Reading the code is not enough.*
  - If it's a change to component, please browse Storybook and check the change
  - If it's a micro-frontend change, please run it locally and check the change
- Do not merge if you have questions or concerns about the code.
  - Use conventional comments as explained in the section above to ask for changes to the author
- If corrections or clarifications are needed, please continue the conversation in GitLab, Slack or Zoom as you see fit.
- If all changes look good you can, optionally, approve the Merge Request, and either merge it or ask the author to do it.

## Flat Classes

Using flat classes without nesting to organize CSS styles.

```css
.nav-menu {
  display: block;
}

.nav-menu-item {
  display: inline-block;
  padding: 10px;
  border-radius: 5px;
}

.nav-menu-item-red {
  background-color: #ff0000;
  color: #fff;
}

.nav-menu-item-blue {
  background-color: #0000ff;
  color: #fff;
}

.nav-menu-item-green {
  background-color: #00ff00;
  color: #000;
}
```

### Pros

## Architecture Decision Records

1. Use Markdown Any Decision Records
2. Use Merge Requests and Conventional Comments to Review ADRs
3. CSS Code Organization
4. Accessibility Testing
5. Snapshot Testing
6. CSS Nesting
7. Feature Flag Libraries
8. Logging and Observability
9. Build tools analysis
10. Centralizing Package Versions
11. Use of TRPC GRPC and Rest
12. Next Image vs Image
13. Unique URL for Contact us Connect Flow
14. Global Styles Loading with multiple MFEs

## Mantine CSS Modules

Mantine uses CSS Modules for component styling, which provides scoped styles and type-safe class names. This approach makes it easier to manage and apply styles to specific elements or groups of elements.

```css
.nav-menu {
  display: block;

  .nav-menu-item {
    display: inline-block;
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
  }

  .nav-menu-item-red {
    background-color: var(--mantine-color-red-6);
    color: white;
  }

  .nav-menu-item-blue {
    background-color: var(--mantine-color-blue-6);
    color: white;
  }

  .nav-menu-item-green {
    background-color: var(--mantine-color-green-6);
    color: black;
  }
}
```

### Pros

- **Simplified Styling.** Mantine CSS Modules provide scoped styles and a more intuitive way to write and organize styles within the component's context.
- **Improved Readability.** CSS Modules enhance the readability of the code by clearly indicating the relationship between parent and child elements with type safety.

## Labels

- **praise:** Praises highlight something positive. Try to leave at least one of these comments per review. **Do not leave false praise** (which can actually be damaging). Do look for something to sincerely praise.
- **nitpick:** Nitpicks are trivial preference-based requests.
- **suggestion:** Suggestions propose improvements to the current subject. It's important to be explicit and clear on **what is being suggested and why it is an improvement**. Consider using **GitLab suggestions** (code snippets) to further communicate your intent.
- **issue:** Issues highlight specific problems with the subject under review. These problems can be user-facing or behind the scenes. It is strongly recommended to pair this comment with a suggestion (code snippet, if possible). If you are not sure if a problem exists or not, consider leaving a **question** instead.
- **todo:** TODO's are small, trivial, but necessary changes.
- **question:** Questions are appropriate if you have a potential concern but are not quite sure if it's relevant or not. Asking the author for clarification or investigation can lead to a quick resolution.
- **thought:** Thoughts represent an idea that popped up from reviewing. These comments extremely valuable and can lead to more focused initiatives and mentoring opportunities.
- **chore:** Chores are simple tasks that must be done before the subject can be "officially" accepted. Usually, these comments reference some common process. Try to leave a link to the process description so that the reader knows how to resolve the chore.
- **typo:** Typo comments are like **todo**, where the main issue is a misspelling.
- **info:** This type of comment are used when a change by the reviewer has been done in your MR. Some changes are hard to explain in a single comment, and it's sometimes faster to do the change and then document it with **info** comments. Try to include the reason why the change was made and how it's an improvement to previous version(s).

## CSS code organization

### Context and Problem Statement

We want to provide uniform experience to developers such that CSS classnames are easy to organize, read & follow industry standards.

### Considered Options

1. **NextJS CSS Module**

CSS Modules converts entire CSS file into easy accessible JavaScript object thus allowing developers to easily use these plain string as object values giving better dev experience.

It allows us to create unique classnames scoped to a component, preventing accidental name collisions.

It does not allow kebab case which is industry standard for CSS classnames.

2. **Plain CSS files**

It allows to stick to standard kebab case for CSS classnames

making them easy to identify and read as CSS classnames.

No framework support needed.

Tailwind provide support to avoid collisions with **Prefix** option.

Multiple VS Code plugins are available for CSS intelligence

### Decision Outcome

## Documentation

Various sections including:

**Onboarding:**
- Onboarding
- Onboarding checklist

**Overview:**
- Component Libraries
- Paloma UI Storybook

**Getting Started:**
- Required Software
- Configure access to GitLab npm registry
- Cloning the Project
- Main Development Tasks
- IDE Setup

**Contribution Guidelines:**
- Commit Messages Guidelines
- Merge Requests Guidelines
- Code Reviews Guidelines
- Testing Guidelines
- Coding Style Guides

**Architecture Decision Records:**
- Use Markdown Any Decision Records
- Use Merge Requests and Conventional Comments to Review ADRs
- CSS Code Organization
- Accessibility Testing
- Snapshot Testing

**CI/CD pipeline:**
- Git Commits Linting
- Code Quality Checks
- Technical Documentation
- CI/CD Docker Images

## 2. Implementation semantics

- Does it satisfy the requirements?
- Is it logically correct?
- Is there unnecessary complexity?
- Is it robust (proper error handling, concurrency issues, etc.)?
- Is it performant?
- Is it secure?
- Are new dependencies worth adding?
  - Could we solve without them?
  - Is it properly documented and tested?

### 3. Documentation

- Are new features reasonably documented?
- Were the relevant docs updated? OpenAPI spec? Storybook entry, etc.?

### 3. Code style

- Does it follow naming conventions?
- Is the code readable (method length, number of loops and conditionals, etc.)?
- Is it deviating from the way you've handled this type of functionality or data elsewhere in the codebase?

### Decision Outcome

After considering the pros and cons, the recommended CSS naming convention for micro frontends is to use Mantine CSS Modules with kebab-case component naming and the BEM methodology. This approach effectively prevents name collisions between micro frontends through automatic scoping provided by CSS Modules. It also prevents name collisions within a project by prefixing component CSS classes with the component name in kebab-case. The BEM methodology is utilized to highlight hierarchy and structure without nesting. By combining these approaches, a robust CSS naming convention is established that ensures clarity, prevents conflicts, and effectively showcases component hierarchy and structure

### Consequences

## Use Markdown Any Decision Records

### Considered Options

- **MADR 3.0.0** – The Markdown Any Decision Records
- **Michael Nygard's template** – The first incarnation of the term 'ADR'
- **Formless** – No conventions for file format and structure

Whatever format we choose, it should be as easy as possible to

1. Write down the decisions
2. Version the decisions

### Decision outcome

**Chosen option:** MADR 3.0.0

- It is flexible
- It is easy to customize

### Consequences

## Feature Flag Libraries

- Go to the flipt console and create a namespace (eg) Development, Production, Staging etc. By Default, it will be a **default** namespace
- Create a flag in the console. It can be a boolean or multi-variant flag.
- Once you enable the flag, test the flagged behavior in our application.
- Get the status of the flag using the api(**api/v1/namespaces/${namespace}/flags/${flagName}**).
- You can call this api in our application in **getServerSideProps** to have it fetched only once.
- Show/Hide the feature based on the flag enabled in the flipt.
- It can be used in two different ways in Client Side:

**Provider:**

```typescript
import { FliptApiClient } from "@flipt-io/flipt";
import React from "react";

const FliptContext = React.createContext<FliptApiClient | null>(null);

export const FliptProvider = ({ children }: { children: React.ReactNode }) => {
  const client = new FliptApiClient({
    environment: process.env.FLIPT_PUBLIC_ADDR ?? "http://localhost:8081",
  });
  return (
    <FliptContext.Provider value={client}>{children}</FliptContext.Provider>
  );
};

export const useFlipT = () => {
  const client = React.useContext(FliptContext);
  if (!client) {
    throw new Error("useFlipT must be used within a FliptProvider");
  }
```

## BEM (Block Element Modifier)

Using the BEM methodology, which introduces a naming convention to organize CSS classes.

```css
.nav-menu {
  display: block;
}

.nav-menu__item {
  display: inline-block;
  padding: 10px;
  border-radius: 5px;
}

.nav-menu__item--red {
```

### Pros

- **Simplicity.** Flat classes offer a simpler approach to organizing CSS, as there is no need to manage multiple levels of nesting.
- **Reduced Specificity.** Without nesting, the specificity of CSS selectors remains lower, reducing the likelihood of conflicts or unintended style overrides.
- **Code Efficiency.** Flat classes can result in less code repetition, as styles can be applied directly to elements without the need for nested selectors.

### Cons

- **Limited Structure.** Without nesting, it may be challenging to establish a clear hierarchy or structure within the CSS, making it harder to understand and maintain as the codebase grows.
- **Reduced Reusability.** Flat classes may not promote reusability as effectively as nested classes, as styles are not encapsulated within specific components or sections.

## Types of doubles

Let's focus now on the trick part, or **calling a method on a collaborator**.

Below are some of the reasons we need test doubles, such as the fact that using real collaborators has some disadvantages:

- They are expensive to create
- They make the test slow
- They have internal behaviour that we cannot control
- They produce by-products that may interfere with other tests
- They need to return a specific value for us to describe the object under test

### Types of doubles

In his book **xUnit Test Patterns**, Gerard Meszaros describes various test doubles patterns.

- **Dummy.** A double without behavior is called a dummy
- **Fake.** A double that behaves as the original object. It is usually implemented without a mocking framework.
- **Stub.** A stub is a double that allows you to control its outputs when describing the object under test
- **Mock.** A mock is a double used to verify if that method was called as expected.
- **Spy.** A spy is a type of mock, that doesn't "replace" every method, only the ones we want to spy on.

Most of the time you'll be using Jest **mock functions**.

## How to do a code review?

Developing a strong code review process sets a foundation for **continuous improvement** and prevents unstable code from shipping to customers. The code review process is also an important part in **spreading knowledge throughout an organization**.

To successfully conduct code reviews, it's important that developers build a code review mindset that has a strong foundation in **collaborative development**.

Code reviews should be performed with the **common goal of learning and sharing** – *regardless of someone else's experience*.

### Code reviews are conversations

Yes, there are power dynamics at play in code review. The reviewer may have a more senior title or have more experience in the codebase at hand. But as a reviewer you need to recognize that **you may be missing context**, or **misunderstand** what the original author is trying to do.

Given that, it's better to **ask questions when phrasing recommendations**. Instead of "You should do it Y way", try *"Can you talk about your reasons for choosing X? In most cases I'd use Y, is there a reason not to here?"*. This approach feels more collaborative and leaves open an opportunity for all participants to learn.

### This isn't just about what is wrong

The goal is to provide feedback and **not all feedback is negative**. It's just as valid to say *"Cool! I didn't know you could do that"*. And you **should**. It will balance out the overall tenor of the review and leave the author with a sense of where they can improve as well as where they should double down.

## CSS code organization (Final Decision)

It allows us to create unique classnames scoped to a component, preventing accidental name collisions.

It does not allow kebab case which is industry standard for CSS classnames.

2. **Plain CSS files**

It allows to stick to standard kebab case for CSS classnames

making them easy to identify and read as CSS classnames.

No framework support needed.

Tailwind provide support to avoid collisions with **Prefix** option.

Multiple VS Code plugins are available for CSS intelligence

### Decision Outcome

We will use plain CSS to maintain CSS classname uniformity and follow kebab case for CSS class names.

**Note:** For CSS Importing we had a discussion and the result of that discussion was it should be at the component level instead of package level. you can refer this MR for more details https://gitlab.ea.com/eait-playerexp-wwce/player-help/-/merge_requests/91

### Consequences

## Use Markdown Any Decision Records

### Context and Problem Statement

We want to record any decisions concerning the architecture ("architectural decision record"), the code, or other fields. *Which format and structure should these records follow?*

An Architectural Decision (AD) is a software design choice that addresses a functional or non-functional requirement that is architecturally significant. This might, for instance, be a technology choice (e.g., Java vs. JavaScript), a choice of the IDE (e.g., IntelliJ vs. Eclipse IDE), a choice between a library (e.g., SLF4J vs java.util.logging), or a decision on features (e.g., infinite undo vs. limited undo). Do not take the term "architecture" too seriously or interpret it too strongly.

As the examples illustrate, **any decisions that might have an impact on the architecture somehow are architectural decisions**.

### Considered Options

- **MADR 3.0.0** – The Markdown Any Decision Records
- **Michael Nygard's template** – The first incarnation of the term 'ADR'
- **Formless** – No conventions for file format and structure

Whatever format we choose, it should be as easy as possible to

1. Write down the decisions
2. Version the decisions

### Decision outcome

**Chosen option:** MADR 3.0.0

- It is flexible
- It is easy to customize

### Consequences

## Snapshot Testing

We already use snapshot testing to safeguard against UI regressions. The key issue at hand is determining the strictness and the level of granularity at which snapshot testing should be executed.

### Considered Options

#### 1. Strict Snapshot Testing

- Use snapshot testing as the primary method for identifying UI regressions.
- Enforce rigid checks and code reviews to ensure accuracy.

#### 2. Flexible Snapshot Testing

- Use snapshot testing as a part of a multi-layered testing strategy.
- Do not rely solely on snapshots for UI validation.

#### 3. Root-Level Snapshots

- Capture snapshots at the root level to get an overarching view of the application.
- May miss granular-level UI changes.

#### 4. Component-Level Snapshots

- Capture snapshots at the component level for a detailed view.
- Increases maintenance overhead due to snapshot volume.

#### 5. No Snapshot Tests

- Team feedback suggests they're not great for catching visual changes.
- Hard to keep up with CSS changes or push for better accessibility.

### Team Feedback and Alternative Suggestions

1. **Visual Testing Tools**: Team suggests using more sophisticated tools like **Applitools** for visual regression, which is an end-to-end matter and should be handled by the QA team.
2. **Chromatic**: Could be a good fit. It works with Figma and Storybook, so it's got more to offer.

### Decision Outcome

We've decided not to use snapshot testing. Instead, we're considering a visual regression tool like Chromatic. The details still need to be worked out!

## CSS Nested Classes

### Context

This analysis aims to explore the use of CSS nested classes. By examining the pros and cons of this approach, we can evaluate its suitability for achieving desired outcomes in web development.

### Considered Options

- **Nested Classes**
- **Flat Classes**
- **BEM (Block Element Modifier)**
- **Tailwind CSS Nesting Plugin**
- **Options Comparison**

### Nested Classes

Using nested classes to organize and structure CSS styles.

```css
.nav-menu {
  display: block;

  .nav-menu-item {
    display: inline-block;
    padding: 10px;
    border-radius: 5px;
  }

  .nav-menu-item-red {
    background-color: #ff0000;
    color: #fff;
  }

  .nav-menu-item-blue {
    background-color: #0000ff;
    color: #fff;
  }

  .nav-menu-item-green {
    background-color: #00ff00;
    color: #000;
  }
}
```

### Pros

- **Improved Readability and Organization.** Nested classes can provide a clear and hierarchical structure to the CSS, making it easier to understand and maintain.
- **Specificity Control.** Nesting classes allows for more precise targeting of elements within specific contexts, reducing the need for overly specific or convoluted selectors.
- **Modularity.** Nested classes promote reusability by allowing styles to be encapsulated within specific components or sections, facilitating easier code maintenance.

### Cons

- **Increased Complexity.** As nesting increases, the CSS selectors can become complex and harder to manage, especially if multiple levels of nesting are used.
- **Specificity Issues.** Nested classes can lead to increased specificity, which may cause conflicts or unintended style overrides when multiple classes are applied to an element.
- **Code Repetition.** Nesting can result in repetitive CSS code, especially when multiple elements within the same hierarchy require similar styles.

### Mantine CSS Modules Pros

- **Simplified Styling.** Mantine CSS Modules allow for scoped classes, providing a more intuitive and concise way to write and organize styles within the component's context.
- **Improved Readability.** CSS Modules enhance the readability of the code by clearly indicating the relationship between parent and child elements with type safety.
- **Reduced Specificity.** With CSS Modules, the specificity of CSS selectors remains lower, reducing the likelihood of conflicts or unintended style overrides.
- **Modularity and Reusability.** CSS Modules promote the creation of modular and reusable components, making it easier to maintain and update styles throughout the codebase.
- **Scoped styles.** CSS Modules create scoped styles where the styles defined within a module only affect components that import it. This ensures that the styles won't unintentionally affect other parts of your application.
- **Reduced repetition.** Mantine's design system helps reduce repetition by providing a comprehensive set of pre-built components and consistent styling tokens.

### Cons

- **Learning Curve.** CSS Modules syntax may require developers to learn and understand its specific import/export patterns. This can slow down development and introduce a learning curve for new team members.
- **Build Tool Dependency.** CSS Modules require build tool configuration to work properly, which adds some complexity to the setup.
- **Potential for misuse.** Nesting can be misused if not used judiciously. Over-nesting or nesting without careful consideration can lead to code that is difficult to read, maintain, and debug. It's important to use nesting selectively and thoughtfully.

### Options Comparison

| Technique | Code |
|-----------|------|
| Nested | ```css .nav-menu { display: block; .nav-menu-item { display: inline-block; padding: 10px; border-radius: 5px; } }``` |

### Logging and Observability

| Field Name | Description |
|------------|-------------|
| TraceFlags | It is an 8-bit field that represents specific characteristics about a trace. It's a part of the SpanContext. In other words When set to 1, it means that the trace may be exported for persistence and further analysis. when set 0 it can be ignore |
| SeverityText | This field is a human-readable representation of the severity level of a log or event. It provides context about the severity of an event or log message |
| SeverityNumber | This field is a machine-readable representation of the severity level. It's an integer that represents the severity level, with higher numbers indicating higher severity. (levels from 1 (TRACE) to 24 (FATAL)) |
| Body | The body of the log record with all information |
| Resource | Resource is an immutable representation of the entity producing telemetry. For example, a service, a host, a container, a function, a device, etc. Resources help to identify the source of telemetry data. |
| InstrumentationScope | Describes the scope that emitted the log. |
| Attributes | Additional information about the event. |

### Considered Options for Generating logs in Opentelemetry format with NextJS

#### 1. OpenTelementry SDK

Next.js supports OpenTelemetry instrumentation out of the box, which means Next.js already instrumented, when we enable OpenTelemetry it will automatically wrap all our code like getStaticProps in spans with helpful attributes

### Feature Flag Libraries Analysis

#### Context and Problem Statement

We want to have a Feature flag based implementation for Shell and Micro Frontend applications as below.

- Show/hide the component or page based on environment-releaseNumber-featureName
- Show/hide capability based on user groups. Example marketing team & UAT team can view feature X on production but its not open for other folks.
- Show/hide the features added between the date range.

### Considered Options

1. **Flagsmith** flagsmith

Flagsmith is a feature flag tool that makes it easy to test and deploy new functional and visual changes to users without pushing updates to code. All flags in Flagsmith are capable of being configured for cross-platform remote configuration, so you can alter an app in real-time without having to wait for app store approval.

**Features and benefits:**
- Cross-platform functionality
- Out of the box 3rd party analytics integrations
- User-focused segmentation
- Update in real-time without back end intervention

**Usage cost:**

Flagsmith is free up to 50,000 requests per month when you choose the cloud solution. If you're looking to self-host, pricing is available on request.

- We can design a service which returns feature flag metadata based on environment and feature flag name (/api/featureFlags?env=uat&feature=help-home)
- The sample data returned by api may look like this

```json
{
  name: "help-home", // the feature we are trying to enable.
  env: "uat", // The Environment, we are trying to use
  release: "1.2", // The Release version we are trying to use
  group: "product-owners", // the user group for which the features are intended
  date: "10/17/2023", // The start date in which we are intended to release a fe
  and so on...
}
```

### Decision Outcome

We will go ahead with Growthbook as it covers our current requirements. This will come with its own service to manage, a database and application UI. There is a need of similar kind of key-value pair service & UI for other parts of application. Since the cost of switching is not much for Growthbook, we can go ahead with this out of box solution and if in future the need arise we can switch the solution easily.

### Consequences

**Component:**

```typescript
const flipt = useFlipT();
....
useEffect(() => {
  async function fetchData() {
    try {
      const evaluation = await flipt.evaluation.variant({
        namespaceKey: "default",
        flagKey: "language",
        entityId: uuidv4(),
        context: {},
      });
      let language = evaluation.variantKey;

      const greeting = 
        language == "es"
          ? "Hola, from Next.js client-side"
          : "Bonjour, from Next.js client-side";

      setData(greeting);
    } catch (err) {
      console.log(err);
    }
  }

  fetchData();
}, [flipt.evaluation]);
```

- Using the api **api/v1/namespaces/${nameSpace}/flags/${flagName}** to fetch its flag details

```typescript
useEffect(() => {
  async function fetchFlagDetails() {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/namespa
      const responseData = await response.json();
      setData(responseData.enabled);
```

## Observability

### Context and Problem Statement

We need to do Performance Monitoring, know Scalability, understand the inefficiencies, bottlenecks and roadblock of user experience.

The requirement is to print logs while making api calls Via BFF Client methods, and it should log HTTP api calls along with Request and Response while creating Nextjs pages. for logging method calls should be simpler.

### Standard format for Logging

#### Opentelemetry(docs)

OpenTelemetry is an open source Observability framework and toolkit designed to create and manage telemetry data such as traces, metrics, and logs.

By using OpenTelemetry we can log distributed traces that represent a single operation, like a customer transaction, as it travels through various services.

It measures the number of requests, the average response time, and logs textual data and are often used to store error details.

It helps logs attributes, which are key-value pairs that provide additional information about a span, like the HTTP method used or the status code returned and logs links, which are used to relate spans in different traces.

*Here is the list of fields in a OpenTelemetry log record*

| Field Name | Description |
|------------|-------------|
| TraceFlags | It is an 8-bit field that represents specific characteristics about a trace. It's a part of the SpanContext. In other words When set to 1, it means that the trace may be exported for persistence and further analysis. when set 0 it can be ignore |
| SeverityText | This field is a human-readable representation of the severity level of a log or event. It provides context about the severity of an event or log message |
| SeverityNumber | This field is a machine-readable representation of the severity level. It's an integer that represents the severity level, with higher numbers indicating higher severity. (levels from 1 (TRACE) to 24 (FATAL)) |
| Body | The body of the log record with all information |
| Resource | Resource is an immutable representation of the entity producing telemetry. For example, a service, a host, a container, a function, a device, etc. Resources help to identify the source of telemetry data. |
| InstrumentationScope | Describes the scope that emitted the log. |
| Attributes | Additional information about the event. |

## Build tools analysis

### Context and Problem Statement

We need to understand about different build tools and compare them to find the fastest bundling solution.

We want to have a bundler for UI packages that bundles the static assets such as CSS, fonts, images and Javascript files.

- Bundles all Javascript/Typescript changes into a single file and shows the type declaration in the source.
- Bundles all CSS files into a single file.
- Copies all other static assets into a bundle.

### Considered Options

#### Webpack

**Webpack** is a static module bundler for JavaScript applications. It recursively builds a dependency graph that includes every module needed by your application, then packages all those modules into one or more bundles.

### Features

- **Code Splitting:** This allows you to split your code into various bundles which you can then load on demand.
- **Loaders:** Loaders enable webpack to process more than just JavaScript files.
- **Plugins:** While loaders are used to transform certain types of modules, plugins can be leveraged

### Test naming guidelines

You might have heard of the **Given-When-Then** pattern, which is similar to **AAA**. This pattern also advocates for breaking the test down into three parts.

- **Given** corresponds to the arrange section
- **When** corresponds to the act section  
- **Then** corresponds to the assert section

There is no difference between the two patterns in terms of the test composition.

The example below exhibits a test with said three blocks. Note how there's an **empty line between each block** to clearly identify each section

```typescript
describe("Button", () => {
  it("shows its label", () => {
    render(<Button onClick={clickHandler}>Submit</Button>);

    userEvent.click(screen.getByRole("button", { name: /Submit/i })));

    expect(clickHandler).toHaveBeenCalledTimes(1);
  });
});
```

### Test naming guidelines

- Name the test as if you were giving an **example** to a domain person
- Test Names should be in lower case
- Don't include the name of the SUT's method/module/function in the test's name
  - You're **describing behavior**, not code
- Don't start names with **should**, your tests explain what the code **does**, not what it should do.
- Test names should read like regular English sentences. Each sentence is an **example** that describes **behavior relevant to the domain**

### BEM Examples

**BEM**

```css
.nav-menu {
  display: block;
}

.nav-menu__item {
  display: inline-block;
  padding: 10px;
  border-radius: 5px;
}

.nav-menu__item--red {
  background-color: #ff0000;
  color: #fff;
}

.nav-menu__item--blue {
  background-color: #0000ff;
  color: #fff;
}

.nav-menu__item--green {
  background-color: #00ff00;
  color: #000;
}
```

**Mantine CSS Modules**

```css
.nav-menu {
  display: block;

  .nav-menu-item {
    display: inline-block;
    padding: 1rem;
    border-radius: 0.25rem;
  }
}
```

### Pros

- **Clear Naming Convention.** BEM provides a standard naming convention that promotes

**Flat**

```css
.nav-menu {
  display: block;
}

.nav-menu-item {
  display: inline-block;
  padding: 10px;
  border-radius: 5px;
}

.nav-menu-item-red {
  background-color: #ff0000;
  color: #fff;
}

.nav-menu-item-blue {
  background-color: #0000ff;
  color: #fff;
}

.nav-menu-item-green {
  background-color: #00ff00;
  color: #000;
}
```

**BEM**

```css
.nav-menu {
  display: block;
}

.nav-menu__item {
  display: inline-block;

## Source Files (CSS Style Guide)

File names must be in PascalCase for CSS Files
File names must match the component name for which styles are going to be applied.

### Source File Structure

#### CSS Structures

1. ClassNames
2. Using @apply for Utility Classes
3. Kebab-Case
4. Empty line
5. Component(s) Prefix for className

The example below shows an example on how css should be organized within a css file.

**Example:** Let's assume you have a component named AccountSupportCard.tsx then the css file name should be AccountSupportCard.css

```css
/*Following kebab-case with component name as prefix */
.account-support-card-container {
  /* using @apply for applying utility classes */
  @apply mt-5 h-[144px] w-auto rounded border border-gray-300 lg:mt-0 lg:w-[181px]
}

.account-support-card-icon {
  @apply ml-4 mt-4;
}
```

## Commit Messages Guidelines

### Commit Message Format

A well-crafted Git commit message is the **best way to communicate context** about a change to fellow developers (and to their future selves).

A diff will tell you *what changed*, but only the commit message can properly tell you *why*.

*Re-establishing the context of a piece of code is wasteful. We can't avoid it completely, so our efforts should go to reducing it [as much] as possible. Commit messages can do exactly that and as a result, a commit message shows whether a developer is a good collaborator.*

Peter Hutterer on Commit Messages

All commits contributed to this project must follow the **seven rules of a great commit message**:

1. **Separate subject from body with a blank line**
2. **Limit the subject line to 50 characters** - Shoot for 50 characters, but **consider 72 the hard limit**
3. **Capitalize the subject line**
4. **Do not end the subject line with a period**
5. **Use the imperative mood in the subject line**
   - A subject line should always be able to complete the following sentence: *If applied, this commit will your subject line here*. For example: *If applied, this commit will **update getting started documentation***

### Commit types

`type` can have any of the following values:

- **chore**: We use this type when changing tasks in package.json. It should be used to update or add Git hooks configuration or any other local development configuration. It should also be used when removing deprecated code. It can be used when updating third-party libraries versions as long as they don't introduce a breaking change
- **ci**: We use this type mainly for changes to .gitlab.yml
- **build**: is used for changes to deployment images or build tasks (usually in Dockerfiles or package.json)
- **feat**: is used for code that adds new features
- **fix**: is for fixes that affect end-users. End users can be people, clients of a REST API or clients of a npm package
- **test**: is used when changing only test code
- **refactor**: is used when you change the implementation of production code, but you don't change its public behavior
- **style**: is used for changes related to code formatting
- **docs**: is used for documentation changes

Each commit should fall into a **one type only**. If your change falls into multiple types, please split your commit into multiple commits.

If you have 2 consecutive commits of the same type, please **squash them**.

For example:

```
chore: Add check for storybook errors in CI pipeline

Run storybook `build` command after running all quality checks in CI in order to prevent deploying a broken Storybook
```

### Commit scopes

We use **JIRA tasks** to keep track of the work done in this project. Tasks identifiers have the format **NXGEN-XXXX** where XXXX is the number of the task. Most tasks are usually either bug fixes or features.

Use the ID of the Jira task/issue as the scope for your commit. For example:

```
chore(NXGEN-3090): Add check for Storybook errors in CI pipeline

Run storybook `build` command after running all quality checks in CI in order to prevent deploying a broken Storybook
```

### Semantic versioning

Semantic versioning is a system where software **version numbers** and the way they change **convey meaning** about the underlying code and what has been modified from one version to the next.

Given a version number **MAJOR.MINOR.PATCH**, increment the:

- **MAJOR** version when you make incompatible API changes (**backward incompatible**)
- **MINOR** version when you add functionality in a backwards compatible manner, and
- **PATCH** version when you make backwards compatible bug fixes.

A change is backward compatible (BC) if it **doesn't break existing clients**. It is very important to recognize backward incompatible changes or BC breaks.

A change is a **BC break** if:

- A client needs to make changes in order to upgrade. For instance: types, function/class names, or parameters have changed
- A function or method works differently with the same input, i.e. your test suite no longer would pass
- Code was removed

### BC breaks in conventional commits

A commit message indicates a breaking change if it contains one or more footer lines starting with **BREAKING CHANGE:** as shown in the example below.

```
chore(NXGEN-3083): Remove NEXTGEN_HOME_PAGE feature flag

The legacy home page is no longer needed since next generation page features are now complete and stable

BREAKING CHANGE: Removed feature flag to switch old and new home page
```

Multiple **BREAKING CHANGE:** lines are allowed in a commit. Each breaking change should have its own footer.

## Source File Structure (React)

1. Imports
2. Type declarations
3. Empty line
4. Splitting component (if necessary)
5. Component(s)

The example below shows an example on how code should be organized within a component file.

```typescript
// Imports
import React, { FC, ReactNode } from "react";

// type declaration
type CardProps = {
  className: string;
  children: ReactNode;
}

// Splitting the component for better readability
const cardTitle = () => {
  return(
    <>
      <h1>This is card title</h1>
    </h1>
  )
}

// Components code
const Card: FC<CardProps> = ({ className, children }) => {
  return(
    <>
      cardTitle()
    </>
  )
}
```

### Testable Components

Add a testid to the parent-level component whenever you are testing.

```html
<div data-testid="parent-component">...</div>
```

If you are trying to use browser-specific elements, use them in useEffect to avoid server-side rendering errors

```typescript
import { useEffect, useState } from "react";

const MyComponent = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div>Window width: {width}</div>;
};
```

## Development Guide

### Steps need to be followed

- We should not add any local paths to the repository
- Do not check in commented code.
- All files must end with a newline.
- Remove unwanted empty lines.
- Let's abide with using pnpm as package manager throughout the app (The only exception is that we are using npm only for publishing the dev version of packages)
- Files using JSX: These have a **.tsx** extension.
  - Example: Component.tsx
- Files not using JSX: These have a **.ts** extension.
  - Example: index.ts

## Components

### Props

Do not use `{}` while passing constant props.

```typescript
<MyComponent className="active" /> // Good
<MyComponent className={"active"} /> // Bad
```

### Conditional rendering

Use conditional rendering for desktop mobile.

```typescript
const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
return isMobile ? <MobileComponent /> : <DesktopComponent />;
```

### Loops

Do not use the index alone as a key when iterating an array. Use a unique value or a combination.

```typescript
const items = ["item1", "item2", "item3"];
items.map((item, index) => <div key={item}>{item}</div>); //Bad
items.map((item, index) => <div key={`item-${index}`}>{item}</div>); // Good
```

## Code Reviews Guidelines

### How to do a code review?

- Code reviews are conversations
- This isn't just about what is wrong
- What should you be looking for?
  1. API Semantics
  2. Implementation semantics
  3. Documentation
  3. Code style
- Code reviews format
- Labels
- When to mark a review comment as solved
- Recommended Practices
- Merge Request Workflow
- Reviewing a rebased branch

Remember writers: **revision is crucial**.

For example, consider this rejected first draft by Guns n Roses

### What should you be looking for?

When it comes to code reviews, it's a **common phenomenon** that there is much focus around mundane aspects like code formatting and style, whereas important aspects (does the code change do what it is supposed to do, is it performant, is it backwards-compatible for existing clients, and many others) tend to get **less attention**.

The following sections point out what's **best use of your time and attention** when doing a code review. Sections are numbered from most important to least. Please use it as a **checklist**, although **not all** points apply to all reviews, its purpose is to serve as a reference for most reviews.

In the coming sections we refer to **API** as the interface that specifies how multiple software applications interact with one another. It could be the **public** methods/properties of a class, the **modules** or UI components a library exports, a REST endpoint from an API, etc.

#### 1. API Semantics

- API has a reasonable size?
- Is it doing too much? Could it be doing one thing instead of multiple?
- Is it consistent? Is it easy to misuse?
- Is it exposing internals?
- Are there breaking changes (classes, modules, functions, configuration HTTP responses, etc.)?
- If it's a breaking change:
  - Is it using a feature flag?
  - Is the change to the REST endpoint versioned?
  - Is the method/module/UI component deprecated before being removed?
- Is it too specific?
- Is there a spot that may cause friction with another system?
  - Do you need to loop someone else into the review?
  - Is a synchronous conversation needed (Zoom call)?

#### 2. Implementation semantics

## Test doubles

When writing **unit tests** we are focusing on **describing one unit of behaviour at a time**, and how **objects communicate** in order to achieve that behaviour.

By behaviour, at the unit level, we mean the **rules by which the object will convert input into output**. The way we describe that behaviour using tests will depend on what kind of behaviour happens within that method or function call. Thinking of behaviour in this way boils down to a very narrow list:

- Throw an exception or produce an error
- Modify the value of a property
- Return a value
- Call a method on a collaborator

Let's focus now on the trick part, or **calling a method on a collaborator**.

Below are some of the reasons we need test doubles, such as the fact that using real collaborators has some disadvantages:

- They are expensive to create
- They make the test slow
- They have internal behaviour that we cannot control
- They produce by-products that may interfere with other tests
- They need to return a specific value for us to describe the object under test

## Code reviews format

In order to prevent **miscommunication** and **under-communication**, all code comments in a Merge Request must adhere to the **Conventional Comments Standard**.

Conventional Comments is a standard for formatting comments of any kind of review/feedback process.

Adhering to a consistent format improves **reader's expectations** and machine readability. Here's the format proposed by conventional comments:

```
<label> [decorations]: <subject>

[discussion]
```

- **label** - This is a single label that signifies what kind of comment is being left.
- **subject** - This is the main message of the comment.
- **decorations** *(optional)* - These are extra decorating labels for the comment. They are surrounded by parentheses and comma-separated.
- **discussion** *(optional)* - This contains supporting statements, context, reasoning, and anything else to help communicate the "why" and "next steps" for resolving the comment.

**decorations** won't be used in this project.

### Labels

- **praise:** Praises highlight something positive. Try to leave at least one of these comments per review. **Do not leave false praise** (which can actually be damaging). Do look for something to sincerely praise.
- **nitpick:** Nitpicks are trivial preference-based requests.
- **suggestion:** Suggestions propose improvements to the current subject. It's important to be explicit and clear on **what is being suggested and why it is an improvement**. Consider using GitLab suggestions (code snippets) to further communicate your intent.
- **issue:** Issues highlight specific problems with the subject under review. These problems can be

## Merge Requests Guidelines

### Branching Model

This project follows a **feature branch workflow**. Every new **feature** will live in its own **Git branch**, named after a Jira ticket (**NXGEN-XXXX**). All commits to that branch will follow the commit message conventions described in the previous section.

For every feature you code, a **Merge Request** (MR) has to be created against this project's default branch (**main**).

### Merge Requests Format

Merge Request **titles** must start with the JaaS ticket identifier **NXGEN-XXXX** followed by a short sentence describing the change. By default, GitLab will use your **first** commit message **subject** and use it as **title**, and the commit **body** as **description** for new MRs.

Example of an MR title and description.

**Note:** If you are working on any UI ticket then when raising an MR you should attach screenshots of UI in desktop and mobile view to verify responsiveness and also attach code coverage and mutation test report screenshot

```
NXGEN-112 Gitlab pages setup
```

### Merge method

This repository is configured to perform merges using a **semi-liner Git history**.

*A merge commit is created for every merge, but the branch is only merged if a fast-forward merge is possible. This ensures that if the merge request build succeeded, the target branch build will also succeed after merging.*

We prefer this method since it facilitates code reviews, the diffs will be shorter and will never include code from a different branch.

When using this merge method, you must ensure that a fast-forward merge will be possible before pushing your changes. **Git rebase** is a very useful function to use to ensure a linear history. Some find the concept of rebasing awkward, but it can be explained as: **replay the changes (commits) in your branch on top of a new commit**.

```bash
git fetch -p                    # Pull the latest changes from GitLab
git rebase origin/main          # Rebase from the remote main branch
```

Since we're producing new commits when rebasing we'll need to force push the new commits.

```bash
git push --force-with-lease origin NXGEN-XXXX
```

Please read **this article** to understand better the `--force-with-lease` option.

### Draft Merge Requests

Our development workflow encourages short feedback loops. The sooner your code gets reviewed the better. We recommend you to open an MR even if you're not done yet and mark it as **Draft**. Checklist will inform the reviewer what's pending, and completed tasks can be reviewed. That way your code can be reviewed in smaller blocks.

### Merge Request Workflow

To review the merge request (MR) please clone it locally

```bash
git fetch -p                              # Pull the latest changes from GitLab
git checkout NXGEN-XXXX                   # check out the branch you're going to review
```

- Before merging, please **test the change manually**. *Reading the code is not enough.*
  - If it's a change to component, please browse Storybook and check the change
  - If it's a micro-frontend change, please run it locally and check the change
- Do not merge if you have questions or concerns about the code.
  - Use conventional comments as explained in the section above to ask for changes to the author
- If corrections or clarifications are needed, please continue the conversation in GitLab, Slack or Zoom as you see fit.
- If all changes look good you can, optionally, approve the Merge Request, and either merge it or ask the author to do it.
  - We should encourage the author to verify a change in the development environment before merging.

### Reviewing a rebased branch

Sometimes, you may have checked out a branch, and the original author may have **rebased it and force pushed more changes**. In order to avoid issues with duplicate or missing commits, please delete your local branch and checkout the remote one.

```bash
git fetch -p                              # Pull the latest changes from GitLab
git branch -D NXGEN-XX                    # Where XX is the JIRA ticket number of the branch that di
git checkout NXGEN-XX                     # Checkout the latest version from the remote
```

## Testing Guidelines

### Test doubles

When writing **unit tests** we are focusing on **describing one unit of behaviour at a time**, and how **objects communicate** in order to achieve that behaviour.

By behaviour, at the unit level, we mean the **rules by which the object will convert input into output**. The way we describe that behaviour using tests will depend on what kind of behaviour happens within that method or function call. Thinking of behaviour in this way boils down to a very narrow list:

- Throw an exception or produce an error
- Modify the value of a property
- Return a value
- Call a method on a collaborator

Let's focus now on the trick part, or **calling a method on a collaborator**.

Below are some of the reasons we need test doubles, such as the fact that using real collaborators has some disadvantages:

- They are expensive to create
- They make the test slow
- They have internal behaviour that we cannot control
- They produce by-products that may interfere with other tests
- They need to return a specific value for us to describe the object under test

### Button

✓ is a primary button with size medium by default
✓ can have an aria label
✓ executes it's click handler
✓ doesn't execute click handler if it's disabled
✓ shows a spinner when an operation is being executed
✓ supports dark mode
✓ is accessible

## React Style Guide

### Source Files

- File names must be in **PascalCase**.
- File names must be in **PascalCase** for classes.
- Files must end with a **newline**.
- Use camelCase instead of PascalCase for variables.
- Write your React components in TypeScript to prevent errors

### Source File Structure

1. Imports
2. Type declarations
3. Empty line
4. Splitting component (if necessary)
5. Component(s)

The example below shows an example on how code should be organized within a component file.

```typescript
// Imports
```