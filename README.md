# SmartPark — IoT Smart Public-Bin Monitoring System

SmartPark is a modern, responsive civic web application designed for municipal waste monitoring and operations. It provides residents with transparent bin conditions and issue reporting while equipping city collection crews and maintenance teams with real-time dispatch tools and audit logging.

---

## 🌟 Key Features

### 1. Public Map & Real-Time Monitoring
- **Interactive City Map**: Built with Leaflet, customized for a dark interface with near-black charcoal panels (`#0a0a0f`, `#141419`) and high-contrast lime (`#84cc16`), amber (`#f59e0b`), and red (`#ef4444`) accents.
- **18 Smart Bins**: Distributed across 8 neighborhoods in **Greenfield Demo City** (Downtown, Riverside Park, University District, Market Square, Tech Quarter, Greenfield Heights, Lakeside, Old Town).
- **Configurable Fill Thresholds**:
  - **Empty**: 0–19% (Lime)
  - **Normal**: 20–59% (Lime)
  - **Almost Full**: 60–80% (Amber)
  - **Full**: >80% (Red, priority collection triggered)
- **Map & List Views**: Dual-mode visualization with instant search, neighborhood filtering, fill level filtering, and condition filtering.
- **Bin Detail Panel**: Real-time telemetry, address, coordinates, battery level, capacity, last collection timestamp, active alerts, and activity history.
- **Demo Data Transparency**: Clearly labeled simulated readings with an interactive IoT Integration modal explaining how real ultrasonic hardware (e.g. JSN-SR04T) connects via MQTT/REST.

### 2. Dedicated Alerts Page
- Live alert feed categorized by severity (**Critical**, **High**, **Medium**, **Low**).
- Filter by alert type (**Bin Full**, **Almost Full**, **Damage Report**, **Sensor Fault**, **Connectivity Issue**, **Maintenance Due**).
- Direct "View on Map" links (`/?bin=BIN-xxx`) to instantly fly to and inspect any flagged bin.
- Complete resolution history for audit and review.

### 3. Public Issue Reporting (Complaints)
- Resident portal to report physical damage, overflowing waste, odor, or missing bins.
- Form validation with automatic reference ID assignment (e.g., `SP-20261119-A3K9`).
- Clear confirmation view allowing residents to verify their submission.
- Protected: Public users cannot alter bin operational statuses or readings.

### 4. Role-Based Staff Operations Center
Secure staff authentication with granular server-side permissions:
- **Collection Crews (`collector`)**:
  - Access collection queue.
  - One-click "Mark as Collected" action resetting fill levels and logging collection notes.
  - Resticted from modifying users or settings.
- **Repair Staff (`repair`)**:
  - Filter open damage and maintenance reports.
  - "Mark Issue as Resolved" with mandatory resolution notes.
  - Automatically resets bin status to `operational`.
- **System Administrators (`admin`)**:
  - Full management suite: Add new smart bins, edit existing bin parameters, delete bins.
  - Configure municipal fill-level thresholds and alert dispatch settings.
  - Manage staff accounts (create accounts, assign roles).
  - Searchable, immutable **Audit Log** tracking all logins, collections, updates, and repairs.

### 5. Security & Architecture
- **Server-Side Enforcement**: Role permissions verified on every API mutation (`/api/bins`, `/api/alerts`, `/api/admin/*`).
- **Password Security**: Passwords hashed with salted `bcryptjs` (cost factor 10); no plaintext credentials stored or transmitted.
- **Session Handling**: Encrypted, HTTP-only, `sameSite` cookie sessions via `iron-session`.

---

## 🔑 Demo Staff Accounts

| Username | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | **Admin** | Full access: Bins, Settings, Thresholds, Users, Audit Log |
| **`collector1`** | `collect123` | **Collector** | Collection queue, Mark bin as collected, Log notes |
| **`repair1`** | `repair123` | **Repair** | Damage alerts, Mark issue resolved, Resolution notes |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20.18.0)
- npm 9+

### Running the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Production build**:
   ```bash
   npm run build
   npm start
   ```

---

## 📡 IoT Hardware & Telemetry Integration

To connect real-world bins instead of the demo simulator:
1. Mount a waterproof ultrasonic distance sensor (e.g., **JSN-SR04T** or **MaxBotix MB7389**) under the bin lid.
2. Connect to an **ESP32-S3** microcontroller with a cellular modem (Quectel BG95 NB-IoT / LTE-M).
3. Transmit telemetry every 5–15 minutes via HTTP POST to `/api/telemetry` or MQTT topic `sensors/bins/:id`.
4. Configure the production endpoint in **Staff Dashboard → Thresholds & Settings**.
