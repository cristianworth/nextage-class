import { useEffect, useState } from 'react'
import { Shell } from './Shell'
import type { Page } from './Shell'
import { useWorkspace } from '../data/useWorkspace'
import { createDemo } from '../domain/demo'
import { errorMessage } from '../domain/models'
import { FormError, Modal } from '../shared/Modal'
import { saveStudent } from '../domain/students'
import type { Lesson, Material, ScheduleBlock, Student } from '../domain/models'
import { saveMaterial } from '../domain/materials'
import { saveLessonPlan } from '../domain/preparation'
import { setHomeworkCorrected } from '../domain/homework'
import { MaterialsPage } from '../features/materials/MaterialsPage'
import { MaterialForm } from '../features/materials/MaterialForm'
import { MaterialDetails } from '../features/materials/MaterialDetails'
import { PlanForm } from '../features/agenda/PlanForm'
import {
  addBlock,
  removeBlock,
  rescheduleLesson,
  scheduleWeekly,
} from '../domain/weekly-scheduling'
import { StudentForm } from '../features/students/StudentForm'
import { StudentsPage } from '../features/students/StudentsPage'
import { scheduleLesson } from '../domain/lessons'
import { saveLessonRecord } from '../domain/records'
import { Icon } from '../shared/Icon'
import { AgendaPage } from '../features/agenda/AgendaPage'
import { LessonForm } from '../features/agenda/LessonForm'
import type { LessonPrefill } from '../features/agenda/LessonForm'
import { LessonDetails } from '../features/agenda/LessonDetails'
import { BlockForm } from '../features/agenda/BlockForm'
import { BlockDetails } from '../features/agenda/BlockDetails'
import { RescheduleForm } from '../features/agenda/RescheduleForm'
import { RecordForm } from '../features/history/RecordForm'
import { HistoryPage } from '../features/history/HistoryPage'

export function App() {
  const [page, setPage] = useState<Page>('agenda')
  const { state, error, commit } = useWorkspace()
  const [resetOpen, setResetOpen] = useState(false)
  const [resetError, setResetError] = useState('')
  const [studentEditor, setStudentEditor] = useState<Student | null | undefined>(undefined)
  const [lessonPrefill, setLessonPrefill] = useState<LessonPrefill | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [recordLesson, setRecordLesson] = useState<Lesson | null>(null)
  const [blockPrefill, setBlockPrefill] = useState<LessonPrefill | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<Lesson | null>(null)
  const [materialEditor, setMaterialEditor] = useState<Material | null | undefined>(undefined)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [planLesson, setPlanLesson] = useState<Lesson | null>(null)
  const [historyStudent, setHistoryStudent] = useState('')
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 4500)
    return () => window.clearTimeout(timer)
  }, [notice])

  function navigate(next: Page) {
    setPage(next)
    setHistoryStudent('')
  }
  function openRecord(lesson: Lesson) {
    setSelectedLesson(null)
    setRecordLesson(lesson)
  }
  function toggleHomework(recordId: string, corrected: boolean) {
    if (!state) return
    commit(setHomeworkCorrected(state, recordId, corrected))
    setNotice(
      corrected ? 'Homework marcado como corrigido.' : 'Homework voltou para as pendências.',
    )
  }
  function reset() {
    try {
      commit(createDemo())
      setResetOpen(false)
      setPage('agenda')
      setHistoryStudent('')
      setStudentEditor(undefined)
      setLessonPrefill(null)
      setRecordLesson(null)
      setSelectedLesson(null)
      setBlockPrefill(null)
      setSelectedBlock(null)
      setRescheduleTarget(null)
      setMaterialEditor(undefined)
      setSelectedMaterial(null)
      setPlanLesson(null)
      setNotice('Demo reiniciada com os exemplos fictícios.')
    } catch (cause) {
      setResetError(errorMessage(cause))
    }
  }

  return (
    <Shell
      page={page}
      onNavigate={navigate}
      onReset={() => {
        setResetError('')
        setResetOpen(true)
      }}
    >
      {error ? (
        <section className="panel recovery-panel">
          <span className="empty-icon">
            <Icon name="info" size={28} />
          </span>
          <h1>Vamos cuidar dos seus dados</h1>
          <p className="error-banner" role="alert">
            {error}
          </p>
          <p className="muted">
            Reiniciar substitui os dados locais por exemplos fictícios. Faça isso apenas se quiser
            descartar o conteúdo atual.
          </p>
          <button className="button" onClick={() => window.location.reload()}>
            Tentar ler novamente
          </button>
        </section>
      ) : (
        state && (
          <>
            {page === 'agenda' && (
              <AgendaPage
                state={state}
                now={now}
                onNew={setLessonPrefill}
                onOpen={setSelectedLesson}
                onBlock={setBlockPrefill}
                onOpenBlock={setSelectedBlock}
              />
            )}
            {page === 'students' && (
              <StudentsPage
                state={state}
                onNew={() => setStudentEditor(null)}
                onEdit={setStudentEditor}
                onHistory={(id) => {
                  setHistoryStudent(id)
                  setPage('history')
                }}
              />
            )}
            {page === 'history' && (
              <HistoryPage
                state={state}
                studentFilter={historyStudent}
                onFilter={setHistoryStudent}
                onEdit={openRecord}
                onHomework={toggleHomework}
              />
            )}
            {page === 'materials' && (
              <MaterialsPage
                materials={state.materials}
                onNew={() => setMaterialEditor(null)}
                onOpen={setSelectedMaterial}
              />
            )}
            {materialEditor !== undefined && (
              <MaterialForm
                material={materialEditor ?? undefined}
                onClose={() => setMaterialEditor(undefined)}
                onSave={(input) => {
                  commit(saveMaterial(state, input, materialEditor?.id))
                  setMaterialEditor(undefined)
                  setNotice('Material salvo no acervo.')
                }}
              />
            )}
            {selectedMaterial && (
              <MaterialDetails
                material={selectedMaterial}
                onClose={() => setSelectedMaterial(null)}
                onEdit={() => {
                  setMaterialEditor(selectedMaterial)
                  setSelectedMaterial(null)
                }}
              />
            )}
            {studentEditor !== undefined && (
              <StudentForm
                student={studentEditor ?? undefined}
                onClose={() => setStudentEditor(undefined)}
                onSave={(input) => {
                  commit(saveStudent(state, input, studentEditor?.id))
                  setStudentEditor(undefined)
                  setNotice(
                    studentEditor
                      ? 'Cadastro atualizado. O histórico foi preservado.'
                      : 'Aluno cadastrado. Vamos planejar a próxima aula?',
                  )
                }}
              />
            )}
            {lessonPrefill && (
              <LessonForm
                students={state.students}
                prefill={lessonPrefill}
                onClose={() => setLessonPrefill(null)}
                onSave={(input) => {
                  commit(input.weekly ? scheduleWeekly(state, input) : scheduleLesson(state, input))
                  setLessonPrefill(null)
                  setNotice('Aula agendada. Seu próximo encontro já tem lugar.')
                }}
              />
            )}
            {selectedLesson && (
              <LessonDetails
                lesson={selectedLesson}
                state={state}
                now={now}
                onClose={() => setSelectedLesson(null)}
                onRecord={() => openRecord(selectedLesson)}
                onReschedule={() => {
                  setRescheduleTarget(selectedLesson)
                  setSelectedLesson(null)
                }}
                onPlan={() => {
                  setPlanLesson(selectedLesson)
                  setSelectedLesson(null)
                }}
                onHomework={toggleHomework}
              />
            )}
            {planLesson && (
              <PlanForm
                lesson={planLesson}
                state={state}
                onClose={() => setPlanLesson(null)}
                onSave={(input) => {
                  commit(saveLessonPlan(state, planLesson.id, input))
                  setPlanLesson(null)
                  setSelectedLesson(planLesson)
                  setNotice('Preparação salva para esta aula.')
                }}
              />
            )}
            {blockPrefill && (
              <BlockForm
                prefill={blockPrefill}
                onClose={() => setBlockPrefill(null)}
                onSave={(input) => {
                  commit(addBlock(state, input))
                  setBlockPrefill(null)
                  setNotice('Bloqueio salvo na agenda.')
                }}
              />
            )}
            {selectedBlock && (
              <BlockDetails
                block={selectedBlock}
                onClose={() => setSelectedBlock(null)}
                onRemove={() => {
                  commit(removeBlock(state, selectedBlock.id))
                  setSelectedBlock(null)
                  setNotice('Bloqueio removido. O período ficou disponível.')
                }}
              />
            )}
            {rescheduleTarget && (
              <RescheduleForm
                lesson={rescheduleTarget}
                onClose={() => setRescheduleTarget(null)}
                onSave={(target, scope) => {
                  commit(rescheduleLesson(state, rescheduleTarget.id, target, scope))
                  setRescheduleTarget(null)
                  setNotice(
                    scope === 'single'
                      ? 'Aula remarcada.'
                      : 'Horário atualizado para esta aula e as próximas.',
                  )
                }}
              />
            )}
            {recordLesson && (
              <RecordForm
                lesson={recordLesson}
                state={state}
                onClose={() => setRecordLesson(null)}
                onSave={(input) => {
                  commit(saveLessonRecord(state, recordLesson.id, input))
                  setRecordLesson(null)
                  setNotice('Registro salvo no histórico do aluno.')
                }}
              />
            )}
          </>
        )
      )}
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {notice}
          <button aria-label="Dispensar aviso" onClick={() => setNotice('')}>
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {resetOpen && (
        <Modal
          title="Reiniciar a demo?"
          subtitle="Os dados deste navegador serão substituídos pelos exemplos fictícios."
          onClose={() => setResetOpen(false)}
        >
          <FormError message={resetError} />
          <div className="form-actions">
            <button className="button" onClick={() => setResetOpen(false)}>
              Manter meus dados
            </button>
            <button className="button danger" onClick={reset}>
              Sim, reiniciar demo
            </button>
          </div>
        </Modal>
      )}
      <footer className="app-footer">
        <span>Nextage Class</span>
        <span>Feito para dar espaço ao aprendizado.</span>
      </footer>
    </Shell>
  )
}
