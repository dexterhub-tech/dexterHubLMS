const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: 'learner' | 'instructor' | 'admin' | 'super-admin';
    firstName?: string;
    lastName?: string;
    activeCohortId?: string;
  };
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  role?: 'learner' | 'instructor' | 'admin' | 'super-admin';
}

export interface Cohort {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  instructorIds: string[];
  learnerIds: string[];
  courseIds: string[];
  performanceThreshold: number;
  weeklyTarget: number;
  gracePeriodDays: number;
  reviewCycleFrequency: 'weekly' | 'bi-weekly' | 'monthly';
}

export interface LearnerProgress {
  _id: string;
  learnerId: string;
  cohortId: string;
  courseId: string;
  completedLessons: string[];
  currentScore: number;
  learningHoursThisWeek: number;
  status: 'on-track' | 'at-risk' | 'under-review' | 'dropped';
  lastActivityDate: string;
  inactivityDays: number;
  lastAssessmentScore: number;
}

export interface DropRecommendation {
  _id: string;
  learnerId: string;
  cohortId: string;
  instructorId: string;
  reason: string;
  evidence: string;
  status: 'pending' | 'approved' | 'rejected' | 'appealed';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Appeal {
  _id: string;
  learnerId: string;
  cohortId: string;
  dropRecommendationId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  type: 'exam' | 'assignment' | 'test' | 'lecture';
  cohortId: string;
  icon: string;
}

class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return this.token || localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${API_URL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async getMe(): Promise<AuthResponse> {
    return this.request('/api/auth/me');
  }

  logout() {
    this.clearToken();
  }

  // Cohort endpoints
  async getCohorts(): Promise<Cohort[]> {
    return this.request('/api/cohorts');
  }

  async getCohort(id: string): Promise<Cohort> {
    return this.request(`/api/cohorts/${id}`);
  }

  async createCohort(cohort: Partial<Cohort>): Promise<Cohort> {
    return this.request('/api/cohorts', {
      method: 'POST',
      body: JSON.stringify(cohort),
    });
  }

  // Learner Progress endpoints
  async getLearnerProgress(learnerId: string): Promise<LearnerProgress[]> {
    return this.request(`/api/learner-progress/${learnerId}`);
  }

  async getLearnerTasks(learnerId: string): Promise<any[]> {
    return this.request(`/api/learner-progress/${learnerId}/tasks`);
  }

  async getLearnerProgressDashboard(learnerId: string): Promise<any> {
    return this.request(`/api/learner-progress/${learnerId}/dashboard`);
  }

  async getEvents(): Promise<Event[]> {
    return this.request('/api/events');
  }

  async getCohortEvents(cohortId: string): Promise<Event[]> {
    return this.request(`/api/events/cohort/${cohortId}`);
  }

  async getCohortLearners(cohortId: string): Promise<any[]> {
    return this.request(`/api/cohorts/${cohortId}/learners`);
  }

  // Instructor endpoints
  async submitInstructorNote(note: any): Promise<any> {
    return this.request('/api/instructor-notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async submitDropRecommendation(
    recommendation: Partial<DropRecommendation>
  ): Promise<DropRecommendation> {
    return this.request('/api/drop-recommendations', {
      method: 'POST',
      body: JSON.stringify(recommendation),
    });
  }

  async getCourses(): Promise<any[]> {
    return this.request('/api/courses');
  }

  async getCourseDetails(id: string): Promise<any> {
    return this.request(`/api/courses/${id}`);
  }

  // Admin endpoints
  async getDropRecommendations(): Promise<DropRecommendation[]> {
    return this.request('/api/drop-recommendations');
  }

  async updateDropRecommendation(
    id: string,
    update: { status: string; reviewNotes: string }
  ): Promise<DropRecommendation> {
    return this.request(`/api/drop-recommendations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async grantGracePeriod(gracePeriod: any): Promise<any> {
    return this.request('/api/grace-periods', {
      method: 'POST',
      body: JSON.stringify(gracePeriod),
    });
  }

  // Appeal endpoints
  async submitAppeal(appeal: Partial<Appeal>): Promise<Appeal> {
    return this.request('/api/appeals', {
      method: 'POST',
      body: JSON.stringify(appeal),
    });
  }

  async getAppeals(): Promise<Appeal[]> {
    return this.request('/api/appeals');
  }

  async updateAppeal(
    id: string,
    update: { status: string; reviewNotes: string }
  ): Promise<Appeal> {
    return this.request(`/api/appeals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  // Audit logs
  async getAuditLogs(): Promise<any[]> {
    return this.request('/api/audit-logs');
  }

  // New Cohort & Submission Methods
  async joinCohort(cohortId: string): Promise<any> {
    return this.request('/api/cohorts/join', {
      method: 'POST',
      body: JSON.stringify({ cohortId })
    });
  }

  async submitAssignment(data: { lessonId: string, cohortId: string, content: string }): Promise<any> {
    return this.request('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMySubmission(lessonId: string, cohortId: string): Promise<any> {
    return this.request(`/api/submissions/my?lessonId=${lessonId}&cohortId=${cohortId}`);
  }

  // Instructor Course Helper Methods
  async createCourse(data: any): Promise<any> {
    return this.request('/api/courses', { method: 'POST', body: JSON.stringify(data) });
  }

  async createModule(data: any): Promise<any> {
    return this.request('/api/courses/modules', { method: 'POST', body: JSON.stringify(data) });
  }

  async createLesson(data: any): Promise<any> {
    return this.request('/api/courses/lessons', { method: 'POST', body: JSON.stringify(data) });
  }

  // Course Application Methods
  async applyToCourse(data: { cohortId: string, courseId: string, reason?: string }): Promise<any> {
    return this.request('/api/cohorts/apply', { method: 'POST', body: JSON.stringify(data) });
  }

  async getPendingApplications(): Promise<any[]> {
    return this.request('/api/cohorts/applications/pending');
  }

  async getMyApplications(): Promise<any[]> {
    return this.request('/api/cohorts/applications/my');
  }

  async handleApplication(id: string, action: 'approve' | 'reject', reason?: string): Promise<any> {
    return this.request(`/api/cohorts/applications/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
  }

  // Cohort Course Management
  async addCourseToCohort(cohortId: string, courseId: string): Promise<any> {
    return this.request(`/api/cohorts/${cohortId}/courses/${courseId}`, {
      method: 'POST'
    });
  }

  async removeCourseFromCohort(cohortId: string, courseId: string): Promise<any> {
    return this.request(`/api/cohorts/${cohortId}/courses/${courseId}`, {
      method: 'DELETE'
    });
  }
}

export const api = new APIClient();
