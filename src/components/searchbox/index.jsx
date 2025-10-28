import "./style.css";

function SearchBox({ tipo, onChange, tabelas }) {
  return (
    <div className="search-box">
      <input type="text" placeholder="Insira o nome ou ID do Player" />
      <input type="number" placeholder="Discord ID do Player" />

      <select id="logs" value={tipo} onChange={e => onChange(e.target.value)}>
        <option value="">-- Escolha --</option>
        {tabelas.map((tabela, index) => (
          <option key={index} value={tabela}>
            {tabela}
          </option>
        ))}
      </select>

      <input
        type="button"
        value="Pesquisar"
        onClick={() => {
          if (!tipo) return alert("Você precisa selecionar uma tabela");
          alert(`Pesquisando na tabela ${tipo}`);
        }}
      />
    </div>
  );
}

export default SearchBox;
