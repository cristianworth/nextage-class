import type { Page } from '../../app/Shell'
import './public-demo.css'

export function PublicDemoGuide({
  createdAt,
  onNavigate,
  onStudentPreview,
}: {
  createdAt: string
  onNavigate: (page: Page) => void
  onStudentPreview: () => void
}) {
  const date = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
  }).format(new Date(createdAt))
  return (
    <section className="public-demo-guide" aria-label="Roteiro da demonstração">
      <details>
        <summary>Experimente em três passos</summary>
        <ol>
          <li>
            <button className="text-button" onClick={() => onNavigate('students')}>
              Acompanhe um aluno
            </button>
            <p>
              Consulte a sequência de Lara. Na agenda, abra uma aula para preparar ou registrar.
            </p>
          </li>
          <li>
            <button className="text-button" onClick={onStudentPreview}>
              Faça um pedido como aluno
            </button>
            <p>Explore aulas, homework e acervo. Em Solicitações, escolha um horário disponível.</p>
          </li>
          <li>
            <button className="text-button" onClick={() => onNavigate('requests')}>
              Decida pela professora
            </button>
            <p>Aprove ou recuse o pedido e confira o resultado nos dois lados.</p>
          </li>
        </ol>
      </details>
      <p>
        Dados fictícios, salvos neste navegador. Exemplos de {date}. Para atualizar as datas, use
        Reiniciar demo.
      </p>
    </section>
  )
}
