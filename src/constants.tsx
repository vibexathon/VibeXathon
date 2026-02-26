
import React from 'react';
import { 
  Cpu, 
  Building2, 
  Lightbulb, 
  BookOpen, 
  FileText, 
  UserPlus 
} from 'lucide-react';
import { Theme, JudgingItem, Coordinator } from './types';

export const THEMES: Theme[] = [
  {
    title: 'AI / ML',
    description: 'Leveraging intelligent algorithms to solve complex automation and predictive challenges.',
    icon: <Cpu className="w-8 h-8 text-indigo-400" />,
  },
  {
    title: 'Smart City and Sustainability',
    description: 'Building urban infrastructure solutions focused on environmental sustainability and safety.',
    icon: <Building2 className="w-8 h-8 text-cyan-400" />,
  },
  {
    title: 'Open Innovation',
    description: 'Any creative solution that disrupts the status quo across diverse industries.',
    icon: <Lightbulb className="w-8 h-8 text-rose-400" />,
  },
];

export const JUDGING_CRITERIA: JudgingItem[] = [
  { criteria: 'Problem Understanding', score: 15 },
  { criteria: 'Technical Implementation', score: 25 },
  { criteria: 'Innovation', score: 15 },
  { criteria: 'Data Science Rigor', score: 15 },
  { criteria: 'Feasibility', score: 10 },
  { criteria: 'Presentation', score: 10 },
  { criteria: 'Demo', score: 10 },
  { criteria: 'Bonus', score: 5 },
];

export const CONVENERS = [
   { name: 'Saneed M Nayak', role: 'Technical CONVENER', sub: 'Student', phone: '78924 08670', color: 'indigo' },
  { name: 'Rakesh M', role: 'Technical CONVENER', sub: 'Student', phone: '97407 89361',color: 'indigo' },
  { name: 'Harshith Raj R', role: 'STUDENT CONVENER', sub: 'Student', phone: '90190 35913', color: 'indigo' },
  { name: 'Muralimithun CS', role: 'STUDENT CONVENER', sub: 'Student', phone: '97414 88780', color: 'indigo' }
];

export const FACULTY_COORDINATORS_LIST = [
  { name: 'Prof. Subhakar M', dept: 'CSE-DS' },
  { name: 'Prof. Manoj Kumar A', dept: 'CSE-DS' },
  { name: 'Prof. Lolakshi P K', dept: 'CSE-DS' },
];

export const STUDENT_COORDINATORS_BY_DEPT = [
  { 
    dept: 'Social Media Team', 
    names: ['T G Pranita Yadav & Team '] 
  },
  { 
    dept: 'Designing Team', 
    names: ['Charan H S & Team'] 
  },
];


// Brochure download link - update this with your brochure URL
export const BROCHURE_URL = '/assets/VIBEXATHON.pdf';

export const QUICK_ACTIONS = [
  { label: 'Register Your Team', icon: <UserPlus className="w-5 h-5" />, color: 'indigo' },
  { label: 'View Poster', icon: <BookOpen className="w-5 h-5" />, color: 'cyan' },
  { label: 'Download Brochure', icon: <FileText className="w-5 h-5" />, color: 'rose' },
];

export const RULES = [
  "A team must consist of 2 to 4 members.",
  "Projects must be built from scratch during the 24-hour hackathon period.",
  "The use of open-source libraries is permitted, provided they are cited.",
  "Inter-college teams are welcome to participate.",
  "Participants must bring their own laptops and equipment.",
  "Decision of the judges will be final and binding."
];
