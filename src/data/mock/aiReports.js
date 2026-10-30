// Mock output of the AI service: the generated report for each study whose AI status is (or will become) READY.
// Shapes match ReportDraft in api/models.js. Suggestions carry no image source: with the mock worklist the studies
// are not on PACS (BRAINIX is, but its image-linked draft now comes from dicom-study-backend).
//
// Synthetic demo content for UI development only. Not clinical output.

const ZOO = 'Model Zoo'

const MODELS = {
  chestXr: { name: 'ChestXR-Draft', version: '1.8.0', task: 'Chest radiograph finding detection + report drafting' },
  mskXr: { name: 'MSK-XR-Draft', version: '1.2.4', task: 'Musculoskeletal radiograph fracture / arthropathy detection + report drafting' },
  neuroCt: { name: 'NeuroCT-Draft', version: '3.0.2', task: 'Non-contrast head CT triage + report drafting' },
  neuroMr: { name: 'NeuroMR-Draft', version: '2.3.1', task: 'Brain MRI observation detection + report drafting' },
  bodyCt: { name: 'BodyCT-Draft', version: '2.1.0', task: 'Chest / abdomen / pelvis CT finding detection + report drafting' },
  ctpa: { name: 'CTPA-Draft', version: '1.4.1', task: 'Pulmonary embolism detection + report drafting' },
  mskMr: { name: 'MSK-MR-Draft', version: '1.1.3', task: 'Spine and joint MRI finding detection + report drafting' },
  abdoUs: { name: 'AbdoUS-Draft', version: '0.9.6', task: 'Renal / thyroid ultrasound measurement + report drafting' },
}

const LIMITATIONS = {
  chestXr: ['Single projection: findings behind the heart and below the diaphragm may be missed.', 'Line and tube tip positions are estimated against anatomical landmarks.'],
  mskXr: ['Undisplaced fractures can be radiographically occult; clinical correlation is required.', 'Trained on adult radiographs only.'],
  neuroCt: ['Very early ischaemia (under 6 hours) is often not visible on CT; a negative result does not exclude stroke.', 'Posterior fossa assessment is limited by beam-hardening artefact.'],
  neuroMr: ['Trained predominantly on adult 1.5T / 3T brain MRI. Not validated for paediatric studies.', 'Lesion counts are automated and may include vessels or artefact.'],
  bodyCt: ['Measurements are automated estimates (approx. ±3 mm).', 'Incidental findings outside the organ of interest are reported with lower sensitivity.'],
  ctpa: ['Subsegmental emboli are detected with lower sensitivity.', 'Right heart strain is estimated from the RV/LV ratio only.'],
  mskMr: ['Trained on standard 1.5T protocols; non-standard planes reduce accuracy.', 'Grading of cartilage and tendon change is approximate.'],
  abdoUs: ['Operator-dependent study: the model only sees the stored images, not the live examination.', 'Measurements are taken from stored calliper images where available.'],
}

// [observation, text, confidence, limitation?]
const REPORTS = {
  'st-1001': {
    model: 'neuroMr',
    technique: 'Multiplanar multisequence MRI of the brain: axial T2 TSE, FLAIR, T2* gradient echo and T1 SE, followed by 3D T1 FFE after intravenous gadolinium.',
    findings: [
      ['Intra-axial mass', 'There is a large heterogeneous intra-axial mass centred in the left fronto-parietal white matter, measuring approximately 4.8 x 3.9 cm in axial dimensions.', 0.93],
      ['Perilesional oedema', 'Extensive surrounding T2/FLAIR hyperintense signal is in keeping with vasogenic oedema and/or infiltrative tumour, extending into the adjacent corona radiata.', 0.88],
      ['Rim enhancement with necrosis', 'Post-contrast images demonstrate irregular, thick peripheral enhancement with a central non-enhancing component, suggestive of necrosis.', 0.81],
      ['Mass effect / midline shift', 'There is local mass effect with effacement of the adjacent sulci and partial compression of the left lateral ventricle, with approximately 4 mm of midline shift to the right.', 0.76],
    ],
    impression: [
      ['Primary impression', 'Large heterogeneously enhancing left fronto-parietal intra-axial mass with central necrosis and surrounding oedema. Imaging features favour a high-grade glial neoplasm; solitary metastasis is a less likely differential.', 0.84],
      ['Recommendation', 'Suggest neurosurgical correlation and, if clinically appropriate, advanced imaging (perfusion / MR spectroscopy).', 0.58, 'Recommendation is generic. Local referral pathways are not known to the model.'],
    ],
  },
  'st-1002': {
    model: 'neuroCt',
    technique: 'Non-contrast axial CT of the head with multiplanar reformats.',
    findings: [
      ['Haemorrhage', 'No intracranial haemorrhage. No extra-axial collection.', 0.95],
      ['Early ischaemic change', 'Subtle loss of grey-white matter differentiation in the right insular cortex and lentiform nucleus, which may represent early ischaemic change.', 0.66, 'Early ischaemic signs are subtle; correlate with CT perfusion or MRI if available.'],
      ['Hyperdense vessel', 'Possible hyperdense right middle cerebral artery (M1 segment).', 0.61],
      ['Ventricles', 'Ventricles and basal cisterns are normal. No midline shift.', 0.92],
    ],
    impression: [
      ['Primary impression', 'No intracranial haemorrhage. Possible early right MCA territory ischaemic change with hyperdense right MCA sign.', 0.7],
      ['Recommendation', 'Urgent stroke team review; consider CT angiography.', 0.6, 'Recommendation is generic. Local stroke pathways are not known to the model.'],
    ],
  },
  'st-1003': {
    model: 'chestXr',
    technique: 'Single PA erect chest radiograph.',
    findings: [
      ['Consolidation', 'Airspace opacification in the right lower zone with air bronchograms, in keeping with consolidation.', 0.89],
      ['Pleural effusion', 'Small right pleural effusion with blunting of the right costophrenic angle.', 0.78],
      ['Heart size', 'Cardiothoracic ratio is within normal limits.', 0.9],
      ['Pneumothorax', 'No pneumothorax.', 0.94],
    ],
    impression: [['Primary impression', 'Right lower lobe consolidation with a small parapneumonic effusion, consistent with pneumonia in the given clinical context.', 0.85]],
  },
  'st-1004': {
    model: 'bodyCt',
    technique: 'Contrast-enhanced CT of the abdomen and pelvis in the portal venous phase.',
    findings: [
      ['Appendix', 'The appendix is dilated to 11 mm with wall thickening and enhancement.', 0.91],
      ['Periappendiceal change', 'Surrounding fat stranding with a small amount of free fluid in the right iliac fossa.', 0.86],
      ['Appendicolith', 'A 6 mm appendicolith is seen at the appendiceal base.', 0.74],
      ['Complications', 'No extraluminal gas or drainable collection to suggest perforation.', 0.79],
    ],
    impression: [['Primary impression', 'Acute appendicitis with an appendicolith. No CT evidence of perforation or abscess.', 0.88]],
  },
  'st-1006': {
    model: 'bodyCt',
    technique: 'High-resolution CT of the chest, supine and prone, with expiratory images.',
    findings: [
      ['Reticulation', 'Bilateral subpleural reticulation with basal and peripheral predominance.', 0.87],
      ['Traction bronchiectasis', 'Traction bronchiectasis in both lower lobes.', 0.8],
      ['Honeycombing', 'Subpleural honeycombing in the posterior costophrenic recesses.', 0.71],
      ['Ground glass', 'No significant ground-glass opacity, consolidation or air trapping.', 0.76],
    ],
    impression: [
      ['Primary impression', 'Fibrotic interstitial lung disease in a usual interstitial pneumonia (UIP) pattern.', 0.76],
      ['Recommendation', 'Suggest discussion at an interstitial lung disease MDT.', 0.58, 'Recommendation is generic. Local referral pathways are not known to the model.'],
    ],
  },
  'st-1007': {
    model: 'mskMr',
    technique: 'Sagittal T1, T2 and STIR, and axial T2 MRI of the lumbar spine.',
    findings: [
      ['Disc extrusion', 'Left paracentral disc extrusion at L4-L5 with caudal migration, compressing the traversing left L5 nerve root.', 0.88],
      ['Disc degeneration', 'Disc desiccation at L4-L5 and L5-S1.', 0.84],
      ['Canal and foramina', 'Moderate central canal narrowing at L4-L5. The neural foramina are otherwise patent.', 0.72],
      ['Conus', 'The conus medullaris terminates normally at L1.', 0.93],
    ],
    impression: [['Primary impression', 'Left paracentral L4-L5 disc extrusion compressing the left L5 nerve root, concordant with the clinical foot drop.', 0.84]],
  },
  'st-1009': {
    model: 'chestXr',
    technique: 'Single AP supine portable chest radiograph.',
    findings: [
      ['Central line', 'Right internal jugular central venous catheter with the tip projected over the cavo-atrial junction.', 0.86],
      ['Pneumothorax', 'No pneumothorax.', 0.93],
      ['Lungs', 'Mild bibasal atelectasis. No focal consolidation.', 0.77],
      ['Heart size', 'Heart size cannot be accurately assessed on this AP projection.', 0.8],
    ],
    impression: [['Primary impression', 'Right IJ central line in satisfactory position. No pneumothorax.', 0.88]],
  },
  'st-1010': {
    model: 'abdoUs',
    technique: 'Ultrasound of the kidneys, ureters and bladder.',
    findings: [
      ['Right kidney', 'Right kidney measures 10.8 cm with moderate hydronephrosis and a dilated proximal ureter.', 0.85],
      ['Left kidney', 'Left kidney measures 10.4 cm with normal cortical thickness and no hydronephrosis.', 0.88],
      ['Bladder', 'Bladder is partially filled. Prostate is enlarged, estimated volume 48 mL.', 0.69],
    ],
    impression: [['Primary impression', 'Moderate right hydroureteronephrosis. Distal ureteric cause not seen on ultrasound; consider CT KUB.', 0.78]],
  },
  'st-1013': {
    model: 'bodyCt',
    technique: 'Non-contrast CT of the chest.',
    findings: [
      ['Nodules', 'Few calcified granulomas in the right upper lobe.', 0.82],
      ['Lungs', 'No consolidation, mass or bronchiectasis.', 0.9],
      ['Mediastinum', 'No mediastinal or hilar lymphadenopathy.', 0.86],
    ],
    impression: [['Primary impression', 'No active lung parenchymal disease. Calcified granulomas, likely sequelae of prior granulomatous infection.', 0.84]],
  },
  'st-1014': {
    model: 'neuroMr',
    technique: 'Multiplanar multisequence MRI of the brain with intravenous gadolinium.',
    findings: [
      ['Parenchyma', 'Normal brain parenchymal signal. No mass or abnormal enhancement.', 0.9],
      ['Ventricles', 'Ventricles and sulci are normal for age.', 0.92],
      ['Sinuses', 'Mild mucosal thickening in the left maxillary sinus.', 0.74],
    ],
    impression: [['Primary impression', 'No intracranial space-occupying lesion. Mild left maxillary sinus mucosal thickening.', 0.86]],
  },
  'st-1015': {
    model: 'mskXr',
    technique: 'AP and lateral radiographs of the right knee.',
    findings: [
      ['Joint space', 'Medial tibiofemoral joint space narrowing.', 0.86],
      ['Osteophytes', 'Marginal osteophytes at the medial compartment and patellofemoral joint.', 0.83],
      ['Effusion', 'Small suprapatellar effusion.', 0.64],
      ['Fracture', 'No fracture or loose body.', 0.9],
    ],
    impression: [['Primary impression', 'Moderate medial compartment and patellofemoral osteoarthritis (Kellgren-Lawrence grade 3).', 0.79]],
  },
  'st-1016': {
    model: 'mskXr',
    technique: 'AP and lateral radiographs of the lumbar spine.',
    findings: [
      ['Disc spaces', 'Disc space narrowing at L4-L5 and L5-S1.', 0.84],
      ['Osteophytes', 'Anterior osteophytes at multiple levels.', 0.82],
      ['Alignment', 'Grade 1 degenerative anterolisthesis of L4 on L5.', 0.71],
      ['Vertebral bodies', 'Vertebral body heights are maintained. No compression fracture.', 0.88],
    ],
    impression: [['Primary impression', 'Multilevel lumbar spondylosis with grade 1 L4-L5 degenerative anterolisthesis.', 0.8]],
  },
  'st-1017': {
    model: 'bodyCt',
    technique: 'Non-contrast low-dose CT of the kidneys, ureters and bladder.',
    findings: [
      ['Ureteric calculus', 'A 5 mm calculus at the left vesicoureteric junction.', 0.9],
      ['Hydronephrosis', 'Mild left hydroureteronephrosis with perinephric fat stranding.', 0.85],
      ['Right kidney', 'A 3 mm non-obstructing calculus in the lower pole of the right kidney.', 0.77],
    ],
    impression: [['Primary impression', 'Obstructing 5 mm left VUJ calculus with mild left hydroureteronephrosis. Small non-obstructing right renal calculus.', 0.87]],
  },
  'st-1018': {
    model: 'abdoUs',
    technique: 'High-frequency ultrasound of the thyroid gland.',
    findings: [
      ['Right lobe nodule', 'Solid hypoechoic nodule in the right lobe measuring 1.6 x 1.2 x 1.1 cm, wider than tall, with smooth margins and no echogenic foci.', 0.83],
      ['Left lobe', 'Left lobe and isthmus are normal in size and echotexture.', 0.88],
      ['Lymph nodes', 'No suspicious cervical lymph nodes.', 0.76],
    ],
    impression: [['Primary impression', 'Right thyroid nodule, ACR TI-RADS 4 (moderately suspicious). FNA is indicated at 1.5 cm or larger.', 0.74]],
  },
  'st-1019': {
    model: 'mskMr',
    technique: 'Multiplanar proton density and T2 fat-saturated MRI of the left knee.',
    findings: [
      ['Anterior cruciate ligament', 'Complete tear of the anterior cruciate ligament with non-visualisation of the femoral attachment.', 0.88],
      ['Bone bruise', 'Bone marrow oedema in the lateral femoral condyle and posterolateral tibial plateau (pivot-shift pattern).', 0.84],
      ['Medial meniscus', 'Vertical tear of the posterior horn of the medial meniscus.', 0.69, 'Ramp lesions and small peripheral tears are detected with lower sensitivity.'],
      ['Joint effusion', 'Moderate joint effusion.', 0.86],
    ],
    impression: [['Primary impression', 'Complete ACL tear with pivot-shift bone contusions and a probable posterior horn medial meniscal tear.', 0.82]],
  },
  'st-1020': {
    model: 'ctpa',
    technique: 'CT pulmonary angiography with bolus tracking.',
    findings: [
      ['Pulmonary emboli', 'Filling defects in the right lower lobe segmental and subsegmental pulmonary arteries.', 0.9],
      ['Main pulmonary arteries', 'Main and lobar pulmonary arteries are patent.', 0.87],
      ['Right heart', 'RV/LV ratio 0.9. No reflux of contrast into the IVC.', 0.73],
      ['Lungs', 'Small wedge-shaped peripheral opacity in the right lower lobe, possible early infarct.', 0.62],
    ],
    impression: [['Primary impression', 'Acute right lower lobe segmental pulmonary emboli without CT evidence of right heart strain.', 0.88]],
  },
  'st-1021': {
    model: 'chestXr',
    technique: 'Single PA erect chest radiograph.',
    findings: [
      ['Consolidation', 'Residual faint opacity in the right lower zone, much improved compared with the expected appearance of the prior pneumonia.', 0.72, 'No prior study was available to the model for direct comparison.'],
      ['Pleura', 'No pleural effusion or pneumothorax.', 0.9],
      ['Heart size', 'Heart size is normal.', 0.89],
    ],
    impression: [['Primary impression', 'Resolving right lower lobe pneumonia.', 0.74]],
  },
  'st-1023': {
    model: 'neuroCt',
    technique: 'Non-contrast axial CT of the head with multiplanar reformats.',
    findings: [
      ['Extra-axial collection', 'No acute subdural or extradural haematoma.', 0.92],
      ['Parenchyma', 'Periventricular white matter hypodensities, in keeping with chronic small vessel ischaemic change.', 0.84],
      ['Atrophy', 'Generalised cerebral volume loss appropriate for age.', 0.8],
      ['Skull', 'No skull vault fracture.', 0.88],
    ],
    impression: [['Primary impression', 'No acute intracranial haemorrhage or fracture. Chronic small vessel ischaemic change.', 0.88]],
  },
  'st-1025': {
    model: 'mskXr',
    technique: 'AP and axial radiographs of the left shoulder.',
    findings: [
      ['Calcification', 'Amorphous calcific density projected over the supraspinatus tendon insertion.', 0.81],
      ['Joints', 'Glenohumeral and acromioclavicular joints are congruent.', 0.88],
      ['Fracture', 'No fracture or dislocation.', 0.92],
    ],
    impression: [['Primary impression', 'Calcific tendinopathy of the supraspinatus tendon.', 0.79]],
  },
  'st-1026': {
    model: 'bodyCt',
    technique: 'Triple-phase CT of the liver: non-contrast, late arterial and portal venous phases.',
    findings: [
      ['Liver lesion', 'A 2.4 cm lesion in segment VII with arterial phase hyperenhancement and portal venous washout with an enhancing capsule.', 0.86],
      ['Liver morphology', 'Nodular liver contour with caudate lobe hypertrophy, in keeping with cirrhosis.', 0.9],
      ['Portal hypertension', 'Splenomegaly (14.5 cm) and perigastric varices.', 0.82],
      ['Portal vein', 'The portal vein is patent with no tumour thrombus.', 0.78],
    ],
    impression: [['Primary impression', 'Segment VII 2.4 cm observation, LI-RADS 5 (definite hepatocellular carcinoma), on a background of cirrhosis with portal hypertension.', 0.82]],
  },
  'st-1027': {
    model: 'mskXr',
    technique: 'AP and lateral radiographs of the right wrist.',
    findings: [
      ['Distal radius fracture', 'Transverse extra-articular fracture of the distal radial metaphysis with dorsal angulation of about 15 degrees.', 0.91],
      ['Ulnar styloid', 'Undisplaced fracture of the ulnar styloid tip.', 0.68],
      ['Carpus', 'No carpal bone fracture or dislocation.', 0.81, 'Scaphoid fractures may be occult on initial radiographs.'],
    ],
    impression: [['Primary impression', 'Dorsally angulated extra-articular distal radius fracture (Colles type) with an ulnar styloid tip fracture.', 0.88]],
  },
  'st-1030': {
    model: 'chestXr',
    technique: 'Single PA erect chest radiograph.',
    findings: [
      ['Lungs', 'Lungs are clear. No consolidation, mass or nodule.', 0.93],
      ['Pleura', 'No pleural effusion or pneumothorax.', 0.95],
      ['Heart and mediastinum', 'Heart size and mediastinal contours are normal.', 0.93],
    ],
    impression: [['Primary impression', 'Normal chest radiograph.', 0.92]],
  },
  'st-1031': {
    model: 'mskXr',
    technique: 'Single AP radiograph of the pelvis.',
    findings: [
      ['Femoral neck fracture', 'Displaced subcapital fracture of the left femoral neck.', 0.9],
      ['Bones', 'Diffuse osteopenia.', 0.8],
      ['Pelvic ring', 'Pelvic ring and right hip are intact.', 0.85],
    ],
    impression: [['Primary impression', 'Displaced left subcapital neck of femur fracture (Garden III-IV).', 0.86]],
  },
  'st-1034': {
    model: 'neuroMr',
    technique: 'Multiplanar multisequence MRI of the brain including 3D FLAIR, with intravenous gadolinium.',
    findings: [
      ['White matter lesions', 'Multiple ovoid T2/FLAIR hyperintense lesions oriented perpendicular to the lateral ventricles (Dawson fingers).', 0.87],
      ['Juxtacortical / infratentorial', 'Juxtacortical lesion in the right frontal lobe and a lesion in the left middle cerebellar peduncle.', 0.78],
      ['Enhancement', 'Two lesions show incomplete ring enhancement, indicating active demyelination.', 0.74],
      ['Optic nerves', 'Mild T2 hyperintensity of the left optic nerve.', 0.58, 'Optic nerve assessment is limited without dedicated orbital sequences.'],
    ],
    impression: [['Primary impression', 'White matter lesions in periventricular, juxtacortical and infratentorial locations with active enhancing lesions, fulfilling MRI criteria for dissemination in space and time. Features favour multiple sclerosis.', 0.8]],
  },
  'st-1035': {
    model: 'mskXr',
    technique: 'AP and lateral radiographs of the cervical spine.',
    findings: [
      ['Alignment', 'Straightening of the normal cervical lordosis.', 0.79],
      ['Degenerative change', 'Mild disc space narrowing at C5-C6 with small anterior osteophytes.', 0.82],
      ['Fracture', 'No fracture or subluxation.', 0.91],
    ],
    impression: [['Primary impression', 'Mild C5-C6 spondylosis. Loss of lordosis may be positional or related to muscle spasm.', 0.8]],
  },
  'st-1036': {
    model: 'neuroCt',
    technique: 'Non-contrast axial CT of the head with bone and soft tissue algorithms.',
    findings: [
      ['Contusion', 'Small hyperdense focus in the right frontal lobe, about 8 mm, in keeping with a haemorrhagic contusion.', 0.81],
      ['Extra-axial collection', 'No extradural or subdural haematoma.', 0.89],
      ['Skull', 'Undisplaced linear fracture of the right frontal bone.', 0.72, 'Fracture detection is less reliable without thin-section bone reconstructions.'],
      ['Mass effect', 'No midline shift. Basal cisterns are preserved.', 0.92],
    ],
    impression: [['Primary impression', 'Small right frontal haemorrhagic contusion with an undisplaced right frontal skull fracture. No extra-axial haematoma or mass effect.', 0.82]],
  },
  'st-1037': {
    model: 'chestXr',
    technique: 'Single PA erect chest radiograph.',
    findings: [
      ['Heart size', 'Cardiomegaly with a cardiothoracic ratio of about 0.62.', 0.9],
      ['Pulmonary oedema', 'Upper lobe venous diversion, interstitial septal lines and perihilar haziness.', 0.84],
      ['Pleural effusion', 'Small bilateral pleural effusions.', 0.8],
    ],
    impression: [['Primary impression', 'Cardiomegaly with interstitial pulmonary oedema and small bilateral effusions, in keeping with congestive cardiac failure.', 0.86]],
  },
}

const toSuggestions = (report) =>
  [...report.findings.map((f) => ['findings', ...f]), ...report.impression.map((f) => ['impression', ...f])].map(([section, observation, text, confidence, limitation], i) => ({
    id: `sg-${i + 1}`,
    section,
    observation,
    text,
    confidence,
    ...(limitation && { limitation }),
    source: null,
    roi: null,
  }))

// The AI-generated report for a study, or null when the AI service produced none.
export function mockAiReport(study) {
  const report = REPORTS[study.id]
  if (!report) return null
  return {
    draftId: `drf_${study.id}`,
    version: 1,
    generatedAt: study.aiReportUpdatedAt,
    model: { zoo: ZOO, ...MODELS[report.model], runId: `run_${study.accessionNumber.slice(-6)}` },
    clinicalHistory: study.clinicalHistory,
    technique: report.technique,
    limitations: LIMITATIONS[report.model],
    suggestions: toSuggestions(report),
  }
}
