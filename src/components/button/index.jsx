import "./style.css";
function Button() {
    return(
        <div className="btn">
            <a
                href={`https://wa.me/5522992326527?text=${encodeURIComponent("Quero contratar seus serviços")}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                Contrate meus Serviços
            </a>
        </div>
    );
}

export default Button;