@echo off
chcp 65001 > nul
echo ========================================================
echo   American Caffetteria - Загрузка проекта на GitHub
echo ========================================================
echo.
echo Вставьте ссылку на ваш GitHub репозиторий:
echo (например: https://github.com/ВАШ_ЛОГИН/American-caffeteri-site.git)
echo.
set /p REPO_URL="URL репозитория: "

if "%REPO_URL%"=="" (
    echo Ошибка: URL не может быть пустым!
    pause
    exit /b
)

echo.
echo Подключение репозитория...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Отправка всех файлов на GitHub...
git push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [УСПЕХ] Все файлы успешно загружены на GitHub!
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [ОШИБКА] Не удалось отправить. Проверьте ссылку или авторизацию.
    echo ========================================================
)
echo.
pause

