# django_maps2

## Demo:
   http://dev.nomadiclogs.com

## Deployment:

####Prerequisites:
--npm v6.2.0
--python3.5

1. Create a virtualenv:
`sudo apt-get install virtualenvwrapper`
(You might need to restart your terminal after installing virtualenvwrapper)

`mkvirtualenv dm2 --python /usr/bin/python3.5`

2. Get this project:
`git clone https://github.com/agilman/django_maps2`

3. Install Python dependencies:
```cd django_maps2
pip install -r requirements.txt```

4. Create project database:
`python manage.py migrate`

5. Install javascript dependencies:
```cd maps/www/
npm install package-lock.json```

6. Create minified js files:
```./uglify-editor.sh
./uglify-viewer.sh```


## Running the app
cd to django_maps2 root directory
`python manage.py runserver`

