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

CMD ["python", "telegram_bot/bot.py"]

