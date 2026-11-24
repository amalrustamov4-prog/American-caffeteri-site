FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
COPY telegram_bot/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходных файлов
COPY . /app

# Предварительная синхронизация статических ассетов
RUN python sync_web.py

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request, sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8080/api/health', timeout=3).getcode() == 200 else 1)"

CMD ["python", "telegram_bot/bot.py"]

