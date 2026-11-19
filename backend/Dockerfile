# syntax=docker/dockerfile:1

FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dependencies first (cached until requirements.txt changes).
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Run as a non-root user.
RUN useradd --create-home --uid 10001 appuser

# Upload directory must be writable by that user. Creating it in the image also makes
# a fresh named volume inherit the ownership (Docker copies the directory on first use).
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app/uploads

COPY app ./app
COPY tests ./tests

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=3).read()" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
