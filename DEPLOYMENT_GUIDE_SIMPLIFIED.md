
# Simple Deployment Guide for Devsroom Workspace

This guide will help you deploy the Devsroom Workspace application on your own server, even if you have limited technical experience. We'll walk through each step in detail.

## What You'll Need

- A VPS (Virtual Private Server) running Ubuntu 24.04
- A domain name pointing to your server's IP address
- About 30-60 minutes of your time

## Step 1: Set Up Your Server

1. **Log in to your VPS** using SSH:
   ```bash
   ssh username@your-server-ip
   ```

2. **Update your system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Install required packages**:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx git
   ```

4. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

## Step 2: Set Up PostgreSQL Database

1. **Install PostgreSQL**:
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```

2. **Create a database user and database**:
   ```bash
   sudo -u postgres psql
   ```

3. **In the PostgreSQL prompt, type these commands** (replace 'yourpassword' with a strong password):
   ```sql
   CREATE USER devsroom WITH PASSWORD 'yourpassword';
   CREATE DATABASE devsroomdb;
   GRANT ALL PRIVILEGES ON DATABASE devsroomdb TO devsroom;
   \q
   ```

## Step 3: Get the Application Code

1. **Create a directory for the application**:
   ```bash
   sudo mkdir -p /var/www/devsroom
   sudo chown -R $USER:$USER /var/www/devsroom
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/devsroom-workspace.git /var/www/devsroom
   cd /var/www/devsroom
   ```

## Step 4: Configure the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create a production environment file**:
   ```bash
   nano .env
   ```

3. **Add these environment variables** (replace values as appropriate):
   ```
   VITE_SUPABASE_URL=https://zmimjuoezczcmnczuvnc.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptaW1qdW9lemN6Y21uY3p1dm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MDg4NTIsImV4cCI6MjA1NzQ4NDg1Mn0.qW3noDGo4oyPmAqqB-MNArgsVZ86oy3B2JCj-sLvtMI
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

## Step 5: Set Up Nginx

1. **Create an Nginx configuration file**:
   ```bash
   sudo nano /etc/nginx/sites-available/devsroom
   ```

2. **Add this configuration** (replace yourdomain.com with your actual domain):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       root /var/www/devsroom/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Enable the site and restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/devsroom /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 6: Set Up SSL (HTTPS)

1. **Get an SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

2. **Follow the prompts** and select the option to redirect all traffic to HTTPS

## Step 7: Set Up Admin User

The default admin credentials are:
- Email: admin@example.com
- Password: admin123

To change these to use your email (mehedihassanshubho@gmail.com):

1. **Edit the authentication context file**:
   ```bash
   nano /var/www/devsroom/src/contexts/AuthContext.tsx
   ```

2. **Find these lines**:
   ```javascript
   const ADMIN_EMAIL = "admin@example.com";
   const ADMIN_PASSWORD = "admin123";
   ```

3. **Change them to**:
   ```javascript
   const ADMIN_EMAIL = "mehedihassanshubho@gmail.com";
   const ADMIN_PASSWORD = "your-secure-password";  // Choose a strong password
   ```

4. **Rebuild the application**:
   ```bash
   npm run build
   ```

## Step 8: Keep Your Application Running

1. **Install PM2** to keep your application running:
   ```bash
   sudo npm install -g pm2
   ```

2. **If you need to restart your server**, PM2 will automatically restart your application:
   ```bash
   pm2 startup
   ```

## Maintenance Tips

### Updating Your Application

When you have updates to your application:

1. **Pull the latest changes**:
   ```bash
   cd /var/www/devsroom
   git pull
   ```

2. **Rebuild the application**:
   ```bash
   npm install
   npm run build
   ```

### Database Backups

1. **Create a backup script**:
   ```bash
   sudo nano /usr/local/bin/backup-db.sh
   ```

2. **Add this content**:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/postgres"
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   FILENAME="devsroomdb_$TIMESTAMP.sql"

   mkdir -p $BACKUP_DIR
   sudo -u postgres pg_dump devsroomdb > $BACKUP_DIR/$FILENAME
   gzip $BACKUP_DIR/$FILENAME
   
   # Keep only the last 7 backups
   find $BACKUP_DIR -type f -name "devsroomdb_*.sql.gz" | sort -r | tail -n +8 | xargs -r rm
   ```

3. **Make it executable**:
   ```bash
   sudo chmod +x /usr/local/bin/backup-db.sh
   ```

4. **Schedule daily backups**:
   ```bash
   sudo crontab -e
   ```

5. **Add this line**:
   ```
   0 2 * * * /usr/local/bin/backup-db.sh
   ```

## Troubleshooting

### If you can't access your site:

1. **Check Nginx status**:
   ```bash
   sudo systemctl status nginx
   ```

2. **Check Nginx error logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check if your domain is pointing to your server**:
   ```bash
   ping yourdomain.com
   ```

### If you forget your admin password:

Edit the AuthContext.tsx file as shown in Step 7 to set a new password.

## Getting Help

If you need additional assistance, you can:
- Search online for specific error messages
- Hire a developer on platforms like Upwork or Fiverr for one-time assistance
- Consult the official documentation for Node.js, Nginx, or PostgreSQL

## Security Best Practices

1. **Keep your server updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install a firewall**:
   ```bash
   sudo apt install ufw
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

3. **Change your admin password regularly** by editing the AuthContext.tsx file

Congratulations! You've successfully deployed the Devsroom Workspace application on your own server.
