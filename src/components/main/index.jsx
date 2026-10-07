import { useEffect } from "react";
import "./style.css";
import Logo from "../../assets/icons/DvsLogo.png";
import Perfil from "../../assets/icons/perfil.png";
import Social from "../social";
import Button from "../button";
import ProjetosData from "../projetos/projetosData";
import Carousel from "../carousel";
import ContactForm from "../contactform/contactform";
import { initRevealAnimations } from "../../reveal";

function Main() {
  useEffect(() => {
    initRevealAnimations();
  }, []);

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

  const services = [
    {
      icon: "</>",
      title: "Desenvolvimento Web",
      description: "Sites modernos e responsivos, criados para apresentar sua marca e atender às necessidades do seu negócio.",
    },
    {
      icon: "↻",
      title: "Manutenção de Sites",
      description: "Correções, atualizações e melhorias para manter seu site seguro, atualizado e funcionando bem.",
    },
    {
      icon: "⚙",
      title: "Manutenção de Sistemas",
      description: "Correção de erros, atualização e aprimoramento de funcionalidades em sistemas web para manter processos confiáveis e eficientes.",
    },
    {
      icon: "▦",
      title: "Desenvolvimento de Sistemas de Gestão",
      description: "Painéis administrativos personalizados para reunir clientes, financeiro, usuários e operações em um só lugar, com estrutura inspirada em ERPs.",
    },
    {
      icon: "✦",
      title: "Consultoria Web",
      description: "Orientação para definir estratégias, tecnologias e próximos passos no desenvolvimento de sites e sistemas alinhados aos objetivos do seu negócio.",
    },
    {
      icon: "🤖",
      title: "Bots Personalizados para Discord",
      description: "Bots sob medida para automatizar tarefas, organizar sua comunidade e criar experiências exclusivas no Discord.",
    },
  ];

  return (
    <main>
      <section className="intro-section">
        <div className="intro-background"></div>
        <div className="intro-content reveal fade-in-up">
          <h1
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <a href="https://dvsweb.com.br/#/painel/"><img src={Logo} alt="" style={{ width: "5rem" }} /></a>
            DVS WEB
          </h1>

          <h2>Transformando ideias em experiências digitais</h2>
          <p>
            A DVS Web é um projeto especializado no desenvolvimento de sites
            modernos, funcionais e personalizados, com foco em transformar
            ideias em uma presença digital de qualidade.
            <br></br>
            Mais do que criar páginas, buscamos oferecer soluções digitais
            alinhadas com a visão de cada cliente, prezando pela clareza,
            eficiência e qualidade em cada entrega.
          </p>
        </div>

        <div className="intro-image reveal fade-in-right">
          <img src={Perfil} alt="Imagem de Perfil Deivison Soares" />
          <Social />
          <Button />
        </div>

        <section className="stacks-section reveal fade-in-up">
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
      </section>

      <section className="services-section reveal fade-in-up" aria-labelledby="services-title">
        <h3 id="services-title">Serviços</h3>
        <div className="services-grid">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <span className="service-icon" aria-hidden="true">{service.icon}</span>
              <h4>{service.title}</h4>
              <p>{service.description}</p>
              <a
                className="service-contact"
                href={`https://wa.me/5522992326527?text=${encodeURIComponent(
                  `Olá! Tenho interesse no serviço de ${service.title} da DvS Web. Gostaria de receber mais informações.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Tenho interesse em ${service.title} pelo WhatsApp`}
              >
                Tenho interesse <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="projects reveal fade-in-up">
        <h3>Empresas que confiaram na DVS WEB</h3>
        <Carousel />
      </section>

      <section className="contact reveal fade-in-up">
        <h2>Contato</h2>
        <h3>
          Vamos <span>Desenvolver</span> Seu Projeto?
        </h3>
        <p>
          Se você tem uma ideia rodando aí na cabeça, chegou a hora de fazer
          acontecer. Me chama, conta o que você quer construir e vamos juntos
          transformar isso em algo real, funcional e que dá resultado.
        </p>
        <Social />
        <ContactForm />
      </section>

      <footer>
        <p>&copy; 2023-2026 DVS WEB. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

export default Main;
