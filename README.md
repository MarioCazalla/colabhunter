# 🧬 ColabHunter: Genomics Cohort & Project Network

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Active Prototype](https://img.shields.io/badge/Status-Active%20Prototype-success.svg)](#)
[![Domain: Rare Disease Research](https://img.shields.io/badge/Domain-Genomics%20%26%20Rare%20Diseases-purple.svg)](#)

**ColabHunter** is an open-access platform designed to connect geneticists, clinical researchers, and bioinformaticians working on active research projects and patient cohorts. 

Unlike single-case candidate discovery tools (like GeneMatcher), **ColabHunter** accelerates translational research by helping research teams find active cohorts, coordinate functional validation assays (*in vitro / in vivo*), and collaborate on high-impact publications.

---

## 🌟 Key Features

- **🧬 Active Cohort Registry**: Search and list research projects by candidate gene (HGNC), phenotype (HPO terms), and mutational mechanism (Gain-of-Function, Loss-of-Function, Dominant Negative).
- **⚡ Real-Time Overlap Detection**: Instant alerts when an investigator enters a gene with existing active cohorts.
- **📇 Transparent Direct Contact**: Direct access to Principal Investigator (PI) contacts (Email, GitHub lab profiles, ORCID iDs, and phone numbers).
- **📊 Cohort Progress Metrics**: Track cohort expansion goals ($N$ current vs. $N$ target).
- **🔒 Privacy & Governance**: Flexible public listing or blinded matching workflows adhering to GDPR and GA4GH standards.

---

## 🚀 Live Demo

You can explore the live web app directly via **GitHub Pages**:
👉 **[https://<your-github-username>.github.io/colabhunter](https://<your-github-username>.github.io/colabhunter)**

---

## 💻 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Light/Dark Theme System), Modern JavaScript (ES6+).
- **Icons & Typography**: FontAwesome 6, Google Fonts (*Inter*, *Plus Jakarta Sans*, *Fira Code*).
- **Zero-Dependency Core**: Fully client-side web application compatible with all hospital and academic browsers.

---

## 🛠️ Local Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/colabhunter.git
   cd colabhunter
   ```

2. Open `index.html` in any web browser or serve locally:
   ```bash
   python3 -m http.server 8000
   ```

3. Navigate to `http://localhost:8000` in your browser.

---

## 📜 How to Deploy on GitHub Pages

1. Create a new public repository named `colabhunter` on GitHub.
2. Push your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ColabHunter web platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/colabhunter.git
   git push -u origin main
   ```
3. In GitHub Repository Settings:
   - Go to **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
   - Select **Branch**: `main` / `/(root)` and click **Save**.
4. Your site will be published at `https://<your-username>.github.io/colabhunter/` in 30 seconds!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
