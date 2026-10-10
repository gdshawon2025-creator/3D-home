export interface PersonProfile {
  id: string;
  nameEn: string;
  nameBn: string;
  roleEn: string;
  roleBn: string;
  activityEn: string;
  activityBn: string;
  speechEn: string;
  speechBn: string;
  category: 'footballer' | 'developer' | 'executive' | 'designer' | 'pedestrian' | 'lounge';
  team?: 'red' | 'blue' | 'referee';
  shirtColor: number;
  pantsColor: number;
  skinColor: number;
  hairColor: number;
  isSitting?: boolean;
  position: [number, number, number];
  rotationY?: number;
  walkPath?: [number, number][]; // optional loop walk path in x,z
}

export const CAMPUS_PEOPLE: PersonProfile[] = [
  // --- FOOTBALLERS: TEAM RED (ENGINEERING STRIKERS) ---
  {
    id: 'red_striker',
    nameEn: 'Farhan (Striker #9)',
    nameBn: 'ফারহান (স্ট্রাইকার #৯)',
    roleEn: 'Lead Striker · Engineering FC',
    roleBn: 'প্রধান স্ট্রাইকার · ইঞ্জিনিয়ারিং এফসি',
    activityEn: 'Dribbling toward goal for the match winner!',
    activityBn: 'জয়ের গোলের উদ্দেশ্যে বল নিয়ে দৌড়াচ্ছে!',
    speechEn: 'Pass the ball to me, I have open space!',
    speechBn: 'আমাকে বল দাও, সামনে ফাঁকা জায়গা আছে!',
    category: 'footballer',
    team: 'red',
    shirtColor: 0xef4444, // Red
    pantsColor: 0xffffff, // White
    skinColor: 0xfed7aa,
    hairColor: 0x1c1917,
    position: [-0.8, 0.32, 2.8],
    rotationY: Math.PI / 2,
  },
  {
    id: 'red_midfielder',
    nameEn: 'Vikas (Midfielder #10)',
    nameBn: 'বিকাশ (মিডফিল্ডার #১০)',
    roleEn: 'Playmaker · ThreeJS Creator',
    roleBn: 'প্লে-মেকার ও ডেভেলপার',
    activityEn: 'Controlling the midfield pace with sharp passes',
    activityBn: 'মিডফিল্ডে বল নিয়ন্ত্রণ ও নিখুঁত পাস দিচ্ছে',
    speechEn: 'Beautiful 3D pitch! Let’s score another goal!',
    speechBn: 'চমৎকার ৩D মাঠ! চলো আরেকটি গোল করি!',
    category: 'footballer',
    team: 'red',
    shirtColor: 0xef4444,
    pantsColor: 0xffffff,
    skinColor: 0xfcd34d,
    hairColor: 0x27272a,
    position: [-2.2, 0.32, 1.4],
    rotationY: 0.8,
  },
  {
    id: 'red_defender',
    nameEn: 'Tanvir (Defender #4)',
    nameBn: 'তানভীর (ডিফেন্ডার #৪)',
    roleEn: 'Center Back · Rock Defense',
    roleBn: 'সেন্টার ব্যাক ডিফেন্ডার',
    activityEn: 'Clearing the defensive box',
    activityBn: 'ডিফেন্স সামলাচ্ছে এবং ট্যাকল করছে',
    speechEn: 'Nobody gets past our defensive line!',
    speechBn: 'আমাদের ডিফেন্স ভেদ করা অসম্ভব!',
    category: 'footballer',
    team: 'red',
    shirtColor: 0xef4444,
    pantsColor: 0xffffff,
    skinColor: 0xd97706,
    hairColor: 0x18181b,
    position: [-3.8, 0.32, 3.2],
    rotationY: 0.4,
  },
  {
    id: 'red_keeper',
    nameEn: 'Sumon (Goalkeeper #1)',
    nameBn: 'সুমন (গোলকিপার #১)',
    roleEn: 'Safe Hands Keeper',
    roleBn: 'প্রধান গোলকিপার',
    activityEn: 'Guarding the left goal post',
    activityBn: 'গোলপোস্টের সামনে সতর্ক পাহারায়',
    speechEn: 'Clean sheet today, guaranteed!',
    speechBn: 'আজ কোনো গোল ঢুকতে দেব না!',
    category: 'footballer',
    team: 'red',
    shirtColor: 0x10b981, // Green keeper kit
    pantsColor: 0x064e3b,
    skinColor: 0xfed7aa,
    hairColor: 0x451a03,
    position: [-4.9, 0.32, 2.5],
    rotationY: Math.PI / 2,
  },

  // --- FOOTBALLERS: TEAM BLUE (DESIGN & PRODUCT) ---
  {
    id: 'blue_striker',
    nameEn: 'Arif (Striker #11)',
    nameBn: 'আরিফ (স্ট্রাইকার #১১)',
    roleEn: 'Speedy Winger · Product Team',
    roleBn: 'উইঙ্গার স্ট্রাইকার · প্রোডাক্ট টিম',
    activityEn: 'Counter-attacking down the right flank',
    activityBn: 'ডান প্রান্ত দিয়ে দ্রুত পাল্টা আক্রমণ করছে',
    speechEn: 'Watch this curved shot into the top corner!',
    speechBn: 'এবার টপ কর্নারে বাঁকানো শটটা দেখো!',
    category: 'footballer',
    team: 'blue',
    shirtColor: 0x2563eb, // Blue
    pantsColor: 0x1e293b, // Dark navy
    skinColor: 0xfed7aa,
    hairColor: 0x172554,
    position: [0.9, 0.32, 2.2],
    rotationY: -Math.PI / 2,
  },
  {
    id: 'blue_midfielder',
    nameEn: 'Nayeem (Midfielder #8)',
    nameBn: 'নাঈম (মিডফিল্ডার #৮)',
    roleEn: 'Central Midfielder · UX Maestro',
    roleBn: 'সেন্ট্রাল মিডফিল্ডার · ইউএক্স বিশেষজ্ঞ',
    activityEn: 'Intercepting the pass at midfield',
    activityBn: 'মাঝমাঠে বল ইন্টারসেপ্ট করছে',
    speechEn: 'Keep moving, press forward!',
    speechBn: 'পজিশন ধরে রাখো, সামনে প্রেস করো!',
    category: 'footballer',
    team: 'blue',
    shirtColor: 0x2563eb,
    pantsColor: 0x1e293b,
    skinColor: 0xfcd34d,
    hairColor: 0x292524,
    position: [2.0, 0.32, 3.6],
    rotationY: -1.2,
  },
  {
    id: 'blue_defender',
    nameEn: 'Shakil (Defender #5)',
    nameBn: 'শাকিল (ডিফেন্ডার #৫)',
    roleEn: 'Sweeper Defender',
    roleBn: 'সুইপার ডিফেন্ডার',
    activityEn: 'Marking the opposing striker closely',
    activityBn: 'স্ট্রাইকারকে মার্ক করে রাখছে',
    speechEn: 'Backline solid! Clear the ball!',
    speechBn: 'লাইন ধরে রাখো! বল ক্লিয়ার করো!',
    category: 'footballer',
    team: 'blue',
    shirtColor: 0x2563eb,
    pantsColor: 0x1e293b,
    skinColor: 0xb45309,
    hairColor: 0x09090b,
    position: [3.6, 0.32, 1.8],
    rotationY: -0.6,
  },
  {
    id: 'blue_keeper',
    nameEn: 'Rakib (Goalkeeper #1)',
    nameBn: 'রাকিব (গোলকিপার #১)',
    roleEn: 'Acrobatic Goalkeeper',
    roleBn: 'গোলরক্ষক',
    activityEn: 'Ready to dive for any oncoming shot',
    activityBn: 'শট ঠেকানোর জন্য সম্পূর্ণ প্রস্তুত',
    speechEn: 'I have this covered, let’s go team!',
    speechBn: 'কোনো চিন্তা নেই, আমি প্রস্তুত!',
    category: 'footballer',
    team: 'blue',
    shirtColor: 0xf59e0b, // Yellow keeper kit
    pantsColor: 0x78350f,
    skinColor: 0xfed7aa,
    hairColor: 0x1c1917,
    position: [4.9, 0.32, 2.5],
    rotationY: -Math.PI / 2,
  },

  // --- REFEREE ---
  {
    id: 'referee',
    nameEn: 'Kazi (Match Referee)',
    nameBn: 'কাজী (ম্যাচ রেফারি)',
    roleEn: 'FIFA Certified Campus Official',
    roleBn: 'প্রধান ম্যাচ রেফারি',
    activityEn: 'Monitoring play with whistle in hand',
    activityBn: 'বাঁশি হাতে খেলা পরিচালনা করছে',
    speechEn: 'Play on! Fair tackle!',
    speechBn: 'খেলা চালিয়ে যাও! ফেয়ার ট্যাকল!',
    category: 'footballer',
    team: 'referee',
    shirtColor: 0x000000, // Black & white stripes
    pantsColor: 0x18181b,
    skinColor: 0xfcd34d,
    hairColor: 0x52525b,
    position: [0.0, 0.32, 4.6],
    rotationY: 0,
  },

  // --- SPECTATORS SITTING ON PITCH BENCHES ---
  {
    id: 'spectator_1',
    nameEn: 'Tania (Cheering Fan)',
    nameBn: 'তানিয়া (সমর্থক)',
    roleEn: 'Product Designer',
    roleBn: 'প্রোডাক্ট ডিজাইনার',
    activityEn: 'Cheering wildly for Team Red from the bench',
    activityBn: 'বেঞ্চে বসে রেড টিমের জন্য উল্লাস করছে',
    speechEn: 'GOAL! What an unbelievable strike!',
    speechBn: 'গোল! কী দুর্দান্ত এক শট!',
    category: 'footballer',
    shirtColor: 0xf43f5e, // Pink
    pantsColor: 0x334155,
    skinColor: 0xfed7aa,
    hairColor: 0x78350f,
    isSitting: true,
    position: [-2.5, 0.46, -0.6],
    rotationY: 0,
  },
  {
    id: 'spectator_2',
    nameEn: 'Sohan (Fan)',
    nameBn: 'সোহান (দর্শক)',
    roleEn: 'Mobile App Developer',
    roleBn: 'মোবাইল অ্যাপ ডেভেলপার',
    activityEn: 'Recording the match highlights on phone',
    activityBn: 'ফোনে ম্যাচের রোমাঞ্চকর মুহূর্ত রেকর্ড করছে',
    speechEn: 'This game is going straight to viral reels!',
    speechBn: 'এই ম্যাচের ক্লিপ সোজা রিলসে যাবে!',
    category: 'footballer',
    shirtColor: 0x8b5cf6, // Violet
    pantsColor: 0x1e293b,
    skinColor: 0xfcd34d,
    hairColor: 0x18181b,
    isSitting: true,
    position: [2.5, 0.46, -0.6],
    rotationY: 0,
  },

  // --- PEDESTRIANS & CAMPUS WALKERS ---
  {
    id: 'walker_south',
    nameEn: 'Anik (Commuter)',
    nameBn: 'অনিক (পথচারী)',
    roleEn: 'DevOps Engineer',
    roleBn: 'ডেভঅপস ইঞ্জিনিয়ার',
    activityEn: 'Walking across the avenue sipping fresh espresso',
    activityBn: 'কফি হাতে অ্যাভিনিউ পার হচ্ছে',
    speechEn: 'Campus morning weather is pure perfection.',
    speechBn: 'ক্যাম্পাসের সকালের আবহাওয়া সত্যিই অসাধারণ।',
    category: 'pedestrian',
    shirtColor: 0x0ea5e9, // Sky blue
    pantsColor: 0x334155,
    skinColor: 0xfed7aa,
    hairColor: 0x1c1917,
    position: [-2.0, 0.32, 9.0],
    rotationY: Math.PI / 2,
    walkPath: [
      [-6, 9.0],
      [6, 9.0],
    ],
  },
  {
    id: 'walker_east',
    nameEn: 'Mehedi (Jogger)',
    nameBn: 'মেহেদী (জগার)',
    roleEn: 'Full-Stack Developer',
    roleBn: 'ফুল-স্ট্যাক ডেভেলপার',
    activityEn: 'Jogging along the coastal ring boulevard',
    activityBn: 'উপকূলীয় রিং রোডে জগিং করছে',
    speechEn: '5km daily jog keeps the code bugs away!',
    speechBn: 'প্রতিদিনের জগিং শরীর ও কোড দুটোই ভালো রাখে!',
    category: 'pedestrian',
    shirtColor: 0x10b981, // Emerald sport
    pantsColor: 0x000000,
    skinColor: 0xfcd34d,
    hairColor: 0x27272a,
    position: [11.0, 0.32, 0.0],
    rotationY: Math.PI,
    walkPath: [
      [11.0, 6.0],
      [11.0, -8.0],
    ],
  },
  {
    id: 'walker_crosswalk',
    nameEn: 'Sadia (Delivery & Logistics)',
    nameBn: 'সাদিয়া (লজিস্টিকস)',
    roleEn: 'Operations Coordinator',
    roleBn: 'অপারেশনস কোঅর্ডিনেটর',
    activityEn: 'Walking with backpack to Headquarters Reception',
    activityBn: 'ল্যাপটপ ব্যাগ নিয়ে রিসেপশনের দিকে যাচ্ছে',
    speechEn: 'Delivering the new VR test gear to Design Suite!',
    speechBn: 'ডিজাইন টিমের জন্য নতুন ভিআর গিয়ার নিয়ে যাচ্ছি!',
    category: 'pedestrian',
    shirtColor: 0xf59e0b, // Amber
    pantsColor: 0x1e293b,
    skinColor: 0xfed7aa,
    hairColor: 0x451a03,
    position: [-9.5, 0.32, 3.5],
    rotationY: -Math.PI / 2,
    walkPath: [
      [-9.5, 6.0],
      [-9.5, -4.0],
    ],
  },

  // --- RECEPTION & ATRIUM PEOPLE ---
  {
    id: 'reception_concierge',
    nameEn: 'Nadia (Concierge)',
    nameBn: 'নাদিয়া (রিসেপশনিস্ট)',
    roleEn: 'Head of Hospitality',
    roleBn: 'চিফ কনসিয়ার্জ',
    activityEn: 'Welcoming morning VIP guests at the atrium',
    activityBn: 'প্রধান লবিতে অতিথিদের স্বাগত জানাচ্ছে',
    speechEn: 'Welcome to THE OFFICE! Have a wonderful day.',
    speechBn: 'দ্য অফিসে স্বাগতম! আপনার দিনটি শুভ হোক।',
    category: 'executive',
    shirtColor: 0x4f46e5, // Indigo blazer
    pantsColor: 0xffffff,
    skinColor: 0xfed7aa,
    hairColor: 0x18181b,
    position: [-4.0, 0.32, -0.6],
    rotationY: Math.PI,
  },

  // --- CENTRAL FOUNTAIN BENCH CHILLERS ---
  {
    id: 'fountain_reader',
    nameEn: 'Kamal (Tech Lead)',
    nameBn: 'কামাল (টেক লিড)',
    roleEn: 'Principal Architect',
    roleBn: 'প্রিন্সিপাল সফটওয়্যার আর্কিটেক্ট',
    activityEn: 'Sitting on the fountain park bench reading documentation',
    activityBn: 'ফাউন্টেন পার্ক বেঞ্চে বসে ডকস পড়ছে',
    speechEn: 'Solving complex distributed systems in quiet nature.',
    speechBn: 'প্রকৃতির মাঝে বসে জটিল আর্কিটেকচার সলভ করছি।',
    category: 'developer',
    shirtColor: 0x059669,
    pantsColor: 0x334155,
    skinColor: 0xfcd34d,
    hairColor: 0x172554,
    isSitting: true,
    position: [0.0, 0.46, -4.5],
    rotationY: Math.PI,
  },

  // --- ROOFTOP LOUNGE & CAFETERIA ---
  {
    id: 'lounge_barista',
    nameEn: 'Bijoy (Master Barista)',
    nameBn: 'বিজয় (মাস্টার বারিস্টা)',
    roleEn: 'Specialty Coffee Artisan',
    roleBn: 'স্পেশালিটি কফি বারিস্টা',
    activityEn: 'Brewing pour-over Ethiopian specialty coffee',
    activityBn: 'রুফটপ ক্যাফেতে সুস্বাদু কফি তৈরি করছে',
    speechEn: 'Fresh single-origin roast is ready at the bar!',
    speechBn: 'টাটকা কফি রেডি! এক কাপ নিয়ে যান!',
    category: 'lounge',
    shirtColor: 0x78350f, // Brown apron
    pantsColor: 0x1c1917,
    skinColor: 0xfed7aa,
    hairColor: 0x27272a,
    position: [0.6, 3.5, -8.2],
    rotationY: -Math.PI / 2,
  },

  // --- BOSS CABIN PENTHOUSE ---
  {
    id: 'boss_executive',
    nameEn: 'Kaushik (CEO)',
    nameBn: 'কৌশিক (সিইও)',
    roleEn: 'Founder & CEO',
    roleBn: 'প্রতিষ্ঠাতা ও প্রধান নির্বাহী',
    activityEn: 'Standing on the penthouse terrace surveying the campus',
    activityBn: 'পেন্টহাউস বারান্দা থেকে পুরো ক্যাম্পাস পর্যবেক্ষণ করছে',
    speechEn: 'Great things happen when technology and passion meet.',
    speechBn: 'প্রযুক্তি এবং একাগ্রতা মিলিত হলে অসাধারণ কিছু তৈরি হয়।',
    category: 'executive',
    shirtColor: 0x0f172a, // Executive black coat
    pantsColor: 0x334155,
    skinColor: 0xfcd34d,
    hairColor: 0x52525b,
    position: [-4.0, 6.3, -3.2],
    rotationY: 0.5,
  },
];
