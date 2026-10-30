import { Box } from '@mui/material'
import { authorColors } from '../theme.js'
import { formatDate, formatDateTime, percent, sourceLabel } from '../report/format.js'

const css = `
.print-report { display: none; }
@media print {
  @page { size: A4; margin: 16mm 14mm; }
  html, body, #root { height: auto !important; }
  .print-report { display: block; font-family: "Segoe UI", system-ui, sans-serif; color: #141b2d; font-size: 10.5pt; line-height: 1.55; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .print-report h1 { font-size: 15pt; margin: 0; }
  .print-report h2 { font-size: 9pt; letter-spacing: .08em; text-transform: uppercase; color: #5b6478; margin: 14pt 0 4pt; }
  .print-report table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  .print-report td, .print-report th { border: 1px solid #e2e6ee; padding: 3pt 5pt; text-align: left; vertical-align: top; }
  .print-report th { background: #f3f5f9; }
  .print-report p { margin: 0 0 5pt; }
  .print-report .ai { color: ${authorColors.ai.main}; background: ${authorColors.ai.tint}; }
  .print-report .reviewer { color: ${authorColors.reviewer.main}; background: ${authorColors.reviewer.tint}; }
  .print-report sup { font-size: 7pt; color: ${authorColors.ai.main}; font-weight: 700; }
  .print-report .badge { display: inline-block; padding: 2pt 7pt; border-radius: 10pt; font-size: 8.5pt; font-weight: 700; }
  .print-report .disclaimer { border: 1px solid #f3d9a4; background: #fff4e0; color: #6b4500; padding: 6pt 8pt; border-radius: 4pt; font-size: 9pt; }
  .print-report .watermark { position: fixed; top: 45%; left: 0; right: 0; text-align: center; font-size: 54pt; font-weight: 800; color: rgba(198,40,40,0.08); transform: rotate(-24deg); }
}
`

function Runs({ runs, refIndex }) {
  return runs.map((run, i) => {
    let content = run.text
    if (run.bold) content = <strong>{content}</strong>
    if (run.italic) content = <em>{content}</em>
    if (run.underline) content = <u>{content}</u>
    return (
      <span key={i}>
        <span className={run.author}>{content}</span>
        {run.author === 'ai' && <sup>[{refIndex[run.suggestionId]}]</sup>}
      </span>
    )
  })
}

function Blocks({ blocks, refIndex }) {
  const out = []
  let list = []
  const flush = () => {
    if (list.length) out.push(<ol key={`ol${out.length}`}>{list}</ol>)
    list = []
  }
  blocks.forEach((block, i) => {
    if (block.kind === 'listItem') {
      list.push(
        <li key={i}>
          <Runs runs={block.runs} refIndex={refIndex} />
        </li>,
      )
      return
    }
    flush()
    if (block.kind === 'image') {
      out.push(<img key={i} src={block.src} alt={block.alt} style={{ width: block.width || 300, maxWidth: '100%', display: 'block', margin: '4pt 0' }} />)
    } else if (block.kind === 'table') {
      out.push(
        <table key={i} style={{ margin: '4pt 0 6pt' }}>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (cell.header ? <th key={c}>{cell.text}</th> : <td key={c}>{cell.text}</td>))}
              </tr>
            ))}
          </tbody>
        </table>,
      )
    } else {
      out.push(
        <p key={i}>
          <Runs runs={block.runs} refIndex={refIndex} />
        </p>,
      )
    }
  })
  flush()
  return out
}

export default function PrintableReport({ report }) {
  if (!report) return <style>{css}</style>
  const refIndex = Object.fromEntries(report.suggestions.map((s, i) => [s.id, i + 1]))
  const final = report.reportType === 'FINAL_REVIEWED_DRAFT'

  return (
    <>
      <style>{css}</style>
      <Box className="print-report">
        {!final && <div className="watermark">DRAFT · NOT REVIEWED</div>}
        <table style={{ border: 0, marginBottom: '8pt' }}>
          <tbody>
            <tr>
              <td style={{ border: 0, padding: 0 }}>
                <h1>{report.study.description}</h1>
                <div style={{ color: '#5b6478', fontSize: '9pt' }}>Radiology report · {report.study.modality}</div>
              </td>
              <td style={{ border: 0, padding: 0, textAlign: 'right' }}>
                <span
                  className="badge"
                  style={final ? { background: '#e6f4ec', color: '#1f8a4c' } : { background: '#fff4e0', color: '#b26a00' }}
                >
                  {report.label}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="disclaimer">{report.disclaimer}</p>

        <table>
          <tbody>
            <tr>
              <th>Patient</th>
              <td>{report.patient.name}</td>
              <th>Patient ID</th>
              <td>{report.patient.patientId}</td>
              <th>Age / Sex</th>
              <td>
                {report.patient.age} / {report.patient.sex}
              </td>
            </tr>
            <tr>
              <th>Study date</th>
              <td>{formatDate(report.study.studyDate)}</td>
              <th>Accession</th>
              <td>{report.study.accessionNumber}</td>
              <th>Referred by</th>
              <td>{report.study.referringPhysician}</td>
            </tr>
            {report.model && (
            <tr>
              <th>AI model</th>
              <td colSpan={3}>
                {report.model.name} v{report.model.version} · {report.model.zoo} · run {report.model.runId}
              </td>
              <th>Draft generated</th>
              <td>{formatDateTime(report.draft.generatedAt)}</td>
            </tr>
            )}
          </tbody>
        </table>

        <p style={{ marginTop: '6pt', fontSize: '8.5pt', color: '#5b6478' }}>
          Legend: <span className="ai">AI-generated text</span>
          <sup>[n]</sup> links to image reference n · <span className="reviewer">Reviewer-written text</span>
        </p>

        {report.sections.map((section, i) => (
          <div key={`${section.title}-${i}`}>
            {section.title && <h2>{section.title}</h2>}
            <Blocks blocks={section.blocks} refIndex={refIndex} />
          </div>
        ))}

        {report.suggestions.length > 0 && (
        <>
        <h2>Image references &amp; AI suggestion review</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Observation</th>
              <th>Source image</th>
              <th>ROI</th>
              <th>Confidence</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {report.suggestions.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.observation}</td>
                <td>{s.source ? sourceLabel(s.source) : 'Study level'}</td>
                <td>{s.roi ? s.roi.shape : '-'}</td>
                <td>{percent(s.confidence)}</td>
                <td style={{ textTransform: 'capitalize' }}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>AI uncertainty &amp; limitations</h2>
        <ul style={{ margin: 0, paddingLeft: '14pt', fontSize: '9pt' }}>
          {report.limitations.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        </>
        )}

        <h2>Review</h2>
        <p>
          {final
            ? `Reviewed and finalized by ${report.review.reviewer} on ${formatDateTime(report.review.finalizedAt)}.`
            : 'Not yet reviewed. This document must not be used for clinical decisions.'}
        </p>
        <p style={{ fontSize: '8pt', color: '#5b6478' }}>
          Exported {formatDateTime(report.exportedAt)} · Draft {report.draft.id} v{report.draft.version} · Study UID{' '}
          {report.study.studyInstanceUID}
        </p>
      </Box>
    </>
  )
}
