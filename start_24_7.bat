@echo off
title American Caffetteria 24/7 Watchdog
color 0A

echo ==========================================================
echo    AMERICAN CAFFETTERIA - 24/7 AUTO-RESTART WATCHDOG     
echo ==========================================================
echo Сервер автоматически перезапустится при любых сбоях.
echo Для полной остановки закройте это окно или нажмите Ctrl+C.
echo ==========================================================
echo.

:loop
echo [%date% %time%] Запуск telegram_bot/bot.py...
python telegram_bot/bot.py
echo.
echo [%date% %time%] Процесс завершился! Автоматический перезапуск через 3 секунды...
timeout /t 3 /nobreak >nul
goto loop

