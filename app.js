(() => {
  const storageKey = "campus-stores.shift.v1";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 1,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    gone: [],
    kit: 0,
    undo: "",
    editing: false,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const live = (r) => s.loans.filter((l) => l.req === r && !l.back);
  const dues = ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"];
  const hrs = { "Fri 8 pm": 20, "Sat 9 am": 33, "Sat 10 am": 34, "Sat noon": 36 };
  const now = [15.75, 19.5, 33];
  const late = (l) => !l.back && now[s.phase] > hrs[l.due];
  const like = (l) =>
    assets.filter(
      (a) => a.type === getAsset(l.asset).type && !a.repair && (a.id === l.asset || !out(a.id)),
    );
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list) =>
    list
      .map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + "</option>")
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair", "Missing"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : s.gone.includes(a.id)
          ? "Missing"
          : out(a.id)
            ? "On loan"
            : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin,
        status === "Missing"
          ? '<span class="tag late">Missing</span>'
          : badge(status, status === "On shelf"),
      );
    }
    return html;
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id) && !s.gone.includes(a.id));
      const select = (label, key, options) =>
        "<label><span>" +
        label +
        '</span><select name="' +
        key +
        '" required><option value="">Select…</option>' +
        opts(options) +
        "</select></label>";
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          dues.map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    const k = s.kit && s.loans.find((x) => x.num === s.kit && !x.back);
    if (k) {
      const r = getReq(k.req);
      const soon = dues.filter((d) => hrs[d] >= now[s.phase]);
      const pick = (name, list, cur) =>
        '<select name="' +
        name +
        '"><option value="">Select…</option>' +
        list
          .map(
            (v) =>
              '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(v) + "</option>",
          )
          .join("") +
        "</select>";
      return (
        html +
        '<form data-kit><div class="record"><small>' +
        esc(r.id) +
        " · Return</small><h3>" +
        esc(r.club + " · " + r.event) +
        "</h3><p>What’s on the counter? Tick it and check the label. Anything not ticked, say who has it.</p></div>" +
        live(r.id)
          .map((l) => {
            const a = getAsset(l.asset);
            const alt = like(l);
            return (
              '<div class="row kitrow"><div><label class="tick"><input type="checkbox" name="in" value="' +
              l.num +
              '"' +
              (l.num === k.num ? " checked" : "") +
              " /><strong>" +
              esc(a.id + " · " + a.type) +
              "</strong></label><small>" +
              esc(a.model + " · slip L-" + l.num + " · due " + l.due) +
              "</small>" +
              (alt.length > 1
                ? '<label class="got"><span>Label on the unit says</span>' +
                  pick(
                    "got" + l.num,
                    alt.map((x) => x.id),
                    l.asset,
                  ) +
                  "</label>"
                : "") +
              '<div class="form"><label><span>Who has it</span>' +
              pick("who" + l.num, people, l.holder) +
              "</label><label><span>Bringing it back</span>" +
              pick("due" + l.num, soon, l.exp) +
              "</label></div></div></div>"
            );
          })
          .join("") +
        '<button type="submit" class="primary">Save return</button> ' +
        btn("Cancel", "cancel") +
        "</form>"
      );
    }
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse();
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown) {
      const sub =
        l.holder && !l.back
          ? l.holder + " has it, back " + l.exp + " · issued to " + l.who + ", due " + l.due
          : l.who + " · Due " + l.due + (l.got ? " · came back as " + l.got : "");
      html += row(
        "L-" + l.num + " · " + l.asset + " · " + getAsset(l.asset).type,
        getReq(l.req).club + " · " + sub,
        l.back
          ? badge("Returned")
          : (late(l) ? '<span class="tag late">Late</span> ' : "") +
              btn("Record return", "return", String(l.num)),
      );
    }
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
    q('[data-action="undo"]').hidden = !s.undo;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.undo = "";
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.kit = 0;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        s.kit = 0;
        break;
      case "cancel":
        s.editing = false;
        s.kit = 0;
        break;
      case "undo": {
        if (!s.undo) return;
        const u = JSON.parse(s.undo);
        s.loans = u.loans;
        s.notes = u.notes;
        s.gone = u.gone || [];
        s.undo = "";
        s.kit = 0;
        s.notice = "Return undone. Those slips are open again.";
        break;
      }
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "return": {
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        s.kit = l.num;
        s.editing = false;
        break;
      }
    }
    commit();
    if (b.dataset.action === "return")
      (q("[data-kit] .tick input:not(:checked)") || q("[data-kit] [type=submit]")).focus();
  });
  root.addEventListener("change", (e) => {
    e.target.removeAttribute("aria-invalid");
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-kit]")) {
      const k = s.loans.find((x) => x.num === s.kit);
      if (!k) return;
      const r = getReq(k.req);
      const type = (l) => getAsset(l.asset).type;
      const ins = form.getAll("in").map(Number);
      const ls = live(r.id);
      const miss = ls.filter((l) => !ins.includes(l.num));
      const say = (t, el) => {
        q("[data-status]").textContent = t;
        el.focus();
      };
      if (!ins.length)
        return say("Nothing ticked yet. Tick what’s on the counter.", f.querySelector(".tick input"));
      const bad = miss.find(
        (l) => !people.includes(form.get("who" + l.num)) || !dues.includes(form.get("due" + l.num)),
      );
      if (bad) {
        const key = people.includes(form.get("who" + bad.num)) ? "due" : "who";
        const el = f.querySelector('[name="' + key + bad.num + '"]');
        el.setAttribute("aria-invalid", "true");
        return say(
          "Who has the " + type(bad) + ", and when is it coming back? The next shift will need this.",
          el,
        );
      }
      s.undo = JSON.stringify({ loans: s.loans, notes: s.notes, gone: s.gone });
      let wrote = 0;
      const odd = ls.filter((l) => {
        const g = form.get("got" + l.num);
        if (!ins.includes(l.num) || !g || g === l.asset || !like(l).some((a) => a.id === g)) return false;
        l.got = g;
        return true;
      });
      for (const l of ls) if (ins.includes(l.num)) l.back = true;
      for (const l of odd) {
        s.gone = s.gone.filter((x) => x !== l.got);
        if (!s.gone.includes(l.asset)) s.gone.push(l.asset);
        wrote++;
        s.notes.push({
          phase: s.phase,
          text:
            l.got + " came back on slip L-" + l.num + " instead of " + l.asset + ". " + l.asset +
            " is marked missing, find out where it is.",
        });
      }
      for (const l of miss) {
        const who = form.get("who" + l.num);
        const due = form.get("due" + l.num);
        if (who === l.holder && due === l.exp) continue;
        l.holder = who;
        l.exp = due;
        wrote++;
        s.notes.push({
          phase: s.phase,
          text:
            r.club + "’s " + type(l) + " (" + l.asset + ") is still out. " + who + " has it, back " +
            due + ". Slip L-" + l.num + " stays open.",
        });
      }
      s.kit = 0;
      commit(
        "Back: " +
          ls.filter((l) => l.back).map(type).join(", ") +
          "." +
          odd
            .map((l) => " Slip L-" + l.num + " said " + l.asset + " but " + l.got + " came back, " + l.asset + " marked missing.")
            .join("") +
          (miss.length
            ? " Still out: " + miss.map((l) => type(l) + " with " + l.holder + " till " + l.exp).join(", ") + "."
            : " Nothing left out.") +
          (wrote ? " Note left for the next shift." : ""),
      );
      return;
    }
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      s.undo = "";
      commit("Handover note saved.");
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || s.gone.includes(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    s.undo = "";
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      kit: d.loans.some((l) => l.num === d.kit && !l.back) ? d.kit : 0,
      undo: "",
      gone: Array.isArray(d.gone) ? d.gone.filter((x) => getAsset(x)) : [],
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
