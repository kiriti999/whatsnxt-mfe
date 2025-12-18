const BLOG_CATEGORIES = [
  {
    categoryName: "IT & Software",
    subcategories: [
      {
        name: "Programming & Development",
        subcategories: [
          { name: "html" },
          { name: "css" },
          { name: "javascript" },
          { name: "misc" },
          { name: "aws" },
          { name: "reactjs" },
          { name: "nodejs" },
          { name: "mongo" },
          { name: "sql" },
          { name: "git" },
          { name: "jenkins" },
          { name: "cicd" },
          { name: "bitbucket" },
          { name: "python" },
          { name: "webpack" },
          { name: "nextjs" },
          { name: "terraform" },
          { name: "ai" },
          { name: "express" },
          { name: "kubernetes" },
          { name: "ansible" },
          { name: "fullstack" },
          { name: "docker" },
          { name: "redis" },
        ],
      },
      { name: "Cloud Computing", subcategories: [] },
      { name: "Networking", subcategories: [] },
      { name: "Cybersecurity", subcategories: [] },
      { name: "Data Science & Analytics", subcategories: [] },
      { name: "Database Management", subcategories: [] },
      { name: "Operating Systems", subcategories: [] },
      { name: "DevOps & Automation", subcategories: [] },
      {
        name: "Artificial Intelligence & Machine Learning",
        subcategories: [],
      },
      { name: "Software Testing & Quality Assurance", subcategories: [] },
      { name: "IT Certification", subcategories: [] },
      { name: "IT Project Management", subcategories: [] },
      {
        name: "Artificial Intelligence Operations (AIOps)",
        subcategories: [],
      },
      { name: "Emerging Technologies", subcategories: [] },
    ],
  },
  {
    categoryName: "Cooking",
    subcategories: [
      {
        name: "Cuisines",
        subcategories: [
          { name: "Italian" },
          { name: "French" },
          { name: "Chinese" },
          { name: "Indian" },
          { name: "Japanese" },
          { name: "Mexican" },
          { name: "Mediterranean" },
          { name: "Middle Eastern" },
          { name: "Thai" },
          { name: "African" },
        ],
      },
      { name: "Cooking Techniques", subcategories: [] },
      { name: "Special Diets", subcategories: [] },
      { name: "Meal Types", subcategories: [] },
      { name: "Baking & Pastry", subcategories: [] },
      { name: "Healthy Cooking", subcategories: [] },
      { name: "Culinary Skills", subcategories: [] },
      { name: "Quick & Easy Recipes", subcategories: [] },
      { name: "Holiday & Special Occasions", subcategories: [] },
    ],
  },
];

const COURSE_CATEGORIES = [
  {
    categoryName: "IT & Software",
    subcategories: [
      {
        name: "Programming & Development",
        subcategories: [
          { name: "html" },
          { name: "css" },
          { name: "javascript" },
          { name: "misc" },
          { name: "aws" },
          { name: "reactjs" },
          { name: "nodejs" },
          { name: "mongo" },
          { name: "sql" },
          { name: "git" },
          { name: "jenkins" },
          { name: "cicd" },
          { name: "bitbucket" },
          { name: "python" },
          { name: "webpack" },
          { name: "nextjs" },
          { name: "terraform" },
          { name: "ai" },
          { name: "express" },
          { name: "kubernetes" },
          { name: "ansible" },
          { name: "fullstack" },
          { name: "docker" },
          { name: "redis" },
        ],
      },
      {
        name: "Cloud Computing",
        subcategories: [],
      },
      {
        name: "Networking",
        subcategories: [],
      },
      {
        name: "Cybersecurity",
        subcategories: [],
      },
      {
        name: "Data Science & Analytics",
        subcategories: [],
      },
      {
        name: "Database Management",
        subcategories: [],
      },
      {
        name: "Operating Systems",
        subcategories: [],
      },
      {
        name: "DevOps & Automation",
        subcategories: [],
      },
      {
        name: "Artificial Intelligence & Machine Learning",
        subcategories: [],
      },
      {
        name: "Software Testing & Quality Assurance",
        subcategories: [],
      },
      {
        name: "IT Certification",
        subcategories: [],
      },
      {
        name: "IT Project Management",
        subcategories: [],
      },
      {
        name: "Artificial Intelligence Operations (AIOps)",
        subcategories: [],
      },
      {
        name: "Emerging Technologies",
        subcategories: [],
      },
    ],
  },
  {
    categoryName: "Cooking",
    subcategories: [
      {
        name: "Cuisines",
        subcategories: [
          { name: "Italian" },
          { name: "French" },
          { name: "Chinese" },
          { name: "Indian" },
          { name: "Japanese" },
          { name: "Mexican" },
          { name: "Mediterranean" },
          { name: "Middle Eastern" },
          { name: "Thai" },
          { name: "African" },
        ],
      },
      {
        name: "Cooking Techniques",
        subcategories: [],
      },
      {
        name: "Special Diets",
        subcategories: [],
      },
      {
        name: "Meal Types",
        subcategories: [],
      },
      {
        name: "Baking & Pastry",
        subcategories: [],
      },
      {
        name: "Healthy Cooking",
        subcategories: [],
      },
      {
        name: "Culinary Skills",
        subcategories: [],
      },
      {
        name: "Quick & Easy Recipes",
        subcategories: [],
      },
      {
        name: "Holiday & Special Occasions",
        subcategories: [],
      },
    ],
  },
];

const LANGUAGES = [
  {
    name: "English (US)",
    abbr: "en",
  },
  {
    name: "French",
    abbr: "fr",
  },
  {
    name: "Hindi",
    abbr: "hin",
  },
  {
    name: "Spanish",
    abbr: "es",
  },
  {
    name: "Tamil",
    abbr: "ta",
  },
  {
    name: "Telugu",
    abbr: "tel",
  },
];

const jwtConstants = {
  secret: "Secure",
  // maxAge: 900000 // 15mins
  maxAge: 604800000, // 7days
};

// Export all constants
export { COURSE_CATEGORIES, BLOG_CATEGORIES, LANGUAGES, jwtConstants };
