import { useState, useEffect } from "react";
import "./style.css";
import ProjetosData from "../projetos/projetosData";

function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % ProjetosData.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? ProjetosData.length - 1 : prev - 1
        );
    };

    // 🔥 AUTOPLAY
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 3000); // troca a cada 3s

        return () => clearInterval(interval); // limpa quando desmontar
    }, []);
    // Pausar ao passar mouse
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ProjetosData.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused]);

    return (
        <div className="carousel" onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}>
            {/* <button className="prev" onClick={prevSlide}>‹</button> */}

            <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {ProjetosData.map((projeto, index) => (
                    <div key={index} className="carousel-card">
                        <img src={projeto.image} alt={projeto.title} />
                        {/* <h4>{projeto.title}</h4> */}
                        {/* <p>{projeto.description}</p> 
                         <a href={projeto.link} target="_blank" rel="noreferrer">Ver projeto</a> */}
                    </div>
                ))}
            </div>

            {/* <button className="next" onClick={nextSlide}>›</button> */}
        </div>
    );
}

export default Carousel;