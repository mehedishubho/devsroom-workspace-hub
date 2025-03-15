
# Complete Self-Hosting Guide for Devsroom Workspace

This guide will walk you through deploying the entire Devsroom Workspace application stack on your own VPS without relying on any third-party services. By the end, you'll have a fully self-contained application with the database running on your own server.

## Prerequisites

- A VPS with Ubuntu 24.04 LTS (minimum 2GB RAM recommended)
- A domain name pointing to your server's IP address
- Basic knowledge of Linux command line
- SSH access to your server

## Step 1: Initial Server Setup

1. **Log in to your VPS** using SSH:
   ```bash
   ssh username@your-server-ip
   ```

2. **Update your system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Create a non-root user** with sudo privileges (if not already set up):
   ```bash
   sudo adduser devsroom
   sudo usermod -aG sudo devsroom
   su - devsroom
   ```

4. **Set up basic firewall**:
   ```bash
   sudo apt install -y ufw
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

## Step 2: Install Required Software

1. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **Install Nginx and other tools**:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx git build-essential
   ```

3. **Install PostgreSQL**:
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```

## Step 3: Set Up PostgreSQL Database

1. **Start and enable PostgreSQL**:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create a database and user**:
   ```bash
   sudo -u postgres psql
   ```

3. **In the PostgreSQL prompt, execute these commands**:
   ```sql
   CREATE USER devsroomuser WITH PASSWORD 'your-secure-password';
   CREATE DATABASE devsroomdb;
   GRANT ALL PRIVILEGES ON DATABASE devsroomdb TO devsroomuser;
   \c devsroomdb
   GRANT ALL PRIVILEGES ON SCHEMA public TO devsroomuser;
   ALTER USER devsroomuser CREATEDB;
   \q
   ```

4. **Create the database tables** by running the migration script. First, create a file:
   ```bash
   sudo mkdir -p /var/www/devsroom/db
   sudo nano /var/www/devsroom/db/schema.sql
   ```

5. **Add the following SQL to create all necessary tables**:
   ```sql
   -- Create clients table
   CREATE TABLE public.clients (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
   );

   -- Create project types table
   CREATE TABLE public.project_types (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
   );

   -- Create project categories table
   CREATE TABLE public.project_categories (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL, 
     project_type_id UUID REFERENCES public.project_types(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
   );

   -- Create projects table
   CREATE TABLE public.projects (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
     description TEXT,
     start_date TIMESTAMP WITH TIME ZONE NOT NULL,
     deadline_date TIMESTAMP WITH TIME ZONE,
     status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'on-hold', 'cancelled')),
     budget DECIMAL(12,2),
     progress INTEGER DEFAULT 0,
     project_type_id UUID REFERENCES public.project_types(id) ON DELETE SET NULL,
     project_category_id UUID REFERENCES public.project_categories(id) ON DELETE SET NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
   );

   -- Create payments table
   CREATE TABLE public.payments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
     amount DECIMAL(12,2) NOT NULL,
     payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
     payment_method TEXT,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
   );

   -- Create project credentials table
   CREATE TABLE public.project_credentials (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
     platform TEXT NOT NULL,
     username TEXT NOT NULL,
     password TEXT NOT NULL,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
   );

   -- Create function to update the updated_at column
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = now();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   -- Create triggers to automatically update updated_at on all tables
   CREATE TRIGGER update_clients_updated_at
   BEFORE UPDATE ON public.clients
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   CREATE TRIGGER update_project_types_updated_at
   BEFORE UPDATE ON public.project_types
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   CREATE TRIGGER update_project_categories_updated_at
   BEFORE UPDATE ON public.project_categories
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   CREATE TRIGGER update_projects_updated_at
   BEFORE UPDATE ON public.projects
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   CREATE TRIGGER update_payments_updated_at
   BEFORE UPDATE ON public.payments
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   CREATE TRIGGER update_project_credentials_updated_at
   BEFORE UPDATE ON public.project_credentials
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

6. **Run the SQL script**:
   ```bash
   sudo -u postgres psql -d devsroomdb -f /var/www/devsroom/db/schema.sql
   ```

## Step 4: Set Up a Backend API Server

Since we won't be using Supabase, we need to create a simple backend API to connect with the PostgreSQL database.

1. **Create a directory for the API server**:
   ```bash
   sudo mkdir -p /var/www/devsroom-api
   sudo chown -R $USER:$USER /var/www/devsroom-api
   cd /var/www/devsroom-api
   ```

2. **Initialize a Node.js project**:
   ```bash
   npm init -y
   npm install express pg cors dotenv helmet express-rate-limit jsonwebtoken bcrypt
   npm install --save-dev typescript ts-node @types/express @types/pg @types/cors @types/node nodemon
   ```

3. **Create a TypeScript configuration file**:
   ```bash
   npx tsc --init
   ```

4. **Create environment file**:
   ```bash
   nano .env
   ```

5. **Add the following environment variables**:
   ```
   PORT=3001
   DATABASE_URL=postgresql://devsroomuser:your-secure-password@localhost:5432/devsroomdb
   JWT_SECRET=your-very-secure-jwt-secret-key
   ```

6. **Create the server directory structure**:
   ```bash
   mkdir -p src/{routes,controllers,middleware,utils}
   ```

7. **Create the main app file**:
   ```bash
   nano src/index.ts
   ```

8. **Add this code to index.ts**:
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import helmet from 'helmet';
   import dotenv from 'dotenv';
   import { rateLimit } from 'express-rate-limit';
   import clientRoutes from './routes/clients';
   import projectRoutes from './routes/projects';
   import projectTypeRoutes from './routes/projectTypes';
   import projectCategoryRoutes from './routes/projectCategories';
   import paymentRoutes from './routes/payments';
   import authRoutes from './routes/auth';
   import credentialRoutes from './routes/credentials';

   dotenv.config();

   const app = express();
   const port = process.env.PORT || 3001;

   // Middleware
   app.use(helmet());
   app.use(cors());
   app.use(express.json());

   // Rate limiting
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     limit: 100, // Limit each IP to 100 requests per window
     standardHeaders: true,
     legacyHeaders: false,
   });
   app.use(limiter);

   // Routes
   app.use('/api/auth', authRoutes);
   app.use('/api/clients', clientRoutes);
   app.use('/api/projects', projectRoutes);
   app.use('/api/project-types', projectTypeRoutes);
   app.use('/api/project-categories', projectCategoryRoutes);
   app.use('/api/payments', paymentRoutes);
   app.use('/api/credentials', credentialRoutes);

   // Health check
   app.get('/health', (req, res) => {
     res.status(200).json({ status: 'ok' });
   });

   app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });
   ```

9. **Create database connection**:
   ```bash
   nano src/utils/db.ts
   ```

10. **Add this code to db.ts**:
    ```typescript
    import { Pool } from 'pg';
    import dotenv from 'dotenv';

    dotenv.config();

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    pool.on('connect', () => {
      console.log('Connected to the database');
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });

    export default pool;
    ```

11. **Create auth middleware**:
    ```bash
    nano src/middleware/auth.ts
    ```

12. **Add this code to auth.ts**:
    ```typescript
    import { Request, Response, NextFunction } from 'express';
    import jwt from 'jsonwebtoken';

    interface AuthRequest extends Request {
      user?: any;
    }

    const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
      }
    };

    export default authMiddleware;
    ```

13. **Create authentication routes**:
    ```bash
    nano src/routes/auth.ts
    ```

14. **Add this code to auth.ts routes**:
    ```typescript
    import express from 'express';
    import jwt from 'jsonwebtoken';
    import bcrypt from 'bcrypt';

    const router = express.Router();

    // For this simple implementation, we'll use an in-memory admin user
    // In production, you would store this in the database with a hashed password
    const ADMIN_EMAIL = "mehedihassanshubho@gmail.com";
    const ADMIN_PASSWORD_HASH = "$2b$10$XdPXXGBO4xLTNI7cGN9Z8O.jm6WU9yHz3xM2.ICGFJBOwy92H7g3m"; // bcrypt hash of 'your-secure-password'

    router.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        
        // Check if email matches admin
        if (email !== ADMIN_EMAIL) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const passwordMatches = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!passwordMatches) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { email, name: 'Admin' },
          process.env.JWT_SECRET as string,
          { expiresIn: '1d' }
        );
        
        res.json({
          token,
          user: {
            email,
            name: 'Admin'
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    export default router;
    ```

15. **Create a package.json script**:
    ```bash
    nano package.json
    ```

16. **Add these scripts to package.json**:
    ```json
    "scripts": {
      "start": "node dist/index.js",
      "dev": "nodemon src/index.ts",
      "build": "tsc -p .",
      "postinstall": "npm run build"
    }
    ```

17. **Here's an example of a model route (clients)**:
    ```bash
    nano src/routes/clients.ts
    ```

18. **Add this code to clients.ts**:
    ```typescript
    import express from 'express';
    import pool from '../utils/db';
    import authMiddleware from '../middleware/auth';

    const router = express.Router();

    // Protect all client routes
    router.use(authMiddleware);

    // Get all clients
    router.get('/', async (req, res) => {
      try {
        const result = await pool.query(
          'SELECT * FROM clients ORDER BY name ASC'
        );
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // Get client by ID
    router.get('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query(
          'SELECT * FROM clients WHERE id = $1',
          [id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // Create new client
    router.post('/', async (req, res) => {
      try {
        const { name, email, phone } = req.body;
        
        if (!name || !email) {
          return res.status(400).json({ error: 'Name and email are required' });
        }
        
        const result = await pool.query(
          'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
          [name, email, phone]
        );
        
        res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // Update client
    router.put('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { name, email, phone } = req.body;
        
        if (!name || !email) {
          return res.status(400).json({ error: 'Name and email are required' });
        }
        
        const result = await pool.query(
          'UPDATE clients SET name = $1, email = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
          [name, email, phone, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json(result.rows[0]);
      } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // Delete client
    router.delete('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const result = await pool.query(
          'DELETE FROM clients WHERE id = $1 RETURNING *',
          [id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json({ message: 'Client deleted successfully' });
      } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    export default router;
    ```

19. **Create similar route files for other entities** (projects, project-types, etc.) following the same pattern.

20. **Build and start the API server**:
    ```bash
    npm run build
    npm start
    ```

## Step 5: Clone and Configure the Frontend Application

1. **Create a directory for the frontend**:
   ```bash
   sudo mkdir -p /var/www/devsroom-frontend
   sudo chown -R $USER:$USER /var/www/devsroom-frontend
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/devsroom-workspace.git /var/www/devsroom-frontend
   cd /var/www/devsroom-frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create a .env file for frontend**:
   ```bash
   nano .env.production
   ```

5. **Add API URL to the .env file**:
   ```
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   ```

6. **Update the Supabase client configuration** to use your custom API instead:
   ```bash
   nano src/integrations/custom-api/client.ts
   ```

7. **Add this code to the client.ts file**:
   ```typescript
   import axios from 'axios';

   const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

   const apiClient = axios.create({
     baseURL: apiBaseUrl,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add token to requests if available
   apiClient.interceptors.request.use((config) => {
     const storedUser = localStorage.getItem("devsroom_user");
     if (storedUser) {
       try {
         const { token } = JSON.parse(storedUser);
         if (token) {
           config.headers.Authorization = `Bearer ${token}`;
         }
       } catch (error) {
         console.error('Error parsing user data:', error);
       }
     }
     return config;
   });

   export default apiClient;
   ```

8. **Update AuthContext.tsx** to use your custom API for authentication:
   ```bash
   nano src/contexts/AuthContext.tsx
   ```

9. **Replace the content of AuthContext.tsx with**:
   ```typescript
   import { createContext, useContext, useState, useEffect, ReactNode } from "react";
   import { useNavigate, useLocation } from "react-router-dom";
   import { useToast } from "@/hooks/use-toast";
   import apiClient from "@/integrations/custom-api/client";

   interface AuthContextType {
     isAuthenticated: boolean;
     user: User | null;
     login: (email: string, password: string) => Promise<boolean>;
     logout: () => void;
     updateUserProfile: (updates: Partial<User>) => void;
   }

   interface User {
     email: string;
     name: string;
     token?: string;
   }

   // Change to your email
   const ADMIN_EMAIL = "mehedihassanshubho@gmail.com";

   const AuthContext = createContext<AuthContextType | undefined>(undefined);

   export const AuthProvider = ({ children }: { children: ReactNode }) => {
     const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
     const [user, setUser] = useState<User | null>(null);
     const { toast } = useToast();
     const navigate = useNavigate();
     const location = useLocation();

     // Check for existing session on load
     useEffect(() => {
       const storedUser = localStorage.getItem("devsroom_user");
       if (storedUser) {
         setUser(JSON.parse(storedUser));
         setIsAuthenticated(true);
       }
     }, []);

     // Redirect authenticated users if trying to access login page
     useEffect(() => {
       if (isAuthenticated && location.pathname === "/login") {
         navigate("/");
       }
     }, [isAuthenticated, location.pathname, navigate]);

     const login = async (email: string, password: string): Promise<boolean> => {
       try {
         // Use the API for authentication
         const response = await apiClient.post('/auth/login', { email, password });
         const { user, token } = response.data;
         
         const userData = { ...user, token };
         setUser(userData);
         setIsAuthenticated(true);
         localStorage.setItem("devsroom_user", JSON.stringify(userData));
         
         toast({
           title: "Login successful",
           description: "Welcome back to your Devsroom Workspace!",
         });
         return true;
       } catch (error) {
         console.error('Login error:', error);
         toast({
           title: "Login failed",
           description: "Invalid email or password",
           variant: "destructive",
         });
         return false;
       }
     };

     const logout = () => {
       setUser(null);
       setIsAuthenticated(false);
       localStorage.removeItem("devsroom_user");
       toast({
         title: "Logged out",
         description: "You have been logged out successfully",
       });
       navigate("/login");
     };

     const updateUserProfile = (updates: Partial<User>) => {
       if (!user) return;
       
       const updatedUser = { ...user, ...updates };
       setUser(updatedUser);
       localStorage.setItem("devsroom_user", JSON.stringify(updatedUser));
     };

     return (
       <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUserProfile }}>
         {children}
       </AuthContext.Provider>
     );
   };

   export const useAuth = () => {
     const context = useContext(AuthContext);
     if (context === undefined) {
       throw new Error("useAuth must be used within an AuthProvider");
     }
     return context;
   };
   ```

10. **Build the frontend**:
    ```bash
    npm run build
    ```

## Step 6: Configure Nginx

1. **Create Nginx configuration for the API**:
   ```bash
   sudo nano /etc/nginx/sites-available/devsroom-api
   ```

2. **Add this configuration**:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Create Nginx configuration for the frontend**:
   ```bash
   sudo nano /etc/nginx/sites-available/devsroom-frontend
   ```

4. **Add this configuration**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       root /var/www/devsroom-frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```

5. **Enable the configurations**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/devsroom-api /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/devsroom-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   sudo certbot --nginx -d api.yourdomain.com
   ```

## Step 7: Set Up Process Manager

1. **Install PM2**:
   ```bash
   sudo npm install -g pm2
   ```

2. **Create PM2 configuration**:
   ```bash
   nano /var/www/devsroom-api/ecosystem.config.js
   ```

3. **Add this configuration**:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'devsroom-api',
         script: 'dist/index.js',
         instances: 'max',
         exec_mode: 'cluster',
         autorestart: true,
         watch: false,
         max_memory_restart: '300M',
         env: {
           NODE_ENV: 'production',
         },
       },
     ],
   };
   ```

4. **Start the API with PM2**:
   ```bash
   cd /var/www/devsroom-api
   pm2 start ecosystem.config.js
   ```

5. **Make PM2 start on boot**:
   ```bash
   pm2 startup
   pm2 save
   ```

## Step 8: Database Backups and Maintenance

1. **Create a backup script**:
   ```bash
   sudo nano /usr/local/bin/backup-postgres.sh
   ```

2. **Add this backup script**:
   ```bash
   #!/bin/bash
   
   BACKUP_DIR="/var/backups/postgres"
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   DB_NAME="devsroomdb"
   BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"
   
   # Create backup directory if it doesn't exist
   mkdir -p $BACKUP_DIR
   
   # Perform backup
   sudo -u postgres pg_dump $DB_NAME > $BACKUP_FILE
   
   # Compress the backup
   gzip $BACKUP_FILE
   
   # Delete backups older than 14 days
   find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +14 -delete
   
   echo "Backup completed: ${BACKUP_FILE}.gz"
   ```

3. **Make the script executable**:
   ```bash
   sudo chmod +x /usr/local/bin/backup-postgres.sh
   ```

4. **Set up a cron job to run the backup daily**:
   ```bash
   sudo crontab -e
   ```

5. **Add this line to the crontab**:
   ```
   0 2 * * * /usr/local/bin/backup-postgres.sh >> /var/log/postgres-backup.log 2>&1
   ```

## Step 9: Security Hardening

1. **Update regularly**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Fail2ban to prevent brute force attacks**:
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. **Configure PostgreSQL security**:
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```

4. **Ensure PostgreSQL only listens on localhost**:
   ```bash
   sudo nano /etc/postgresql/14/main/postgresql.conf
   ```

   Find the line with `listen_addresses` and set it to:
   ```
   listen_addresses = 'localhost'
   ```

5. **Restart PostgreSQL**:
   ```bash
   sudo systemctl restart postgresql
   ```

## Step 10: Monitoring and Maintenance

1. **Install monitoring tools**:
   ```bash
   sudo apt install -y htop iotop
   ```

2. **Monitor the server load**:
   ```bash
   htop
   ```

3. **Monitor disk space**:
   ```bash
   df -h
   ```

4. **Check running services**:
   ```bash
   sudo systemctl status nginx
   sudo systemctl status postgresql
   pm2 status
   ```

5. **Check Nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

6. **Check API logs**:
   ```bash
   pm2 logs
   ```

## Step 11: Update Your Application

When you need to update your application:

1. **Update the frontend**:
   ```bash
   cd /var/www/devsroom-frontend
   git pull
   npm install
   npm run build
   ```

2. **Update the API**:
   ```bash
   cd /var/www/devsroom-api
   git pull
   npm install
   npm run build
   pm2 restart devsroom-api
   ```

## First-Time Admin Setup

After deploying, you'll need to set up your admin account:

1. **Generate a password hash** for your admin user:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-secure-password', 10, (err, hash) => { console.log(hash); });"
   ```

2. **Update the admin password hash** in the auth.ts route file with the newly generated hash.

3. **Restart the API server**:
   ```bash
   pm2 restart devsroom-api
   ```

4. **Test the login** with your email (mehedihassanshubho@gmail.com) and the password you used to generate the hash.

## Conclusion

Congratulations! You've now set up a fully self-hosted Devsroom Workspace application on your own VPS. The application is:

1. Using PostgreSQL on your server for data storage
2. Running a custom API backend to handle database operations
3. Serving the frontend via Nginx
4. Secured with SSL certificates from Let's Encrypt
5. Protected by a firewall and security best practices
6. Configured for regular backups
7. Set up with monitoring tools for maintenance

To keep your application running smoothly, regularly check for security updates, monitor server resources, and perform regular backups.

