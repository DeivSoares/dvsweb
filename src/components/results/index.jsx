import "./style.css";

function Results({ headers = [], rows = [] }) {
  return (
    <table>
      <thead>
        <tr>
          {headers.length > 0 ? (
            headers.map((headerTitle, index) => <th key={index}>{headerTitle}</th>)
          ) : (
            <th colSpan="6">Nenhum cabeçalho definido</th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? (
          rows.map((rowData, rowIndex) => (
            <tr key={rowIndex}>
              {rowData.map((cellData, cellIndex) => (
                <td key={cellIndex}>{cellData}</td>
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
  );
}

export default Results;