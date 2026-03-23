import "./style.css";
import Logo from "../../assets/icons/DvsLogo.png";
import Social from '../social';
import Button from '../button';

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
    { name: "C#", icon: loadIcon("CSharp") },
    { name: "Git", icon: loadIcon("Git") },
    { name: "GitHub", icon: loadIcon("GitHub") },
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

          <h2>Transformo sua ideia em realidade</h2>
          <p>
            Me chamo Deivison Soares, tenho 26 anos e sou apaixonado por
            tecnologia desde que me entendo por gente. <br></br>
            Formado em <span>Desenvolvimento de Sistemas</span>{" "}e especializado em <span>Desenvolvimento Web</span>.
            Hoje atuo criando interfaces intuitivas e responsivas que proporcionam experiências excepcionais
            aos usuários, oferecendo total suporte. <br></br>
            Se você também acredita que a tecnologia pode transformar ideias em
            realidade, estamos na mesma sintonia.
          </p>
        </div>

        <div className="intro-image">
          <img src="https://media.licdn.com/dms/image/v2/D4D35AQEhL598s_gfbA/profile-framedphoto-shrink_200_200/B4DZzmPLcsG4AY-/0/1773389265027?e=1774836000&v=beta&t=D6whBpT0zQS9g-Agm45m1iQOip0JjLYAZccpmbtriAs" alt="" />
            <Social />
            <Button />
        </div>
      </section>

      <section className="stacks-section">
        <h3>Minhas Stacks</h3>
        <div className="stacks-grid">
          {stacks.map((stack, index) => (
            <div key={index} className="stack-item">
              <div className="stack-icon">
                {typeof stack.icon === "string" &&
                stack.icon.startsWith("/") ? (
                  <img src={stack.icon} alt={`${stack.name} icon`} />
                ) : (
                  <span>{stack.icon}</span>
                )}
              </div>
              <span className="stack-name">{stack.name}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Main;
