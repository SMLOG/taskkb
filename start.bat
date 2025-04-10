start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

:waitForDocker
timeout /t 2 > nul
docker ps > nul 2>&1
if %errorlevel% neq 0 (
	ping 127.0.0.1 -n 1 > nul
    goto :waitForDocker
)

docker build -t mynode .
rem docker run   --rm -it -v .:/app -p 8081:8080  --name mynode mynode
docker run    --rm -v "%CD%":/app -p 8081:8080  --name mynode mynode

pause