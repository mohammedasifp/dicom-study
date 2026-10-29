const STUDY_UID = '2.16.840.1.113669.632.20.1211.10000357775'

const SERIES = {
  flair: {
    seriesInstanceUID: '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114285654497',
    seriesNumber: 401,
    seriesDescription: 'Axial T2 FLAIR',
  },
  t2: {
    seriesInstanceUID: '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114262848496',
    seriesNumber: 301,
    seriesDescription: 'Axial T2 TSE',
  },
  t2star: {
    seriesInstanceUID: '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114314125550',
    seriesNumber: 501,
    seriesDescription: 'Axial T2* FE-EPI',
  },
  t1: {
    seriesInstanceUID: '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114333440565',
    seriesNumber: 601,
    seriesDescription: 'Axial T1 SE',
  },
  t1c: {
    seriesInstanceUID: '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114440679623',
    seriesNumber: 801,
    seriesDescription: '3D T1 FFE + Gd',
  },
}

const image = (series, instanceNumber, sopInstanceUID) => ({
  studyInstanceUID: STUDY_UID,
  ...series,
  instanceNumber,
  sopInstanceUID,
})

// roi: x/y/width/height are fractions (0-1) of the image, origin top-left.
export const draftReport = {
  draftId: 'drf_01HF8K2Q7Z',
  version: 1,
  generatedAt: '2026-10-29T10:42:00+05:30',
  model: {
    zoo: 'Model Zoo',
    name: 'NeuroMR-Draft',
    version: '2.3.1',
    task: 'Brain MRI observation detection + report drafting',
    runId: 'run_7f3a91c2',
  },
  patient: {
    name: 'BRAINIX',
    patientId: '5Yp0E',
    age: '57 Y',
    sex: 'M',
  },
  study: {
    studyInstanceUID: STUDY_UID,
    accessionNumber: 'ACC-218211405',
    description: 'MRI Brain with contrast',
    modality: 'MR',
    studyDate: '2006-12-01',
    referringPhysician: 'Dr. A. Mehta',
  },
  clinicalHistory:
    'Progressive headaches over 3 weeks with new-onset right-sided weakness. Evaluate for intracranial lesion.',
  technique:
    'Multiplanar multisequence MRI of the brain: axial T2 TSE, FLAIR, T2* gradient echo and T1 SE, followed by 3D T1 FFE after intravenous gadolinium.',
  limitations: [
    'Trained predominantly on adult 1.5T / 3T brain MRI. Not validated for paediatric or post-operative studies.',
    'No diffusion-weighted or perfusion sequences in this study, so tumour cellularity cannot be characterised.',
    'Measurements are automated estimates from a single axial plane (approx. ±5 mm).',
    'Regions of interest are shown only where detection confidence is 0.70 or higher.',
  ],
  suggestions: [
    {
      id: 'sg-1',
      section: 'findings',
      observation: 'Intra-axial mass',
      text: 'There is a large heterogeneous intra-axial mass centred in the left fronto-parietal white matter, measuring approximately 4.8 x 3.9 cm in axial dimensions.',
      confidence: 0.93,
      source: image(SERIES.flair, 19, '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114313904540'),
      roi: { shape: 'ellipse', x: 0.52, y: 0.3, width: 0.3, height: 0.28 },
    },
    {
      id: 'sg-2',
      section: 'findings',
      observation: 'Perilesional oedema',
      text: 'Extensive surrounding T2/FLAIR hyperintense signal is in keeping with vasogenic oedema and/or infiltrative tumour, extending into the adjacent corona radiata.',
      confidence: 0.88,
      source: image(SERIES.flair, 19, '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114313904540'),
      roi: { shape: 'ellipse', x: 0.46, y: 0.22, width: 0.42, height: 0.42 },
    },
    {
      id: 'sg-3',
      section: 'findings',
      observation: 'Rim enhancement with necrosis',
      text: 'Post-contrast images demonstrate irregular, thick peripheral enhancement with a central non-enhancing component, suggestive of necrosis.',
      confidence: 0.81,
      source: image(SERIES.t1c, 50, '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114483235652'),
      roi: { shape: 'ellipse', x: 0.54, y: 0.32, width: 0.24, height: 0.22 },
    },
    {
      id: 'sg-4',
      section: 'findings',
      observation: 'Mass effect / midline shift',
      text: 'There is local mass effect with effacement of the adjacent sulci and partial compression of the left lateral ventricle, with approximately 4 mm of midline shift to the right.',
      confidence: 0.76,
      source: image(SERIES.t2, 21, '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114290345509'),
      roi: { shape: 'rect', x: 0.4, y: 0.28, width: 0.2, height: 0.36 },
    },
    {
      id: 'sg-5',
      section: 'findings',
      observation: 'Intralesional susceptibility',
      text: 'Small foci of susceptibility within the lesion may represent intratumoural haemorrhage or calcification.',
      confidence: 0.52,
      limitation: 'Susceptibility artefact near the skull base limits assessment. No localisation provided.',
      source: image(SERIES.t2star, 2, '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114333631575'),
      roi: null,
    },
    {
      id: 'sg-6',
      section: 'findings',
      observation: 'Ventricles and posterior fossa',
      text: 'No hydrocephalus. The posterior fossa structures and brainstem are unremarkable.',
      confidence: 0.9,
      source: image(SERIES.t1, 20, '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114374843603'),
      roi: null,
    },
    {
      id: 'sg-7',
      section: 'impression',
      observation: 'Primary impression',
      text: 'Large heterogeneously enhancing left fronto-parietal intra-axial mass with central necrosis and surrounding oedema. Imaging features favour a high-grade glial neoplasm (e.g. glioblastoma); solitary metastasis is a less likely differential.',
      confidence: 0.84,
      source: image(SERIES.t1c, 50, '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114483235652'),
      roi: null,
    },
    {
      id: 'sg-8',
      section: 'impression',
      observation: 'Mass effect',
      text: 'Mass effect with approximately 4 mm rightward midline shift. No hydrocephalus.',
      confidence: 0.79,
      source: image(SERIES.t2, 21, '1.3.46.670589.11.0.0.11.4.2.0.8743.5.5396.2006120114290345509'),
      roi: null,
    },
    {
      id: 'sg-9',
      section: 'impression',
      observation: 'Recommendation',
      text: 'Suggest neurosurgical correlation and, if clinically appropriate, advanced imaging (perfusion / MR spectroscopy).',
      confidence: 0.58,
      limitation: 'Recommendation is generic. Local referral pathways are not known to the model.',
      source: null,
      roi: null,
    },
  ],
}
