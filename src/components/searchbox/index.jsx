import "./style.css";

function SearchBox({ tipo, onChange }) {
  return (
    <div className="search-box">
      <img
        src="https://media.discordapp.net/attachments/1039084685390774324/1430815528938639390/ebcaf586-5d74-480a-97d8-6c1bb37ff84f.gif?ex=68fb264d&is=68f9d4cd&hm=cd4d7d1b02ebe0db6e8d115e464ea70ce5890710c63c393589e5e3fabd4bdd56&=&width=360&height=360"
        alt=""
      />
      <input type="text" name="pesquisa" id="pesquisa" placeholder="Insira o nome ou ID do Player"/>
      <input type="number" name="discord" id="discord" placeholder="Discord ID do Player"/>
      <select id="logs" value={tipo} onChange={onChange}>
        <option value="Selecione uma Log">Selecione uma Log</option>
        <option value="voltou">Voltou pra Ação</option>
        <option value="vdm">Vdm</option>
        <option value="kill">Kill</option>
        <option value="gg">GG</option>
        <option value="ggairdrop">GG no Airdrop</option>
        <option value="adrenalina">Adrenalina</option>
        <option value="desfibrilador">Desfibrilador</option>
        <option value="anuncios">Anuncios</option>
        <option value="saque">Saque</option>
        <option value="enviou">Enviou</option>
        <option value="lixo">Lixo</option>
        <option value="cobranca">Cobrança</option>
        <option value="booster">Booster</option>
        <option value="cam">Cam</option>
        <option value="lojinha">Lojinha</option>
        <option value="quadro">Quadro</option>
      </select>
      <input type="button" value="Pesquisar" onClick={buttonClick} />
    </div>
  );
}

export default SearchBox;

function buttonClick() {
  const table = document.querySelector("table");
  const pesquisa = document.getElementById('pesquisa').value.trim();
  const discord = document.getElementById('discord').value.trim();
  const logs = document.getElementById('logs').value;

  const mensagensErro = {
    pesquisa: 'O campo "Nome ou ID do Player" está vazio.',
    discord: 'O campo "Discord ID do Player" está vazio.',
    logs: 'Você precisa selecionar uma opção de log.'
  };

  if (!pesquisa) return alert(mensagensErro.pesquisa);
  if (!discord) return alert(mensagensErro.discord);
  if (logs === 'Selecione uma Log') return alert(mensagensErro.logs);

  alert('Pesquisa realizada com sucesso!');

  const tabelaVisivel = table.style.display !== "none";
  tabelaVisivel ? hideTable() : showTable();
}

function showTable() {
  const table = document.querySelector("table");
  table.style.display = "table";
  console.log("Tabela mostrada");
}

function hideTable() {
  const table = document.querySelector("table");
  table.style.display = "none";
  console.log("Tabela escondida");
}
