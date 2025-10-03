
export const INTERNAL_STAGE_1_RUBRIC = [
    { id: 'problem_clarity', name: 'Problem Statement Clarity', max: 10 },
    { id: 'originality', name: 'Originality of Idea', max: 10 },
    { id: 'feasibility', name: 'Technical Feasibility', max: 5 },
];

export const INTERNAL_STAGE_2_RUBRIC = [
    { id: 'progress', name: 'Progress & Milestone Achievement', max: 10 },
    { id: 'technical_implementation', name: 'Technical Implementation (Initial)', max: 10 },
    { id: 'documentation_initial', name: 'Initial Documentation', max: 5 },
];

export const INTERNAL_FINAL_RUBRIC = [
    { id: 'final_execution', name: 'Final Technical Execution & Complexity', max: 15 },
    { id: 'project_report', name: 'Final Report & Documentation', max: 10 },
    { id: 'internal_presentation', name: 'Internal Presentation & Viva', max: 10 },
];

export const EXTERNAL_FINAL_RUBRIC = [
    { id: 'innovation', name: 'Innovation & Novelty', max: 15 },
    { id: 'real_world_application', name: 'Real-World Application & Impact', max: 15 },
    { id: 'external_presentation', name: 'Final Presentation & Q/A', max: 20 },
];

export const INDIVIDUAL_EVALUATION_RUBRIC = [
    { id: 'contribution', name: 'Individual Contribution & Impact', max: 10 },
    { id: 'teamwork', name: 'Teamwork & Communication', max: 10 },
];


export const TEAM_ROLES = [
    'Leader',
    'Frontend Developer',
    'Backend Developer',
    'Full-Stack Developer',
    'UI/UX Designer',
    'Project Manager',
    'Data Scientist',
    'QA Tester',
    'DevOps Engineer',
    'Documentation',
    'Presenter'
];

export const WORK_STYLE_TAGS = [
    'Late-night coder',
    'Early bird',
    'Strong presenter',
    'Creative thinker',
    'Meticulous planner',
    'API expert',
    'Frontend specialist',
    'Backend guru',
    'Database wizard',
    'UI/UX enthusiast',
    'Documentation hero',
    'Team motivator'
];

export const SKILL_TAGS = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart',
    // Frontend
    'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Ember.js',
    // Backend
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Ruby on Rails', 'Laravel',
    // Mobile
    'React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose', 'Android', 'iOS',
    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'SQLite',
    // DevOps & Cloud
    'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'CI/CD',
    // AI/ML
    'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Genkit', 'LangChain',
    // Non-Technical / Soft Skills
    'UI/UX Design', 'Figma', 'Project Management', 'Public Speaking', 'Marketing', 'Business Strategy', 'Pitching',
    'Graphic Design', 'Video Editing', 'Content Writing'
];

export const DEPARTMENTS_DATA = {
    "Computer Science & Related Branches": [
        { id: "CSE", name: "Computer Science and Engineering (CSE)" },
        { id: "IT", name: "Information Technology (IT)" },
        { id: "CSBS", name: "Computer Science and Business Systems (CSBS)" },
        { id: "Software Engineering", name: "Software Engineering" },
        { id: "CCE", name: "Computer and Communication Engineering (CCE)" },
        { id: "AI", name: "Artificial Intelligence (AI)" },
        { id: "AI & ML", name: "Artificial Intelligence and Machine Learning (AI & ML)" },
        { id: "AI & DS", name: "Artificial Intelligence and Data Science (AI & DS)" },
        { id: "DS", name: "Data Science (DS)" },
        { id: "CSE-Cyber Security", name: "Cyber Security (CSE-Cyber Security)" },
        { id: "Cloud Technology and Information Security", name: "Cloud Technology and Information Security" },
        { id: "IoT", name: "Internet of Things (IoT)" },
        { id: "Blockchain Technology", name: "Blockchain Technology" },
        { id: "VR/AR", name: "Virtual Reality / Augmented Reality (VR/AR)" },
        { id: "CSE-Gaming", name: "CSE with Specialization in Gaming / Graphics / Animation" }
    ],
    "Electronics, Electrical & Communication": [
        { id: "ECE", name: "Electronics and Communication Engineering (ECE)" },
        { id: "ETC/ET&T", name: "Electronics and Telecommunication Engineering (ETC/ET&T)" },
        { id: "ECM", name: "Electronics and Computer Engineering (ECM)" },
        { id: "EIE", name: "Electronics and Instrumentation Engineering (EIE)" },
        { id: "ICE", name: "Instrumentation and Control Engineering (ICE)" },
        { id: "EEE", name: "Electrical and Electronics Engineering (EEE)" },
        { id: "EE", name: "Electrical Engineering (EE)" },
        { id: "VLSI", name: "VLSI Design and Embedded Systems" },
        { id: "Communication Systems", name: "Communication Systems Engineering" },
        { id: "Microelectronics", name: "Microelectronics and Semiconductor Engineering" }
    ],
    "Mechanical & Allied Branches": [
        { id: "ME", name: "Mechanical Engineering (ME)" },
        { id: "Production Engineering", name: "Production Engineering" },
        { id: "Manufacturing Engineering", name: "Manufacturing Engineering" },
        { id: "Industrial Engineering", name: "Industrial Engineering" },
        { id: "Industrial and Production Engineering", name: "Industrial and Production Engineering" },
        { id: "Mechatronics", name: "Mechatronics Engineering" },
        { id: "Robotics and Automation", name: "Robotics and Automation Engineering" },
        { id: "Automobile Engineering", name: "Automobile Engineering" },
        { id: "Thermal Engineering", name: "Thermal Engineering" },
        { id: "Marine Engineering", name: "Marine Engineering" },
        { id: "Aeronautical Engineering", name: "Aeronautical Engineering" },
        { id: "Aerospace Engineering", name: "Aerospace Engineering" },
        { id: "Mining Machinery", name: "Mining Machinery Engineering" }
    ],
    "Civil & Environmental Branches": [
        { id: "CE", name: "Civil Engineering (CE)" },
        { id: "Structural Engineering", name: "Structural Engineering" },
        { id: "Construction Engineering", name: "Construction Engineering" },
        { id: "Transportation Engineering", name: "Transportation Engineering" },
        { id: "Environmental Engineering", name: "Environmental Engineering" },
        { id: "Geotechnical Engineering", name: "Geotechnical Engineering" },
        { id: "Water Resources", name: "Water Resources Engineering" },
        { id: "Surveying Engineering", name: "Surveying Engineering" },
        { id: "Coastal and Ocean", name: "Coastal and Ocean Engineering" }
    ],
    "Chemical & Material Sciences": [
        { id: "ChE", name: "Chemical Engineering (ChE)" },
        { id: "Petrochemical", name: "Petrochemical Engineering" },
        { id: "Petroleum Engineering", name: "Petroleum Engineering" },
        { id: "Plastic and Polymer", name: "Plastic and Polymer Engineering" },
        { id: "Rubber Technology", name: "Rubber Technology" },
        { id: "Paint Technology", name: "Paint Technology" },
        { id: "Food Technology", name: "Food Technology" },
        { id: "Leather Technology", name: "Leather Technology" },
        { id: "Textile Engineering", name: "Textile Engineering" },
        { id: "Biochemical Engineering", name: "Biochemical Engineering" },
        { id: "Ceramic Engineering", name: "Ceramic Engineering" },
        { id: "MT", name: "Metallurgical Engineering (MT)" },
        { id: "Materials Science", name: "Materials Science and Engineering" },
        { id: "Mining Engineering", name: "Mining Engineering" },
        { id: "Mineral Engineering", name: "Mineral Engineering" }
    ],
    "Biology, Medical & Agricultural Branches": [
        { id: "Biotechnology", name: "Biotechnology Engineering" },
        { id: "Bioinformatics", name: "Bioinformatics" },
        { id: "Biomedical Engineering", name: "Biomedical Engineering" },
        { id: "Biochemical Engineering", name: "Biochemical Engineering" },
        { id: "Genetic Engineering", name: "Genetic Engineering" },
        { id: "Agricultural Engineering", name: "Agricultural Engineering" },
        { id: "Dairy Technology", name: "Dairy Technology" },
        { id: "Food Process Engineering", name: "Food Process Engineering" }
    ],
    "Marine, Energy & Earth Sciences": [
        { id: "Ocean Engineering", name: "Ocean Engineering and Naval Architecture" },
        { id: "Marine Engineering", name: "Marine Engineering" },
        { id: "Petroleum Engineering", name: "Petroleum Engineering" },
        { id: "Mining Engineering", name: "Mining Engineering" },
        { id: "Geological Engineering", name: "Geological Engineering" },
        { id: "Geo-Informatics", name: "Geo-Informatics Engineering" },
        { id: "Petroleum and Petrochemical", name: "Petroleum and Petrochemical Engineering" },
        { id: "Renewable Energy", name: "Renewable Energy Engineering" },
        { id: "Energy Engineering", name: "Energy Engineering" },
        { id: "Environmental Science", name: "Environmental Science and Engineering" }
    ],
    "Emerging / Interdisciplinary Branches": [
        { id: "AI & Robotics", name: "Artificial Intelligence & Robotics" },
        { id: "Smart Manufacturing", name: "Smart Manufacturing" },
        { id: "Nanotechnology", name: "Nanotechnology Engineering" },
        { id: "Railway Engineering", name: "Railway Engineering" },
        { id: "Aerospace Avionics", name: "Aerospace Avionics" },
        { id: "Engineering Physics", name: "Engineering Physics" },
        { id: "Mathematics and Computing", name: "Mathematics and Computing" },
        { id: "Cognitive Science", name: "Cognitive Science & Engineering" },
        { id: "Computational Engineering", name: "Computational Engineering" },
        { id: "Nuclear Engineering", name: "Nuclear Engineering" },
        { id: "Systems Engineering", name: "Systems Engineering" }
    ]
};

export const BRANCHES_DATA = DEPARTMENTS_DATA;
