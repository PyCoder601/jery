FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install -r requirements.txt

COPY . /app/

RUN chmod +x /app/entrypoint.sh

EXPOSE 8004

CMD ["/app/entrypoint.sh"]