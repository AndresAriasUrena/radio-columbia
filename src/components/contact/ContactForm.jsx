'use client';
import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const ContactForm = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    message: '',
    station_name: 'Radio Columbia'
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: '', message: '' });

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      setStatus({
        type: 'success',
        message: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.'
      });

      setFormData({
        user_name: '',
        user_email: '',
        user_phone: '',
        message: '',
        station_name: 'Radio Columbia'
      });
    } catch (error) {
      console.error('Error:', error);
      setStatus({
        type: 'error',
        message: 'Hubo un error al enviar el mensaje. Por favor intenta de nuevo.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:py-16 bg-[#F8FBFF] mx-2 my-4 rounded-2xl">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start justify-between">
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
          <h2 className="text-5xl sm:text-7xl font-semibold text-[#1E305C] leading-none mb-2">
            Ponte<br />en contacto<br />con <span className="text-[#D51F2F]">nosotros</span>
          </h2>
          <div className="w-2/3 h-0.5 bg-[#D4D5DD] my-4" />
          <p className="text-[#2F3037]/60 text-lg mb-6 max-w-lg">
            Puede comunicarse con nosotros por los diferentes medios disponibles. También puedes llenar el formulario y pronto un asesor se comunicará con tu petición.
          </p>
          <div className="flex flex-col lg:flex-row gap-4 w-full items-center lg:items-start">
            <div className="text-center lg:text-left">
              <p className="font-semibold text-[#2F3037] mb-1">Centro de llamadas</p>
              <p className="text-[#2F3037]/60 text-md">Comunícate en el horario de<br />
                <a href="tel:+50622240707" className="text-[#01A299] hover:underline">
                  (506+) 2224 - 0707
                </a>
              </p>
            </div>
            <div className="text-center lg:text-left">
              <p className="font-semibold text-[#2F3037] mb-1">Correo electrónico</p>
              <p className="text-[#2F3037]/60 text-md">Puedes escribirnos al correo especializado:<br />
                <a href="mailto:ventas@grupocolumbia.co.cr" className="text-[#01A299] hover:underline">
                  ventas@grupocolumbia.co.cr
                </a>
              </p>
            </div>
            <div className="text-center lg:text-left">
              <p className="font-semibold text-[#2F3037] mb-1">Media Kit</p>
              <p className="text-[#2F3037]/60 text-md">Descubre nuestras opciones de pauta:<br />
                <a href="https://grupocolumbia.co.cr/media-kit" target="_blank" rel="noopener noreferrer" className="text-[#01A299] hover:underline">
                  Ver Media Kit
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <form ref={formRef} onSubmit={handleSubmit} className="w-full space-y-6">
            <input type="hidden" name="station_name" value={formData.station_name} />

            <div>
              <label htmlFor="user_name" className="block text-[#2F3037] text-sm mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Ej. John Doe"
                required
                className="w-full px-4 py-3 bg-white border border-[#D4D5DD] rounded-lg text-[#2F3037] placeholder-[#2F3037]/40 focus:outline-none focus:border-[#01A299] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="user_email" className="block text-[#2F3037] text-sm mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="user_email"
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
                placeholder="Ej. john.doe@example.com"
                required
                className="w-full px-4 py-3 bg-white border border-[#D4D5DD] rounded-lg text-[#2F3037] placeholder-[#2F3037]/40 focus:outline-none focus:border-[#01A299] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="user_phone" className="block text-[#2F3037] text-sm mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="user_phone"
                name="user_phone"
                value={formData.user_phone}
                onChange={handleChange}
                placeholder="Ej. 5555-5555"
                required
                className="w-full px-4 py-3 bg-white border border-[#D4D5DD] rounded-lg text-[#2F3037] placeholder-[#2F3037]/40 focus:outline-none focus:border-[#01A299] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-[#2F3037] text-sm mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                required
                rows="5"
                className="w-full px-4 py-3 bg-white border border-[#D4D5DD] rounded-lg text-[#2F3037] placeholder-[#2F3037]/40 focus:outline-none focus:border-[#01A299] transition-colors resize-none"
              />
            </div>

            {status.message && (
              <div className={`p-4 rounded-lg ${
                status.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-600'
                  : 'bg-red-500/10 border border-red-500/30 text-red-600'
              }`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-4 bg-[#D51F2F] hover:bg-[#b91a27] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
