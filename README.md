# Todo App: Full-Stack Infrastructure & Deployment

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)
![Ansible](https://img.shields.io/badge/ansible-%231A1918.svg?style=for-the-badge&logo=ansible&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)

A full-stack Todo application with a **Node.js/Express** backend, **PostgreSQL** database, and a static **Nginx**-served frontend — fully containerized with Docker and deployable to **AWS EC2** via **Terraform** and **Ansible**.

---

## Architecture Overview

The application uses a decoupled, containerized architecture orchestrated by Docker Compose, with cloud infrastructure provisioned via Terraform and configured via Ansible.

- **Frontend:** Static HTML/CSS/JS served by an Nginx container, which also proxies `/api/` requests to the backend.
- **Backend:** Node.js/Express REST API connected to PostgreSQL.
- **Database:** PostgreSQL running in a Docker container with a persistent volume and automatic schema initialization via `init.sql`.
- **Infrastructure:** AWS EC2 (`t3.micro`) provisioned by Terraform with a static Elastic IP, VPC, and security groups (ports 22 and 80).
- **Configuration:** Ansible playbook installs Docker on the EC2 instance and deploys the app via Docker Compose.

---

## Repository Structure

```text
├── ansible/
│   ├── ansible.cfg        # Ansible configuration
│   └── playbook.yml       # Installs Docker & deploys the app on EC2
├── backend/
│   ├── config/
│   │   └── db.js          # PostgreSQL connection pool & table initialization
│   ├── controllers/
│   │   ├── personController.js
│   │   └── taskController.js
│   ├── routes/
│   │   ├── personRoutes.js
│   │   └── taskRoutes.js
│   ├── .dockerignore
│   ├── .env.example       # Template for required environment variables
│   ├── Dockerfile
│   ├── package.json
│   └── server.js          # Express app entry point
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   ├── Dockerfile
│   ├── index.html
│   └── nginx.conf         # Serves static files & proxies /api/ to backend
├── Terraform/
│   ├── main.tf            # EC2, VPC, SG, EIP, route table, Ansible trigger
│   ├── outputs.tf         # Outputs the public IP after provisioning
│   └── variables.tf       # Configurable variables (region, instance type, SSH key path)
├── docker-compose.yml     # Orchestrates frontend, backend, and postgres locally
└── init.sql               # SQL schema run automatically on first DB startup
```

---

## Prerequisites

Before running this project locally or deploying to AWS, make sure you have the following installed:

| Tool | Version | Purpose |
|---|---|---|
| [Docker](https://docs.docker.com/get-docker/) | 24+ | Containerization |
| [Docker Compose](https://docs.docker.com/compose/install/) | v2+ | Local orchestration |
| [Terraform](https://developer.hashicorp.com/terraform/install) | 1.5+ | AWS infrastructure provisioning |
| [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/) | 2.14+ | Remote server configuration |
| [AWS CLI](https://aws.amazon.com/cli/) | 2+ | AWS authentication |

---

## Running Locally (Docker Compose)

No Node.js or PostgreSQL installation needed on your machine — everything runs inside containers.

**1. Clone the repository:**
```bash
git clone https://github.com/balayantsDAVID/todo-app-infra
cd todo-app-infra
```

**2. Configure environment variables:**

Copy the example env file and fill in your values:
```bash
cp backend/.env.example backend/.env
```

The `.env` file is gitignored and will not be committed. The default values in `.env.example` match what `docker-compose.yml` expects, so no changes are needed for local development.

**3. Start the application:**
```bash
docker compose up -d --build
```

**4. Access the app:**

| Service | URL |
|---|---|
| Todo App | http://localhost |
| PostgreSQL | `localhost:5432` (user: `postgres`, db: `tododb`) |

**5. Stop the application:**
```bash
docker compose down
```

To also remove the database volume (wipe all data):
```bash
docker compose down -v
```

---

## Deploying to AWS

The deployment flow is: **Terraform provisions the EC2 instance → Ansible configures it and deploys the Docker Compose stack automatically.**

### Step 1 — Configure AWS credentials

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, and default region (`eu-central-1`).

### Step 2 — Generate an SSH key pair (if you don't have one)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

The default path is `~/.ssh/id_ed25519`. Terraform is configured to use this path by default via `variables.tf`.

### Step 3 — Install Ansible dependencies

```bash
ansible-galaxy collection install community.docker ansible.posix
```

### Step 4 — Initialize and apply Terraform

```bash
cd Terraform
terraform init
terraform apply
```

Review the plan and type `yes` to confirm. Terraform will:
1. Provision a VPC, subnet, internet gateway, route table, security group, and EC2 instance.
2. Attach a static Elastic IP to the instance.
3. Write an Ansible inventory file (`ansible/hosts`) with the public IP.
4. Wait 30 seconds for the instance to boot, then automatically run the Ansible playbook.

### Step 5 — Access the deployed app

After `terraform apply` completes, it will print the public IP:

```
Outputs:
myToDoApp_public_ip = "X.X.X.X"
```

Open `http://X.X.X.X` in your browser.

### Tearing down the infrastructure

```bash
terraform destroy
```

---

## Environment Variables

The backend reads the following variables from `backend/.env` (locally) or from the container's environment (in production via Docker Compose):

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the Express server listens on | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | *(set this yourself)* |
| `DB_NAME` | PostgreSQL database name | `tododb` |

> **Security note:** Never commit your `.env` file. It is listed in `.gitignore`. Always change the default `DB_PASSWORD` before deploying to a public server.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/persons` | Get all persons |
| `POST` | `/api/persons` | Create a person |
| `DELETE` | `/api/persons/:id` | Delete a person |
| `GET` | `/api/tasks` | Get all tasks |
| `POST` | `/api/tasks` | Create a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |

---

## Project Development Journey

### 1. Application Development
Built a Node.js/Express REST API with a PostgreSQL backend, using `pg` (node-postgres) for database access. The frontend is a vanilla HTML/JS/CSS single-page app. Environment configuration follows the 12-Factor App methodology — no hardcoded credentials, all config via `process.env`.

### 2. Containerization (Docker)
- Wrote individual `Dockerfile`s for the frontend (Nginx) and backend (Node.js).
- The Nginx container serves the static frontend and reverse-proxies `/api/` calls to the backend — no CORS issues in production.
- `docker-compose.yml` orchestrates all three services locally, with a health check on PostgreSQL to ensure the backend only starts once the database is ready.
- The database schema is automatically applied on first startup via `init.sql` mounted into the PostgreSQL container.

### 3. Cloud Infrastructure (Terraform)
- Provisions a full AWS network stack: VPC, public subnet, internet gateway, and route table.
- Launches an Ubuntu 24.04 EC2 `t3.micro` instance with a security group allowing SSH (22) and HTTP (80).
- Attaches an Elastic IP for a stable public address across instance restarts.
- Automatically generates the Ansible inventory file with the correct IP and SSH key path.

### 4. Server Configuration & Deployment (Ansible)
- Installs Docker and Docker Compose plugin on the EC2 instance.
- Syncs the project files to the server (excluding `.git`, `node_modules`, `.env`, and Terraform state).
- Deploys the app using `docker compose up --build` via the `community.docker.docker_compose_v2` module.
