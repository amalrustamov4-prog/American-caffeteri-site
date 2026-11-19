@echo off
chcp 65001 >nul
echo ===================================================
echo 🚀 AMERICAN CAFFETTERIA — VERCEL & CLOUD DEPLOY
echo ===================================================
echo.
echo [1/4] Sinxronizatsiya: fayllarni yangilash...
python sync_web.py
if %errorlevel% neq 0 (
    echo [XATO] Fayllarni sinxronizatsiya qilib bo'lmadi!
    pause
    exit /b %errorlevel%
)
echo.
echo [2/4] Avtotestlarni tekshirish...
python tests/test_suite.py
if %errorlevel% neq 0 (
    echo [XATO] Testlar xato bilan yakunlandi!
    pause
    exit /b %errorlevel%
)
python tests/test_realtime_endpoints.py
if %errorlevel% neq 0 (
    echo [XATO] API testlar xato bilan yakunlandi!
    pause
    exit /b %errorlevel%
)
echo.
echo [3/4] Git commit va GitHub ga yuklash...
git add .
git commit -m "chore: auto-deploy update" --allow-empty
git push origin main
git push mirror main
echo.
echo [4/4] Vercel Production ga to'g'ridan-to'g'ri yangilash...
set VERCEL_TOKEN=vcp_3QZesduPL4fL0JPUQk176tQUqioZt7p08DVjBwTByHDFD2sQld3O0Wsa
call npx vercel build --prod --yes
call npx vercel deploy --prebuilt --prod --yes
echo.
echo ===================================================
echo ✅ SAYT VERCEL VA GITHUB'DA MUVAFFAQIYATLI YANGILANDI!
echo 🌐 Ishchi havola: https://american11.vercel.app
echo ===================================================
pause
