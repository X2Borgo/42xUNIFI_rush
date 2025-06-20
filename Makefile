BACKEND = backend/

all: npm php

npm:
	@echo "Opening new terminal for npm server..."
	@gnome-terminal --tab -- bash -c "npm install ; npm run host"

php:
	@echo "Opening new terminal for php server..."
	@gnome-terminal --tab -- bash -c "cd $(BACKEND) ; php -S localhost:8080"