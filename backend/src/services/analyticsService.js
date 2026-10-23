import * as taskRepo from '../repositories/taskRepository.js';
import * as sessionRepo from '../repositories/sessionRepository.js';
import * as subjectRepo from '../repositories/subjectRepository.js';
import * as revisionRepo from '../repositories/revisionRepository.js';
import * as profileRepo from '../repositories/profileRepository.js';

export async function getDashboard(userId) {
  const profile = await profileRepo.getProfile(userId);
  const [tasksDueToday, upcomingTasks, recentSessions, subjects, dueRevisions] = await Promise.all([
    taskRepo.getTasksDueToday(userId, profile?.timezone ?? 'UTC'),
    taskRepo.getUpcomingTasks(userId, 7),
    sessionRepo.getRecentSessions(userId, 5),
    subjectRepo.getSubjects(userId),
    revisionRepo.getDueRevisions(userId, 5),
  ]);

  const [allTasks, completedTasks] = await Promise.all([
    taskRepo.getTasks(userId, {}, { offset: 0, limit: 1 }),
    taskRepo.getTasks(userId, { status: 'completed' }, { offset: 0, limit: 1 }),
  ]);
  const total = allTasks.total;
  const completed = completedTasks.total;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    tasks_due_today: tasksDueToday,
    upcoming_tasks: upcomingTasks,
    recent_sessions: recentSessions,
    subjects,
    revisions_due: dueRevisions,
    summary: {
      total_tasks: total,
      completed_tasks: completed,
      completion_rate_percent: completionRate,
      total_subjects: subjects.length,
    },
  };
}

export async function getAnalytics(userId, query) {
  const { from, to } = query;

  const sessions = await sessionRepo.getSessionStats(userId, from, to);

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const bySubject = {};
  for (const s of sessions) {
    const key = s.subject_id ?? 'unspecified';
    bySubject[key] = (bySubject[key] ?? 0) + (s.duration_minutes ?? 0);
  }

  const bySubjectArray = Object.entries(bySubject).map(([subject_id, minutes]) => ({
    subject_id: subject_id === 'unspecified' ? null : subject_id,
    minutes,
    hours: Math.round((minutes / 60) * 10) / 10,
  }));
  const subjects = await subjectRepo.getSubjects(userId);
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]));
  for (const entry of bySubjectArray) {
    entry.subject = entry.subject_id ? subjectNames.get(entry.subject_id) ?? 'Subject' : 'Unassigned';
  }

  const firstTasks = await taskRepo.getTasks(userId, {}, { offset: 0, limit: 50 });
  const totalTasks = firstTasks.total;
  const totalPages = Math.ceil(totalTasks / 50);
  const extraPages = await Promise.all(Array.from({ length: totalPages - 1 }, (_, index) =>
    taskRepo.getTasks(userId, {}, { offset: (index + 1) * 50, limit: 50 })
  ));
  const allTasks = [...firstTasks.items, ...extraPages.flatMap((page) => page.items)];
  const completedTasks = allTasks.filter((task) => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = Math.max(0, totalTasks - completedTasks);
  const tasksBySubject = new Map();
  for (const task of allTasks) {
    const subject = task.subject?.name ?? 'Unassigned';
    const totals = tasksBySubject.get(subject) ?? { subject, completed: 0, pending: 0 };
    totals[task.status === 'completed' ? 'completed' : 'pending']++;
    tasksBySubject.set(subject, totals);
  }

  return {
    period: { from: from ?? null, to: to ?? null },
    study_time: {
      total_minutes: totalMinutes,
      total_hours: totalHours,
      session_count: sessions.length,
    },
    study_time_by_subject: bySubjectArray,
    tasks_by_subject: [...tasksBySubject.values()],
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      completion_rate_percent: completionRate,
    },
  };
}
