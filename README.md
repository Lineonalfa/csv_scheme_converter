# CSV Scheme Converter

This is a lightweight React-based single-page app that turns a CSV file into a
clean, multi-page scheme of work preview and downloadable PDF.

## How it works

- Upload any CSV file (with headers) using **Select CSV**.
- Adjust the number of rows per preview page.
- Download a multi-page PDF using the **Download PDF** button.

## Running locally

This project is intentionally dependency-free. Serve the folder with any static
server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.
