@echo off
REM EduAI Docker Rebuild Script for Windows

echo 🔄 Rebuilding EduAI containers with updated dependencies...

REM Stop running containers
echo ⏹️  Stopping containers...
docker-compose -f docker-compose.dev.yml down

REM Remove old backend image to force rebuild
echo 🗑️  Removing old backend image...
docker image rm hackathon2-backend -f 2>nul

REM Rebuild and start containers
echo 🏗️  Building and starting containers...
docker-compose -f docker-compose.dev.yml --env-file .env up --build -d

REM Show status
echo 📊 Container status:
docker-compose -f docker-compose.dev.yml ps

echo ✅ Rebuild complete!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs

REM Show logs
echo.
echo 📜 Following logs (Ctrl+C to exit):
docker-compose -f docker-compose.dev.yml logs -f
