FROM python:3.9-alpine

WORKDIR /app

COPY requirements.txt .

# Install python packages and remove build dependencies
RUN apk add --no-cache --virtual .build-deps gcc musl-dev && \
    pip install --no-cache-dir -r requirements.txt && \
    apk del .build-deps

COPY . .

EXPOSE 5002

CMD ["python", "api_server.py"]

