start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
ping 127.0.0.1 -n 10 > nul
rem docker run   --rm -it -v .:/app -p 8081:8080  --name mynode mynode
docker run   --rm -d -v .:/app -p 8081:8080  --name mynode mynode
