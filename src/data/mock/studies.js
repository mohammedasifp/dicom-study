import { AI_FAILURE_REASON as F, AI_REPORT_STATUS as AI, MODALITY as M, PRIORITY as P, REVIEW_STATUS as R } from '../../constants/study.js'

// Mock worklist. Times are offsets from "now" (minutes) so SLA timers stay meaningful during a demo;
// createMockStudies() turns them into the ISO timestamps the real API will return.
//
// ai / review are independent: `ai` is what the AI pipeline reports, `review` is the radiologist's progress.
// A study can only be under review once AI has finished (READY, or FAILED = manual report).
// `next` scripts the pipeline for studies still with the AI service: [minutes from now, status, failure reason].
//
// The BRAINIX study is the only one available on the local Orthanc; every other StudyInstanceUID is a placeholder
// and will not resolve in OHIF. AI report content for READY studies lives in aiReports.js.

const BRAINIX_UID = '2.16.840.1.113669.632.20.1211.10000357775'
const uid = (n) => `1.2.826.0.1.3680043.10.999.${n}`

const SEED = [
  { id: 'st-1001', uid: BRAINIX_UID, acc: 'ACC-218211405', name: 'BRAINIX', uhid: '5Yp0E', age: '57 Y', sex: 'M', cls: 'IP', modality: M.MR, desc: 'MRI Brain with contrast', body: 'Brain', ago: 95, ref: 'Dr. A. Mehta', priority: P.URGENT, to: 'rad-1', ai: AI.READY, review: R.PENDING_REVIEW, series: 5, images: 412, history: 'Progressive headaches over 3 weeks with new-onset right-sided weakness. Evaluate for intracranial lesion.' },
  { id: 'st-1002', acc: 'ACC-218211562', name: 'Ramesh Kumar', uhid: 'NU0012026010441', age: '64 Y', sex: 'M', cls: 'ER', modality: M.CT, desc: 'CT Brain plain', body: 'Brain', ago: 22, ref: 'Emergency Dept.', priority: P.STAT, to: null, ai: AI.PROCESSING, next: [[3, AI.READY]], review: R.PENDING_REVIEW, series: 2, images: 64, history: 'Sudden onset left hemiparesis, onset 2 hours ago. Rule out haemorrhage.' },
  { id: 'st-1003', acc: 'ACC-218211560', name: 'Lakshmi Narayanan', uhid: 'NU0012026010438', age: '71 Y', sex: 'F', cls: 'ER', modality: M.XR, desc: 'X-Ray Chest PA', body: 'Chest', ago: 48, ref: 'Emergency Dept.', priority: P.STAT, to: 'rad-4', ai: AI.READY, review: R.UNDER_REVIEW, series: 1, images: 1, history: 'Acute breathlessness and fever. Query consolidation or effusion.' },
  { id: 'st-1004', acc: 'ACC-218211548', name: 'Mohammed Irfan', uhid: 'NU0012026010436', age: '38 Y', sex: 'M', cls: 'ER', modality: M.CT, desc: 'CT Abdomen and Pelvis with contrast', body: 'Abdomen', ago: 74, ref: 'Dr. R. Sharma', priority: P.STAT, to: 'rad-1', ai: AI.READY, review: R.UNDER_REVIEW, series: 4, images: 520, history: 'Right iliac fossa pain with raised WBC. Query appendicitis.' },
  { id: 'st-1005', acc: 'ACC-218211571', name: 'Priya Venkatesh', uhid: 'NU0012026010444', age: '29 Y', sex: 'F', cls: 'ER', modality: M.US, desc: 'USG Abdomen and Pelvis', body: 'Abdomen', ago: 12, ref: 'Dr. N. Das', priority: P.STAT, to: null, ai: AI.RECEIVED, next: [[0.5, AI.PROCESSING], [2, AI.FAILED, F.OUT_OF_SCOPE]], review: R.PENDING_REVIEW, series: 1, images: 38, history: 'Lower abdominal pain, positive pregnancy test. Rule out ectopic pregnancy.' },
  { id: 'st-1006', acc: 'ACC-218211533', name: 'Suresh Babu', uhid: 'NU0012026010431', age: '52 Y', sex: 'M', cls: 'IP', modality: M.CT, desc: 'CT Chest HRCT', body: 'Chest', ago: 190, ref: 'Dr. P. Iyer', priority: P.URGENT, to: 'rad-1', ai: AI.READY, review: R.PENDING_REVIEW, series: 3, images: 310, history: 'Chronic cough and progressive dyspnoea. Evaluate interstitial lung disease.' },
  { id: 'st-1007', acc: 'ACC-218211529', name: 'Anitha George', uhid: 'NU0012026010429', age: '45 Y', sex: 'F', cls: 'OP', modality: M.MR, desc: 'MRI Lumbar Spine plain', body: 'Spine', ago: 260, ref: 'Dr. S. Kulkarni', priority: P.URGENT, to: null, ai: AI.READY, review: R.PENDING_REVIEW, series: 6, images: 188, history: 'Low back pain radiating to left leg with foot drop.' },
  { id: 'st-1008', acc: 'ACC-218211517', name: 'Govind R', uhid: 'NU0012025010337', age: '25 Y', sex: 'M', cls: 'OP', modality: M.MR, desc: 'MRI Hip Joint (one side)', body: 'Hip', ago: 330, ref: 'Self', priority: P.URGENT, to: 'rad-3', ai: AI.FAILED, reason: F.INCOMPLETE_STUDY, review: R.UNDER_REVIEW, series: 5, images: 160, history: 'Right hip pain after fall. Query occult fracture or avascular necrosis.' },
  { id: 'st-1009', acc: 'ACC-218211502', name: 'Fathima Beevi', uhid: 'NU0012026010419', age: '61 Y', sex: 'F', cls: 'IP', modality: M.XR, desc: 'X-Ray Chest AP (portable)', body: 'Chest', ago: 140, ref: 'Dr. P. Iyer', priority: P.URGENT, to: 'rad-1', ai: AI.READY, review: R.REVIEWED, series: 1, images: 1, history: 'Post central line insertion. Check line position, rule out pneumothorax.' },
  { id: 'st-1010', acc: 'ACC-218211498', name: 'Venkat Raman', uhid: 'NU0012026010417', age: '58 Y', sex: 'M', cls: 'IP', modality: M.US, desc: 'USG Kidney Ureter Bladder', body: 'Abdomen', ago: 205, ref: 'Dr. R. Sharma', priority: P.URGENT, to: 'rad-2', ai: AI.READY, review: R.PENDING_REVIEW, series: 1, images: 24, history: 'Raised creatinine. Evaluate for obstructive uropathy.' },
  { id: 'st-1011', acc: 'ACC-218211490', name: 'Deepa Krishnan', uhid: 'NU0012026010414', age: '34 Y', sex: 'F', cls: 'OP', modality: M.US, desc: 'USG Obstetric (growth scan)', body: 'Pelvis', ago: 380, ref: 'Dr. N. Das', priority: P.ROUTINE, to: null, ai: AI.FAILED, reason: F.NO_MODEL, review: R.PENDING_REVIEW, series: 1, images: 42, history: '32 weeks gestation. Growth and liquor assessment.' },
  { id: 'st-1012', acc: 'ACC-218211486', name: 'Sandya M', uhid: 'NU0012026010427', age: '14 D', sex: 'F', cls: 'IP', modality: M.MR, desc: 'MRI Brain without contrast', body: 'Brain', ago: 410, ref: 'Self', priority: P.URGENT, to: null, ai: AI.FAILED, reason: F.OUT_OF_SCOPE, review: R.PENDING_REVIEW, series: 4, images: 140, history: 'Neonatal seizures. Evaluate for hypoxic ischaemic injury.' },
  { id: 'st-1013', acc: 'ACC-218211471', name: 'Govind Prasad', uhid: 'NU0012026010373', age: '24 Y', sex: 'M', cls: 'OP', modality: M.CT, desc: 'CT Chest plain', body: 'Chest', ago: 600, ref: 'Self', priority: P.ROUTINE, to: 'rad-3', ai: AI.READY, review: R.FINALIZED, series: 2, images: 220, reportedAgo: 420, history: 'Persistent cough for 6 weeks.' },
  { id: 'st-1014', acc: 'ACC-218211470', name: 'Govind Prasad', uhid: 'NU0012026010373', age: '24 Y', sex: 'M', cls: 'OP', modality: M.MR, desc: 'MRI Brain with contrast', body: 'Brain', ago: 602, ref: 'Self', priority: P.ROUTINE, to: 'rad-3', ai: AI.READY, review: R.FINALIZED, series: 6, images: 380, reportedAgo: 400, history: 'Chronic headache. Rule out space-occupying lesion.' },
  { id: 'st-1015', acc: 'ACC-218211455', name: 'Kiran Patil', uhid: 'NU0012026010402', age: '47 Y', sex: 'M', cls: 'OP', modality: M.XR, desc: 'X-Ray Knee AP/Lateral (right)', body: 'Knee', ago: 520, ref: 'Dr. S. Kulkarni', priority: P.ROUTINE, to: 'rad-3', ai: AI.READY, review: R.PENDING_REVIEW, series: 1, images: 2, history: 'Chronic right knee pain. Query osteoarthritis.' },
  { id: 'st-1016', acc: 'ACC-218211449', name: 'Meena Kumari', uhid: 'NU0012026010399', age: '66 Y', sex: 'F', cls: 'OP', modality: M.XR, desc: 'X-Ray Lumbar Spine AP/Lateral', body: 'Spine', ago: 700, ref: 'Dr. S. Kulkarni', priority: P.ROUTINE, to: null, ai: AI.READY, review: R.PENDING_REVIEW, series: 1, images: 2, history: 'Chronic low back pain. Evaluate degenerative change.' },
  { id: 'st-1017', acc: 'ACC-218211441', name: 'Arun Thomas', uhid: 'NU0012026010395', age: '55 Y', sex: 'M', cls: 'OP', modality: M.CT, desc: 'CT KUB plain', body: 'Abdomen', ago: 760, ref: 'Dr. R. Sharma', priority: P.ROUTINE, to: 'rad-1', ai: AI.READY, review: R.PENDING_REVIEW, series: 2, images: 180, history: 'Left flank pain with haematuria. Query urolithiasis.' },
  { id: 'st-1018', acc: 'ACC-218211437', name: 'Shalini Gupta', uhid: 'NU0012026010392', age: '41 Y', sex: 'F', cls: 'OP', modality: M.US, desc: 'USG Thyroid', body: 'Neck', ago: 820, ref: 'Dr. A. Mehta', priority: P.ROUTINE, to: 'rad-2', ai: AI.READY, review: R.REVIEWED, series: 1, images: 18, history: 'Palpable thyroid nodule.' },
  { id: 'st-1019', acc: 'ACC-218211426', name: 'Rahul Verma', uhid: 'NU0012026010388', age: '33 Y', sex: 'M', cls: 'OP', modality: M.MR, desc: 'MRI Knee (left)', body: 'Knee', ago: 900, ref: 'Dr. S. Kulkarni', priority: P.ROUTINE, to: 'rad-1', ai: AI.READY, review: R.PENDING_REVIEW, series: 5, images: 150, history: 'Twisting sports injury. Query ACL or meniscal tear.' },
  { id: 'st-1020', acc: 'ACC-218211414', name: 'Usha Rani', uhid: 'NU0012026010381', age: '59 Y', sex: 'F', cls: 'IP', modality: M.CT, desc: 'CT Pulmonary Angiography', body: 'Chest', ago: 35, ref: 'Dr. P. Iyer', priority: P.STAT, to: 'rad-1', ai: AI.PROCESSING, next: [[4, AI.READY]], review: R.PENDING_REVIEW, series: 3, images: 400, history: 'Post-operative day 3, sudden dyspnoea and tachycardia. Rule out pulmonary embolism.' },
  { id: 'st-1021', acc: 'ACC-218211409', name: 'Abdul Rahman', uhid: 'NU0012026010378', age: '68 Y', sex: 'M', cls: 'IP', modality: M.XR, desc: 'X-Ray Chest PA', body: 'Chest', ago: 980, ref: 'Dr. P. Iyer', priority: P.ROUTINE, to: null, ai: AI.READY, review: R.PENDING_REVIEW, series: 1, images: 1, history: 'Follow-up of right lower lobe pneumonia.' },
  { id: 'st-1022', acc: 'ACC-218211398', name: 'Nandini Shetty', uhid: 'NU0012026010372', age: '27 Y', sex: 'F', cls: 'OP', modality: M.US, desc: 'USG Pelvis (transabdominal)', body: 'Pelvis', ago: 1050, ref: 'Dr. N. Das', priority: P.ROUTINE, to: 'rad-2', ai: AI.FAILED, reason: F.NO_MODEL, review: R.FINALIZED, series: 1, images: 30, reportedAgo: 900, history: 'Irregular menses. Evaluate for polycystic ovaries.' },
  { id: 'st-1023', acc: 'ACC-218211385', name: 'Prakash Joshi', uhid: 'NU0012026010366', age: '73 Y', sex: 'M', cls: 'IP', modality: M.CT, desc: 'CT Brain plain', body: 'Brain', ago: 1500, ref: 'Dr. A. Mehta', priority: P.ROUTINE, to: 'rad-4', ai: AI.READY, review: R.UNDER_REVIEW, series: 2, images: 60, history: 'Fall at home, on anticoagulants. Rule out subdural haematoma.' },
  { id: 'st-1024', acc: 'ACC-218211377', name: 'Divya Nair', uhid: 'NU0012026010361', age: '36 Y', sex: 'F', cls: 'OP', modality: M.MR, desc: 'MRI Cervical Spine plain', body: 'Spine', ago: 1620, ref: 'Dr. S. Kulkarni', priority: P.ROUTINE, to: null, ai: AI.FAILED, reason: F.PROCESSING_ERROR, review: R.PENDING_REVIEW, series: 5, images: 120, history: 'Neck pain with tingling in both hands.' },
  { id: 'st-1025', acc: 'ACC-218211366', name: 'Harish Chandra', uhid: 'NU0012026010355', age: '50 Y', sex: 'M', cls: 'OP', modality: M.XR, desc: 'X-Ray Shoulder (left)', body: 'Shoulder', ago: 1180, ref: 'Self', priority: P.ROUTINE, to: 'rad-1', ai: AI.READY, review: R.FINALIZED, series: 1, images: 2, reportedAgo: 1000, history: 'Restricted movement of left shoulder.' },
  { id: 'st-1026', acc: 'ACC-218211352', name: 'Sowmya Iyer', uhid: 'NU0012026010349', age: '62 Y', sex: 'F', cls: 'IP', modality: M.CT, desc: 'CT Abdomen triple phase', body: 'Abdomen', ago: 300, ref: 'Dr. R. Sharma', priority: P.URGENT, to: 'rad-2', ai: AI.READY, review: R.REVIEWED, series: 4, images: 610, history: 'Cirrhosis with rising AFP. Characterise liver lesion.' },
  { id: 'st-1027', acc: 'ACC-218211348', name: 'Vijay Anand', uhid: 'NU0012026010344', age: '44 Y', sex: 'M', cls: 'ER', modality: M.XR, desc: 'X-Ray Wrist AP/Lateral (right)', body: 'Wrist', ago: 65, ref: 'Emergency Dept.', priority: P.URGENT, to: null, ai: AI.PROCESSING, next: [[1, AI.READY]], review: R.PENDING_REVIEW, series: 1, images: 2, history: 'Fall on outstretched hand. Query distal radius fracture.' },
  { id: 'st-1028', acc: 'ACC-218211331', name: 'Rekha Pillai', uhid: 'NU0012026010338', age: '39 Y', sex: 'F', cls: 'OP', modality: M.US, desc: 'USG Breast (bilateral)', body: 'Breast', ago: 1300, ref: 'Dr. A. Mehta', priority: P.ROUTINE, to: 'rad-2', ai: AI.FAILED, reason: F.NO_MODEL, review: R.PENDING_REVIEW, series: 1, images: 26, history: 'Palpable lump right breast.' },
  { id: 'st-1029', acc: 'ACC-218211327', name: 'Manoj Tiwari', uhid: 'NU0012026010334', age: '57 Y', sex: 'M', cls: 'OP', modality: M.MR, desc: 'MRI Prostate multiparametric', body: 'Pelvis', ago: 2900, ref: 'Dr. R. Sharma', priority: P.ROUTINE, to: 'rad-2', ai: AI.FAILED, reason: F.NO_MODEL, review: R.FINALIZED, series: 6, images: 340, reportedAgo: 2100, history: 'Raised PSA (8.2 ng/mL).' },
  { id: 'st-1030', acc: 'ACC-218211312', name: 'Kavitha Subramanian', uhid: 'NU0012026010328', age: '48 Y', sex: 'F', cls: 'OP', modality: M.XR, desc: 'X-Ray Chest PA', body: 'Chest', ago: 1700, ref: 'Self', priority: P.ROUTINE, to: null, ai: AI.READY, review: R.PENDING_REVIEW, series: 1, images: 1, history: 'Pre-employment health check.' },
  { id: 'st-1031', acc: 'ACC-218211305', name: 'Balaji Srinivasan', uhid: 'NU0012026010321', age: '81 Y', sex: 'M', cls: 'IP', modality: M.XR, desc: 'X-Ray Pelvis AP', body: 'Pelvis', ago: 170, ref: 'Emergency Dept.', priority: P.URGENT, to: 'rad-3', ai: AI.READY, review: R.PENDING_REVIEW, series: 1, images: 1, history: 'Fall, unable to bear weight. Query neck of femur fracture.' },
  { id: 'st-1032', acc: 'ACC-218211299', name: 'Asha Devi', uhid: 'NU0012026010317', age: '54 Y', sex: 'F', cls: 'OP', modality: M.CT, desc: 'CT Paranasal Sinuses', body: 'Head', ago: 2200, ref: 'Dr. N. Das', priority: P.ROUTINE, to: 'rad-4', ai: AI.FAILED, reason: F.NO_MODEL, review: R.FINALIZED, series: 2, images: 120, reportedAgo: 1500, history: 'Chronic sinusitis, pre-operative planning.' },
  { id: 'st-1033', acc: 'ACC-218211286', name: 'Gopal Krishna', uhid: 'NU0012026010311', age: '69 Y', sex: 'M', cls: 'IP', modality: M.US, desc: 'USG Doppler Lower Limb Venous (left)', body: 'Lower limb', ago: 55, ref: 'Dr. P. Iyer', priority: P.STAT, to: 'rad-2', ai: AI.FAILED, reason: F.NO_MODEL, review: R.UNDER_REVIEW, series: 1, images: 30, history: 'Swollen painful left calf. Rule out deep vein thrombosis.' },
  { id: 'st-1034', acc: 'ACC-218211274', name: 'Lavanya Reddy', uhid: 'NU0012026010306', age: '31 Y', sex: 'F', cls: 'OP', modality: M.MR, desc: 'MRI Brain with contrast', body: 'Brain', ago: 1400, ref: 'Dr. A. Mehta', priority: P.ROUTINE, to: 'rad-1', ai: AI.READY, review: R.UNDER_REVIEW, series: 6, images: 360, history: 'Episodes of visual blurring. Evaluate for demyelination.' },
  { id: 'st-1035', acc: 'ACC-218211263', name: 'Santosh Hegde', uhid: 'NU0012026010301', age: '42 Y', sex: 'M', cls: 'OP', modality: M.XR, desc: 'X-Ray Cervical Spine AP/Lateral', body: 'Spine', ago: 3100, ref: 'Self', priority: P.ROUTINE, to: 'rad-1', ai: AI.READY, review: R.FINALIZED, series: 1, images: 2, reportedAgo: 2600, history: 'Neck stiffness.' },
  { id: 'st-1036', acc: 'ACC-218211258', name: 'Pooja Bhat', uhid: 'NU0012026010297', age: '26 Y', sex: 'F', cls: 'ER', modality: M.CT, desc: 'CT Brain plain', body: 'Brain', ago: 8, ref: 'Emergency Dept.', priority: P.STAT, to: null, ai: AI.PROCESSING, next: [[1.5, AI.READY]], review: R.PENDING_REVIEW, series: 2, images: 58, history: 'Head injury after road traffic accident, GCS 13.' },
  { id: 'st-1037', acc: 'ACC-218211583', name: 'Joseph Mathew', uhid: 'NU0012026010452', age: '76 Y', sex: 'M', cls: 'ER', modality: M.XR, desc: 'X-Ray Chest PA', body: 'Chest', ago: 3, ref: 'Emergency Dept.', priority: P.URGENT, to: null, ai: AI.RECEIVED, next: [[0.5, AI.PROCESSING], [2.5, AI.READY]], review: R.PENDING_REVIEW, series: 1, images: 1, history: 'Known heart failure, worsening orthopnoea and bilateral leg swelling.' },
  { id: 'st-1038', acc: 'ACC-218211590', name: 'Farhan Siddiqui', uhid: 'NU0012026010455', age: '35 Y', sex: 'M', cls: 'OP', modality: M.MR, desc: 'MRI Shoulder (right)', body: 'Shoulder', ago: 1, ref: 'Dr. S. Kulkarni', priority: P.ROUTINE, to: null, ai: AI.RECEIVED, next: [[1, AI.PROCESSING]], review: R.PENDING_REVIEW, series: 6, images: 210, history: 'Painful arc and weakness on abduction. Query rotator cuff tear.' },
]

// Typical pipeline timing: AI picks a study up about a minute after Orthanc receives it and needs a few minutes.
const AI_UPDATED_OFFSET = { [AI.RECEIVED]: 0, [AI.PROCESSING]: 1, [AI.READY]: 6, [AI.FAILED]: 2 }

const minutesBefore = (now, minutes) => new Date(now - minutes * 60000).toISOString()

export function createMockStudies(now = Date.now()) {
  return SEED.map((s, i) => ({
    id: s.id,
    studyInstanceUID: s.uid || uid(1001 + i),
    accessionNumber: s.acc,
    patient: { name: s.name, uhid: s.uhid, age: s.age, sex: s.sex },
    patientClass: s.cls,
    modality: s.modality,
    description: s.desc,
    bodyPart: s.body,
    studyDateTime: minutesBefore(now, s.ago),
    referringDoctor: s.ref,
    priority: s.priority,
    assignedTo: s.to,
    aiReportStatus: s.ai,
    aiReportUpdatedAt: minutesBefore(now, Math.max(0, s.ago - AI_UPDATED_OFFSET[s.ai])),
    aiFailureReason: s.reason || null,
    reviewStatus: s.review,
    imagesAvailable: true,
    seriesCount: s.series,
    instanceCount: s.images,
    clinicalHistory: s.history,
    reportedAt: s.reportedAgo ? minutesBefore(now, s.reportedAgo) : null,
  }))
}

// Scheduled AI status changes, as absolute times: { [studyId]: [{ at, status, reason }] }.
export function createMockAiSchedule(now = Date.now()) {
  return Object.fromEntries(
    SEED.filter((s) => s.next).map((s) => [s.id, s.next.map(([inMinutes, status, reason]) => ({ at: now + inMinutes * 60000, status, reason: reason || null }))]),
  )
}
