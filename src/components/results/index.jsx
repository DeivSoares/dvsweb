import "./style.css";

function Results() {
  return (
    <div>
      <div className="title-search-results">
        <h3>Assassino</h3>
        <h3>Vítima</h3>
        <h3>Coordenada</h3>
        <h3>Causa da Morte</h3>
        <h3>Código da Morte</h3>
        <h3>Data e Hora</h3>
      </div>
      <div className="content-search-results">
        <ul className="content-results" id="0">
            <li><h3>Tchan</h3></li>
            <li><h3>Kah</h3></li>
            <li><h3>Coordenada</h3></li>
            <li><h3>WEAPON_SPECIAL_CARBINE_MK2</h3></li>
            <li><h3>HASDA144</h3></li>
            <li><h3>23/10 às 12:00</h3></li>
        </ul>
      </div>
    </div>
  );
}
export default Results;
