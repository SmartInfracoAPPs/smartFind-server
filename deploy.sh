
echo "building app"


# npm run start

echo "deploying files to server"

scp -P 4422 -r * githubuser@10.247.5.180:/var/www/smartfindold/backend

echo "done!"