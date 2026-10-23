import React, { useState, useEffect, useRef } from "react";
import "./ContactForm.css";

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    discord: "",
    whatsapp: "",
    subject: "",
    message: "",
    consent: false,
  });
  const formRef = useRef(null);

  useEffect(() => {
    const scriptId = "staticforms-script";
    const attachForm = () => {
      if (window.StaticForms && formRef.current) {
        window.StaticForms.attach(formRef.current);
      }
    };

    const existingScript = document.getElementById(scriptId);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.staticforms.dev/scripts/staticforms.js";
      script.defer = true;
      script.id = scriptId;
      script.onload = attachForm;
      document.body.appendChild(script);
    } else {
      attachForm();
    }
  }, []);

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ submitting: false, submitted: false, error: false });

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();

    if (!trimmedName) {
      newErrors.name = "Nome é obrigatório";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Nome precisa ter pelo menos 2 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = "Email é obrigatório";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Informe um e-mail válido";
    }

    if (!trimmedSubject) {
      newErrors.subject = "Conte sobre seu projeto é obrigatório";
    } else if (trimmedSubject.length < 10) {
      newErrors.subject = "Descreva seu projeto com pelo menos 10 caracteres";
    }

    if (!formData.message.trim()) {
      newErrors.message = "A mensagem é obrigatória";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "A mensagem precisa ter pelo menos 10 caracteres";
    }

    if (!formData.consent) {
      newErrors.consent = "É necessário consentir para enviar o formulário";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    if (!validateForm()) {
      e.preventDefault();
      setStatus({ submitting: false, submitted: false, error: true });
      return;
    }

    setStatus({ submitting: true, submitted: true, error: false });
  };

  const openLegalDetails = (id) => {
    const details = document.getElementById(id);
    if (!details) return;

    details.open = true;
    details.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="contact-form-container">
      <p className="subtitle">
        Preencha os campos abaixo e entrarei em contato com você em breve.
      </p>

      {status.error && (
        <div className="alert alert-error">
          ❌ Revise os campos obrigatórios antes de enviar.
        </div>
      )}

      {status.submitted && !status.error && (
        <div className="alert alert-success">
          ✅ Formulário válido! A mensagem será enviada e você será redirecionado.
        </div>
      )}

      <form
        ref={formRef}
        action="https://api.staticforms.dev/submit"
        method="POST"
        className="contact-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <input type="hidden" name="apiKey" value="sf_0b05ba9c192a223f40bd2b31" />
        <input type="hidden" name="redirectTo" value="https://dvsweb.com.br/" />
        <input type="hidden" name="replyTo" value={formData.email} />

        <div className="form-group">
          <label htmlFor="name">
            Nome <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error" : ""}
            placeholder="Seu nome"
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "error" : ""}
            placeholder="seu@email.com"
            required
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="discord">Discord</label>
          <input
            type="text"
            id="discord"
            name="discord"
            value={formData.discord}
            onChange={handleChange}
            placeholder="@seuusuario"
          />
        </div>

        <div className="form-group">
          <label htmlFor="whatsapp">WhatsApp</label>
          <input
            type="text"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">
            Conte sobre seu Projeto <span className="required">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={errors.subject ? "error" : ""}
            placeholder="Descreva brevemente o projeto"
            required
          />
          {errors.subject && <span className="error-message">{errors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message">
            Texto <span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={errors.message ? "error" : ""}
            rows="5"
            placeholder="Conte mais detalhes sobre sua ideia..."
            required
          />
          {errors.message && <span className="error-message">{errors.message}</span>}
        </div>

        <div className="consent-group">
          <input
            type="checkbox"
            id="contact-consent"
            name="consent"
            value="accepted"
            checked={formData.consent}
            onChange={handleChange}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            required
          />
          <div className="consent-copy">
            <label htmlFor="contact-consent">
              Li e concordo com os Termos de Consentimento e estou ciente da
              Política de Privacidade. Autorizo o uso dos dados informados para
              responder ao meu contato.
            </label>
            <p>
              Consulte os{" "}
              <button
                type="button"
                className="inline-legal-link"
                onClick={() => openLegalDetails("consent-terms")}
              >
                Termos de Consentimento
              </button>{" "}
              e a{" "}
              <button
                type="button"
                className="inline-legal-link"
                onClick={() => openLegalDetails("privacy-policy")}
              >
                Política de Privacidade
              </button>
              .
            </p>
          </div>
          {errors.consent && (
            <span id="consent-error" className="error-message">
              {errors.consent}
            </span>
          )}
        </div>

        <button type="submit" disabled={status.submitting} className="submit-button">
          {status.submitting ? "Enviando..." : "Enviar mensagem"}
        </button>
      </form>
    </div>
  );
}

export default ContactForm;
