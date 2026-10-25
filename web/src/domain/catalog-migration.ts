import type { z } from 'zod'
import type { workspaceV5Schema, workspaceV4Schema } from './models'

export function migrateCatalog(
  previous: z.infer<typeof workspaceV4Schema>,
): z.infer<typeof workspaceV5Schema> {
  const levels = [
    ...new Set(
      [
        ...previous.materials,
        ...previous.records.flatMap((record) =>
          record.materialSnapshot ? [record.materialSnapshot] : [],
        ),
      ]
        .filter((item) => item.lessonNumber !== undefined)
        .map((item) => item.level),
    ),
  ]
  const bookId = (level: string) => `legacy-book/${level}`
  const bookTitle = (level: string) => `Sequência ${level} (acervo anterior)`
  const snapshot = <T extends { level: string; lessonNumber?: number }>(item: T) =>
    item.lessonNumber !== undefined
      ? { ...item, bookId: bookId(item.level), bookTitle: bookTitle(item.level) }
      : item
  const timestamps = previous.materials.map((item) => item.createdAt).sort()
  const timestamp = timestamps[0] ?? previous.students[0]?.createdAt ?? '2026-01-01T00:00:00.000Z'
  return {
    ...previous,
    version: 5,
    books: levels.map((level) => ({
      id: bookId(level),
      title: bookTitle(level),
      levels: [level],
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
    students: previous.students.map((student) => ({
      ...student,
      primaryBookId: levels.includes(student.level) ? bookId(student.level) : null,
    })),
    materials: previous.materials.map((item) => ({
      ...item,
      levels: [item.level],
      ...(item.lessonNumber !== undefined ? { bookId: bookId(item.level) } : {}),
    })),
    records: previous.records.map((record) => ({
      ...record,
      materialSnapshot: record.materialSnapshot ? snapshot(record.materialSnapshot) : undefined,
      courseProgress: record.courseProgress
        ? {
            ...record.courseProgress,
            next: record.courseProgress.next ? snapshot(record.courseProgress.next) : null,
          }
        : undefined,
    })),
  }
}
