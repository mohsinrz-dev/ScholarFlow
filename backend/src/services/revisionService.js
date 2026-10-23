import * as revisionRepo from '../repositories/revisionRepository.js';
import * as subjectRepo from '../repositories/subjectRepository.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { Errors } from '../utils/errors.js';

function computeNextReviewDate(reviewCount) {
  const intervals = [1, 3, 7, 14, 30, 60];
  const days = intervals[Math.min(reviewCount, intervals.length - 1)];
  const next = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return next.toISOString();
}

export async function listRevisions(userId, query) {
  const { page, limit, offset } = parsePagination(query);
  const filters = { status: query.status, due_before: query.due_before };
  const { items, total } = await revisionRepo.getRevisions(userId, filters, { offset, limit });
  return { items, pagination: buildPaginationMeta(page, limit, total) };
}

export async function createRevision(userId, payload) {
  if (payload.subject_id) {
    const subject = await subjectRepo.getSubjectById(userId, payload.subject_id);
    if (!subject) throw Errors.notFound('Subject');
  }

  const itemPayload = {
    ...payload,
    due_date: payload.due_date ?? new Date().toISOString(),
  };

  return revisionRepo.createRevision(userId, itemPayload);
}

export async function updateRevision(userId, revisionId, payload) {
  const existing = await revisionRepo.getRevisionById(userId, revisionId);
  if (!existing) throw Errors.notFound('Revision item');

  const updates = { ...payload };

  if (payload.status === 'reviewed') {
    const newCount = (existing.review_count ?? 0) + 1;
    updates.review_count = newCount;
    updates.last_reviewed_at = new Date().toISOString();
    updates.due_date = computeNextReviewDate(newCount);
    updates.status = 'pending';
  }

  const updated = await revisionRepo.updateRevision(userId, revisionId, updates);
  if (!updated) throw Errors.notFound('Revision item');
  return updated;
}
