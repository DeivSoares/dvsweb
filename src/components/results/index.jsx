import "./style.css";

function Results() {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Assassino</th>
            <th>Vítima</th>
            <th>Coordenada</th>
            <th>Causa da Morte</th>
            <th>Código da Morte</th>
            <th>Data e Hora</th>
          </tr>
        </thead>
        <tbody>
          <tr className="results-row">
            <td>Tchan</td>
            <td>Kah</td>
            <td>Coordenada</td>
            <td>WEAPON_SPECIAL_CARBINE_MK2</td>
            <td>HASDA144</td>
            <td>23/10 às 12:00</td>
          </tr>
          <tr className="results-row">
            <td>Tchan</td>
            <td>Kah</td>
            <td>Coordenada</td>
            <td>WEAPON_SPECIAL_CARBINE_MK2</td>
            <td>HASDA144</td>
            <td>23/10 às 12:00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default Results;