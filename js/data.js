/* ============================================================
   Data & static template configuration for Sistem Borang LKS TNB
   (SENARAI SEMAK LKS, AMK, Laporan Harian, Gantt, JMS, BQ, Jadual
   Imbangan, Surat Akuan Kerja Selesai, CASE)
   ============================================================ */

const CHECKLIST_ITEMS = [
  { no: 1, perkara: "SENARAI SEMAK LKS", dokumen: "ENGR-1401-PSI", status: "ADA" },
  { no: 2, perkara: "SURAT AKUAN KERJA SELESAI", dokumen: "ENGR-1402-PSI", status: "ADA" },
  { no: 3, perkara: "LAPORAN KERJA SIAP BAGI TUJUAN PENYEDIAAN SIJIL AKUAN SELESAI", dokumen: "ARAHAN/PANDUAN", status: "ADA" },
  { no: 4, perkara: "ARAHAN MULA KERJA", dokumen: "ENGR-1104-PSI", status: "ADA" },
  { no: 5, perkara: "CARTA PERBATUAN / GANTT CHART", dokumen: "ENGR-1105-PSI", status: "ADA" },
  { no: 6, perkara: "BORANG PEMERIKSAAN FIZIKAL STOR", dokumen: "ENGR-1106-PSI", status: "TIADA" },
  { no: 7, perkara: "LAPORAN HARIAN PENYELIA", dokumen: "ENGR-1201-PSI", status: "ADA" },
  { no: 8, perkara: "JADUAL IMBANGAN PENGGUNAAN BAHAN", dokumen: "ENGR-1403-PSI", status: "ADA" },
  { no: 9, perkara: "SALINAN PURCHASE ORDER (PO)", dokumen: "", dokumenFromPO: true, status: "ADA" },
  { no: 10, perkara: "GI SLIP 221 / DELIVERY SLIP", dokumen: "", status: "ADA" },
  { no: 11, perkara: "GI SLIP 222 (SCRAP/CREDIT)", dokumen: "", status: "ADA" },
  { no: 12, perkara: "BORANG PENGUJIAN SHORT LENGTH CABLE", dokumen: "", status: "TIADA" },
  { no: 13, perkara: "AS-BUILT DRAWING + GPS KOORDINATE", dokumen: "ARAHAN/PANDUAN", status: "TIADA" },
  { no: 14, perkara: "GAMBAR KERJA DITAPAK - SEBELUM, SEMASA, SELEPAS KERJA SELESAI(WARNA) - TIMESTAMP", dokumen: "", status: "ADA" },
  { no: 15, perkara: "HDD PROFILE / UMAP / TESTING REPORT", dokumen: "ARAHAN/PANDUAN", status: "TIADA" },
  { no: 16, perkara: "BORANG KIRAAN HDD", dokumen: "ARAHAN/PANDUAN", status: "TIADA" },
  { no: 17, perkara: "CORING TEST (MILL PAVE)", dokumen: "", status: "TIADA" },
  { no: 18, perkara: "SURAT PENGESAHAN SIAP DARI PBT", dokumen: "", status: "TIADA" },
  { no: 19, perkara: "BILL OF QUANTITY (BQ)", dokumen: "", status: "ADA" },
  { no: 20, perkara: "JOINT MEASUREMENT SHEET (JMS)", dokumen: "ARAHAN/PANDUAN", status: "ADA" },
  { no: 21, perkara: "SURAT JAMINAN KERJA 1 TAHUN", dokumen: "ARAHAN/PANDUAN", status: "TIADA" },
  { no: 22, perkara: "CONTRACTOR AND SUPPLIER EVALUATION (CASE)", dokumen: "ARAHAN/PANDUAN", status: "ADA" },
  { no: 23, perkara: "GAMBAR TRANSPORTATION", dokumen: "", status: "ADA" },
  { no: 24, perkara: "GATE PASS", dokumen: "", status: "ADA" },
  { no: 25, perkara: "CSQA", dokumen: "ARAHAN/PANDUAN", status: "TIADA" },
  { no: 26, perkara: "PERMIT KHAS", dokumen: "ARAHAN/PANDUAN", status: "TIADA" },
  { no: 27, perkara: "VIDEO JOIN ST THRU (HT)", dokumen: "ARAHAN/PANDUAN", status: "TIADA" },
  { no: 28, perkara: "BORANG REKOD QR JOINT", dokumen: "ARAHAN/PANDUAN", status: "TIADA" }
];

const JENIS_KERJA_OPTIONS = [
  "Kerja-kerja Kabel Bawah Tanah",
  "Kerja-kerja rombakan / penanaman Tiang dan Sesalur",
  "Sesalur Bekal / Sesalur kakilima",
  "Pemasangan /Rombakan Pencawang",
  "Sambungan Terus dan tamatan",
  "Kerja HDD",
  "Utility Mapping",
  "Milling and Paving",
  "Pengangkutan / Kren"
];

const AMK_PRE_START_STEPS = [
  "Menyediakan pelan kerja",
  "Memastikan peralatan kerja mencukupi dan digunakan",
  "Memastikan peralatan keselamatan mencukupi dan digunakan",
  "Mematuhi Peraturan Kerja TNB"
];

const JOB_TYPE_OPTIONS = ["KVT", "KVR", "SAVT", "SAVR", "HDD", "JOINT", "MILL", "PAVE"];

const WEEK_DAYS = ["I", "S", "R", "K", "J", "S", "A"]; // Isnin..Ahad
const GANTT_WEEKS = 12; // scrollable weeks available for planning

/* CASE evaluation question bank - Section A: SERVICES TECHNICAL */
const CASE_SECTIONS = [
  {
    key: "quality",
    title: "KRITERIA: KUALITI (QUALITY) (45%)",
    questions: [
      {
        id: "q1",
        my: "Bagaimana anda menilai pembekal / kontraktor dari segi kualiti kerja?",
        en: "How would you rate contractor/supplier based on their quality of work?",
        options: [
          { label: "Cemerlang / Excellent", my: "Tiada Kerja semula / alat telah dikaliberasi / mengguna peralatan yang betul", en: "No rework / tools being caliberated / using the right equipment" },
          { label: "Baik / Acceptable", my: "Tiada Kerja semula / Tidak menggunakan peralatan yang betul", en: "No rework/ Not using the right equipment" },
          { label: "Memerlukan Penambahbaikan / Needs Improvement", my: "Kerja semula dan tiada implikasi kepada TNB (Masa / Kos)", en: "Rework with no impact to project timeline" },
          { label: "Tidak memuaskan / Unacceptable", my: "Kerja semula dan implikasi yang tinggi kepada TNB menyebabkan kelewatan (Masa / Kos)", en: "Rework with impact to project timeline" }
        ]
      },
      {
        id: "q2",
        my: "Bagaimana anda menilai pembekal / kontraktor dari segi KEPATUHAN KEPADA SPESIFIKASI (syarat terma) yang telah ditetapkan?",
        en: "How would you rate the supplier / contractor for COMPLIANCE to SPECIFICATIONS AND PROCEDURES of JOB/ SERVICE/ WORK?",
        options: [
          { label: "Cemerlang / Excellent", my: "Memenuhi spesifikasi yang ditetapkan dalam kontrak", en: "Met specifications as required" },
          { label: "Memerlukan Penambahbaikan / Needs Improvement", my: "Memenuhi spesifikasi yang ditetapkan dalam kontrak dengan pembetulan", en: "Met specifications with resubmissions" },
          { label: "Tidak memuaskan / Unacceptable", my: "Tidak memenuhi specifikasi yang ditetapkan dalam kontrak ( Contoh: TNBD- Sub Kontraktor)", en: "Did not comply to specification (E.g.TNBD - involve sub-contracting)" }
        ]
      },
      {
        id: "q3",
        my: "Bagaimana anda menilai pembekal / kontraktor ini dari segi PENGENDALIAN DAN PENJAGAAN bahan-bahan (material) dari mula ambil dari stor sehingga projek selesai (mengikut ISO)?",
        en: "How would you rate the supplier / contractor for USAGE / HANDLING / MAINTENANCE OF TOOLS AND EQUIPMENT as per the industrial standard (ISO)?",
        options: [
          { label: "Cemerlang / Excellent", my: "Tiada kerosakan dikesan dan dalam keadaan yang baik dan mempunyai initisiatif– Pelabelan, penandaan dan pemisahan item, melantik pengawal di premis", en: "Items kept in order, good condition and extra initiatives taken such as labelling, tagging, segregation of item, guard on site" },
          { label: "Baik / Acceptable", my: "Barang dalam keadaan yang baik dan teratur", en: "Item are kept in good condition and in order" },
          { label: "Memerlukan Penambahbaikan / Needs Improvement", my: "Barang dalam keadaan yang baik tetapi tidak teratur", en: "Item are kept in good condition but not in order" },
          { label: "Tidak memuaskan / Unacceptable", my: "Kerosakan teruk dan perlu diganti oleh pihak kontraktor / Barang hilang", en: "Item are damage/missing and need to be replaced" }
        ]
      },
      {
        id: "q4",
        my: "Bagaimana anda menilai pembekal/kontraktor dari segi KUALITI DAN KELENGKAPAN DOKUMEN KERJA/ LAPORAN? (Contoh: TNB Distribution LKS Checklist, Sijil Akuan Selesai)",
        en: "How would you rate the supplier/ contractor in term of their quality of WORK DOCUMENTS/FINAL REPORTS?",
        options: [
          { label: "Cemerlang / Excellent", my: "Dokumentasi lengkap dan kaedah pemfailan yang baik (Labeling dan softcopy disediakan)", en: "Complete documentation and good filing method (Labelling and softcopy provided)" },
          { label: "Baik / Acceptable", my: "Dokumentasi yang lengkap", en: "Complete documentation" },
          { label: "Memerlukan Penambahbaikan / Needs Improvement", my: "Dokumentasi yang lengkap dengan penghantaran semula", en: "Complete documentation with rework" },
          { label: "Tidak memuaskan / Unacceptable", my: "Dokumentasi tidak lengkap / kesilapan", en: "Incomplete / Incorrect documentation" }
        ]
      },
      {
        id: "q5",
        my: "Adakah terdapat sebarang ADUAN YANG BERTULIS daripada PBT (Pihak Berkuasa Tempatan), Jabatan Alam Sekitar, Suruhanjaya Tenaga, orang awam / Staf TNB dan media sosial?",
        en: "Was there any WRITTEN VIOLATION OF ANY POLICIIES/REGULATION raised from LOCAL AUTHORITIES (PBTs), Legal Authority, Energy Commission, Environmental department, social media PUBLIC or TNB STAFF?",
        options: [
          { label: "Cemerlang / Excellent", my: "Tiada aduan", en: "No Complaints" },
          { label: "Memerlukan Penambahbaikan / Needs Improvement", my: "Segera menyelesaikan aduan yang diterima", en: "Complaints with no delay in timeline" },
          { label: "Tidak memuaskan / Unacceptable", my: "Aduan yang diterima diselesaikan dengan lambat / Tidak mengendahkan aduan", en: "Complaints leading to stop work or delay in timeline" }
        ]
      },
      {
        id: "q6",
        my: "Bagaimana anda menilai pembekal / kontraktor dari segi ISU-ISU YANG DIBANGKIT oleh pihak ketiga kepada TNB seperti LAD yang ditanggung, ganti rugi, aduan, Notice to Correct (NTC) & tindakan susulan (yang disebabkan oleh kontraktor)?",
        en: "How would you rate the supplier/ contractor in RESOLVING THE ISSUES RAISED by a Third Party to TNB- damages, Notice to Correct (NTCs) and follow-ups?",
        options: [
          { label: "Baik / Acceptable", my: "Dapat menyelesaikan isu, memenuhi permintaan ad hoc & pertanyaan tepat pada masanya. Tiada implikasi terhadap TNB (Masa /kos)", en: "Issues resolved within agreed time, no impact to TNB (time/ cost/ resources)" },
          { label: "Tidak memuaskan / Unacceptable", my: "Tidak dapat menyelesaikan isu dalam masa yang ditetapkan / Isu diselesaikan lambat dengan implikasi yang tinggi terhadap TNB (Masa / Kos)", en: "Issues not resolved or resolved with delays leading to high impact to TNB (time/ cost/ resources)" }
        ]
      }
    ]
  },
  {
    key: "delivery",
    title: "KRITERIA: PENGHANTARAN (DELIVERY) (20%)",
    questions: [
      {
        id: "q1",
        my: "[Dijana automatik dari tarikh di skrin SE] Bagaimana anda menilai pembekal/ kontraktor dari segi KETEPATAN MASA penyiapan kerja yang DIRANCANG berbanding kerja yang disiapkan, berdasarkan tarikh Timeliness-Service di skrin SE? (PLANNED VS ACTUAL)?",
        en: "Automated base on the dates in SE screen] How would you rate the supplier/ contractor for ACTUAL vs PLANNED PERFORMANCE for each activity, selected based on Timeliness-Service in SE screen?",
        options: [
          { label: "Cemerlang / Excellent", my: "Kerja disiapkan lebih awal daripada masa dalam perancangan yang dipersetujui bersama semasa kick off meeting", en: "Delivered earlier than agreed date" },
          { label: "Baik / Acceptable", my: "Kerja disiapkan berdasarkan masa yang ditetapkan semasa kick off meeting", en: "Delivers as per the agreed date" },
          { label: "Tidak memuaskan / Unacceptable", my: "Kerja disiapkan lebih lewat daripada masa yang ditetapkan dan tiada implikasi terhadap TNB (Masa /kos/sumber)", en: "Delivers passed the target date" }
        ]
      },
      {
        id: "q2",
        my: "Bagaimana anda menilai pembekal / kontraktor dari segi KETEPATAN MASA DALAM PENYERAHAN DOKUMEN iaitu penyerahan dokumen, laporan, Sijil Akuan Selesai, lukisan, manual, invois dan lain-lain?",
        en: "How would you rate the supplier / contractor for TIMELY and ACCURATE SUBMISSION OF DOCUMENTS i.e. reports, drawings, manuals, Sijil Akuan Selesai, invoices etc.?",
        options: [
          { label: "Cemerlang / Excellent", my: "Dokumentasi Lengkap dan dihantar lebih awal dalam masa yang ditetapkan)", en: "Ahead of time, no resubmission" },
          { label: "Baik / Acceptable", my: "Dokumen lengkap dan dihantar dalam masa yang ditetapkan", en: "On time, no resubmission" },
          { label: "Memerlukan Penambahbaikan / Needs Improvement", my: "Dokumen lengkap dan dihantar tetapi memerlukan galakan dari pihak TNB (Follow up)", en: "On time, resubmission with valid reasons" },
          { label: "Tidak memuaskan / Unacceptable", my: "Dokumen dihantar Lewat / Pembetulan berulang kali/ Tidak lengkap", en: "Delayed submission, resubmissions due to supplier/ contractor fault" }
        ]
      }
    ]
  },
  {
    key: "responsiveness",
    title: "KRITERIA: MAKLUMBALAS (RESPONSIVENESS) (10%)",
    questions: [
      {
        id: "q1",
        my: "Bagaimana anda menilai pembekal / kontraktor dari segi KERJASAMA / MAKLUMBALAS yang diberi atas PERMINTAAN Kecemasan (AD-HOC)?",
        en: "How would you rate the supplier/ contractor for COOPERATION and RESPONSIVENESS on ad-hoc request?",
        options: [
          { label: "Cemerlang / Excellent", my: "Tiada isu dan dapat memenuhi permintaan ad hoc dan pertanyaan tepat pada masanya / inisiatif", en: "Quick resolution, extra initiatives taken" },
          { label: "Baik / Acceptable", my: "Memberi maklumbalas yang cepat terhadap permintaan dan persoalan", en: "Met expectations" },
          { label: "Memerlukan Penambahbaikan / Needs Improvement", my: "Permintaan berulang kali untuk mendapatkan tindak balas", en: "Repeated efforts/ follow-ups by TNB" },
          { label: "Tidak memuaskan / Unacceptable", my: "Tiada memberi kerjasama / maklumbalas langsung / Lewat", en: "Did not meet expectations, no urgency to respond" }
        ]
      },
      {
        id: "q2",
        my: "Bagaimana anda menilai tahap PENYELESAIAN ADUAN dari hasil kerja yang dijalankan oleh pembekal/kontraktor berdasarkan MASA YANG DITETAPKAN?",
        en: "Does the supplier/ contractor RESOLVES COMPLAINTS/ISSUES in AGREED LEAD TIME?",
        options: [
          { label: "Cemerlang / Excellent", my: "Semua aduan diselesaikan dalam masa yang ditetapkan", en: "Within agreed lead time, fast response, no complaints/issues" },
          { label: "Memerlukan penambahbaikan / Needs Improvement", my: "Aduan diselesaikan dengan kelewatan tetapi atas dasar alasan kukuh, Tiada implikasi terhadap TNB", en: "Delay with valid reason and no impact to TNB" },
          { label: "Tidak diterima / Unacceptable", my: "Aduan diselesaikan dengan kelewatan, Implikasi yang tinggi terhadap TNB", en: "Delays with impact to TNB, slow/no response" }
        ]
      }
    ]
  },
  {
    key: "ehs",
    title: "KRITERIA: EHS (KESELAMATAN) (25%)",
    questions: [
      {
        id: "q1",
        my: "Bagaimana anda menilai pembekal / kontraktor dari segi kepatuhan kepada prosedur keselamatan TNB HEALTH, SAFETY and ENVIRONMENT (HSE)?",
        en: "How would you rate the supplier/ contractor for COMPLIANCE to TNB Health, Safety, Environment and Quality (HSEQ) PROCEDURES?",
        options: [
          { label: "Cemerlang / Excellent", my: "Pematuhan kepada semua keperluan keselamatan TNB", en: "Follows all safety procedures as per set standards" },
          { label: "Memerlukan penambahbaikan / Needs Improvement", my: "Memerlukan panduan dan bimbingan daripada TNB untuk memastikan semua keperluan keselamatan dipatuhi", en: "Requires guidance and follow-ups from TNB to ensure safety procedures are followed" },
          { label: "Tidak diterima / Unacceptable", my: "Tidak mematuhi keperluan keselamantan TNB", en: "Does not follow safety procedures or safety incidents" }
        ]
      },
      {
        id: "q2",
        my: "Semasa melaksanakan kerja / perkhidmatan, adakah terdapat sebarang INSIDEN KESELAMATAN yang dilaporkan disebabkan oleh pembekal / kontraktor?",
        en: "During the service delivery, were there any SAFETY INCIDENTS?",
        options: [
          { label: "Cemerlang / Excellent", my: "Tiada insiden yang dilaporkan semasa/selepas kerja dijalankan, pelan pengurusan risiko yang baik, zero LTI (Lost Injury Time)", en: "No incidents, good risk management plan, zero LTI and no incidents, no near misses" },
          { label: "Memerlukan penambahbaikan / Needs Improvement", my: "Tiada insiden yang dilaporkan semasa/selepas kerja dijalankan dan insiden hampir terlepas (near misses), No LTI", en: "No incidents but have near misses, No LTI" },
          { label: "Tidak diterima / Unacceptable", my: "LTI (Lost Injury Time) >= 1", en: "LTI (Lost Injury Time) >= 1" }
        ]
      },
      {
        id: "q3",
        my: "Semasa melaksanakan kerja / perkhidmatan, adakah terdapat sebarang INSIDEN KESELAMATAN DAN KESIHATAN yang dilaporkan BERKAITAN DENGAN ALAM SEKITAR?",
        en: "During the service delivery, were there any ENVIRONMENTAL INCIDENTS?",
        options: [
          { label: "Cemerlang / Excellent", my: "Tiada insiden (Green initiatives)", en: "No incidents, recognizes green initiative" },
          { label: "Tidak diterima / Unacceptable", my: "Terdapat Insiden (>=1) (Pengurusan sisa, tumpahan minyak)", en: "Incidents, Oil Leaks / non managed Waste management" }
        ]
      }
    ]
  }
];
