# CSV → JSON API (Node.js + Express + PostgreSQL)

A simple Node.js API that reads a CSV file, parses it into JSON objects (including nested keys), inserts the data into a PostgreSQL database, and generates an age distribution report.

---

## 🚀 Features

- Parses CSV files with **nested keys** (e.g., `name.firstName`, `address.city`)
- Converts values into proper **types** (numbers, strings)
- Inserts parsed rows into **PostgreSQL**
- Provides endpoints to:
  - Upload and insert CSV data
  - Fetch all users
  - Generate an age report (by age ranges)

---

## 🧰 Tech Stack

- **Node.js** (Express)
- **PostgreSQL** (pg library)
- **dotenv** for environment variables
- **Custom CSV parser**

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/tishaa17/csv-to-json-api.git
cd csv-to-json-api
```
### 2. Install dependencies
```bash
npm install
```
### 3. Configure environment variables

Create a .env file in the root folder:

```bash
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
CSV_FILE_PATH=./sample.csv
PORT=3000
```
⚠️ Do not commit your .env file — keep it private.
You can also include a .env.example for reference.

🗄️ Database Setup

In your PostgreSQL database, create the users table:
```bash
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  age INT,
  address JSONB,
  additional_info JSONB
);
```

▶️ Running the App

Start the Express server:
```bash
node index.js
```
By default, it runs on:
```bash
http://localhost:3000
```

📡 API Endpoints
| Method  | Endpoint  | Description                                      |
| ------- | --------- | ------------------------------------------------ |
| **GET** | `/`       | Health check (verifies API is running)           |
| **GET** | `/upload` | Parses CSV file and inserts data into PostgreSQL |
| **GET** | `/users`  | Returns all inserted users                       |
| **GET** | `/report` | Returns age distribution report                  |

Example CSV
```bash
name.firstName,name.lastName,age,address.line1,address.city,gender
Rohit,Prasad,35,A-563 Rakshak Society,Pune,male
Asha,Verma,28,123 Green Park,Delhi,female
Raj,Sharma,17,5 MG Road,Mumbai,male
Leela,Kumar,62,7 Flower Lane,Ahmedabad,female
Anil,Mehta,45,11 Sunrise Ave,Bangalore,male
Sneha,Rao,32,22 Lotus Street,Chennai,female
Vikram,Singh,55,88 Ocean Drive,Goa,male
Pooja,Sharma,19,14 Rose Park,Delhi,female
Amit,Patel,38,66 Maple Road,Hyderabad,male
Nisha,Gupta,23,7 Jasmine Lane,Pune,female
```