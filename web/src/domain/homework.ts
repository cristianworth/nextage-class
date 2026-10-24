import type { Workspace } from './models'

export function setHomeworkCorrected(
  state: Workspace,
  recordId: string,
  corrected: boolean,
  now = new Date(),
): Workspace {
  const record = state.records.find((item) => item.id === recordId)
  if (!record?.homework) throw new Error('Este homework não foi encontrado.')
  return {
    ...state,
    records: state.records.map((item) =>
      item.id !== recordId
        ? item
        : {
            ...item,
            updatedAt: now.toISOString(),
            homework: { ...record.homework!, correctedAt: corrected ? now.toISOString() : null },
          },
    ),
  }
}
