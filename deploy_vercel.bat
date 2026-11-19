@echo off
chcp 65001 >nul
echo ===================================================
echo 🚀 AMERICAN CAFFETTERIA — VERCEL DEPLOYMENT
echo ===================================================
echo.
echo [1/3] Синхронизация файлов web и android...
python sync_web.py
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось синхронизировать файлы!
    pause
    exit /b %errorlevel%
)
echo.
echo [2/3] Запуск автотестов...
python tests/test_suite.py
python tests/test_realtime_endpoints.py
if %errorlevel% neq 0 (
    echo [ОШИБКА] Тесты завершились с ошибкой! Деплой отменён.
    pause
    exit /b %errorlevel%
)
echo.
echo [3/3] Деплой на Vercel Production...
npx vercel --prod --token vcp_3QZesduPL4fL0JPUQk176tQUqioZt7p08DVjBwTByHDFD2sQld3O0Wsa --yes
echo.
echo ===================================================
echo ✅ САЙТ УСПЕШНО ОБНОВЛЁН НА VERCEL!
echo 🌐 https://american11.vercel.app
echo ===================================================
pause
