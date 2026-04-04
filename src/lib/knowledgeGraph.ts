// Subject Knowledge Graph - Hierarchical topic structure for adaptive learning

export interface SubTopic {
  id: string;
  name: string;
  parent: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SubjectNode {
  id: string;
  name: string;
  children: SubjectNode[];
}

// Full knowledge graph for supported subjects
export const KNOWLEDGE_GRAPH: Record<string, SubjectNode> = {
  Physics: {
    id: 'physics', name: 'Physics', children: [
      { id: 'mechanics', name: 'Mechanics', children: [
        { id: 'kinematics', name: 'Kinematics', children: [] },
        { id: 'laws-of-motion', name: 'Laws of Motion', children: [] },
        { id: 'rotation', name: 'Rotational Motion', children: [] },
        { id: 'work-energy', name: 'Work, Energy & Power', children: [] },
        { id: 'gravitation', name: 'Gravitation', children: [] },
      ]},
      { id: 'thermodynamics', name: 'Thermodynamics', children: [
        { id: 'heat-transfer', name: 'Heat Transfer', children: [] },
        { id: 'kinetic-theory', name: 'Kinetic Theory', children: [] },
        { id: 'thermo-laws', name: 'Laws of Thermodynamics', children: [] },
      ]},
      { id: 'electricity', name: 'Electricity & Magnetism', children: [
        { id: 'electrostatics', name: 'Electrostatics', children: [] },
        { id: 'current-electricity', name: 'Current Electricity', children: [] },
        { id: 'magnetism', name: 'Magnetism', children: [] },
        { id: 'em-induction', name: 'EM Induction', children: [] },
      ]},
      { id: 'optics', name: 'Optics', children: [
        { id: 'ray-optics', name: 'Ray Optics', children: [] },
        { id: 'wave-optics', name: 'Wave Optics', children: [] },
      ]},
      { id: 'modern-physics', name: 'Modern Physics', children: [
        { id: 'atomic-physics', name: 'Atomic Physics', children: [] },
        { id: 'nuclear-physics', name: 'Nuclear Physics', children: [] },
        { id: 'semiconductors', name: 'Semiconductors', children: [] },
      ]},
      { id: 'waves', name: 'Waves & Oscillations', children: [] },
    ],
  },
  Chemistry: {
    id: 'chemistry', name: 'Chemistry', children: [
      { id: 'physical-chem', name: 'Physical Chemistry', children: [
        { id: 'atomic-structure', name: 'Atomic Structure', children: [] },
        { id: 'chemical-bonding', name: 'Chemical Bonding', children: [] },
        { id: 'states-of-matter', name: 'States of Matter', children: [] },
        { id: 'chemical-kinetics', name: 'Chemical Kinetics', children: [] },
        { id: 'equilibrium', name: 'Equilibrium', children: [] },
        { id: 'electrochemistry', name: 'Electrochemistry', children: [] },
      ]},
      { id: 'organic-chem', name: 'Organic Chemistry', children: [
        { id: 'hydrocarbons', name: 'Hydrocarbons', children: [] },
        { id: 'organic-reactions', name: 'Organic Reactions', children: [] },
        { id: 'polymers', name: 'Polymers', children: [] },
        { id: 'biomolecules', name: 'Biomolecules', children: [] },
      ]},
      { id: 'inorganic-chem', name: 'Inorganic Chemistry', children: [
        { id: 'periodic-table', name: 'Periodic Table', children: [] },
        { id: 'coordination', name: 'Coordination Compounds', children: [] },
        { id: 'd-block', name: 'd & f Block Elements', children: [] },
      ]},
    ],
  },
  Biology: {
    id: 'biology', name: 'Biology', children: [
      { id: 'botany', name: 'Botany', children: [
        { id: 'plant-physiology', name: 'Plant Physiology', children: [] },
        { id: 'plant-anatomy', name: 'Plant Anatomy', children: [] },
        { id: 'plant-reproduction', name: 'Plant Reproduction', children: [] },
      ]},
      { id: 'zoology', name: 'Zoology', children: [
        { id: 'human-physiology', name: 'Human Physiology', children: [] },
        { id: 'animal-kingdom', name: 'Animal Kingdom', children: [] },
        { id: 'human-reproduction', name: 'Human Reproduction', children: [] },
      ]},
      { id: 'genetics', name: 'Genetics & Evolution', children: [
        { id: 'molecular-bio', name: 'Molecular Biology', children: [] },
        { id: 'heredity', name: 'Heredity & Variation', children: [] },
        { id: 'evolution', name: 'Evolution', children: [] },
      ]},
      { id: 'ecology', name: 'Ecology & Environment', children: [] },
    ],
  },
  Mathematics: {
    id: 'mathematics', name: 'Mathematics', children: [
      { id: 'algebra', name: 'Algebra', children: [
        { id: 'complex-numbers', name: 'Complex Numbers', children: [] },
        { id: 'quadratic', name: 'Quadratic Equations', children: [] },
        { id: 'matrices', name: 'Matrices & Determinants', children: [] },
        { id: 'permutation', name: 'Permutations & Combinations', children: [] },
        { id: 'sequences', name: 'Sequences & Series', children: [] },
      ]},
      { id: 'calculus', name: 'Calculus', children: [
        { id: 'limits', name: 'Limits & Continuity', children: [] },
        { id: 'differentiation', name: 'Differentiation', children: [] },
        { id: 'integration', name: 'Integration', children: [] },
        { id: 'diff-equations', name: 'Differential Equations', children: [] },
      ]},
      { id: 'coordinate', name: 'Coordinate Geometry', children: [
        { id: 'straight-lines', name: 'Straight Lines', children: [] },
        { id: 'circles', name: 'Circles', children: [] },
        { id: 'conics', name: 'Conic Sections', children: [] },
      ]},
      { id: 'trigonometry', name: 'Trigonometry', children: [] },
      { id: 'probability', name: 'Probability & Statistics', children: [] },
      { id: 'vectors-3d', name: 'Vectors & 3D Geometry', children: [] },
    ],
  },
  English: {
    id: 'english', name: 'English', children: [
      { id: 'grammar', name: 'Grammar', children: [] },
      { id: 'comprehension', name: 'Reading Comprehension', children: [] },
      { id: 'vocabulary', name: 'Vocabulary', children: [] },
    ],
  },
  Hindi: {
    id: 'hindi', name: 'Hindi', children: [
      { id: 'vyakaran', name: 'Vyakaran', children: [] },
      { id: 'sahitya', name: 'Sahitya', children: [] },
    ],
  },
  History: {
    id: 'history', name: 'History', children: [
      { id: 'ancient', name: 'Ancient History', children: [] },
      { id: 'medieval', name: 'Medieval History', children: [] },
      { id: 'modern', name: 'Modern History', children: [] },
    ],
  },
  Geography: {
    id: 'geography', name: 'Geography', children: [
      { id: 'physical-geo', name: 'Physical Geography', children: [] },
      { id: 'human-geo', name: 'Human Geography', children: [] },
      { id: 'indian-geo', name: 'Indian Geography', children: [] },
    ],
  },
  'Computer Science': {
    id: 'cs', name: 'Computer Science', children: [
      { id: 'programming', name: 'Programming', children: [] },
      { id: 'data-structures', name: 'Data Structures', children: [] },
      { id: 'databases', name: 'Databases', children: [] },
      { id: 'networking', name: 'Networking', children: [] },
    ],
  },
  Economics: {
    id: 'economics', name: 'Economics', children: [
      { id: 'micro', name: 'Microeconomics', children: [] },
      { id: 'macro', name: 'Macroeconomics', children: [] },
      { id: 'indian-economy', name: 'Indian Economy', children: [] },
    ],
  },
  'Political Science': {
    id: 'polsci', name: 'Political Science', children: [
      { id: 'indian-constitution', name: 'Indian Constitution', children: [] },
      { id: 'political-theory', name: 'Political Theory', children: [] },
    ],
  },
  'General Knowledge': {
    id: 'gk', name: 'General Knowledge', children: [
      { id: 'current-affairs', name: 'Current Affairs', children: [] },
      { id: 'static-gk', name: 'Static GK', children: [] },
    ],
  },
  Reasoning: {
    id: 'reasoning', name: 'Reasoning', children: [
      { id: 'logical', name: 'Logical Reasoning', children: [] },
      { id: 'analytical', name: 'Analytical Reasoning', children: [] },
      { id: 'verbal', name: 'Verbal Reasoning', children: [] },
    ],
  },
  Aptitude: {
    id: 'aptitude', name: 'Aptitude', children: [
      { id: 'quantitative', name: 'Quantitative Aptitude', children: [] },
      { id: 'data-interpretation', name: 'Data Interpretation', children: [] },
    ],
  },
};

// Flatten the knowledge graph into a list of all sub-topics for a subject
export function getSubTopics(subject: string): { id: string; name: string; path: string[] }[] {
  const node = KNOWLEDGE_GRAPH[subject];
  if (!node) return [];

  const result: { id: string; name: string; path: string[] }[] = [];
  const traverse = (n: SubjectNode, path: string[]) => {
    if (n.children.length === 0) {
      result.push({ id: n.id, name: n.name, path: [...path, n.name] });
    } else {
      n.children.forEach(c => traverse(c, [...path, n.name]));
    }
  };
  node.children.forEach(c => traverse(c, [subject]));
  return result;
}

// Get top-level chapters for a subject
export function getChapters(subject: string): { id: string; name: string }[] {
  const node = KNOWLEDGE_GRAPH[subject];
  if (!node) return [];
  return node.children.map(c => ({ id: c.id, name: c.name }));
}
