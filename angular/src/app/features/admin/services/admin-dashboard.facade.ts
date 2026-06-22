import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { PortfolioProjectsService } from '@features/portfolio/services/portfolio-projects.service';
import { PortfolioSkillsService } from '@features/portfolio/services/portfolio-skills.service';
import { PortfolioExperienceService } from '@features/portfolio/services/portfolio-experience.service';
import { ContactMessagesService } from '@features/portfolio/services/contact-messages.service';
import { AdminDashboardMetric } from '@features/admin/models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardFacade {
  constructor(
    private readonly projectsService: PortfolioProjectsService,
    private readonly skillsService: PortfolioSkillsService,
    private readonly experienceService: PortfolioExperienceService,
    private readonly messagesService: ContactMessagesService,
  ) {}

  getOverviewMetrics(): Observable<AdminDashboardMetric[]> {
    return forkJoin({
      projects: this.projectsService.getProjects(),
      skills: this.skillsService.getSkills(),
      experience: this.experienceService.getExperience(),
      messages: this.messagesService.getMessages(),
    }).pipe(
      map(({ projects, skills, experience, messages }) => [
        { label: 'Projects', value: String(projects.length), context: 'Published and in-flight portfolio entries' },
        { label: 'Skills', value: String(skills.length), context: 'Structured capabilities ready for presentation' },
        { label: 'Experience', value: String(experience.length), context: 'Timeline items visible to recruiters and clients' },
        { label: 'Inbox', value: String(messages.length), context: 'Messages available for triage and response' },
      ]),
    );
  }
}
