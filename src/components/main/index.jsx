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
            A DVS Web é uma empresa especializada no desenvolvimento de sites modernos, funcionais e personalizados, focada em transformar ideias em presença digital de qualidade.
            <br></br>
            Mais do que criar páginas, entregamos soluções digitais alinhadas com a visão de cada cliente, prezando sempre pela clareza, eficiência e qualidade na execução.
          </p>
        </div>

        <div className="intro-image">
          <img src="https://media.licdn.com/dms/image/v2/D4D03AQGCZHXLOCokPA/profile-displayphoto-scale_400_400/B4DZzmPK9CIwAg-/0/1773389263171?e=1777507200&v=beta&t=wkABLhbvOQpPFMGqTdzNASvBVR2dSUyOuh9Em2MJRjE" alt="Imagem de Perfil Deivison Soares" />
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
