#!/bin/sh


VERSION=`git branch --show-current`

dest='../todo'



#(cd ${dest}  && git pull --rebase)
npm run build -- --outDir=${dest}

(cd ${dest} && git add . && git commit -am 'update' && while ! git push ; do echo 'lll';done;)
echo "https://alearningapp.com/todo/";
echo 'done';
