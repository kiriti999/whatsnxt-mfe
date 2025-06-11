// types.ts
interface TutorialArticle {
    title: string;
    // Add other properties as needed
}

export interface TutorialsTocProps {
    tutorials: Tutorial[];
    active: number;
    navigateTutorial: NavigateTutorial;
}

interface Tutorial extends TutorialArticle {
    order?: number;
}

type NavigateTutorial = (index: number) => () => void;