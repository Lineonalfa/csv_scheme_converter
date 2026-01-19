const { useMemo, useState } = React;

const DEFAULT_ROWS_PER_PAGE = 8;

const chunkRows = (rows, chunkSize) => {
  if (!rows.length) return [];
  const pages = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    pages.push(rows.slice(i, i + chunkSize));
  }
  return pages;
};

const parseCsvText = (text) =>
  Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

const App = () => {
  const [csvData, setCsvData] = useState({ headers: [], rows: [] });
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [fileLabel, setFileLabel] = useState("No file selected");
  const [error, setError] = useState("");

  const pages = useMemo(
    () => chunkRows(csvData.rows, Number(rowsPerPage) || DEFAULT_ROWS_PER_PAGE),
    [csvData.rows, rowsPerPage]
  );

  const handleCsvParse = (text, label) => {
    const results = parseCsvText(text);
    if (results.errors?.length) {
      setError(results.errors.map((item) => item.message).join("; "));
      return;
    }

    const headers = results.meta.fields || [];
    const rows = results.data || [];
    setCsvData({ headers, rows });
    setFileLabel(label);
    setError("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      handleCsvParse(loadEvent.target.result, file.name);
    };
    reader.readAsText(file);
  };

  const handleSampleLoad = async () => {
    try {
      const response = await fetch(
        "Grade_3_Mathematics_Scheme_Strand1_Substrand1_Lessons1-8.csv"
      );
      if (!response.ok) {
        throw new Error("Sample CSV could not be loaded.");
      }
      const text = await response.text();
      handleCsvParse(text, "Grade 3 Mathematics Sample");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadPdf = () => {
    if (!csvData.rows.length) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Scheme of Work", 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Source: ${fileLabel}`, 40, 60);

    doc.autoTable({
      head: [csvData.headers],
      body: csvData.rows.map((row) => csvData.headers.map((header) => row[header])),
      startY: 80,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [32, 61, 90] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 40, right: 40 },
    });

    doc.save("scheme-of-work.pdf");
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">CSV → Scheme of Work</p>
          <h1>Build clean, multi-page schemes from any CSV.</h1>
          <p className="subtitle">
            Upload a CSV file to generate a formatted scheme of work preview and
            download it as a multi-page PDF.
          </p>
        </div>
        <div className="controls">
          <label className="file-upload">
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <span>Select CSV</span>
          </label>
          <button className="secondary" onClick={handleSampleLoad}>
            Load sample
          </button>
          <button className="primary" onClick={handleDownloadPdf}>
            Download PDF
          </button>
        </div>
      </header>

      <section className="settings">
        <div>
          <h2>Preview settings</h2>
          <p>
            Adjust how many lessons appear on each page. This does not affect the
            PDF auto pagination, but it helps you preview the layout.
          </p>
        </div>
        <label>
          Rows per page
          <input
            type="number"
            min="4"
            max="20"
            value={rowsPerPage}
            onChange={(event) => setRowsPerPage(event.target.value)}
          />
        </label>
      </section>

      <section className="status">
        <div>
          <h3>Current file</h3>
          <p>{fileLabel}</p>
        </div>
        <div>
          <h3>Rows detected</h3>
          <p>{csvData.rows.length}</p>
        </div>
        <div>
          <h3>Columns detected</h3>
          <p>{csvData.headers.length}</p>
        </div>
      </section>

      {error && (
        <div className="error">
          <strong>CSV parsing issue:</strong> {error}
        </div>
      )}

      {!csvData.rows.length ? (
        <section className="empty">
          <h2>No CSV loaded yet</h2>
          <p>
            Upload a CSV file or use the sample to generate a multi-page scheme
            of work preview.
          </p>
        </section>
      ) : (
        <section className="pages">
          {pages.map((pageRows, index) => (
            <article className="page" key={`page-${index}`}>
              <header>
                <h2>Scheme of Work</h2>
                <p>
                  Page {index + 1} of {pages.length}
                </p>
              </header>
              <table>
                <thead>
                  <tr>
                    {csvData.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, rowIndex) => (
                    <tr key={`${index}-${rowIndex}`}>
                      {csvData.headers.map((header) => (
                        <td key={`${index}-${rowIndex}-${header}`}>
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
