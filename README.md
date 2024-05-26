This is a website for tracking logins 

Deployment 

ssh -i C:\Users\peter\OneDrive\Documents\awskeys\updated-wow-web-key.pem ubuntu@18.208.1.61
cd wow-website
git pull
npm install
pm2 restart wow-web
exit