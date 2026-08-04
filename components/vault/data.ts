export type Option = { id: string; label: string };
export type Question = {
  id: string;
  question: string;
  options: Option[];
  correctOptionId: string;
};

export type VaultConfig = {
  year: string;
  title: string;
  subtitle: string;
  archiveUrl: string;
  variant: string;
  pageClass: string;
  logoAsset: string;
  questions: Question[];
};

const q = (id: string, question: string, labels: string[], correct: number): Question => ({
  id,
  question,
  options: labels.map((label, index) => ({ id: String.fromCharCode(97 + index), label })),
  correctOptionId: String.fromCharCode(97 + correct),
});

export const vaultData: Record<string, VaultConfig> = {
  "2021": {
    year: "2021", title: "Parallax", subtitle: "The Legacy Rerouted",
    archiveUrl: "/vault/2021", variant: "parallax", pageClass: "theme-parallax", logoAsset: "/brand-palettes-2021-2022.jpg",
    questions: [
      q("2021-q1", "How was Malhar 2021 conducted, given the pandemic?", ["As a two-week hybrid event", "As a one-day online/virtual fest", "It was cancelled entirely", "As an invite-only offline event"], 1),
      q("2021-q2", "What was the tagline of Malhar 2021?", ["Alive with Passion", "The World Within", "The Legacy Rerouted", "Rise and Shine"], 2),
      q("2021-q3", "What symbol was central to the Malhar 2021 logo?", ["A compass rose", "A phoenix", "A camera lens inside an eye", "A triquetra"], 2),
    ],
  },
  "2022": {
    year: "2022", title: "Aurora", subtitle: "Rise into the light",
    archiveUrl: "/vault/2022", variant: "aurora", pageClass: "theme-aurora", logoAsset: "/brand-palettes-2021-2022.jpg",
    questions: [
      q("2022-q1", "Which Netflix ‘Little Things’ actor interacted with the audience at Malhar 2022?", ["Rohit Saraf", "Vijay Varma", "Dhruv Sehgal", "Imran Khan"], 2),
      q("2022-q2", "Which creature was hidden in the Malhar 2022 logo?", ["Eagle", "Peacock", "Swan", "Dolphin"], 2),
      q("2022-q3", "Which colour palette best describes Malhar 2022?", ["Deep red and gold", "Purple and electric blue", "Dark teal and copper", "Bright yellow and sky blue"], 3),
    ],
  },
  "2023": {
    year: "2023", title: "Eye of the Storm", subtitle: "Find the calm within",
    archiveUrl: "/vault/2023", variant: "storm", pageClass: "theme-storm", logoAsset: "/brand-palettes-2023-2025.jpg",
    questions: [
      q("2023-q1", "What real-world tension did the theme ‘Eye of the Storm’ represent?", ["The calm and chaos of life, and finding strength within it", "The changing weather patterns during Malhar", "A storm that postponed the fest", "A rivalry between two hosting colleges"], 0),
      q("2023-q2", "What was the central symbol of the Malhar 2023 logo?", ["A spiral galaxy", "A thunderbolt", "An eye on a compass rose", "A yin and yang"], 2),
      q("2023-q3", "What colour dominated the Malhar 2023 palette?", ["Yellow and blue", "Teal and copper", "Red and orange", "Purple and electric blue"], 3),
    ],
  },
  "2024": {
    year: "2024", title: "Viva La Vida", subtitle: "Alive With Passion",
    archiveUrl: "/vault/2024", variant: "viva", pageClass: "theme-viva", logoAsset: "/brand-palettes-2023-2025.jpg",
    questions: [
      q("2024-q1", "Which artist delivered a standout musical performance at Malhar 2024?", ["Yashraj", "Christo Xavier", "KK", "B Praak"], 1),
      q("2024-q2", "What does ‘Viva la Vida’ (the theme of Malhar 2024) mean?", ["Long live the storm", "Alive and burning", "Long live life", "Rise of the eagle"], 2),
      q("2024-q3", "What bird featured in the Malhar 2024 logo?", ["Swan", "Peacock", "Owl", "Eagle"], 3),
    ],
  },
  "2025": {
    year: "2025", title: "The World Within", subtitle: "Celestial depths",
    archiveUrl: "/vault/2025", variant: "within", pageClass: "theme-within", logoAsset: "/brand-palettes-2023-2025.jpg",
    questions: [
      q("2025-q1", "Which actor closed the Malhar 2025 Conclave on August 16?", ["Vijay Varma", "Rohit Saraf", "Aditya Roy Kapur", "Imran Khan"], 0),
      q("2025-q3", "Which colour palette best describes Malhar 2025?", ["Bright yellow and sky blue", "Dark navy and antique gold", "Purple and electric blue", "Deep red and orange"], 1),
      q("2025-q4", "What natural elements featured in the 2025 logo?", ["Fire and wind", "Mountains, moon and waves", "Sun and desert", "Stars and lightning"], 1),
    ],
  },
};

export const supportedYears = Object.keys(vaultData);
