import type {
  User,
  AppEvent,
  MatchCandidate,
  Group,
  Conversation,
  Notification,
  Connection,
} from '@/types';

/* ================================================================== */
/*  Mock Users — 10 diverse TU Darmstadt students                      */
/* ================================================================== */

export const mockUsers: User[] = [
  {
    id: 'user_001',
    name: 'Akira Tanaka',
    email: 'akira.tanaka@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'M.Sc. Computer Science',
    semester: 3,
    avatar: 'anime_girl',
    onboarding_complete: true,
    bio: 'Japanese exchange student passionate about distributed systems and J-pop. Looking for study partners and hackathon teammates.',
    academic: {
      courses: ['Distributed Systems', 'Machine Learning', 'Computer Vision'],
      degree: 'M.Sc. Computer Science',
      thesis_topic: 'Federated learning for privacy-preserving recommendation systems',
    },
    interests: {
      hobbies: ['climbing', 'photography', 'origami'],
      topics: ['AI ethics', 'open source', 'privacy'],
      music: 'J-pop',
      sports: 'badminton',
    },
    skills: {
      programming: ['Python', 'TypeScript', 'Go'],
      languages: ['Japanese', 'English', 'German (B1)'],
      tools: ['Docker', 'Kubernetes', 'PyTorch'],
    },
    goals: {
      learning: ['Rust', 'system design'],
      career: 'ML engineering at a research lab',
      short_term: 'Find study group for exam prep',
      here_to: 'Meet people in my courses and find study partners',
    },
    availability: {
      preferred_times: ['evenings', 'weekends'],
      study_style: 'pair',
      timezone: 'CET',
    },
    events: {
      attended: ['event_001', 'event_002', 'event_005'],
      interested: ['event_003', 'event_007'],
      categories: ['hackathon', 'seminar', 'lecture'],
    },
  },
  {
    id: 'user_002',
    name: 'BananaCat',
    email: 'priya.sharma@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'M.Sc. Information Systems',
    semester: 2,
    avatar: 'banana_guy',
    onboarding_complete: true,
    bio: 'Data enthusiast from Mumbai. Love dancing, chai, and building dashboards that actually make sense.',
    academic: {
      courses: ['Data Mining', 'Business Intelligence', 'Cloud Computing'],
      degree: 'M.Sc. Information Systems',
    },
    interests: {
      hobbies: ['dancing', 'cooking', 'yoga'],
      topics: ['data visualization', 'UX research', 'sustainability'],
      music: 'Bollywood & indie pop',
      sports: 'yoga',
    },
    skills: {
      programming: ['Python', 'R', 'SQL'],
      languages: ['Hindi', 'English', 'German (A2)'],
      tools: ['Tableau', 'Power BI', 'AWS'],
    },
    goals: {
      learning: ['React', 'data engineering'],
      career: 'Data analyst at a tech company',
      short_term: 'Build portfolio projects',
      here_to: 'Network with other data people and find project partners',
    },
    availability: {
      preferred_times: ['mornings', 'afternoons'],
      study_style: 'group',
      timezone: 'CET',
    },
    events: {
      attended: ['event_002', 'event_004'],
      interested: ['event_006', 'event_008'],
      categories: ['seminar', 'social'],
    },
  },
  {
    id: 'user_003',
    name: 'Lukas Weber',
    email: 'lukas.weber@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'B.Sc. Electrical Engineering',
    semester: 5,
    avatar: 'buff_arnold',
    onboarding_complete: true,
    bio: 'Local Darmstadt guy who lifts and codes embedded systems. Always down for a Stammtisch.',
    academic: {
      courses: ['Embedded Systems', 'Signal Processing', 'Control Theory'],
      degree: 'B.Sc. Electrical Engineering',
    },
    interests: {
      hobbies: ['weightlifting', 'board games', '3D printing'],
      topics: ['IoT', 'robotics', 'renewable energy'],
      music: 'metal',
      sports: 'powerlifting',
    },
    skills: {
      programming: ['C', 'C++', 'MATLAB'],
      languages: ['German', 'English'],
      tools: ['Altium Designer', 'Oscilloscope', 'FPGA toolchains'],
    },
    goals: {
      learning: ['Python', 'machine learning for embedded'],
      career: 'Embedded systems engineer at Bosch',
      short_term: 'Finish bachelor thesis',
      here_to: 'Find lab partners and people to share project ideas with',
    },
    availability: {
      preferred_times: ['afternoons', 'evenings'],
      study_style: 'pair',
      timezone: 'CET',
    },
    events: {
      attended: ['event_001', 'event_003'],
      interested: ['event_005'],
      categories: ['lecture', 'hackathon'],
    },
  },
  {
    id: 'user_004',
    name: 'Sofia Martinez',
    email: 'sofia.martinez@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'M.Sc. Autonomous Systems',
    semester: 1,
    avatar: 'anime_girl',
    onboarding_complete: true,
    bio: 'Robotics nerd from Barcelona. Just arrived in Darmstadt and looking for friends who also think robots are cool.',
    academic: {
      courses: ['Robot Learning', 'Computer Vision', 'Autonomous Navigation'],
      degree: 'M.Sc. Autonomous Systems',
    },
    interests: {
      hobbies: ['sketching', 'running', 'reading sci-fi'],
      topics: ['robotics', 'self-driving cars', 'sim-to-real transfer'],
      music: 'electronic',
      sports: 'running',
    },
    skills: {
      programming: ['Python', 'C++', 'ROS'],
      languages: ['Spanish', 'English', 'German (B2)'],
      tools: ['ROS2', 'Gazebo', 'OpenCV'],
    },
    goals: {
      learning: ['reinforcement learning', 'sim-to-real'],
      career: 'Robotics researcher',
      short_term: 'Join a robotics project team',
      here_to: 'Collaborate on robotics projects and explore Darmstadt',
    },
    availability: {
      preferred_times: ['mornings', 'afternoons'],
      study_style: 'group',
      timezone: 'CET',
    },
    events: {
      attended: ['event_005'],
      interested: ['event_001', 'event_003', 'event_007'],
      categories: ['hackathon', 'lecture', 'social'],
    },
  },
  {
    id: 'user_005',
    name: 'Chen Wei',
    email: 'chen.wei@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'M.Sc. Computer Science',
    semester: 4,
    avatar: 'bland_normal_guy',
    onboarding_complete: true,
    bio: 'Backend engineer at heart from Beijing. Building side projects and looking for co-founders.',
    academic: {
      courses: ['Distributed Systems', 'Software Engineering', 'Databases'],
      degree: 'M.Sc. Computer Science',
      thesis_topic: 'Optimizing query planning in distributed databases',
    },
    interests: {
      hobbies: ['chess', 'cooking', 'hiking'],
      topics: ['startups', 'system architecture', 'databases'],
      music: 'lo-fi',
      sports: 'table tennis',
    },
    skills: {
      programming: ['Java', 'Go', 'Python', 'TypeScript'],
      languages: ['Mandarin', 'English', 'German (B1)'],
      tools: ['PostgreSQL', 'Redis', 'gRPC', 'Terraform'],
    },
    goals: {
      learning: ['Rust', 'distributed consensus'],
      career: 'Start a developer tools company',
      short_term: 'Find a co-founder for my side project',
      here_to: 'Meet technical people who want to build things',
    },
    availability: {
      preferred_times: ['evenings', 'weekends'],
      study_style: 'pair',
      timezone: 'CET',
    },
    events: {
      attended: ['event_001', 'event_002', 'event_006'],
      interested: ['event_003'],
      categories: ['hackathon', 'seminar'],
    },
  },
  {
    id: 'user_006',
    name: 'Anna Kowalska',
    email: 'anna.kowalska@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'M.Sc. Data Science',
    semester: 2,
    avatar: 'anime_girl',
    onboarding_complete: true,
    bio: 'Polish girl who codes in Python by day and paints watercolors by night. Always up for a coffee and a chat about ML.',
    academic: {
      courses: ['Statistical Learning', 'Natural Language Processing', 'Deep Learning'],
      degree: 'M.Sc. Data Science',
    },
    interests: {
      hobbies: ['watercolor painting', 'reading', 'coffee tasting'],
      topics: ['NLP', 'generative AI', 'art + technology'],
      music: 'indie folk',
      sports: 'cycling',
    },
    skills: {
      programming: ['Python', 'Julia', 'R'],
      languages: ['Polish', 'English', 'German (B2)'],
      tools: ['Hugging Face', 'Weights & Biases', 'Jupyter'],
    },
    goals: {
      learning: ['MLOps', 'deployment pipelines'],
      career: 'NLP researcher at a big lab',
      short_term: 'Publish first paper',
      here_to: 'Find collaborators for NLP research',
    },
    availability: {
      preferred_times: ['mornings', 'evenings'],
      study_style: 'solo',
      timezone: 'CET',
    },
    events: {
      attended: ['event_002', 'event_004', 'event_006'],
      interested: ['event_008'],
      categories: ['seminar', 'social', 'lecture'],
    },
  },
  {
    id: 'user_007',
    name: 'Miracle the Crazy Nigerian',
    email: 'emmanuel.okafor@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'M.Sc. IT Security',
    semester: 3,
    avatar: 'buff_arnold',
    onboarding_complete: true,
    bio: 'Cybersecurity enthusiast from Lagos. CTF player. Love breaking things (ethically) and building them back stronger.',
    academic: {
      courses: ['Network Security', 'Cryptography', 'Secure Software Engineering'],
      degree: 'M.Sc. IT Security',
    },
    interests: {
      hobbies: ['CTF competitions', 'football', 'afrobeats DJing'],
      topics: ['zero-trust architecture', 'blockchain security', 'bug bounty'],
      music: 'afrobeats',
      sports: 'football',
    },
    skills: {
      programming: ['Python', 'Rust', 'C'],
      languages: ['English', 'Yoruba', 'German (A2)'],
      tools: ['Wireshark', 'Burp Suite', 'Ghidra'],
    },
    goals: {
      learning: ['cloud security', 'reverse engineering'],
      career: 'Security consultant',
      short_term: 'Win a CTF competition',
      here_to: 'Find a CTF team and security-minded friends',
    },
    availability: {
      preferred_times: ['evenings', 'weekends'],
      study_style: 'group',
      timezone: 'CET',
    },
    events: {
      attended: ['event_003', 'event_005'],
      interested: ['event_001', 'event_007'],
      categories: ['hackathon', 'lecture'],
    },
  },
  {
    id: 'user_008',
    name: 'Marie Dupont',
    email: 'marie.dupont@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'M.Sc. Computational Engineering',
    semester: 2,
    avatar: 'banana_guy',
    onboarding_complete: true,
    bio: 'French engineer who simulates fluid dynamics and bakes croissants. I believe in work-life balance.',
    academic: {
      courses: ['Finite Element Methods', 'Computational Fluid Dynamics', 'Numerical Optimization'],
      degree: 'M.Sc. Computational Engineering',
    },
    interests: {
      hobbies: ['baking', 'cinema', 'piano'],
      topics: ['simulation', 'HPC', 'scientific computing'],
      music: 'jazz',
      sports: 'fencing',
    },
    skills: {
      programming: ['C++', 'Fortran', 'Python', 'MATLAB'],
      languages: ['French', 'English', 'German (B1)'],
      tools: ['ANSYS', 'OpenFOAM', 'ParaView'],
    },
    goals: {
      learning: ['GPU computing', 'Julia for scientific computing'],
      career: 'Simulation engineer in automotive',
      short_term: 'Contribute to an open source CFD project',
      here_to: 'Meet other simulation nerds and enjoy student life',
    },
    availability: {
      preferred_times: ['afternoons'],
      study_style: 'pair',
      timezone: 'CET',
    },
    events: {
      attended: ['event_004', 'event_006'],
      interested: ['event_002', 'event_008'],
      categories: ['seminar', 'social'],
    },
  },
  {
    id: 'user_009',
    name: 'Yusuf Demir',
    email: 'yusuf.demir@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'B.Sc. Computer Science',
    semester: 4,
    avatar: 'bland_normal_guy',
    onboarding_complete: true,
    bio: 'Turkish CS undergrad. Full-stack dev who also does competitive programming. Tea > coffee, fight me.',
    academic: {
      courses: ['Algorithms & Data Structures', 'Web Technologies', 'Operating Systems'],
      degree: 'B.Sc. Computer Science',
    },
    interests: {
      hobbies: ['competitive programming', 'gaming', 'tea culture'],
      topics: ['web performance', 'algorithms', 'open source'],
      music: 'Turkish psychedelic rock',
      sports: 'basketball',
    },
    skills: {
      programming: ['TypeScript', 'Python', 'C++', 'Rust'],
      languages: ['Turkish', 'English', 'German (C1)'],
      tools: ['React', 'Node.js', 'PostgreSQL', 'Git'],
    },
    goals: {
      learning: ['systems programming', 'compiler design'],
      career: 'Software engineer at a FAANG company',
      short_term: 'Ace my algorithm exams',
      here_to: 'Find coding buddies and hackathon teammates',
    },
    availability: {
      preferred_times: ['evenings', 'weekends'],
      study_style: 'pair',
      timezone: 'CET',
    },
    events: {
      attended: ['event_001', 'event_003', 'event_005'],
      interested: ['event_007'],
      categories: ['hackathon', 'lecture'],
    },
  },
  {
    id: 'user_010',
    name: 'Lisa Nguyen',
    email: 'lisa.nguyen@stud.tu-darmstadt.de',
    university: 'TU Darmstadt',
    program: 'M.Sc. Computer Science',
    semester: 1,
    avatar: 'mystery_silhouette',
    onboarding_complete: true,
    bio: 'Vietnamese-American, just arrived from UC Berkeley for an exchange semester. Interested in HCI and making tech more human.',
    academic: {
      courses: ['Human-Computer Interaction', 'Machine Learning', 'UX Engineering'],
      degree: 'M.Sc. Computer Science',
    },
    interests: {
      hobbies: ['journaling', 'film photography', 'karaoke'],
      topics: ['HCI', 'accessibility', 'design systems'],
      music: 'K-pop & R&B',
      sports: 'volleyball',
    },
    skills: {
      programming: ['TypeScript', 'Swift', 'Python'],
      languages: ['Vietnamese', 'English', 'German (A1)'],
      tools: ['Figma', 'React Native', 'Firebase'],
    },
    goals: {
      learning: ['German language', 'European design thinking'],
      career: 'UX engineer at a design-forward company',
      short_term: 'Make friends in Darmstadt',
      here_to: 'Experience European student life and collaborate on HCI projects',
    },
    availability: {
      preferred_times: ['mornings', 'afternoons'],
      study_style: 'group',
      timezone: 'CET',
    },
    events: {
      attended: ['event_004'],
      interested: ['event_002', 'event_006', 'event_008'],
      categories: ['social', 'seminar'],
    },
  },
];

/* ================================================================== */
/*  Current user (Akira) — convenience reference                       */
/* ================================================================== */

export const currentUser = mockUsers[0];

/* ================================================================== */
/*  Mock Events — 8 TU Darmstadt events                                */
/* ================================================================== */

export const mockEvents: AppEvent[] = [
  {
    id: 'event_001',
    title: 'Advanced Distributed Systems Lecture',
    description:
      'Weekly lecture covering consensus algorithms, replication strategies, and fault tolerance in large-scale distributed systems. Prof. Dr. Muller.',
    location: 'S2|02 C110, Piloty Building',
    start_time: '2026-04-10T10:00:00+02:00',
    end_time: '2026-04-10T11:30:00+02:00',
    category: 'lecture',
    attendee_count: 87,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80',
  },
  {
    id: 'event_002',
    title: 'NLP Research Seminar: Large Language Models',
    description:
      'Student presentations on recent LLM papers. This week: efficient fine-tuning techniques and RLHF approaches. Bring your questions!',
    location: 'S1|03 Room 223, Altes Hauptgebaude',
    start_time: '2026-04-11T14:00:00+02:00',
    end_time: '2026-04-11T16:00:00+02:00',
    category: 'seminar',
    attendee_count: 34,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80',
  },
  {
    id: 'event_003',
    title: 'TU Darmstadt Spring Hackathon 2026',
    description:
      '48-hour hackathon focused on sustainable campus solutions. Teams of 3-5. Prizes from SAP, Siemens, and Continental. Free pizza and energy drinks.',
    location: 'karo 5, Karolinenplatz 5',
    start_time: '2026-04-18T18:00:00+02:00',
    end_time: '2026-04-20T18:00:00+02:00',
    category: 'hackathon',
    attendee_count: 156,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80',
  },
  {
    id: 'event_004',
    title: 'International Students Coffee Meetup',
    description:
      'Casual coffee meetup for international students. Practice your German, share tips about Darmstadt life, and make new friends. Hosted by the International Office.',
    location: '603|01 Unibar, Stadtmitte Campus',
    start_time: '2026-04-09T16:00:00+02:00',
    end_time: '2026-04-09T18:00:00+02:00',
    category: 'social',
    attendee_count: 42,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80',
  },
  {
    id: 'event_005',
    title: 'Robotics Lab Open Day',
    description:
      'Tour the robotics lab, see demos of autonomous drones and humanoid robots, and chat with PhD researchers about their work.',
    location: 'S2|02 E302, Piloty Building',
    start_time: '2026-04-14T13:00:00+02:00',
    end_time: '2026-04-14T17:00:00+02:00',
    category: 'lecture',
    attendee_count: 63,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80',
  },
  {
    id: 'event_006',
    title: 'Data Science Workshop: Kaggle Competition Prep',
    description:
      'Hands-on workshop preparing for the upcoming Kaggle competition. Covers feature engineering, model ensembling, and leaderboard strategies.',
    location: 'S1|22 Maschinenhaus, Lichtwiese Campus',
    start_time: '2026-04-12T10:00:00+02:00',
    end_time: '2026-04-12T13:00:00+02:00',
    category: 'seminar',
    attendee_count: 28,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80',
  },
  {
    id: 'event_007',
    title: 'CTF Night: Capture The Flag Security Challenge',
    description:
      'Monthly CTF challenge night. Beginner-friendly with mentors. Categories: web, crypto, reverse engineering, and forensics. Free drinks and snacks.',
    location: 'S2|02 C205, Piloty Building',
    start_time: '2026-04-16T19:00:00+02:00',
    end_time: '2026-04-17T01:00:00+02:00',
    category: 'hackathon',
    attendee_count: 45,
    image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=640&q=80',
  },
  {
    id: 'event_008',
    title: 'Stammtisch: Board Games & Beers',
    description:
      'Informal gathering at the student bar. Bring your favorite board game or just show up and join a table. All are welcome, German practice encouraged!',
    location: 'Schlossgarten, near Residenzschloss',
    start_time: '2026-04-15T20:00:00+02:00',
    end_time: '2026-04-15T23:30:00+02:00',
    category: 'social',
    attendee_count: 37,
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&q=80',
  },
];

/* ================================================================== */
/*  Mock Conversations                                                 */
/* ================================================================== */

export const mockConversations: Conversation[] = [
  {
    id: 'conv_001',
    participant: {
      id: 'user_005',
      name: 'Chen Wei',
      university: 'TU Darmstadt',
      program: 'M.Sc. Computer Science',
      avatar: 'bland_normal_guy',
    },
    last_message: 'Hey! Are you going to the Distributed Systems lecture on Friday?',
    last_message_time: '2026-04-08T09:12:00+02:00',
    unread: true,
  },
  {
    id: 'conv_002',
    participant: {
      id: 'user_002',
      name: 'BananaCat',
      university: 'TU Darmstadt',
      program: 'M.Sc. Information Systems',
      avatar: 'banana_guy',
    },
    last_message: 'The NLP seminar was amazing! Want to work on the next assignment together?',
    last_message_time: '2026-04-07T18:45:00+02:00',
    unread: true,
  },
  {
    id: 'conv_003',
    participant: {
      id: 'user_009',
      name: 'Yusuf Demir',
      university: 'TU Darmstadt',
      program: 'B.Sc. Computer Science',
      avatar: 'bland_normal_guy',
    },
    last_message: 'Team name ideas for the hackathon: NullPointerExceptions? lol',
    last_message_time: '2026-04-07T14:22:00+02:00',
    unread: false,
  },
  {
    id: 'conv_004',
    participant: {
      id: 'user_004',
      name: 'Sofia Martinez',
      university: 'TU Darmstadt',
      program: 'M.Sc. Autonomous Systems',
      avatar: 'anime_girl',
    },
    last_message: 'Just submitted the lab report. Let me know if you spot any issues!',
    last_message_time: '2026-04-06T21:10:00+02:00',
    unread: false,
  },
  {
    id: 'conv_005',
    participant: {
      id: 'user_006',
      name: 'Anna Kowalska',
      university: 'TU Darmstadt',
      program: 'M.Sc. Data Science',
      avatar: 'anime_girl',
    },
    last_message: 'See you at the coffee meetup tomorrow!',
    last_message_time: '2026-04-05T16:33:00+02:00',
    unread: false,
  },
];

/* ================================================================== */
/*  Mock Notifications                                                 */
/* ================================================================== */

export const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'connection_request',
    title: 'Connection Request',
    body: 'Sofia Martinez wants to connect with you',
    read: false,
    timestamp: '2026-04-08T08:30:00+02:00',
    link: '/connections',
  },
  {
    id: 'notif_002',
    type: 'event_reminder',
    title: 'Event Tomorrow',
    body: 'International Students Coffee Meetup starts tomorrow at 4 PM',
    read: false,
    timestamp: '2026-04-08T07:00:00+02:00',
    link: '/events/event_004',
  },
  {
    id: 'notif_003',
    type: 'new_match',
    title: 'New Match!',
    body: 'You and Miracle the Crazy Nigerian share 3 interests. Say hi!',
    read: false,
    timestamp: '2026-04-07T22:15:00+02:00',
    link: '/users/user_007',
  },
  {
    id: 'notif_004',
    type: 'connection_accepted',
    title: 'Connection Accepted',
    body: 'Chen Wei accepted your connection request',
    read: true,
    timestamp: '2026-04-07T14:00:00+02:00',
    link: '/users/user_005',
  },
  {
    id: 'notif_005',
    type: 'new_message',
    title: 'New Message',
    body: 'BananaCat sent you a message',
    read: true,
    timestamp: '2026-04-07T11:30:00+02:00',
    link: '/messages/conv_002',
  },
  {
    id: 'notif_006',
    type: 'group_invite',
    title: 'Group Invite',
    body: 'Yusuf Demir invited you to join "Hackathon Dream Team"',
    read: true,
    timestamp: '2026-04-06T19:00:00+02:00',
    link: '/events/event_003/groups',
  },
];

/* ================================================================== */
/*  Mock Connections                                                    */
/* ================================================================== */

export const mockConnections: Connection[] = [
  {
    id: 'conn_001',
    requester_id: 'user_001',
    receiver_id: 'user_005',
    status: 'ACCEPTED',
  },
  {
    id: 'conn_002',
    requester_id: 'user_002',
    receiver_id: 'user_001',
    status: 'ACCEPTED',
  },
  {
    id: 'conn_003',
    requester_id: 'user_004',
    receiver_id: 'user_001',
    status: 'PENDING',
  },
  {
    id: 'conn_004',
    requester_id: 'user_001',
    receiver_id: 'user_009',
    status: 'ACCEPTED',
  },
  {
    id: 'conn_005',
    requester_id: 'user_006',
    receiver_id: 'user_001',
    status: 'ACCEPTED',
  },
];

/* ================================================================== */
/*  Mock Groups                                                        */
/* ================================================================== */

export const mockGroups: Group[] = [
  {
    group_id: 'group_001',
    name: 'Distributed Systems Study Group',
    description: 'Weekly study sessions for the DS lecture. We review problem sets and discuss papers.',
    event_id: 'event_001',
    number_of_member: 4,
    looking_for: 2,
    members: [
      { id: 'user_001', name: 'Akira Tanaka', university: 'TU Darmstadt', program: 'M.Sc. Computer Science', avatar: 'anime_girl' },
      { id: 'user_005', name: 'Chen Wei', university: 'TU Darmstadt', program: 'M.Sc. Computer Science', avatar: 'bland_normal_guy' },
      { id: 'user_009', name: 'Yusuf Demir', university: 'TU Darmstadt', program: 'B.Sc. Computer Science', avatar: 'bland_normal_guy' },
      { id: 'user_003', name: 'Lukas Weber', university: 'TU Darmstadt', program: 'B.Sc. Electrical Engineering', avatar: 'buff_arnold' },
    ],
  },
  {
    group_id: 'group_002',
    name: 'Hackathon Dream Team',
    description: 'Building a sustainable campus navigation app. Need a designer!',
    event_id: 'event_003',
    number_of_member: 3,
    looking_for: 2,
    members: [
      { id: 'user_001', name: 'Akira Tanaka', university: 'TU Darmstadt', program: 'M.Sc. Computer Science', avatar: 'anime_girl' },
      { id: 'user_009', name: 'Yusuf Demir', university: 'TU Darmstadt', program: 'B.Sc. Computer Science', avatar: 'bland_normal_guy' },
      { id: 'user_007', name: 'Miracle the Crazy Nigerian', university: 'TU Darmstadt', program: 'M.Sc. IT Security', avatar: 'buff_arnold' },
    ],
  },
  {
    group_id: 'group_003',
    name: 'NLP Paper Reading Circle',
    description: 'We read and discuss one NLP paper every week. Coffee is mandatory.',
    event_id: 'event_002',
    number_of_member: 3,
    looking_for: 3,
    members: [
      { id: 'user_006', name: 'Anna Kowalska', university: 'TU Darmstadt', program: 'M.Sc. Data Science', avatar: 'anime_girl' },
      { id: 'user_002', name: 'BananaCat', university: 'TU Darmstadt', program: 'M.Sc. Information Systems', avatar: 'banana_guy' },
      { id: 'user_001', name: 'Akira Tanaka', university: 'TU Darmstadt', program: 'M.Sc. Computer Science', avatar: 'anime_girl' },
    ],
  },
  {
    group_id: 'group_004',
    name: 'Stammtisch Crew',
    description: 'The regular board game crew. We meet every Tuesday. Settlers of Catan is the current obsession.',
    event_id: 'event_008',
    number_of_member: 5,
    looking_for: 0,
    members: [
      { id: 'user_003', name: 'Lukas Weber', university: 'TU Darmstadt', program: 'B.Sc. Electrical Engineering', avatar: 'buff_arnold' },
      { id: 'user_008', name: 'Marie Dupont', university: 'TU Darmstadt', program: 'M.Sc. Computational Engineering', avatar: 'banana_guy' },
      { id: 'user_010', name: 'Lisa Nguyen', university: 'TU Darmstadt', program: 'M.Sc. Computer Science', avatar: 'mystery_silhouette' },
      { id: 'user_002', name: 'BananaCat', university: 'TU Darmstadt', program: 'M.Sc. Information Systems', avatar: 'banana_guy' },
      { id: 'user_004', name: 'Sofia Martinez', university: 'TU Darmstadt', program: 'M.Sc. Autonomous Systems', avatar: 'anime_girl' },
    ],
  },
];

/* ================================================================== */
/*  Mock Match Candidates — 8 candidates with varied scores (65-95%)   */
/* ================================================================== */

export const mockMatches: MatchCandidate[] = [
  {
    user_id: 'user_005',
    name: 'Chen Wei',
    avatar: 'bland_normal_guy',
    match_score: 0.92,
    shared: { events: 3, interests: 4, courses: ['Distributed Systems'] },
    program: 'M.Sc. Computer Science',
    tags: ['Python', 'Go', 'startups', 'system design'],
  },
  {
    user_id: 'user_009',
    name: 'Yusuf Demir',
    avatar: 'bland_normal_guy',
    match_score: 0.88,
    shared: { events: 3, interests: 3 },
    program: 'B.Sc. Computer Science',
    tags: ['TypeScript', 'competitive programming', 'open source'],
  },
  {
    user_id: 'user_006',
    name: 'Anna Kowalska',
    avatar: 'anime_girl',
    match_score: 0.85,
    shared: { events: 2, interests: 3, courses: ['Machine Learning'] },
    program: 'M.Sc. Data Science',
    tags: ['Python', 'NLP', 'generative AI'],
  },
  {
    user_id: 'user_004',
    name: 'Sofia Martinez',
    avatar: 'anime_girl',
    match_score: 0.81,
    shared: { events: 1, interests: 3, courses: ['Computer Vision'] },
    program: 'M.Sc. Autonomous Systems',
    tags: ['robotics', 'C++', 'running'],
  },
  {
    user_id: 'user_007',
    name: 'Miracle the Crazy Nigerian',
    avatar: 'buff_arnold',
    match_score: 0.78,
    shared: { events: 2, interests: 2 },
    program: 'M.Sc. IT Security',
    tags: ['Python', 'Rust', 'CTF', 'security'],
  },
  {
    user_id: 'user_002',
    name: 'BananaCat',
    avatar: 'banana_guy',
    match_score: 0.74,
    shared: { events: 2, interests: 2 },
    program: 'M.Sc. Information Systems',
    tags: ['data visualization', 'Python', 'sustainability'],
  },
  {
    user_id: 'user_010',
    name: 'Lisa Nguyen',
    avatar: 'mystery_silhouette',
    match_score: 0.69,
    shared: { events: 0, interests: 2, courses: ['Machine Learning'] },
    program: 'M.Sc. Computer Science',
    tags: ['HCI', 'TypeScript', 'design systems'],
  },
  {
    user_id: 'user_008',
    name: 'Marie Dupont',
    avatar: 'banana_guy',
    match_score: 0.65,
    shared: { events: 0, interests: 1 },
    program: 'M.Sc. Computational Engineering',
    tags: ['C++', 'simulation', 'scientific computing'],
  },
];

/* ---- Aliases (different screens import different names) ---- */
export const mockCurrentUser = currentUser;
export const conversations = mockConversations;
export const events = mockEvents;
export const users = mockUsers;
export const matchCandidates = mockMatches;
export const notifications = mockNotifications;
export const connections = mockConnections;
export const groups = mockGroups;
export const messagesByConversation: Record<string, import('@/types').Message[]> = {
  'conv_001': [
    { id: 'm-001', sender_id: 'user_005', content: "Hey! Are you going to the Distributed Systems lecture on Friday?", timestamp: '2026-04-08T09:12:00+02:00' },
    { id: 'm-002', sender_id: mockCurrentUser.id, content: "Yes! Looking forward to it. Want to grab coffee before?", timestamp: '2026-04-08T09:20:00+02:00' },
    { id: 'm-003', sender_id: 'user_005', content: "Sure! How about 9am at the cafeteria?", timestamp: '2026-04-08T09:25:00+02:00' },
  ],
  'conv_002': [
    { id: 'm-010', sender_id: 'user_002', content: "The NLP seminar was amazing! Want to work on the next assignment together?", timestamp: '2026-04-07T18:45:00+02:00' },
    { id: 'm-011', sender_id: mockCurrentUser.id, content: "Definitely! I found the RLHF part really interesting.", timestamp: '2026-04-07T19:00:00+02:00' },
    { id: 'm-012', sender_id: 'user_002', content: "Same! Let's meet at the library tomorrow.", timestamp: '2026-04-07T19:15:00+02:00' },
  ],
  'conv_003': [
    { id: 'm-020', sender_id: 'user_009', content: "Team name ideas for the hackathon: NullPointerExceptions? lol", timestamp: '2026-04-07T14:22:00+02:00' },
    { id: 'm-021', sender_id: mockCurrentUser.id, content: "Haha I like it! Or 'It's not a bug, it's a feature'", timestamp: '2026-04-07T14:30:00+02:00' },
  ],
  'conv_004': [
    { id: 'm-030', sender_id: 'user_004', content: "Just submitted the lab report. Let me know if you spot any issues!", timestamp: '2026-04-06T21:10:00+02:00' },
    { id: 'm-031', sender_id: mockCurrentUser.id, content: "Will do! Thanks for sharing.", timestamp: '2026-04-06T21:30:00+02:00' },
  ],
  'conv_005': [
    { id: 'm-040', sender_id: 'user_006', content: "See you at the coffee meetup tomorrow!", timestamp: '2026-04-05T16:33:00+02:00' },
    { id: 'm-041', sender_id: mockCurrentUser.id, content: "Looking forward to it!", timestamp: '2026-04-05T16:45:00+02:00' },
  ],
};
export const mockMessages = messagesByConversation;

