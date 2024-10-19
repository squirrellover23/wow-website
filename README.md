This is a website for tracking class attendance

Technology stack:

Front end:
this uses a simple express js app and ejs files to create up the web pages

Back end: 

the server uses a sqlite3 database running on the ec2 instance
this uses pm2 to keep express running
this also uses caddy to redirect trafic to port 3000 where the app is listening
caddy was used so that it would be easy to add a domain which was never implemented





