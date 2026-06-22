export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'Foundation' | 'Advanced' | 'Expert';
  featured: boolean;
  yearsOfExperience: number;
}
