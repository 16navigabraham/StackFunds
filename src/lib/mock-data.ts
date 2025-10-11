import { PlaceHolderImages } from './placeholder-images';

export interface Update {
  date: string;
  text: string;
}

export interface Supporter {
  id: string;
  address: string;
  amount: number;
}

export interface Transaction {
    id: string;
    date: string;
    type: 'Sent' | 'Received';
    amount: number;
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  imageHint: string;
  creatorName: string;
  creatorAddress: string;
  goal: number;
  raised: number;
  daysLeft: number;
  updates: Update[];
  supporters: Supporter[];
  status?: 'Active' | 'Goal Reached' | 'Funds Released' | 'Expired';
}

const getImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    return {
        imageUrl: img?.imageUrl ?? 'https://picsum.photos/seed/default/600/400',
        imageHint: img?.imageHint ?? 'placeholder image'
    }
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Decentralized AI Network',
    shortDescription: 'Building a censorship-resistant AI platform for everyone.',
    longDescription: 'Our project aims to create a fully decentralized network for training and deploying AI models. By leveraging Bitcoin and Stacks, we ensure that control remains in the hands of the users, not corporations. Your funding will help us develop the core protocol and attract initial researchers.',
    ...getImage('project-1'),
    creatorName: 'Satoshi Jr.',
    creatorAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    goal: 10,
    raised: 7.5,
    daysLeft: 15,
    updates: [
        { date: '2024-07-20', text: 'We have successfully launched our testnet! Thanks to all early supporters.' }
    ],
    supporters: [
        { id: '1', address: 'bc1q...', amount: 1 },
        { id: '2', address: 'bc1p...', amount: 0.5 },
    ],
    status: 'Active',
  },
  {
    id: '2',
    title: 'Open Source Gaming Console',
    shortDescription: 'A fully open-source hardware gaming console you can build and mod yourself.',
    longDescription: 'Tired of closed ecosystems? So are we. This project is to fund the first production run of the "StackBox," an open-source gaming console. All schematics and software will be available for free. Contributions will go towards manufacturing the first 1000 units.',
    ...getImage('project-2'),
    creatorName: 'GamerGuild',
    creatorAddress: 'bc1qec6zp35egh5s22wrt3m2srd8vle5pfs0kwh4m4',
    goal: 5,
    raised: 5.2,
    daysLeft: 0,
    updates: [],
    supporters: [],
    status: 'Goal Reached',
  },
  {
    id: '3',
    title: 'Artisan Coffee Roastery on Bitcoin',
    shortDescription: 'Bringing fair-trade coffee to the world, one block at a time.',
    longDescription: 'We are a collective of coffee farmers who want to use Bitcoin to create a transparent and fair supply chain. Funding will be used to purchase a new roasting machine and set up a direct-to-consumer platform on Stacks, ensuring farmers get a fair price for their beans.',
    ...getImage('project-3'),
    creatorName: 'CafeSats',
    creatorAddress: 'bc1q6jg90px0g4s4n56fgns8wp2p9hspq0t3j4h4jc',
    goal: 3,
    raised: 1.2,
    daysLeft: 42,
    updates: [],
    supporters: [],
    status: 'Active',
  },
   {
    id: '4',
    title: 'Bio-Luminescent Plants',
    shortDescription: 'Create genetically engineered plants that glow in the dark for natural lighting.',
    longDescription: 'Imagine a world where your houseplants light up your room. Our team of bio-engineers is working to make this a reality. Funding will cover lab equipment and research costs to develop a stable, glowing plant variety.',
    ...getImage('project-4'),
    creatorName: 'GlowingGardens',
    creatorAddress: 'bc1qylp8a2w8u4m9wzfr8qj9p3tqj9n2h8g9g9h9g9',
    goal: 8,
    raised: 8.1,
    daysLeft: -5, // Expired but goal reached
    updates: [],
    supporters: [],
    status: 'Funds Released',
  },
  {
    id: '5',
    title: '3D Printed Prosthetics Initiative',
    shortDescription: 'Provide low-cost, custom 3D printed prosthetics to those in need.',
    longDescription: 'This project will fund the setup of a mobile 3D printing lab that can travel to remote areas to provide custom-fit prosthetics. All designs are open-source, and contributions will help purchase printers and materials.',
    ...getImage('project-5'),
    creatorName: 'HelpingHand',
    creatorAddress: 'bc1q9z5j6s7d8f9g0h1j2k3l4m5n6p7q8r9s0t1u2v',
    goal: 4,
    raised: 2.5,
    daysLeft: 22,
    updates: [],
    supporters: [],
    status: 'Active',
  },
  {
    id: '6',
    title: 'Community Music DAO',
    shortDescription: 'A decentralized autonomous organization to fund and promote independent musicians.',
    longDescription: 'The music industry is broken. We\'re building a DAO on Stacks that allows fans to directly invest in artists they believe in. Funding will be used to develop the smart contracts and the governance platform.',
    ...getImage('project-6'),
    creatorName: 'SoundStack',
    creatorAddress: 'bc1q2y3x4w5v6b7n8m9z0a1s2d3f4g5h6j7k8l9p0q',
    goal: 6,
    raised: 1.1,
    daysLeft: 50,
    updates: [],
    supporters: [],
    status: 'Active',
  },
];

export const user = {
    name: 'Alex',
    address: 'bc1qylp8a2w8u4m9wzfr8qj9p3tqj9n2h8g9g9h9g9',
    balance: 0.1337,
};

export const transactions: Transaction[] = [
    { id: '1', date: '2024-07-22', type: 'Sent', amount: 0.01, status: 'Completed' },
    { id: '2', date: '2024-07-21', type: 'Received', amount: 0.05, status: 'Completed' },
    { id: '3', date: '2024-07-20', type: 'Sent', amount: 0.005, status: 'Completed' },
];

export const myCampaigns = projects.filter(p => p.creatorAddress === user.address);
