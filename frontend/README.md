# 🐝 BeeLine Kiosk System

A full-stack, real-time food ordering system designed to streamline restaurant operations. This solution connects a self-service customer kiosk, a real-time Kitchen Display System (KDS), and an Administrative Dashboard into one cohesive platform.

![Stack](https://img.shields.io/badge/stack-PERN-orange.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## 🚀 Key Features

### 🖥️ Customer Kiosk

- **Interactive Menu:** Browse categories (Chicken, Burgers, etc.) with a modern, responsive UI.
- **Cart & Checkout:** Seamless item addition, quantity adjustment, and order summary.
- **Live Order Tracking:** Customers can scan a QR code to track their specific order status (Queued → Preparing → Ready) on their mobile devices in real-time.
- **Queue Monitor:** Public display screen showing the status of all active orders.

### 👨‍🍳 Kitchen Display System (KDS)

- **Real-Time Feeds:** Orders appear instantly in the kitchen without refreshing the page (via WebSockets).
- **Status Management:** Kitchen staff can move orders from "Queued" to "Preparing" to "Ready" to "Completed" with a single click.
- **Visual Indicators:** Color-coded cards to indicate order urgency and status.

### 📊 Admin Dashboard

- **Menu Management:** Add, edit, delete, or toggle availability of menu items.
- **Sales Analytics:** View revenue, total orders, and active order counts.
- **Transaction History:** Detailed log of all past orders.
- **QR Code Generator:** Generate and print unique QR codes for specific tables.

---

## 🛠️ Tech Stack

**Frontend:**

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Real-Time:** Socket.io-client
- **HTTP Client:** Axios

**Backend:**

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (pg)
- **Real-Time:** Socket.io
- **Language:** TypeScript

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL Database
- Git

### 1. Database Setup

Ensure you have a PostgreSQL database running. You will need the connection string (URL) for the next steps.

### 2. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```
