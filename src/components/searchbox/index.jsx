import "./style.css";

function SearchBox() {
  return (
    <div className="search-box">
      <img
        src="https://media.discordapp.net/attachments/1039084685390774324/1430815528938639390/ebcaf586-5d74-480a-97d8-6c1bb37ff84f.gif?ex=68fb264d&is=68f9d4cd&hm=cd4d7d1b02ebe0db6e8d115e464ea70ce5890710c63c393589e5e3fabd4bdd56&=&width=360&height=360"
        alt=""
      />
      <input
        type="text"
        name="pesquisa"
        id="pesquisa"
        placeholder="Insira o nome ou ID do Player"
      />
      <input
        type="number"
        name="discord"
        id="discord"
        placeholder="Discord ID do Player"
      />
      <select id="logs">
        <option value="Selecione uma Log">Selecione uma Log</option>
        <option value="Kill">Voltou pra Ação</option>
        <option value="VDM">Vdm</option>
        <option value="Kill">Kill</option>
        <option value="GG">GG</option>
        <option value="GG no Airdrop">GG no Airdrop</option>
        <option value="Adrenalina">Adrenalina</option>
        <option value="Desfibrilador">Desfibrilador</option>
        <option value="Anuncios">Anuncios</option>
        <option value="Saque">Saque</option>
        <option value="Enviou">Enviou</option>
        <option value="Lixo">Lixo</option>
        <option value="Cobrança">Cobrança</option>
        <option value="Booster">Booster</option>
        <option value="Cam">Cam</option>
        <option value="Lojinha">Lojinha</option>
        <option value="Quadro">Quadro</option>
      </select>
      <input type="button" value="Pesquisar" />
    </div>
  );
}

export default SearchBox;
