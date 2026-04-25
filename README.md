# Deliveroo Data Hub

Retrieve, explore, and export your Deliveroo order history.

## ✨ Overview

Deliveroo Data Hub is a lightweight userscript that allows you to:

- Collect your full Deliveroo order history
- Filter orders by date range
- Export your data as structured files (JSON, CSV)
- Gain visibility over your consumption habits

The goal is simple: **help you take back control of your data**.

---

## 🚀 Features

### v0.1.0

- Dashboard overlay (Start / Pause / Stop / Export)
- Order collection via XHR interception
- Initial DOM extraction (first visible orders)
- Date range filtering (inclusive full-day)
- JSON export

### v0.2.0 (in progress)

- CSV export
- Export format selector (JSON / CSV)
- Improved scraping reliability
- Collapsible logs for better UX
- Better error handling

---

## 🧩 Installation

### Option 1 — Userscript (recommended)

1. Install Tampermonkey:
   - https://www.tampermonkey.net/

2. Install the script:
   - Download from the latest release:
     https://github.com/Malamdg/deliveroo-data-hub/releases

3. Open Deliveroo:
   - https://deliveroo.com/

4. The dashboard will appear automatically.

---

## 🛠 Usage

1. Open Deliveroo and log in
2. Launch the dashboard
3. Select a date range
4. Click **Start**
5. Wait for data collection to complete
6. Click **Export**

---

## 📦 Export formats

### JSON

Structured format for developers or advanced usage.

### CSV (coming in v0.2.0)

Spreadsheet-friendly format for Excel / Google Sheets.

---

## ⚠️ Limitations

- Relies partially on Deliveroo DOM structure (may break if UI changes)
- Requires the user to be logged in
- No official API usage (scraping-based approach)

---

## 🧠 Philosophy

- Keep it simple
- No overengineering
- Deliver value quickly
- Stay transparent with users

---

## 🏗 Architecture

```tree
src/
├── core/ # business logic (date, filtering, export)
├── adapters/ # DOM / XHR extraction
├── dashboard/ # UI (HTML, CSS, JS)
└── runners/ # orchestration
```


---

## 🔮 Roadmap

See: `docs/roadmap.md`

---

## 📚 Knowledge base

Project decisions and architecture: `docs/knowledge/`


---

## 🤝 Contributing

This is currently a personal project, but contributions and ideas are welcome.

---

## 📄 License

MIT License (recommended for open usage)

---

## 🚀 Vision

Help users better understand their consumption habits and regain ownership of their personal data.