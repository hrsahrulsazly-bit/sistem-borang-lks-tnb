/* ============================================================
   Sistem Borang LKS - TNB
   State management, rendering, cross-page binding, print & save
   ============================================================ */

const STORAGE_KEY = "tnbLksFormData_v1";

const PAGE_META = {
  checklist:  { title: "SENARAI SEMAK LKS", code: "ENGR-1401-PSI" },
  akselesai:  { title: "SURAT AKUAN KERJA SELESAI", code: "ENGR-1402-PSI" },
  case:       { title: "CASE (Contractor and Supplier Evaluation)", code: "ARAHAN/PANDUAN" },
  bq:         { title: "BQ LKS (Laporan Kerja Selesai / BQ Sebenar)", code: "" },
  jms:        { title: "JMS (Borang Joint Management Sheet)", code: "" },
  imbangan:   { title: "Jadual Imbangan Penggunaan Bahan", code: "ENGR-1403-PSI" },
  fieldbook:  { title: "Laporan Harian Penyelia", code: "ENGR-1201-PSI" },
  amk:        { title: "Arahan Mula Kerja (AMK)", code: "ENGR-1104-PSI" },
  gantt:      { title: "Carta Perbatuan Perancangan Kerja (Gantt)", code: "ENGR-1105-PSI" },
  records:    { title: "Rekod Tersimpan (Online)", code: "" }
};

/* Cloud save/load (page 10) only works when this file is actually served over
   http(s) by Vercel - a plain double-clicked index.html (file://) has no
   server behind it to answer /api/* requests. */
const CLOUD_ENABLED = typeof location !== "undefined" && location.protocol !== "file:";

function defaultState() {
  return {
    common: {},
    checklist: CHECKLIST_ITEMS.map(i => ({ ...i })),
    lineItems: Array.from({ length: 10 }, emptyLineItem),
    materialUsage: [ emptyMaterialRow() ],
    serviceEntries: [ emptyServiceEntry() ],
    amkJenisKerja: {},
    caseAnswers: {},
    fieldbook: {
      dates: ["", "", "", "", "", "", ""],
      rows: [ { label: "" } ]
    },
    gantt: {
      weeks: 5,
      tasks: [ emptyGanttTask() ],
      doneCells: []
    }
  };
}

function emptyLineItem() {
  return { item: "", serviceId: "", desc: "", unit: "", qtyActual: "", qtyPO: "", rate: "" };
}
function emptyMaterialRow() {
  return { noKatalog: "", keterangan: "", kodUnit: "", kuantitiKeluar: "", kuantitiGuna: "", noCreditNote: "", skrapKg: "", skrapM: "", noSkrap: "" };
}
function emptyServiceEntry() {
  return { seNo: "", po: "", claimed: "" };
}
function emptyGanttTask() {
  return { desc: "", jumlahSasaran: "", targetCells: [], actualCells: [], jumlahHariPlan: "", jumlahHariActual: "", kemajuan: "", catatan: "" };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return {
      common: Object.assign(base.common, parsed.common || {}),
      checklist: parsed.checklist && parsed.checklist.length ? parsed.checklist : base.checklist,
      lineItems: parsed.lineItems && parsed.lineItems.length ? parsed.lineItems : base.lineItems,
      materialUsage: parsed.materialUsage && parsed.materialUsage.length ? parsed.materialUsage : base.materialUsage,
      serviceEntries: parsed.serviceEntries && parsed.serviceEntries.length ? parsed.serviceEntries : base.serviceEntries,
      amkJenisKerja: parsed.amkJenisKerja || {},
      caseAnswers: parsed.caseAnswers || {},
      fieldbook: parsed.fieldbook || base.fieldbook,
      gantt: Object.assign(base.gantt, parsed.gantt || {})
    };
  } catch (e) {
    console.warn("Gagal memuatkan data tersimpan, guna data lalai.", e);
    return defaultState();
  }
}

let saveTimer = null;
let hasUnsavedCloudChanges = false;
function saveState() {
  hasUnsavedCloudChanges = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, 250);
}

// Warn before closing/leaving the tab if there are edits not yet sent to the
// cloud (page 10) - workers commonly close the tab thinking it auto-saved
// online, when only the local browser copy was updated.
window.addEventListener("beforeunload", (e) => {
  if (!hasUnsavedCloudChanges) return;
  e.preventDefault();
  e.returnValue = "";
  return "";
});

function fmtMoney(n) {
  const v = Number(n) || 0;
  return "RM" + v.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------------- Computed totals ---------------- */
function computeTotals() {
  let totalPO = 0, totalActual = 0;
  state.lineItems.forEach(li => {
    const rate = parseFloat(li.rate) || 0;
    const qtyPO = parseFloat(li.qtyPO) || 0;
    const qtyActual = parseFloat(li.qtyActual) || 0;
    totalPO += rate * qtyPO;
    totalActual += rate * qtyActual;
  });

  let sePO = 0, seClaimed = 0;
  state.serviceEntries.forEach(se => {
    sePO += parseFloat(se.po) || 0;
    seClaimed += parseFloat(se.claimed) || 0;
  });

  const qsTotal = ["qs1", "qs2", "qs3", "qs4", "qs5", "qs6", "qs7"]
    .reduce((sum, key) => sum + (parseFloat(state.common[key]) || 0), 0);

  return {
    bqTotalPO: totalPO, bqTotalActual: totalActual, bqTotalDiff: totalPO - totalActual,
    seTotalPO: sePO, seTotalClaimed: seClaimed,
    qsTotal: qsTotal
  };
}

function refreshDisplays() {
  const totals = computeTotals();
  state.common.totalClaimed = totals.bqTotalActual;

  document.querySelectorAll("[data-display]").forEach(el => {
    const key = el.getAttribute("data-display");
    let val;
    if (key in totals) val = totals[key];
    else val = state.common[key];
    el.textContent = fmtMoney(val);
  });
  document.querySelectorAll("[data-display-num]").forEach(el => {
    const key = el.getAttribute("data-display-num");
    const val = key in totals ? totals[key] : state.common[key];
    el.textContent = val ? Number(val).toString() : "0";
  });

  // mirror readonly fields bound to computed totalClaimed
  document.querySelectorAll('[data-field="totalClaimed"], [data-field="totalClaimed_mirror"]').forEach(el => {
    el.value = totals.bqTotalActual ? totals.bqTotalActual.toFixed(2) : "";
  });
  document.querySelectorAll('[data-field="totalPO_mirror"]').forEach(el => {
    el.value = state.common.totalPO || "";
  });
}

/* ---------------- Generic common-field binding ---------------- */
function bindCommonFields() {
  document.querySelectorAll("[data-field]").forEach(el => {
    const key = el.getAttribute("data-field");
    if (key === "totalClaimed" || key === "totalClaimed_mirror" || key === "totalPO_mirror") return; // computed/readonly mirrors
    if (key in state.common) el.value = state.common[key];
    el.addEventListener("input", () => {
      state.common[key] = el.value;
      document.querySelectorAll(`[data-field="${key}"]`).forEach(other => { if (other !== el) other.value = el.value; });
      if (key === "poNumber") {
        // PO number mirrored in checklist row 9 ("SALINAN PURCHASE ORDER (PO)") without rebuilding the whole table
        const poCell = document.querySelector('[data-cl-field="dokumen"][data-cl-idx="8"]');
        if (poCell) poCell.value = el.value;
      }
      refreshDisplays();
      saveState();
    });
  });
}

/* ---------------- Generic radio-group binding (single-choice, stored in state.common) ---------------- */
function bindRadioGroups() {
  document.querySelectorAll("[data-radio-field]").forEach(el => {
    const key = el.getAttribute("data-radio-field");
    el.checked = state.common[key] === el.value;
    el.addEventListener("change", () => {
      state.common[key] = el.value;
      saveState();
    });
  });
}

/* ---------------- 1. Checklist ---------------- */
function renderChecklist() {
  const body = document.getElementById("checklist-body");
  body.innerHTML = state.checklist.map((row, i) => {
    const dokumen = row.dokumenFromPO ? (state.common.poNumber || "") : row.dokumen;
    return `<tr>
      <td style="text-align:center">${row.no}</td>
      <td><textarea class="perkara-cell" rows="1" data-cl-field="perkara" data-cl-idx="${i}">${escapeHtml(row.perkara)}</textarea></td>
      <td>${row.dokumenFromPO
        ? `<input type="text" value="${escapeAttr(dokumen)}" data-cl-field="dokumen" data-cl-idx="${i}" placeholder="No. PO">`
        : `<input type="text" value="${escapeAttr(row.dokumen)}" data-cl-field="dokumen" data-cl-idx="${i}">`}</td>
      <td>
        <select data-cl-field="status" data-cl-idx="${i}" class="status-${row.status}">
          <option value="ADA" ${row.status === "ADA" ? "selected" : ""}>ADA</option>
          <option value="TIADA" ${row.status === "TIADA" ? "selected" : ""}>TIADA</option>
        </select>
      </td>
    </tr>`;
  }).join("");

  body.querySelectorAll("[data-cl-field]").forEach(el => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.getAttribute("data-cl-idx"), 10);
      const field = el.getAttribute("data-cl-field");
      state.checklist[idx][field] = el.value;
      if (field === "status") el.className = "status-" + el.value;
      if (field === "perkara") autoGrowTextarea(el);
      saveState();
    });
    el.addEventListener("change", () => {
      const idx = parseInt(el.getAttribute("data-cl-idx"), 10);
      const field = el.getAttribute("data-cl-field");
      state.checklist[idx][field] = el.value;
      saveState();
    });
  });

  // wrap long PERKARA text onto as many lines as it needs, sized to fit exactly
  body.querySelectorAll("textarea.perkara-cell").forEach(autoGrowTextarea);
}

function autoGrowTextarea(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

/* ---------------- Shared line items (BQ + JMS) ----------------
   Both tables render from the same state.lineItems array. Typing in one
   field must NOT rebuild the table's innerHTML (that would destroy the
   input the user is actively typing in and drop keyboard focus after
   every character) - so on "input" we only patch the computed amount
   cells in place and mirror the raw value into the other table's twin
   input. Full rebuilds only happen on add/remove row. */
function renderLineItems() {
  renderBqBody();
  renderJmsBody();
  refreshDisplays();
}

function lineAmounts(li) {
  const rate = parseFloat(li.rate) || 0;
  const amtActual = rate * (parseFloat(li.qtyActual) || 0);
  const amtPO = rate * (parseFloat(li.qtyPO) || 0);
  return { amtActual, amtPO, diff: amtPO - amtActual };
}

function renderBqBody() {
  const body = document.getElementById("bq-body");
  if (!body) return;
  body.innerHTML = state.lineItems.map((li, i) => {
    const { amtActual, amtPO, diff } = lineAmounts(li);
    const seNo = (state.serviceEntries[i] && state.serviceEntries[i].seNo) || "";
    return `<tr>
      <td style="text-align:center">${i + 1}</td>
      <td class="li-service-id" id="bq-serviceId-${i}" style="text-align:center">${escapeHtml(seNo)}</td>
      <td><input type="text" data-li-idx="${i}" data-li-field="desc" value="${escapeAttr(li.desc)}"></td>
      <td><input type="text" data-li-idx="${i}" data-li-field="unit" value="${escapeAttr(li.unit)}"></td>
      <td><input type="number" step="any" data-li-idx="${i}" data-li-field="qtyActual" value="${escapeAttr(li.qtyActual)}"></td>
      <td><input type="number" step="any" data-li-idx="${i}" data-li-field="qtyPO" value="${escapeAttr(li.qtyPO)}"></td>
      <td><input type="number" step="any" data-li-idx="${i}" data-li-field="rate" value="${escapeAttr(li.rate)}"></td>
      <td style="text-align:right" id="bq-amtActual-${i}">${amtActual ? amtActual.toFixed(2) : ""}</td>
      <td style="text-align:right" id="bq-amtPO-${i}">${amtPO ? amtPO.toFixed(2) : ""}</td>
      <td style="text-align:right" id="bq-diff-${i}">${diff ? diff.toFixed(2) : ""}</td>
      <td class="no-print"><button class="del-row-btn" data-del-li="${i}">✕</button></td>
    </tr>`;
  }).join("");
  wireLineItemInputs(body);
}

function renderJmsBody() {
  const body = document.getElementById("jms-body");
  if (!body) return;
  body.innerHTML = state.lineItems.map((li, i) => {
    const { amtActual, amtPO } = lineAmounts(li);
    const seNo = (state.serviceEntries[i] && state.serviceEntries[i].seNo) || "";
    return `<tr>
      <td style="text-align:center">${i + 1}</td>
      <td class="li-service-id" id="jms-serviceId-${i}" style="text-align:center">${escapeHtml(seNo)}</td>
      <td><input type="text" data-li-idx="${i}" data-li-field="desc" value="${escapeAttr(li.desc)}"></td>
      <td><input type="text" data-li-idx="${i}" data-li-field="unit" value="${escapeAttr(li.unit)}"></td>
      <td><input type="number" step="any" data-li-idx="${i}" data-li-field="rate" value="${escapeAttr(li.rate)}"></td>
      <td><input type="number" step="any" data-li-idx="${i}" data-li-field="qtyPO" value="${escapeAttr(li.qtyPO)}"></td>
      <td style="text-align:right" id="jms-amtPO-${i}">${amtPO ? amtPO.toFixed(2) : ""}</td>
      <td><input type="number" step="any" data-li-idx="${i}" data-li-field="qtyActual" value="${escapeAttr(li.qtyActual)}"></td>
      <td style="text-align:right" id="jms-amtActual-${i}">${amtActual ? amtActual.toFixed(2) : ""}</td>
    </tr>`;
  }).join("");
  wireLineItemInputs(body);
}

function wireLineItemInputs(container) {
  container.querySelectorAll("[data-li-field]").forEach(el => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.getAttribute("data-li-idx"), 10);
      const field = el.getAttribute("data-li-field");
      state.lineItems[idx][field] = el.value;

      // patch computed amount cells in place (no rebuild -> keeps focus)
      const { amtActual, amtPO, diff } = lineAmounts(state.lineItems[idx]);
      setCellText(`bq-amtActual-${idx}`, amtActual);
      setCellText(`bq-amtPO-${idx}`, amtPO);
      setCellText(`bq-diff-${idx}`, diff);
      setCellText(`jms-amtPO-${idx}`, amtPO);
      setCellText(`jms-amtActual-${idx}`, amtActual);

      // mirror the raw value into the twin input on the other table
      const otherId = container.id === "bq-body" ? "jms-body" : "bq-body";
      const otherEl = document.querySelector(`#${otherId} [data-li-idx="${idx}"][data-li-field="${field}"]`);
      if (otherEl && otherEl.value !== el.value) otherEl.value = el.value;

      refreshDisplays();
      saveState();
    });
  });
  container.querySelectorAll("[data-del-li]").forEach(el => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.getAttribute("data-del-li"), 10);
      state.lineItems.splice(idx, 1);
      if (!state.lineItems.length) state.lineItems.push(emptyLineItem());
      renderLineItems();
      saveState();
    });
  });
}

function setCellText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ? val.toFixed(2) : "";
}

/* ---------------- Service Entry table (shared: AK Selesai + CASE) ---------------- */
function renderServiceEntries() {
  ["se-body-ak", "se-body-case"].forEach(id => {
    const body = document.getElementById(id);
    if (!body) return;
    body.innerHTML = state.serviceEntries.map((se, i) => `<tr>
      <td><input type="text" data-se-idx="${i}" data-se-field="seNo" value="${escapeAttr(se.seNo)}"></td>
      <td><input type="number" step="0.01" data-se-idx="${i}" data-se-field="po" value="${escapeAttr(se.po)}"></td>
      <td><input type="number" step="0.01" data-se-idx="${i}" data-se-field="claimed" value="${escapeAttr(se.claimed)}"></td>
      <td class="no-print"><button class="del-row-btn" data-del-se="${i}">✕</button></td>
    </tr>`).join("");

    body.querySelectorAll("[data-se-field]").forEach(el => {
      el.addEventListener("input", () => {
        const idx = parseInt(el.getAttribute("data-se-idx"), 10);
        const field = el.getAttribute("data-se-field");
        state.serviceEntries[idx][field] = el.value;

        // mirror the raw value into the twin input on the other page's table
        const otherId = body.id === "se-body-ak" ? "se-body-case" : "se-body-ak";
        const otherEl = document.querySelector(`#${otherId} [data-se-idx="${idx}"][data-se-field="${field}"]`);
        if (otherEl && otherEl.value !== el.value) otherEl.value = el.value;

        // each Service Entry row's number doubles as the Service ID for the
        // SAME-numbered row in BQ LKS / JMS (row 1 SE -> row 1 Service ID, etc.)
        if (field === "seNo") syncServiceIdFromSE(idx);

        refreshDisplays();
        saveState();
      });
    });
    body.querySelectorAll("[data-del-se]").forEach(el => {
      el.addEventListener("click", () => {
        const idx = parseInt(el.getAttribute("data-del-se"), 10);
        state.serviceEntries.splice(idx, 1);
        if (!state.serviceEntries.length) state.serviceEntries.push(emptyServiceEntry());
        renderServiceEntries();
        syncAllServiceIds();
        refreshDisplays();
        saveState();
      });
    });
  });
}

// update just row `idx`'s Service ID cells (in place, keeps focus elsewhere)
function syncServiceIdFromSE(idx) {
  const seNo = (state.serviceEntries[idx] && state.serviceEntries[idx].seNo) || "";
  const bqEl = document.getElementById(`bq-serviceId-${idx}`);
  if (bqEl) bqEl.textContent = seNo;
  const jmsEl = document.getElementById(`jms-serviceId-${idx}`);
  if (jmsEl) jmsEl.textContent = seNo;
}

// re-sync every row (used after add/remove rows shift indices)
function syncAllServiceIds() {
  state.lineItems.forEach((li, i) => syncServiceIdFromSE(i));
}

/* ---------------- Material usage (Jadual Imbangan) ---------------- */
function renderMaterialUsage() {
  const body = document.getElementById("imbangan-body");
  if (!body) return;
  body.innerHTML = state.materialUsage.map((r, i) => `<tr>
    <td style="text-align:center">${i + 1}</td>
    <td><input type="text" data-mu-idx="${i}" data-mu-field="noKatalog" value="${escapeAttr(r.noKatalog)}"></td>
    <td><input type="text" data-mu-idx="${i}" data-mu-field="keterangan" value="${escapeAttr(r.keterangan)}"></td>
    <td><input type="text" data-mu-idx="${i}" data-mu-field="kodUnit" value="${escapeAttr(r.kodUnit)}"></td>
    <td><input type="number" step="any" data-mu-idx="${i}" data-mu-field="kuantitiKeluar" value="${escapeAttr(r.kuantitiKeluar)}"></td>
    <td><input type="number" step="any" data-mu-idx="${i}" data-mu-field="kuantitiGuna" value="${escapeAttr(r.kuantitiGuna)}"></td>
    <td style="text-align:right" id="mu-kredit-${i}">${computeKredit(r)}</td>
    <td><input type="text" data-mu-idx="${i}" data-mu-field="noCreditNote" value="${escapeAttr(r.noCreditNote)}"></td>
    <td><input type="number" step="any" data-mu-idx="${i}" data-mu-field="skrapKg" value="${escapeAttr(r.skrapKg)}"></td>
    <td><input type="number" step="any" data-mu-idx="${i}" data-mu-field="skrapM" value="${escapeAttr(r.skrapM)}"></td>
    <td><input type="text" data-mu-idx="${i}" data-mu-field="noSkrap" value="${escapeAttr(r.noSkrap)}"></td>
    <td class="no-print"><button class="del-row-btn" data-del-mu="${i}">✕</button></td>
  </tr>`).join("");

  body.querySelectorAll("[data-mu-field]").forEach(el => {
    el.addEventListener("input", () => {
      const idx = parseInt(el.getAttribute("data-mu-idx"), 10);
      const field = el.getAttribute("data-mu-field");
      state.materialUsage[idx][field] = el.value;
      const kreditCell = document.getElementById(`mu-kredit-${idx}`);
      if (kreditCell) kreditCell.textContent = computeKredit(state.materialUsage[idx]);
      saveState();
    });
  });
  body.querySelectorAll("[data-del-mu]").forEach(el => {
    el.addEventListener("click", () => {
      const idx = parseInt(el.getAttribute("data-del-mu"), 10);
      state.materialUsage.splice(idx, 1);
      if (!state.materialUsage.length) state.materialUsage.push(emptyMaterialRow());
      renderMaterialUsage();
      saveState();
    });
  });
}
function computeKredit(r) {
  const k = (parseFloat(r.kuantitiKeluar) || 0) - (parseFloat(r.kuantitiGuna) || 0);
  return k ? k.toFixed(2) : "";
}

/* ---------------- AMK jenis kerja checkboxes ---------------- */
function renderAmkJenisKerja() {
  const wrap = document.getElementById("amk-jeniskerja");
  if (!wrap) return;
  wrap.innerHTML = JENIS_KERJA_OPTIONS.map(opt => `
    <div class="row">
      <div class="box"><input type="checkbox" class="chk-box" data-jk="${escapeAttr(opt)}" ${state.amkJenisKerja[opt] ? "checked" : ""}></div>
      <div class="lbl">${opt}</div>
    </div>`).join("");
  wrap.querySelectorAll("[data-jk]").forEach(el => {
    el.addEventListener("change", () => {
      state.amkJenisKerja[el.getAttribute("data-jk")] = el.checked;
      saveState();
    });
  });
}

/* ---------------- CASE questionnaire ---------------- */
function renderCaseQuestions() {
  const wrap = document.getElementById("case-questions");
  if (!wrap) return;
  wrap.innerHTML = CASE_SECTIONS.map(section => {
    const qs = section.questions.map((q, qi) => {
      const ansKey = `${section.key}_${q.id}`;
      if (!state.caseAnswers[ansKey]) state.caseAnswers[ansKey] = { rating: "", comment: "" };
      const ans = state.caseAnswers[ansKey];
      const opts = q.options.map((o, oi) => `
        <label class="case-opt">
          <input type="radio" name="case_${ansKey}" value="${oi}" ${String(ans.rating) === String(oi) ? "checked" : ""} data-case-key="${ansKey}">
          <span class="lbl">${o.label}</span>
          <span class="desc"><span class="my">${o.my}</span><span class="en">${o.en}</span></span>
        </label>`).join("");
      return `<div class="case-q">
        <div class="q-head"><span class="my">${qi + 1}. ${q.my}</span><br><span class="en">${q.en}</span></div>
        <div class="options">${opts}</div>
        <div class="comment"><label>Komen: (Max 60 perkataan)</label>
          <textarea data-case-comment="${ansKey}">${escapeHtml(ans.comment)}</textarea>
        </div>
      </div>`;
    }).join("");
    return `<div class="case-section-title">${section.title}</div>${qs}`;
  }).join("");

  wrap.querySelectorAll("[data-case-key]").forEach(el => {
    el.addEventListener("change", () => {
      state.caseAnswers[el.getAttribute("data-case-key")].rating = el.value;
      saveState();
    });
  });
  wrap.querySelectorAll("[data-case-comment]").forEach(el => {
    el.addEventListener("input", () => {
      state.caseAnswers[el.getAttribute("data-case-comment")].comment = el.value;
      saveState();
    });
  });
}

/* ---------------- Field book (Laporan Harian) ---------------- */
function renderFieldbook() {
  const headTr = document.getElementById("fb-header-row");
  const body = document.getElementById("fieldbook-body");
  if (!headTr || !body) return;

  headTr.innerHTML = `<th style="min-width:220px">SKOP KERJA \\ TARIKH</th>` +
    state.fieldbook.dates.map((d, ci) => `<th><input type="date" data-fb-date="${ci}" value="${escapeAttr(d)}"></th>`).join("") +
    `<th style="min-width:90px">JUMLAH MINGGUAN</th>`;

  body.innerHTML = state.fieldbook.rows.map((row, ri) => {
    const cells = state.fieldbook.dates.map((d, ci) => {
      const val = row[`c${ci}`] || "";
      return `<td><input type="text" data-fb-row="${ri}" data-fb-col="${ci}" value="${escapeAttr(val)}"></td>`;
    }).join("");
    return `<tr>
      <td><input type="text" data-fb-label="${ri}" value="${escapeAttr(row.label)}"></td>
      ${cells}
      <td><input type="text" data-fb-total="${ri}" value="${escapeAttr(row.total || "")}"></td>
    </tr>`;
  }).join("");

  headTr.querySelectorAll("[data-fb-date]").forEach(el => {
    el.addEventListener("input", () => {
      state.fieldbook.dates[parseInt(el.getAttribute("data-fb-date"), 10)] = el.value;
      saveState();
    });
  });
  body.querySelectorAll("[data-fb-label]").forEach(el => {
    el.addEventListener("input", () => {
      state.fieldbook.rows[parseInt(el.getAttribute("data-fb-label"), 10)].label = el.value;
      saveState();
    });
  });
  body.querySelectorAll("[data-fb-row]").forEach(el => {
    el.addEventListener("input", () => {
      const ri = parseInt(el.getAttribute("data-fb-row"), 10);
      const ci = el.getAttribute("data-fb-col");
      state.fieldbook.rows[ri][`c${ci}`] = el.value;
      saveState();
    });
  });
  body.querySelectorAll("[data-fb-total]").forEach(el => {
    el.addEventListener("input", () => {
      state.fieldbook.rows[parseInt(el.getAttribute("data-fb-total"), 10)].total = el.value;
      saveState();
    });
  });
}

/* ---------------- Gantt chart ---------------- */
function renderGantt() {
  const table = document.getElementById("gantt-table");
  if (!table) return;
  const weeks = state.gantt.weeks;
  const totalDays = weeks * 7;

  let headRow1 = `<tr><th class="task-col" rowspan="2">Keterangan Kerja-kerja</th><th class="qty-col" rowspan="2">Jumlah Sasaran</th>`;
  for (let w = 0; w < weeks; w++) headRow1 += `<th colspan="7">Minggu ${w + 1}</th>`;
  headRow1 += `<th class="qty-col" rowspan="2">Jumlah Hari</th><th class="qty-col" rowspan="2">Kemajuan (%)</th><th class="qty-col" rowspan="2">CATATAN</th></tr>`;
  let headRow2 = `<tr>`;
  for (let w = 0; w < weeks; w++) WEEK_DAYS.forEach(d => headRow2 += `<th>${d}</th>`);
  headRow2 += `</tr>`;

  let body = "";
  state.gantt.tasks.forEach((task, ti) => {
    while (task.targetCells.length < totalDays) task.targetCells.push(false);
    while (task.actualCells.length < totalDays) task.actualCells.push(false);

    let targetCells = "";
    let actualCells = "";
    for (let d = 0; d < totalDays; d++) {
      targetCells += `<td class="day-cell" data-mark="${task.targetCells[d] ? "T" : ""}" data-gt="${ti}" data-gtype="target" data-gday="${d}">${task.targetCells[d] ? "T" : ""}</td>`;
      actualCells += `<td class="day-cell" data-mark="${task.actualCells[d] ? "A" : ""}" data-gt="${ti}" data-gtype="actual" data-gday="${d}">${task.actualCells[d] ? "A" : ""}</td>`;
    }
    body += `<tr>
      <td class="task-col" rowspan="2"><input type="text" data-gt-desc="${ti}" value="${escapeAttr(task.desc)}"></td>
      <td class="qty-col" rowspan="2"><input type="text" data-gt-qty="${ti}" value="${escapeAttr(task.jumlahSasaran)}"></td>
      ${targetCells}
      <td class="qty-col"><input type="text" placeholder="Plan" data-gt-field="jumlahHariPlan" data-gt-idx="${ti}" value="${escapeAttr(task.jumlahHariPlan)}"></td>
      <td class="qty-col" rowspan="2"><input type="text" data-gt-field="kemajuan" data-gt-idx="${ti}" value="${escapeAttr(task.kemajuan)}"></td>
      <td class="qty-col" rowspan="2"><input type="text" data-gt-field="catatan" data-gt-idx="${ti}" value="${escapeAttr(task.catatan)}"></td>
    </tr>
    <tr>${actualCells}
      <td class="qty-col"><input type="text" placeholder="Actual" data-gt-field="jumlahHariActual" data-gt-idx="${ti}" value="${escapeAttr(task.jumlahHariActual)}"></td>
    </tr>`;
  });

  // "Kerja Siap di Tapak" summary row - single row, own done/undone mark per day
  while (state.gantt.doneCells.length < totalDays) state.gantt.doneCells.push(false);
  let doneCells = "";
  for (let d = 0; d < totalDays; d++) {
    doneCells += `<td class="day-cell" data-mark="${state.gantt.doneCells[d] ? "V" : ""}" data-gdone="${d}">${state.gantt.doneCells[d] ? "✓" : ""}</td>`;
  }
  body += `<tr>
    <td class="task-col" colspan="2" style="text-align:center;font-weight:bold">Kerja Siap di Tapak</td>
    ${doneCells}
    <td class="qty-col"></td><td class="qty-col"></td><td class="qty-col"></td>
  </tr>`;

  table.innerHTML = headRow1 + headRow2 + body;

  table.querySelectorAll("[data-gt-desc]").forEach(el => el.addEventListener("input", () => {
    state.gantt.tasks[parseInt(el.getAttribute("data-gt-desc"), 10)].desc = el.value;
    saveState();
  }));
  table.querySelectorAll("[data-gt-qty]").forEach(el => el.addEventListener("input", () => {
    state.gantt.tasks[parseInt(el.getAttribute("data-gt-qty"), 10)].jumlahSasaran = el.value;
    saveState();
  }));
  table.querySelectorAll("[data-gt-field]").forEach(el => el.addEventListener("input", () => {
    const idx = parseInt(el.getAttribute("data-gt-idx"), 10);
    const field = el.getAttribute("data-gt-field");
    state.gantt.tasks[idx][field] = el.value;
    saveState();
  }));
  table.querySelectorAll(".day-cell[data-gt]").forEach(el => el.addEventListener("click", () => {
    const ti = parseInt(el.getAttribute("data-gt"), 10);
    const day = parseInt(el.getAttribute("data-gday"), 10);
    const type = el.getAttribute("data-gtype");
    const arr = type === "target" ? state.gantt.tasks[ti].targetCells : state.gantt.tasks[ti].actualCells;
    arr[day] = !arr[day];
    renderGantt();
    saveState();
  }));
  table.querySelectorAll(".day-cell[data-gdone]").forEach(el => el.addEventListener("click", () => {
    const day = parseInt(el.getAttribute("data-gdone"), 10);
    state.gantt.doneCells[day] = !state.gantt.doneCells[day];
    renderGantt();
    saveState();
  }));
}

/* ---------------- Add-row buttons ---------------- */
function wireAddButtons() {
  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.getAttribute("data-add");
      if (kind === "bq") { state.lineItems.push(emptyLineItem()); renderLineItems(); }
      if (kind === "se") { state.serviceEntries.push(emptyServiceEntry()); renderServiceEntries(); refreshDisplays(); }
      if (kind === "imbangan") { state.materialUsage.push(emptyMaterialRow()); renderMaterialUsage(); }
      if (kind === "fieldbook") { state.fieldbook.rows.push({ label: "" }); renderFieldbook(); }
      if (kind === "fieldbookcol") { state.fieldbook.dates.push(""); renderFieldbook(); }
      if (kind === "gantt") { state.gantt.tasks.push(emptyGanttTask()); renderGantt(); }
      if (kind === "ganttweek") { state.gantt.weeks += 1; renderGantt(); }
      saveState();
    });
  });
}

/* ---------------- Navigation ---------------- */
function showPage(key) {
  document.querySelectorAll(".doc-page").forEach(p => {
    p.classList.toggle("hidden-page", p.getAttribute("data-key") !== key);
  });
  document.querySelectorAll("#page-nav button").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-page") === key);
  });
  const meta = PAGE_META[key];
  document.getElementById("page-title").textContent = meta.title;
  document.getElementById("page-code").textContent = meta.code;
  window.scrollTo(0, 0);
  currentPage = key;
}
let currentPage = "checklist";

function wireNav() {
  document.querySelectorAll("#page-nav button").forEach(b => {
    b.addEventListener("click", () => showPage(b.getAttribute("data-page")));
  });
}

/* ---------------- Print ---------------- */
function wirePrintButtons() {
  document.getElementById("btn-print-page").addEventListener("click", () => {
    document.querySelectorAll(".doc-page").forEach(p => p.classList.remove("print-target"));
    document.querySelector(`.doc-page[data-key="${currentPage}"]`).classList.add("print-target");
    window.print();
  });
  document.getElementById("btn-print-all").addEventListener("click", () => {
    document.querySelectorAll(".doc-page:not(.no-print-page)").forEach(p => p.classList.add("print-target"));
    window.print();
  });
  window.addEventListener("afterprint", () => {
    document.querySelectorAll(".doc-page").forEach(p => p.classList.remove("print-target"));
  });
}

/* ---------------- Settings gear (password-gated: Simpan/Muat Naik/Reset) ---------------- */
const SETTINGS_PASSWORD = "GHCL2026";

function wireSettingsGear() {
  const modal = document.getElementById("settings-modal");
  const gearBtn = document.getElementById("btn-settings-gear");
  const closeBtn = document.getElementById("settings-close-btn");
  const unlockBtn = document.getElementById("settings-unlock-btn");
  const passwordInput = document.getElementById("settings-password");
  const errorEl = document.getElementById("settings-error");
  const lockPane = document.getElementById("settings-lock");
  const actionsPane = document.getElementById("settings-actions");
  if (!modal) return;

  function openModal() {
    lockPane.classList.remove("hidden");
    actionsPane.classList.add("hidden");
    passwordInput.value = "";
    errorEl.textContent = "";
    modal.classList.remove("hidden");
    passwordInput.focus();
  }
  function closeModal() {
    modal.classList.add("hidden");
  }
  function tryUnlock() {
    if (passwordInput.value === SETTINGS_PASSWORD) {
      lockPane.classList.add("hidden");
      actionsPane.classList.remove("hidden");
      errorEl.textContent = "";
    } else {
      errorEl.textContent = "Kata laluan salah. Sila cuba lagi.";
    }
  }

  gearBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  unlockBtn.addEventListener("click", tryUnlock);
  passwordInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });
}

/* ---------------- Export / Import / Reset ---------------- */
function wireDataButtons() {
  document.getElementById("btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const poPart = (state.common.poNumber || "borang-lks").toString().replace(/[^a-z0-9_-]/gi, "");
    a.href = url;
    a.download = `LKS_${poPart}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById("file-import");
  document.getElementById("btn-import").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = Object.assign(defaultState(), parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        renderAll();
      } catch (e) {
        alert("Fail tidak sah. Sila pilih fail .json yang dieksport dari sistem ini.");
      }
    };
    reader.readAsText(file);
    fileInput.value = "";
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (confirm("Padam semua data yang telah diisi dalam borang ini? Tindakan ini tidak boleh dibatalkan.")) {
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      renderAll();
    }
  });
}

/* ---------------- Page 10: Rekod Tersimpan (Online, via Vercel + KV) ---------------- */
function wireCloudRecords() {
  const statusEl = document.getElementById("cloud-status");
  if (!statusEl) return; // page markup not present

  const poInput = document.getElementById("cloud-po-input");
  const loadBtn = document.getElementById("cloud-load-btn");
  const saveBtn = document.getElementById("cloud-save-btn");
  const refreshBtn = document.getElementById("cloud-refresh-btn");

  if (!CLOUD_ENABLED) {
    statusEl.innerHTML = '<span style="color:#b3261e">Ciri simpan/muat awan hanya berfungsi apabila sistem ini dideploy di Vercel — tidak berfungsi apabila fail ini dibuka terus dari komputer (file://).</span>';
    loadBtn.disabled = true;
    saveBtn.disabled = true;
    refreshBtn.disabled = true;
    document.getElementById("cloud-records-body").innerHTML =
      '<tr><td colspan="5" style="text-align:center;color:#888">Tidak tersedia dalam mod tempatan (file://).</td></tr>';
    return;
  }

  loadBtn.addEventListener("click", () => loadFromCloud(poInput.value.trim()));
  saveBtn.addEventListener("click", saveToCloud);
  refreshBtn.addEventListener("click", refreshCloudList);
  refreshCloudList();
}

async function saveToCloud() {
  const statusEl = document.getElementById("cloud-status");
  const po = (state.common.poNumber || "").trim();
  if (!po) {
    statusEl.innerHTML = '<span style="color:#b3261e">Sila isi No. Pesanan Belian dalam borang dahulu (cth: di halaman Surat Akuan Kerja Selesai) sebelum simpan ke awan.</span>';
    return;
  }
  statusEl.textContent = "Menyimpan...";
  try {
    const res = await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poNumber: po, data: state })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal simpan.");
    hasUnsavedCloudChanges = false;
    statusEl.innerHTML = `<span style="color:#12742f">Berjaya disimpan untuk No. PO ${escapeHtml(po)}.</span>`;
    refreshCloudList();
  } catch (e) {
    statusEl.innerHTML = `<span style="color:#b3261e">Ralat: ${escapeHtml(e.message)}</span>`;
  }
}

async function loadFromCloud(po) {
  const statusEl = document.getElementById("cloud-status");
  if (!po) {
    statusEl.innerHTML = '<span style="color:#b3261e">Sila masukkan No. PO.</span>';
    return;
  }
  statusEl.textContent = "Mencari...";
  try {
    const res = await fetch("/api/load?po=" + encodeURIComponent(po));
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Rekod tidak dijumpai.");
    if (!confirm(`Borang semasa (dalam sesi ini) akan digantikan dengan data yang disimpan untuk No. PO ${po}. Teruskan?`)) {
      statusEl.textContent = "";
      return;
    }
    state = Object.assign(defaultState(), json.data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
    hasUnsavedCloudChanges = false;
    statusEl.innerHTML = `<span style="color:#12742f">Borang untuk No. PO ${escapeHtml(po)} berjaya dimuatkan. Anda kini boleh mengedit dan simpan semula.</span>`;
  } catch (e) {
    statusEl.innerHTML = `<span style="color:#b3261e">Ralat: ${escapeHtml(e.message)}</span>`;
  }
}

async function refreshCloudList() {
  const body = document.getElementById("cloud-records-body");
  if (!body) return;
  body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888">Memuatkan senarai...</td></tr>';
  try {
    const res = await fetch("/api/list");
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal memuatkan senarai.");
    const records = json.records || [];
    if (!records.length) {
      body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888">Tiada rekod disimpan lagi.</td></tr>';
      return;
    }
    body.innerHTML = records.map(r => `<tr>
      <td>${escapeHtml(r.poNumber)}</td>
      <td>${escapeHtml(r.contractorName || "")}</td>
      <td>${escapeHtml(r.workDescription || "")}</td>
      <td>${r.updatedAt ? new Date(r.updatedAt).toLocaleString("ms-MY") : ""}</td>
      <td class="no-print" style="display:flex;gap:4px">
        <button class="add-row-btn" data-open-po="${escapeAttr(r.poNumber)}">Buka</button>
        <button class="del-row-btn" data-delete-po="${escapeAttr(r.poNumber)}">Padam</button>
      </td>
    </tr>`).join("");
    body.querySelectorAll("[data-open-po]").forEach(btn => {
      btn.addEventListener("click", () => loadFromCloud(btn.getAttribute("data-open-po")));
    });
    body.querySelectorAll("[data-delete-po]").forEach(btn => {
      btn.addEventListener("click", () => deleteFromCloud(btn.getAttribute("data-delete-po")));
    });
  } catch (e) {
    body.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#b3261e">Ralat memuatkan senarai: ${escapeHtml(e.message)}</td></tr>`;
  }
}

async function deleteFromCloud(po) {
  const statusEl = document.getElementById("cloud-status");
  if (!confirm(`Padam rekod tersimpan untuk No. PO ${po} secara kekal? Tindakan ini tidak boleh dibatalkan.`)) return;
  statusEl.textContent = "Memadam...";
  try {
    const res = await fetch("/api/delete?po=" + encodeURIComponent(po), { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Gagal memadam.");
    statusEl.innerHTML = `<span style="color:#12742f">Rekod untuk No. PO ${escapeHtml(po)} telah dipadam.</span>`;
    refreshCloudList();
  } catch (e) {
    statusEl.innerHTML = `<span style="color:#b3261e">Ralat: ${escapeHtml(e.message)}</span>`;
  }
}

/* ---------------- Helpers ---------------- */
function escapeAttr(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function escapeHtml(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------------- Init ---------------- */
function renderAll() {
  bindCommonFields();
  bindRadioGroups();
  renderChecklist();
  renderLineItems();
  renderServiceEntries();
  renderMaterialUsage();
  renderAmkJenisKerja();
  renderCaseQuestions();
  renderFieldbook();
  renderGantt();
  refreshDisplays();
}

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wirePrintButtons();
  wireDataButtons();
  wireCloudRecords();
  wireSettingsGear();
  wireAddButtons();
  renderAll();
  showPage("checklist");
});
