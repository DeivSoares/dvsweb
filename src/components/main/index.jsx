import "./style.css";
import Logo from "../../assets/icons/DvsLogo.png";
import Perfil from "../../assets/icons/perfil.png";
import Social from '../social';
import Button from '../button';
import ProjetosData from '../projetos/projetosData';

function Main() {
  // Carrega automaticamente os ícones da pasta src/assets/icons
  const loadIcon = (iconName) => {
    try {
      return require(`../../assets/icons/${iconName}.png`);
    } catch (e) {
      // Fallback para emoji se a imagem não existir
      const emojiMap = {
        HTML: "🌐",
        CSS: "🎨",
        JavaScript: "⚡",
        React: "⚛️",
        CSharp: "🔷",
        Git: "📝",
        GitHub: "🐙",
      };
      return emojiMap[iconName] || "❓";
    }
  };

  const stacks = [
    { name: "HTML", icon: loadIcon("HTML") },
    { name: "CSS", icon: loadIcon("CSS") },
    { name: "JavaScript", icon: loadIcon("JavaScript") },
    { name: "React", icon: loadIcon("React") },
    { name: "NodeJS", icon: loadIcon("NodeJS") },
    { name: "Git", icon: loadIcon("Git") },
    { name: "GitHub", icon: loadIcon("GitHub") },
    { name: "C#", icon: loadIcon("CSharp") },
    { name: "Discord API", icon: loadIcon("Discord") },
  ];

  return (
    <main>
      <section className="intro-section">
        <div className="intro-background"></div>
        <div className="intro-content">
          <h1 style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
            <img src={Logo} alt="" style={{ width: "5rem" }} />
            Deivison Soares
          </h1>

          <h2>Transformando ideias em experiências digitais</h2>
          <p>
            A DVS Web é um projeto especializado no desenvolvimento de sites modernos, funcionais e personalizados, com foco em transformar ideias em uma presença digital de qualidade.
            <br></br>
            Mais do que criar páginas, buscamos oferecer soluções digitais alinhadas com a visão de cada cliente, prezando pela clareza, eficiência e qualidade em cada entrega.
          </p>
        </div>

        <div className="intro-image">
          <img src={Perfil} alt="Imagem de Perfil Deivison Soares" />
          <Social />
          <Button />
        </div>

        
      <section className="stacks-section">
        <h3>Minhas Stacks</h3>
        <div className="stacks-grid">
          {stacks.map((stack, index) => (
            <div key={index} className="stack-item">
              <div className="stack-icon">
                {typeof stack.icon === "string" && stack.icon.startsWith("/") ? (<img src={stack.icon} alt={`${stack.name} icon`} />) : (<span>{stack.icon}</span>)}
              </div>
              <span className="stack-name">{stack.name}</span>
            </div>
          ))}
        </div>
      </section>


      </section>


      <section className="projects">
        <h3>Meus Projetos</h3>
        <div className="projects-grid">
          {ProjetosData.map((projeto, index) => (
            <div key={index} className="project-item">
              <h4>{projeto.title}</h4>
              <p>{projeto.description}</p>
              <a href={projeto.link} target="_blank" rel="noopener noreferrer">
                <img src={projeto.image} alt={projeto.title} />
              </a>
            </div>
          ))}

        </div>
      </section>

      <footer>
        <p>&copy; 2026 DVS Web. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

export default Main;
