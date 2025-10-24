import SearchBox from "../../components/searchbox";
import Results from "../../components/results";
import "./style.css";

function Flow() {
  return (
    <main className="flw">
      <h1>Painel Admin</h1>
      <SearchBox />
      <Results />
    </main>
  );
}
export default Flow;
