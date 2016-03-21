# yippeecouriers
A service to jet your pet around the world!

Dev Setup
---------

You'll need node, npm, gulp installed. 

Checkout the code:
git clone https://github.com/YippeeAir/yippeecouriers

NPM Install:
npm install

Start the app w/ Gulp:
gulp develop


Server Setup
------------

Server is running on Google Compute Engine.

Node Setup: https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04
Mongo Setup: https://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

File Locations:
App Code: /opt/yippee
Nginx Config: /etc/nginx/sites-available/default 

App Management:
Start: pm2 start app
Stop: pm2 stop app
Restart: pm2 restart app

Mongo
mongo access only allowed locally. Login via SSH or connect via an SSH tunnel

