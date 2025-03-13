
# Deployment Guide for Project Management Dashboard

This guide will walk you through deploying this application to a VPS (Virtual Private Server) and setting up a proper database for production use.

## Prerequisites

- A VPS with at least 1GB RAM (e.g., DigitalOcean Droplet, Linode, AWS EC2)
- A domain name (optional but recommended)
- Basic knowledge of Linux commands
- Node.js 18+ installed on your VPS

## Step 1: Prepare Your VPS

1. Set up a new VPS with Ubuntu 22.04 LTS
2. Update the system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
3. Install required packages:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx git
   ```
4. Install Node.js and npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

## Step 2: Set Up a Database

For a production environment, you need a real database. This guide will use PostgreSQL:

1. Install PostgreSQL:
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```

2. Set up a database user and database:
   ```bash
   sudo -u postgres psql
   ```

3. In the PostgreSQL shell:
   ```sql
   CREATE USER pmuser WITH PASSWORD 'strongpassword';
   CREATE DATABASE projectmgmt;
   GRANT ALL PRIVILEGES ON DATABASE projectmgmt TO pmuser;
   \q
   ```

## Step 3: Clone and Build the Application

1. Clone your project repository:
   ```bash
   git clone https://github.com/yourusername/your-repo.git /var/www/projectmgmt
   cd /var/www/projectmgmt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a production .env file:
   ```bash
   nano .env.production
   ```

4. Add the following environment variables:
   ```
   DATABASE_URL=postgresql://pmuser:strongpassword@localhost:5432/projectmgmt
   JWT_SECRET=your-secure-jwt-secret
   ```

5. Build the application:
   ```bash
   npm run build
   ```

## Step 4: Backend Data Migration

To move away from the sample data and use a real database, you will need to:

1. Create database migration scripts:
   - Create tables for clients, projects, project types, categories
   - Set up relationships between them

2. For example, in PostgreSQL:
   ```sql
   CREATE TABLE project_types (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );

   CREATE TABLE project_categories (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     project_type_id INTEGER REFERENCES project_types(id) ON DELETE CASCADE,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );

   CREATE TABLE clients (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     phone VARCHAR(255),
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );

   CREATE TABLE projects (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     client_id INTEGER REFERENCES clients(id),
     description TEXT,
     start_date TIMESTAMP NOT NULL,
     deadline_date TIMESTAMP,
     status VARCHAR(50) NOT NULL,
     budget DECIMAL(10,2),
     progress INTEGER DEFAULT 0,
     project_type_id INTEGER REFERENCES project_types(id),
     project_category_id INTEGER REFERENCES project_categories(id),
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   ```

3. Create a server-side API:
   - Implement a simple Express.js server to handle API requests
   - Create CRUD operations for all entities

## Step 5: Set Up API Server

1. Create a server directory:
   ```bash
   mkdir -p server/src
   cd server
   npm init -y
   npm install express cors helmet pg dotenv jsonwebtoken bcrypt
   ```

2. Create a basic server file:
   ```bash
   nano src/index.js
   ```

3. Add server code (basic example):
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const helmet = require('helmet');
   const { Pool } = require('pg');
   require('dotenv').config();

   const app = express();
   const port = process.env.PORT || 3001;

   // Database connection
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });

   // Middleware
   app.use(helmet());
   app.use(cors());
   app.use(express.json());

   // Routes
   app.get('/api/clients', async (req, res) => {
     try {
       const result = await pool.query('SELECT * FROM clients ORDER BY name');
       res.json(result.rows);
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Server error' });
     }
   });

   // Add more routes for CRUD operations on clients, projects, etc.

   app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });
   ```

## Step 6: Update Frontend to Use the API

1. Create an API service file in your frontend:
   ```bash
   mkdir -p src/services
   nano src/services/api.ts
   ```

2. Implement the API service:
   ```typescript
   import axios from 'axios';

   const API_URL = process.env.NODE_ENV === 'production'
     ? '/api'
     : 'http://localhost:3001/api';

   const api = axios.create({
     baseURL: API_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add authentication interceptor
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   export const clientsApi = {
     getAll: () => api.get('/clients'),
     getById: (id: string) => api.get(`/clients/${id}`),
     create: (data: any) => api.post('/clients', data),
     update: (id: string, data: any) => api.put(`/clients/${id}`, data),
     delete: (id: string) => api.delete(`/clients/${id}`),
   };

   // Add similar endpoints for projects, project types, categories
   
   export default api;
   ```

## Step 7: Configure Nginx

1. Create an Nginx configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/projectmgmt
   ```

2. Add configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           root /var/www/projectmgmt/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/projectmgmt /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 8: Set Up SSL with Let's Encrypt

1. Obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

2. Follow the prompts to complete SSL setup

## Step 9: Set Up Process Manager

1. Install PM2:
   ```bash
   sudo npm install -g pm2
   ```

2. Start the API server:
   ```bash
   cd /var/www/projectmgmt/server
   pm2 start src/index.js --name "project-api"
   ```

3. Save the PM2 configuration:
   ```bash
   pm2 save
   pm2 startup
   ```

## Step 10: Regular Maintenance

1. Set up automated backups for your PostgreSQL database:
   ```bash
   sudo nano /usr/local/bin/backup-db.sh
   ```

2. Add backup script:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/postgres"
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   FILENAME="projectmgmt_$TIMESTAMP.sql"

   mkdir -p $BACKUP_DIR
   pg_dump -U pmuser projectmgmt > $BACKUP_DIR/$FILENAME
   gzip $BACKUP_DIR/$FILENAME
   
   # Keep only the last 7 backups
   find $BACKUP_DIR -type f -name "projectmgmt_*.sql.gz" | sort -r | tail -n +8 | xargs -r rm
   ```

3. Make it executable:
   ```bash
   sudo chmod +x /usr/local/bin/backup-db.sh
   ```

4. Add to crontab:
   ```bash
   sudo crontab -e
   ```

5. Schedule daily backups at 2 AM:
   ```
   0 2 * * * /usr/local/bin/backup-db.sh
   ```

## Security Considerations

1. Set up a firewall:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

2. Configure secure authentication:
   - Disable password authentication in SSH
   - Use SSH keys for access
   - Consider two-factor authentication for admin access

3. Regular updates:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## Performance Optimization

1. Configure Nginx for caching static assets:
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
       expires 30d;
       add_header Cache-Control "public, no-transform";
   }
   ```

2. Consider adding a CDN for static assets

3. Optimize your PostgreSQL configuration based on your server resources

## Conclusion

This guide provides a basic foundation for deploying your application to a VPS. Depending on your specific requirements, you may need to make adjustments to the configuration. Remember to regularly monitor your server performance and security, and keep all software updated.
