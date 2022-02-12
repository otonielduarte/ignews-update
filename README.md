stripe util with docker

First you need make the login in stripe with the command bellow:
- docker run --rm -v ~/.config/stripe:/root/.config/stripe -it stripe/stripe-cli:latest login
  
  (this key will expire after 90 days, at which point you'll need to re-authenticate.)
  It was execute at 22/02/06

So now you can execute others command:
docker run --rm -v ~/.config/stripe:/root/.config/stripe -it stripe/stripe-cli:latest listen --forward-to 192.168.0.1:3000/api/webhooks
