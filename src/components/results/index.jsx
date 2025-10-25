import "./style.css";

function Results({ headers, rows = [] }) {
    // debug rápido
  console.log("Headers recebidos em Results:", headers);


  return (
    <div>
      <table>
      <thead>
        <tr>
          {headers && headers.length > 0 ? (
            headers.map((head, index) => <th key={index}>{head}</th>)
          ) : (
            <th colSpan={6}>Nenhum cabeçalho definido</th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? (
          rows.map((r, i) => (
            <tr className="results-row" key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length || 6}>Sem dados</td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  );
}
export default Results;