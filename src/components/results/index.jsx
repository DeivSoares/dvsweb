import "./style.css";

function Results({ headers, rows }) {
  if (!headers.length) return <p>Nenhum cabeçalho definido.</p>;

  return (
    <table>
      <thead>
        <tr>
          {headers.map((head, index) => (
            <th key={index}>{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? (
          rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} style={{ textAlign: "center" }}>
              Nenhum dado encontrado
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default Results;
