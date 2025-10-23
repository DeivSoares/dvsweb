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
        <ul className="" id="0">
            <li>Tchan</li>
            <li>Kah</li>
            <li>Coordenada</li>
            <li>WEAPON_SPECIAL_CARBINE_MK2</li>
            <li>HASDA144</li>
            <li>23/10 às 12:00</li>
        </ul>
      </div>
    </div>
  );
}
export default Results;
